// ============================================
// FIFA PLAYER SERVICE
// Business logic for FIFA player operations
// OPTIMIZED VERSION - No memory overload
// ============================================

import { Op, WhereOptions, Order, Sequelize, QueryTypes } from 'sequelize';
import { FifaPlayer } from '../../models/player/FifaPlayer';
import { FifaPlayerFilters } from '../../controllers/FifaPlayerController';
import { NotFoundError } from '../../utils/CustomErrors';
import sequelize from '../../config/database';

// Dynamic import for Redis to avoid TypeScript issues
let redisClient: any;
try {
    redisClient = require('../../config/redis').default;
} catch (error) {
    console.warn('Redis not available, caching disabled');
}

export class FifaPlayerService {
    /**
     * Invalidate all player-related caches
     * Called after create, update, or delete operations
     */
    private async invalidatePlayerCaches(playerId?: number) {
        if (!redisClient) return; // Skip if Redis not available

        try {
            const patterns = [
                'fifa:players:*',      // All player listings
                'fifa:search:*',       // All search results
                'fifa:top-rated:*',    // Top rated lists
                'fifa:versions:*',     // Version lists
                'fifa:timeline:*'      // Timeline caches
            ];

            // If specific player ID, also invalidate that player's cache with all possible prefixes
            if (playerId) {
                patterns.push(`player:${playerId}`);
                patterns.push(`fifa:players:${playerId}`);
                patterns.push(`*:${playerId}*`); // Catch all player-specific caches
            }

            // Delete all matching keys
            for (const pattern of patterns) {
                const keys = await redisClient.keys(pattern);
                if (keys.length > 0) {
                    await redisClient.del(...keys);
                    console.log(`🗑️  Invalidated ${keys.length} cache keys matching: ${pattern}`);
                }
            }
        } catch (error) {
            console.error('Error invalidating cache:', error);
        }
    }

    /**
     * Generate a short name from long name
     * Examples: "Lionel Andrés Messi Cuccittini" -> "L. Messi"
     */
    private generateShortName(longName: string): string {
        if (!longName) return '';
        
        const parts = longName.trim().split(' ');
        if (parts.length === 1) return parts[0];
        
        // Take first letter of first name + last name
        const firstInitial = parts[0].charAt(0).toUpperCase();
        const lastName = parts[parts.length - 1];
        
        return `${firstInitial}. ${lastName}`;
    }

    /**
     * Get available FIFA versions with statistics
     */
    async getFifaVersionsWithStats() {
        const query = `
            SELECT 
                fifa_version,
                fifa_update,
                COUNT(*) as player_count,
                AVG(overall) as avg_overall,
                MAX(overall) as max_overall,
                MIN(overall) as min_overall
            FROM players
            GROUP BY fifa_version, fifa_update
            ORDER BY fifa_version DESC, fifa_update DESC
        `;

        const versions = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            raw: true
        });

        return versions;
    }

    /**
     * Get overall rating distribution for frontend filters
     */
    async getOverallRatingDistribution(fifaVersion?: string, fifaUpdate?: string) {
        const conditions: string[] = [];
        const replacements: any = {};

        if (fifaVersion) {
            conditions.push('fifa_version = :fifaVersion');
            replacements.fifaVersion = fifaVersion;
        }

        if (fifaUpdate) {
            conditions.push('fifa_update = :fifaUpdate');
            replacements.fifaUpdate = fifaUpdate;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // MySQL 8 compatible query with explicit GROUP BY
        const query = `
            SELECT 
                rating_range,
                COUNT(*) as count,
                CONCAT(rating_range, '-', rating_range + 4) as range_label
            FROM (
                SELECT FLOOR(overall/5)*5 as rating_range
                FROM players
                ${whereClause}
            ) ranges
            GROUP BY rating_range
            ORDER BY rating_range DESC
        `;

        const distribution = await sequelize.query(query, {
            replacements,
            type: QueryTypes.SELECT,
            raw: true
        });

        return distribution;
    }

    /**
     * Get paginated list of FIFA players with filters (OPTIMIZED v2)
     * Smart query builder that adapts to filter requirements
     * Provides full data when specific version is requested
     */
    async getPlayers(filters: FifaPlayerFilters) {
        const page = filters.page || 1;
        // Increase limit: allow up to 1000 per page, or unlimited if limit=-1
        const requestedLimit = filters.limit || 20;
        const limit = requestedLimit === -1 ? 999999 : Math.min(requestedLimit, 1000);
        const offset = (page - 1) * limit;

        // Build WHERE conditions
        const baseConditions: string[] = [];
        const replacements: any = {};

        // Name search (supports both short_name and long_name)
        if (filters.name) {
            baseConditions.push('(p.long_name LIKE :name OR p.short_name LIKE :name)');
            replacements.name = `%${filters.name}%`;
        }

        if (filters.clubName) {
            baseConditions.push('p.club_name LIKE :clubName');
            replacements.clubName = `%${filters.clubName}%`;
        }

        if (filters.nationalityName) {
            baseConditions.push('p.nationality_name LIKE :nationalityName');
            replacements.nationalityName = `%${filters.nationalityName}%`;
        }

        if (filters.position) {
            baseConditions.push('p.player_positions LIKE :position');
            replacements.position = `%${filters.position}%`;
        }

        if (filters.gender) {
            baseConditions.push('p.gender = :gender');
            replacements.gender = filters.gender.toUpperCase();
        }

        // Rating filters
        if (filters.overallMin !== undefined) {
            baseConditions.push('p.overall >= :overallMin');
            replacements.overallMin = filters.overallMin;
        }

        if (filters.overallMax !== undefined) {
            baseConditions.push('p.overall <= :overallMax');
            replacements.overallMax = filters.overallMax;
        }

        if (filters.potentialMin !== undefined) {
            baseConditions.push('p.potential >= :potentialMin');
            replacements.potentialMin = filters.potentialMin;
        }

        if (filters.potentialMax !== undefined) {
            baseConditions.push('p.potential <= :potentialMax');
            replacements.potentialMax = filters.potentialMax;
        }

        // Age filters
        if (filters.ageMin !== undefined) {
            baseConditions.push('p.age >= :ageMin');
            replacements.ageMin = filters.ageMin;
        }

        if (filters.ageMax !== undefined) {
            baseConditions.push('p.age <= :ageMax');
            replacements.ageMax = filters.ageMax;
        }

        // FIFA Version filters
        if (filters.fifaVersion) {
            baseConditions.push('p.fifa_version = :fifaVersion');
            replacements.fifaVersion = filters.fifaVersion;
        }

        if (filters.fifaUpdate) {
            baseConditions.push('p.fifa_update = :fifaUpdate');
            replacements.fifaUpdate = filters.fifaUpdate;
        }

        const sortBy = filters.sortBy || 'overall';
        const sortOrder = filters.sortOrder || 'DESC';
        replacements.limit = limit;
        replacements.offset = offset;

        let query: string;
        let countQuery: string;
        let queryMode: string;

        // DECISION LOGIC: Choose query strategy based on filters
        const hasSpecificVersion = filters.fifaVersion || filters.fifaUpdate;
        const hasOnlyRatingFilters = filters.overallMin !== undefined || filters.overallMax !== undefined;
        
        if (hasSpecificVersion) {
            // MODE 1: SPECIFIC VERSION - Show latest update per player from that version
            // If specific update is provided, show all players from that exact version+update
            // If only version is provided, show latest update per unique player identity
            queryMode = `FIFA ${filters.fifaVersion || 'All'} Update ${filters.fifaUpdate || 'Latest'}`;
            
            if (filters.fifaUpdate) {
                // Exact version+update specified - show all players from that exact version
                const whereClause = baseConditions.length > 0 ? `WHERE ${baseConditions.join(' AND ')}` : '';
                
                query = `
                    SELECT * FROM players p
                    ${whereClause}
                    ORDER BY p.${sortBy} ${sortOrder}
                    LIMIT :limit OFFSET :offset
                `;

                countQuery = `
                    SELECT COUNT(*) as total FROM players p
                    ${whereClause}
                `;
            } else {
                // Only FIFA version specified - show latest update per unique player identity
                const subqueryWhere = baseConditions.length > 0 ? 
                    `WHERE ${baseConditions.join(' AND ').replace(/p\./g, '')}` : '';
                const outerWhere = baseConditions.length > 0 ? 
                    `WHERE ${baseConditions.join(' AND ')}` : '';

                query = `
                    SELECT p.* FROM players p
                    INNER JOIN (
                        SELECT 
                            long_name,
                            nationality_name,
                            MAX(CONCAT(fifa_version, '_', LPAD(fifa_update, 3, '0'))) as latest_version
                        FROM players
                        ${subqueryWhere}
                        GROUP BY long_name, nationality_name
                    ) latest ON p.long_name = latest.long_name 
                    AND p.nationality_name = latest.nationality_name
                    AND CONCAT(p.fifa_version, '_', LPAD(p.fifa_update, 3, '0')) = latest.latest_version
                    ${outerWhere}
                    ORDER BY p.${sortBy} ${sortOrder}
                    LIMIT :limit OFFSET :offset
                `;

                countQuery = `
                    SELECT COUNT(*) as total FROM (
                        SELECT DISTINCT p.id
                        FROM players p
                        INNER JOIN (
                            SELECT 
                                long_name,
                                nationality_name,
                                MAX(CONCAT(fifa_version, '_', LPAD(fifa_update, 3, '0'))) as latest_version
                            FROM players
                            ${subqueryWhere}
                            GROUP BY long_name, nationality_name
                        ) latest ON p.long_name = latest.long_name 
                        AND p.nationality_name = latest.nationality_name
                        AND CONCAT(p.fifa_version, '_', LPAD(p.fifa_update, 3, '0')) = latest.latest_version
                        ${outerWhere}
                    ) unique_players
                `;
            }

        } else if (hasOnlyRatingFilters && !filters.name && !filters.clubName) {
            // MODE 2: RATING FOCUSED - Optimized for overall/potential browsing
            queryMode = 'Rating-Optimized Latest Versions';
            
            // Use latest version for each unique player identity (name + nationality)
            // Simplified to avoid club-based duplications (same player in club vs national team)
            const subqueryConditions = baseConditions.filter(cond => 
                !cond.includes('p.overall') && 
                !cond.includes('p.potential') && 
                !cond.includes('p.age')
            );
            const ratingConditions = baseConditions.filter(cond => 
                cond.includes('p.overall') || 
                cond.includes('p.potential') || 
                cond.includes('p.age')
            );

            const subqueryWhere = subqueryConditions.length > 0 ? 
                `WHERE ${subqueryConditions.join(' AND ').replace(/p\./g, '')}` : '';
            const outerWhere = ratingConditions.length > 0 ? 
                `WHERE ${ratingConditions.join(' AND ')}` : '';

            query = `
                SELECT p.* FROM players p
                INNER JOIN (
                    SELECT 
                        long_name,
                        nationality_name,
                        MAX(CONCAT(fifa_version, '_', LPAD(fifa_update, 3, '0'))) as latest_version
                    FROM players
                    ${subqueryWhere}
                    GROUP BY long_name, nationality_name
                ) latest ON p.long_name = latest.long_name 
                AND p.nationality_name = latest.nationality_name
                AND CONCAT(p.fifa_version, '_', LPAD(p.fifa_update, 3, '0')) = latest.latest_version
                ${outerWhere}
                ORDER BY p.${sortBy} ${sortOrder}
                LIMIT :limit OFFSET :offset
            `;

            countQuery = `
                SELECT COUNT(*) as total FROM (
                    SELECT DISTINCT p.id
                    FROM players p
                    INNER JOIN (
                        SELECT 
                            long_name,
                            nationality_name,
                            MAX(CONCAT(fifa_version, '_', LPAD(fifa_update, 3, '0'))) as latest_version
                        FROM players
                        ${subqueryWhere}
                        GROUP BY long_name, nationality_name
                    ) latest ON p.long_name = latest.long_name 
                    AND p.nationality_name = latest.nationality_name
                    AND CONCAT(p.fifa_version, '_', LPAD(p.fifa_update, 3, '0')) = latest.latest_version
                    ${outerWhere}
                ) unique_players
            `;

        } else {
            // MODE 3: COMPREHENSIVE SEARCH - Latest version per unique player identity with all filters
            // Uses composite key (name + club + nationality) for accurate deduplication
            // Handle NULL values properly with COALESCE
            queryMode = 'Comprehensive Latest Versions';
            
            const subqueryWhere = baseConditions.length > 0 ? 
                `WHERE ${baseConditions.join(' AND ').replace(/p\./g, '')}` : '';
            const outerWhere = baseConditions.length > 0 ? 
                `WHERE ${baseConditions.join(' AND ')}` : '';

            query = `
                SELECT p.* FROM players p
                INNER JOIN (
                    SELECT 
                        long_name,
                        nationality_name,
                        MAX(CONCAT(fifa_version, '_', LPAD(fifa_update, 3, '0'))) as latest_version
                    FROM players
                    ${subqueryWhere}
                    GROUP BY long_name, nationality_name
                ) latest ON p.long_name = latest.long_name 
                AND p.nationality_name = latest.nationality_name
                AND CONCAT(p.fifa_version, '_', LPAD(p.fifa_update, 3, '0')) = latest.latest_version
                ${outerWhere}
                ORDER BY p.${sortBy} ${sortOrder}
                LIMIT :limit OFFSET :offset
            `;

            countQuery = `
                SELECT COUNT(*) as total FROM (
                    SELECT DISTINCT p.id
                    FROM players p
                    INNER JOIN (
                        SELECT 
                            long_name,
                            nationality_name,
                            MAX(CONCAT(fifa_version, '_', LPAD(fifa_update, 3, '0'))) as latest_version
                        FROM players
                        ${subqueryWhere}
                        GROUP BY long_name, nationality_name
                    ) latest ON p.long_name = latest.long_name 
                    AND p.nationality_name = latest.nationality_name
                    AND CONCAT(p.fifa_version, '_', LPAD(p.fifa_update, 3, '0')) = latest.latest_version
                    ${outerWhere}
                ) unique_players
            `;
        }

        const [players, countResult] = await Promise.all([
            sequelize.query(query, {
                replacements,
                type: QueryTypes.SELECT,
                raw: true
            }),
            sequelize.query(countQuery, {
                replacements,
                type: QueryTypes.SELECT,
                raw: true
            })
        ]);

        const total = (countResult[0] as any).total;
        const totalPages = Math.ceil(total / limit);

        return {
            players: players as FifaPlayer[],
            pagination: {
                total: parseInt(total),
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
            queryMeta: {
                mode: queryMode,
                filtersApplied: Object.keys(filters).filter(k => filters[k as keyof FifaPlayerFilters] !== undefined).length,
                executionStrategy: hasSpecificVersion ? 'specific' : hasOnlyRatingFilters ? 'rating-optimized' : 'comprehensive'
            }
        };
    }
    async getPlayerById(id: number) {
        const player = await FifaPlayer.findByPk(id);

        if (!player) {
            throw new NotFoundError('FIFA Player', id);
        }

        return player;
    }

    /**
     * Get available FIFA versions and updates with enhanced metadata
     */
    async getAvailableVersions() {
        const query = `
            SELECT 
                fifa_version,
                fifa_update,
                COUNT(*) as player_count,
                COUNT(DISTINCT long_name) as unique_players,
                AVG(overall) as avg_overall,
                MAX(overall) as max_overall,
                MIN(overall) as min_overall
            FROM players
            GROUP BY fifa_version, fifa_update
            ORDER BY fifa_version DESC, fifa_update DESC
        `;

        const versions = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            raw: true
        }) as any[];

        // Group by version with enhanced data
        const groupedVersions: Record<string, any> = {};
        versions.forEach((v) => {
            if (!groupedVersions[v.fifa_version]) {
                groupedVersions[v.fifa_version] = {
                    updates: [],
                    totalPlayers: 0,
                    uniquePlayers: 0,
                    overallRange: { min: 99, max: 0 },
                    avgOverall: 0
                };
            }
            
            groupedVersions[v.fifa_version].updates.push({
                update: v.fifa_update,
                playerCount: v.player_count,
                uniquePlayers: v.unique_players,
                avgOverall: Math.round(v.avg_overall * 10) / 10,
                overallRange: {
                    min: v.min_overall,
                    max: v.max_overall
                }
            });
            
            groupedVersions[v.fifa_version].totalPlayers += parseInt(v.player_count);
            groupedVersions[v.fifa_version].uniquePlayers = Math.max(
                groupedVersions[v.fifa_version].uniquePlayers, 
                parseInt(v.unique_players)
            );
            groupedVersions[v.fifa_version].overallRange.min = Math.min(
                groupedVersions[v.fifa_version].overallRange.min, 
                v.min_overall
            );
            groupedVersions[v.fifa_version].overallRange.max = Math.max(
                groupedVersions[v.fifa_version].overallRange.max, 
                v.max_overall
            );
        });

        return groupedVersions;
    }

    /**
     * Get optimized filter data for frontend components
     */
    async getFilterMetadata(fifaVersion?: string, fifaUpdate?: string) {
        const conditions: string[] = [];
        const replacements: any = {};

        if (fifaVersion) {
            conditions.push('fifa_version = :fifaVersion');
            replacements.fifaVersion = fifaVersion;
        }

        if (fifaUpdate) {
            conditions.push('fifa_update = :fifaUpdate');
            replacements.fifaUpdate = fifaUpdate;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        try {
            // Get general stats first (always works)
            const stats = await sequelize.query(`
                SELECT 
                    COUNT(*) as total_players,
                    COUNT(DISTINCT long_name) as unique_players,
                    AVG(overall) as avg_overall,
                    MAX(overall) as max_overall,
                    MIN(overall) as min_overall,
                    AVG(age) as avg_age,
                    MAX(age) as max_age,
                    MIN(age) as min_age,
                    COUNT(CASE WHEN gender = 'M' THEN 1 END) as male_count,
                    COUNT(CASE WHEN gender = 'F' THEN 1 END) as female_count
                FROM players
                ${whereClause}
            `, { replacements, type: QueryTypes.SELECT });

            // Get distribution data (MySQL 8 compatible)
            const overallDistribution = await sequelize.query(`
                SELECT 
                    rating_range,
                    COUNT(*) as count,
                    CONCAT(rating_range, '-', rating_range + 4) as range_label
                FROM (
                    SELECT FLOOR(overall/5)*5 as rating_range
                    FROM players
                    ${whereClause}
                ) ranges
                GROUP BY rating_range
                ORDER BY rating_range DESC
            `, { replacements, type: QueryTypes.SELECT });

            // Get top positions (primary position only)
            const positions = await sequelize.query(`
                SELECT 
                    TRIM(SUBSTRING_INDEX(player_positions, ',', 1)) as position,
                    COUNT(*) as count
                FROM players
                ${whereClause}
                ${whereClause ? 'AND' : 'WHERE'} player_positions IS NOT NULL AND player_positions != ''
                GROUP BY TRIM(SUBSTRING_INDEX(player_positions, ',', 1))
                ORDER BY count DESC
                LIMIT 20
            `, { replacements, type: QueryTypes.SELECT });

            // Get top clubs
            const clubs = await sequelize.query(`
                SELECT 
                    club_name,
                    COUNT(*) as count,
                    AVG(overall) as avg_overall
                FROM players
                ${whereClause}
                ${whereClause ? 'AND' : 'WHERE'} club_name IS NOT NULL AND club_name != ''
                GROUP BY club_name
                ORDER BY count DESC
                LIMIT 30
            `, { replacements, type: QueryTypes.SELECT });

            // Get top nationalities
            const nationalities = await sequelize.query(`
                SELECT 
                    nationality_name,
                    COUNT(*) as count,
                    AVG(overall) as avg_overall
                FROM players
                ${whereClause}
                ${whereClause ? 'AND' : 'WHERE'} nationality_name IS NOT NULL AND nationality_name != ''
                GROUP BY nationality_name
                ORDER BY count DESC
                LIMIT 30
            `, { replacements, type: QueryTypes.SELECT });

            return {
                version: {
                    fifaVersion: fifaVersion || 'all',
                    fifaUpdate: fifaUpdate || 'all'
                },
                overallDistribution,
                positions: positions.slice(0, 15), // Top 15 positions
                clubs: clubs.slice(0, 20),        // Top 20 clubs
                nationalities: nationalities.slice(0, 25), // Top 25 countries
                stats: stats[0],
                generatedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error in getFilterMetadata:', (error as Error).message);
            // Return basic metadata if advanced queries fail
            return {
                version: {
                    fifaVersion: fifaVersion || 'all',
                    fifaUpdate: fifaUpdate || 'all'
                },
                overallDistribution: [],
                positions: [],
                clubs: [],
                nationalities: [],
                stats: {
                    total_players: 0,
                    unique_players: 0,
                    avg_overall: 0,
                    max_overall: 0,
                    min_overall: 0,
                    male_count: 0,
                    female_count: 0
                },
                error: 'Advanced metadata not available',
                generatedAt: new Date().toISOString()
            };
        }
    }

    /**
     * Get top rated players (OPTIMIZED)
     * Only returns unique players with their latest version
     */
    async getTopRatedPlayers(
        limit: number = 4,
        gender?: 'M' | 'F',
        fifaVersion?: string,
        fifaUpdate?: string,
    ) {
        const outerConditions: string[] = [];
        const subqueryConditions: string[] = [];
        const replacements: any = { limit: Math.min(limit, 200) }; // Max 200

        if (gender) {
            outerConditions.push('p.gender = :gender');
            subqueryConditions.push('gender = :gender');
            replacements.gender = gender.toUpperCase();
        }

        if (fifaVersion) {
            outerConditions.push('p.fifa_version = :fifaVersion');
            subqueryConditions.push('fifa_version = :fifaVersion');
            replacements.fifaVersion = fifaVersion;
        }

        if (fifaUpdate) {
            outerConditions.push('p.fifa_update = :fifaUpdate');
            subqueryConditions.push('fifa_update = :fifaUpdate');
            replacements.fifaUpdate = fifaUpdate;
        }

        const outerWhereClause = outerConditions.length > 0 ? `WHERE ${outerConditions.join(' AND ')}` : '';
        const subqueryWhereClause = subqueryConditions.length > 0 ? `WHERE ${subqueryConditions.join(' AND ')}` : '';

        // OPTIMIZED: Get unique players with highest overall, latest version only
        const query = `
            SELECT p.* FROM players p
            INNER JOIN (
                SELECT 
                    long_name,
                    MAX(overall) as max_overall,
                    MAX(CONCAT(fifa_version, '_', fifa_update)) as latest_version
                FROM players
                ${subqueryWhereClause}
                GROUP BY long_name
            ) latest ON p.long_name = latest.long_name 
            AND p.overall = latest.max_overall
            AND CONCAT(p.fifa_version, '_', p.fifa_update) = latest.latest_version
            ${outerWhereClause}
            ORDER BY p.overall DESC, p.potential DESC
            LIMIT :limit
        `;

        const players = await sequelize.query(query, {
            replacements,
            type: QueryTypes.SELECT,
            raw: true
        });

        return players;
    }

    /**
     * Search players by name (OPTIMIZED)
     * Returns unique players matching search term
     */
    async searchPlayers(
        searchTerm: string,
        limit: number = 20,
        gender?: 'M' | 'F',
        fifaVersion?: string,
        fifaUpdate?: string,
    ) {
        const outerConditions: string[] = ['p.long_name LIKE :searchTerm'];
        const subqueryConditions: string[] = ['long_name LIKE :searchTerm'];
        const replacements: any = {
            searchTerm: `%${searchTerm}%`,
            limit: Math.min(limit, 100) // Max 100
        };

        if (gender) {
            outerConditions.push('p.gender = :gender');
            subqueryConditions.push('gender = :gender');
            replacements.gender = gender.toUpperCase();
        }

        if (fifaVersion) {
            outerConditions.push('p.fifa_version = :fifaVersion');
            subqueryConditions.push('fifa_version = :fifaVersion');
            replacements.fifaVersion = fifaVersion;
        }

        if (fifaUpdate) {
            outerConditions.push('p.fifa_update = :fifaUpdate');
            subqueryConditions.push('fifa_update = :fifaUpdate');
            replacements.fifaUpdate = fifaUpdate;
        }

        const outerWhereClause = `WHERE ${outerConditions.join(' AND ')}`;
        const subqueryWhereClause = `WHERE ${subqueryConditions.join(' AND ')}`;

        // OPTIMIZED: Get unique players matching search, latest version only
        const query = `
            SELECT p.* FROM players p
            INNER JOIN (
                SELECT 
                    long_name,
                    MAX(CONCAT(fifa_version, '_', fifa_update)) as latest_version
                FROM players
                ${subqueryWhereClause}
                GROUP BY long_name
            ) latest ON p.long_name = latest.long_name 
            AND CONCAT(p.fifa_version, '_', p.fifa_update) = latest.latest_version
            ${outerWhereClause}
            ORDER BY p.overall DESC
            LIMIT :limit
        `;

        const players = await sequelize.query(query, {
            replacements,
            type: QueryTypes.SELECT,
            raw: true
        });

        return players;
    }

    /**
     * Get detailed stats for a player
     */
    async getPlayerStats(id: number) {
        const player = await this.getPlayerById(id);

        // Organize stats into categories
        return {
            basicInfo: {
                id: player.id,
                name: player.short_name,
                positions: player.player_positions,
                club: player.club_name,
                nationality: player.nationality_name,
                overall: player.overall,
                potential: player.potential,
                age: player.age,
                height: player.height_cm,
                weight: player.weight_kg,
                preferredFoot: player.preferred_foot,
                weakFoot: player.weak_foot,
                skillMoves: player.skill_moves,
                workRate: player.work_rate,
                bodyType: player.body_type,
            },
            marketValue: {
                valueEur: player.value_eur,
                wageEur: player.wage_eur,
            },
            faceStats: {
                pace: player.pace,
                shooting: player.shooting,
                passing: player.passing,
                dribbling: player.dribbling,
                defending: player.defending,
                physic: player.physic,
            },
            attacking: {
                crossing: player.attacking_crossing,
                finishing: player.attacking_finishing,
                headingAccuracy: player.attacking_heading_accuracy,
                shortPassing: player.attacking_short_passing,
                volleys: player.attacking_volleys,
            },
            skill: {
                dribbling: player.skill_dribbling,
                curve: player.skill_curve,
                fkAccuracy: player.skill_fk_accuracy,
                longPassing: player.skill_long_passing,
                ballControl: player.skill_ball_control,
            },
            movement: {
                acceleration: player.movement_acceleration,
                sprintSpeed: player.movement_sprint_speed,
                agility: player.movement_agility,
                reactions: player.movement_reactions,
                balance: player.movement_balance,
            },
            power: {
                shotPower: player.power_shot_power,
                jumping: player.power_jumping,
                stamina: player.power_stamina,
                strength: player.power_strength,
                longShots: player.power_long_shots,
            },
            mentality: {
                aggression: player.mentality_aggression,
                interceptions: player.mentality_interceptions,
                positioning: player.mentality_positioning,
                vision: player.mentality_vision,
                penalties: player.mentality_penalties,
                composure: player.mentality_composure,
            },
            defending: {
                marking: player.defending_marking,
                standingTackle: player.defending_standing_tackle,
                slidingTackle: player.defending_sliding_tackle,
            },
            goalkeeping: {
                diving: player.goalkeeping_diving,
                handling: player.goalkeeping_handling,
                kicking: player.goalkeeping_kicking,
                positioning: player.goalkeeping_positioning,
                reflexes: player.goalkeeping_reflexes,
                speed: player.goalkeeping_speed,
            },
            traits: player.player_traits ? player.player_traits.split(',').map((t: string) => t.trim()) : [],
        };
    }

    /**
     * Get player radar chart data for Chart.js
     */
    async getPlayerRadarStats(id: number) {
        const player = await this.getPlayerById(id);

        return {
            playerInfo: {
                id: player.id,
                longName: player.long_name,
                shortName: player.short_name,
                playerFaceUrl: player.player_face_url,
                overall: player.overall,
                potential: player.potential,
                age: player.age,
                position: player.player_positions?.split(',')[0]?.trim() || 'N/A',
                club: player.club_name || 'Free Agent',
                fifaVersion: player.fifa_version
            },
            radarChart: {
                labels: ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physic'],
                values: [
                    player.pace || 0,
                    player.shooting || 0,
                    player.passing || 0,
                    player.dribbling || 0,
                    player.defending || 0,
                    player.physic || 0
                ]
            },
            detailedStats: {
                attacking: {
                    crossing: player.attacking_crossing || 0,
                    finishing: player.attacking_finishing || 0,
                    headingAccuracy: player.attacking_heading_accuracy || 0,
                    shortPassing: player.attacking_short_passing || 0,
                    volleys: player.attacking_volleys || 0
                },
                skill: {
                    dribbling: player.skill_dribbling || 0,
                    curve: player.skill_curve || 0,
                    fkAccuracy: player.skill_fk_accuracy || 0,
                    longPassing: player.skill_long_passing || 0,
                    ballControl: player.skill_ball_control || 0
                },
                movement: {
                    acceleration: player.movement_acceleration || 0,
                    sprintSpeed: player.movement_sprint_speed || 0,
                    agility: player.movement_agility || 0,
                    reactions: player.movement_reactions || 0,
                    balance: player.movement_balance || 0
                },
                power: {
                    shotPower: player.power_shot_power || 0,
                    jumping: player.power_jumping || 0,
                    stamina: player.power_stamina || 0,
                    strength: player.power_strength || 0,
                    longShots: player.power_long_shots || 0
                },
                mentality: {
                    aggression: player.mentality_aggression || 0,
                    interceptions: player.mentality_interceptions || 0,
                    positioning: player.mentality_positioning || 0,
                    vision: player.mentality_vision || 0,
                    penalties: player.mentality_penalties || 0,
                    composure: player.mentality_composure || 0
                },
                defending: {
                    marking: player.defending_marking || 0,
                    standingTackle: player.defending_standing_tackle || 0,
                    slidingTackle: player.defending_sliding_tackle || 0
                },
                goalkeeping: {
                    diving: player.goalkeeping_diving || 0,
                    handling: player.goalkeeping_handling || 0,
                    kicking: player.goalkeeping_kicking || 0,
                    positioning: player.goalkeeping_positioning || 0,
                    reflexes: player.goalkeeping_reflexes || 0,
                    speed: player.goalkeeping_speed || 0
                }
            }
        };
    }

    /**
     * Get player timeline evolution across FIFA versions
     */
    async getPlayerTimeline(id: number, skillName?: string) {
        // Check cache first
        const cacheKey = `fifa:timeline:${id}:${skillName || 'all'}`;
        if (redisClient) {
            try {
                const cached = await redisClient.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            } catch (error) {
                console.warn('Redis cache read error:', error);
            }
        }

        const referencePlayer = await this.getPlayerById(id);
        const playerName = referencePlayer.long_name;
        const playerGender = referencePlayer.gender;

        const query = `
            SELECT 
                fifa_version,
                fifa_update,
                overall,
                potential,
                age,
                pace,
                shooting,
                passing,
                dribbling,
                defending,
                physic,
                club_name,
                value_eur
            FROM (
                SELECT *,
                    ROW_NUMBER() OVER (
                        PARTITION BY fifa_version 
                        ORDER BY CAST(fifa_update AS UNSIGNED) DESC
                    ) as rn
                FROM players
                WHERE long_name = :playerName
                AND gender = :playerGender
            ) ranked
            WHERE rn = 1
            ORDER BY CAST(fifa_version AS UNSIGNED) ASC
        `;

        const allVersions = await sequelize.query(query, {
            replacements: { playerName, playerGender },
            type: QueryTypes.SELECT,
            raw: true
        });

        let result;
        
        if (skillName) {
            const skillField = this.getSkillFieldName(skillName);
            result = {
                skill: skillName,
                timeline: allVersions.map((v: any) => ({
                    fifaVersion: v.fifa_version,
                    fifaUpdate: v.fifa_update,
                    value: v[skillField] || 0,
                    overall: v.overall
                }))
            };
        } else {
            result = {
                playerName,
                timeline: allVersions.map((v: any) => ({
                    fifaVersion: v.fifa_version,
                    fifaUpdate: v.fifa_update,
                    overall: v.overall,
                    potential: v.potential,
                    age: v.age,
                    pace: v.pace || 0,
                    shooting: v.shooting || 0,
                    passing: v.passing || 0,
                    dribbling: v.dribbling || 0,
                    defending: v.defending || 0,
                    physic: v.physic || 0,
                    club: v.club_name,
                    valueEur: v.value_eur
                }))
            };
        }

        // Cache the result for 1 hour
        if (redisClient) {
            try {
                await redisClient.setex(cacheKey, 3600, JSON.stringify(result));
            } catch (error) {
                console.warn('Redis cache write error:', error);
            }
        }

        return result;
    }

    /**
     * Helper to get skill field name from friendly name
     */
    private getSkillFieldName(skillName: string): string {
        const skillMap: Record<string, string> = {
            'pace': 'pace',
            'shooting': 'shooting',
            'passing': 'passing',
            'dribbling': 'dribbling',
            'defending': 'defending',
            'physic': 'physic',
            'overall': 'overall',
            'potential': 'potential',
            'crossing': 'attacking_crossing',
            'finishing': 'attacking_finishing',
            'heading': 'attacking_heading_accuracy',
            'short_passing': 'attacking_short_passing',
            'volleys': 'attacking_volleys',
            'curve': 'skill_curve',
            'fk_accuracy': 'skill_fk_accuracy',
            'long_passing': 'skill_long_passing',
            'ball_control': 'skill_ball_control',
            'acceleration': 'movement_acceleration',
            'sprint_speed': 'movement_sprint_speed',
            'agility': 'movement_agility',
            'reactions': 'movement_reactions',
            'balance': 'movement_balance',
            'shot_power': 'power_shot_power',
            'jumping': 'power_jumping',
            'stamina': 'power_stamina',
            'strength': 'power_strength',
            'long_shots': 'power_long_shots'
        };

        return skillMap[skillName.toLowerCase()] || skillName;
    }

    async createPlayer(playerData: any) {
        const query = `
            INSERT INTO players (
                fifa_version, fifa_update, gender, player_face_url, long_name, short_name,
                player_positions, club_name, nationality_name, overall, potential, value_eur,
                wage_eur, age, height_cm, weight_kg, preferred_foot, weak_foot, skill_moves,
                work_rate, body_type, pace, shooting, passing, dribbling, defending, physic,
                attacking_crossing, attacking_finishing, attacking_heading_accuracy,
                attacking_short_passing, attacking_volleys, skill_dribbling, skill_curve,
                skill_fk_accuracy, skill_long_passing, skill_ball_control,
                movement_acceleration, movement_sprint_speed, movement_agility,
                movement_reactions, movement_balance, power_shot_power, power_jumping,
                power_stamina, power_strength, power_long_shots, mentality_aggression,
                mentality_interceptions, mentality_positioning, mentality_vision,
                mentality_penalties, mentality_composure, defending_marking,
                defending_standing_tackle, defending_sliding_tackle, goalkeeping_diving,
                goalkeeping_handling, goalkeeping_kicking, goalkeeping_positioning,
                goalkeeping_reflexes, goalkeeping_speed, player_traits
            ) VALUES (
                :fifa_version, :fifa_update, :gender, :player_face_url, :long_name, :short_name,
                :player_positions, :club_name, :nationality_name, :overall, :potential, :value_eur,
                :wage_eur, :age, :height_cm, :weight_kg, :preferred_foot, :weak_foot, :skill_moves,
                :work_rate, :body_type, :pace, :shooting, :passing, :dribbling, :defending, :physic,
                :attacking_crossing, :attacking_finishing, :attacking_heading_accuracy,
                :attacking_short_passing, :attacking_volleys, :skill_dribbling, :skill_curve,
                :skill_fk_accuracy, :skill_long_passing, :skill_ball_control,
                :movement_acceleration, :movement_sprint_speed, :movement_agility,
                :movement_reactions, :movement_balance, :power_shot_power, :power_jumping,
                :power_stamina, :power_strength, :power_long_shots, :mentality_aggression,
                :mentality_interceptions, :mentality_positioning, :mentality_vision,
                :mentality_penalties, :mentality_composure, :defending_marking,
                :defending_standing_tackle, :defending_sliding_tackle, :goalkeeping_diving,
                :goalkeeping_handling, :goalkeeping_kicking, :goalkeeping_positioning,
                :goalkeeping_reflexes, :goalkeeping_speed, :player_traits
            )
        `;

        const result = await sequelize.query(query, {
            replacements: playerData,
            type: QueryTypes.INSERT
        });

        const selectQuery = `SELECT * FROM players WHERE id = :id`;
        const player = await sequelize.query(selectQuery, {
            replacements: { id: result[0] },
            type: QueryTypes.SELECT,
            raw: true
        });

        // Invalidate all caches after creating a player
        await this.invalidatePlayerCaches();

        return player[0];
    }

    async updatePlayer(id: number, playerData: any) {
        const fields = Object.keys(playerData)
            .filter(key => playerData[key] !== undefined)
            .map(key => `${key} = :${key}`)
            .join(', ');

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `
            UPDATE players 
            SET ${fields}
            WHERE id = :id
        `;

        await sequelize.query(query, {
            replacements: { ...playerData, id },
            type: QueryTypes.UPDATE
        });

        // Invalidate all caches after updating a player
        await this.invalidatePlayerCaches(id);

        // Return updated player directly, not through getPlayerById (which has deduplication)
        const selectQuery = `SELECT * FROM players WHERE id = :id`;
        const [player] = await sequelize.query(selectQuery, {
            replacements: { id },
            type: QueryTypes.SELECT
        });

        return player;
    }

    async deletePlayer(id: number) {
        const query = `DELETE FROM players WHERE id = :id`;
        
        await sequelize.query(query, {
            replacements: { id },
            type: QueryTypes.DELETE
        });

        // Invalidate all caches after deleting a player
        await this.invalidatePlayerCaches(id);

        return { deleted: true, id };
    }

    /**
     * Export players to CSV or Excel format
     * Uses the same filters as getPlayers but without pagination
     */
    async exportPlayers(filters: FifaPlayerFilters, format: 'csv' | 'xlsx' = 'csv') {
        // Remove pagination from filters
        const exportFilters = { ...filters };
        delete exportFilters.page;
        delete exportFilters.limit;

        // Get all players matching filters (max 10000 for safety)
        const limitedFilters = { ...exportFilters, limit: 10000, page: 1 };
        const result = await this.getPlayers(limitedFilters);

        return result.players;
    }
}

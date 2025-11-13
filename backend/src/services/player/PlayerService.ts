// ============================================
// PLAYER SERVICE
// Handles all player-related business logic
// Repository Pattern + SOLID Principles
// ============================================

import { Op, Transaction } from 'sequelize';
import { Player } from '../../models/player/Player';
import { PlayerVersion } from '../../models/player/PlayerVersion';
import { SkillStats } from '../../models/skills/SkillStats';
import { Club } from '../../models/location/Club';
import { Nationality } from '../../models/location/Nationality';
import { NationTeam } from '../../models/location/NationTeam';
import { Position } from '../../models/attributes/Position';
import { PlayerVersionPosition } from '../../models/player/PlayerVersionPosition';
import {
    PlayerFilters,
    CreatePlayerDTO,
    UpdatePlayerDTO,
    CreatePlayerVersionDTO,
    UpdatePlayerVersionDTO,
    SkillStatsDTO
} from '../../types';
import { NotFoundError, ValidationError } from '../../utils/CustomErrors';
import { PaginationMeta } from '../../utils/ApiResponse';
import sequelize from '../../config/database';

export class PlayerService {
    /**
     * Get paginated list of players with filters
     */
    async getPlayers(filters: PlayerFilters): Promise<{
        players: any[];
        pagination: PaginationMeta;
    }> {
        const {
            name,
            clubId,
            clubName,
            positionCode,
            nationalityId,
            leagueId,
            fifaVersion,
            overallMin,
            overallMax,
            page = 1,
            limit = 20,
            sortBy = 'overall',
            sortOrder = 'DESC'
        } = filters;

        // Build WHERE clause
        const wherePlayer: any = {};
        const wherePlayerVersion: any = {};
        const whereClub: any = {};
        const includePosition = !!positionCode;

        // Player filters
        if (name) {
            wherePlayer[Op.or] = [
                { short_name: { [Op.like]: `%${name}%` } },
                { long_name: { [Op.like]: `%${name}%` } }
            ];
        }

        if (nationalityId) {
            wherePlayer.nationalityId = nationalityId;
        }

        // PlayerVersion filters
        if (fifaVersion) {
            wherePlayerVersion.fifaVersion = fifaVersion;
        }

        if (overallMin) {
            wherePlayerVersion.overall = { [Op.gte]: overallMin };
        }

        if (overallMax) {
            wherePlayerVersion.overall = {
                ...wherePlayerVersion.overall,
                [Op.lte]: overallMax
            };
        }

        if (clubId) {
            wherePlayerVersion.clubId = clubId;
        }

        // Club filters
        if (clubName) {
            whereClub.name = { [Op.like]: `%${clubName}%` };
        }

        if (leagueId) {
            whereClub.leagueId = leagueId;
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Build include array
        const includes: any[] = [
            {
                model: Nationality,
                as: 'nationality',
                attributes: ['id', 'name']
            },
            {
                model: PlayerVersion,
                as: 'versions',
                where: Object.keys(wherePlayerVersion).length > 0 ? wherePlayerVersion : undefined,
                required: Object.keys(wherePlayerVersion).length > 0,
                include: [
                    {
                        model: Club,
                        as: 'club',
                        where: Object.keys(whereClub).length > 0 ? whereClub : undefined,
                        required: false,
                        attributes: ['id', 'name', 'club_logo_url']
                    },
                    {
                        model: NationTeam,
                        as: 'nationTeam',
                        required: false,
                        attributes: ['id', 'name']
                    }
                ]
            }
        ];

        // Add position filter if specified
        if (includePosition) {
            includes[1].include.push({
                model: PlayerVersionPosition,
                as: 'positions',
                required: true,
                include: [
                    {
                        model: Position,
                        as: 'position',
                        where: { code: positionCode },
                        required: true
                    }
                ]
            });
        }

        // Query with pagination
        const { count, rows } = await Player.findAndCountAll({
            where: wherePlayer,
            include: includes,
            limit,
            offset,
            distinct: true,
            subQuery: false
        });

        // Format response - Get latest version for each player
        const players = rows.map((player: any) => {
            const latestVersion = player.versions?.[0] || null;
            return {
                id: player.id,
                externalPlayerId: player.externalPlayerId,
                shortName: player.short_name,
                longName: player.long_name,
                dob: player.dob,
                playerUrl: player.playerUrl,
                playerFaceUrl: player.playerFaceUrl,
                nationality: player.nationality,
                latestVersion: latestVersion ? {
                    id: latestVersion.id,
                    fifaVersion: latestVersion.fifaVersion,
                    overall: latestVersion.overall,
                    potential: latestVersion.potential,
                    age: latestVersion.age,
                    positions: latestVersion.playerPositions,
                    club: latestVersion.club,
                    valueEur: latestVersion.valueEur
                } : null
            };
        });

        const totalPages = Math.ceil(count / limit);
        const pagination: PaginationMeta = {
            page,
            limit,
            total: count,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };

        return { players, pagination };
    }

    /**
     * Get single player by ID with latest version only
     */
    async getPlayerById(playerId: number): Promise<any> {
        const player = await Player.findByPk(playerId, {
            include: [
                {
                    model: Nationality,
                    as: 'nationality',
                    attributes: ['id', 'name']
                },
                {
                    model: PlayerVersion,
                    as: 'versions',
                    separate: true,
                    limit: 1,
                    order: [['fifa_version', 'DESC'], ['fifa_update', 'DESC']],
                    include: [
                        {
                            model: Club,
                            as: 'club',
                            attributes: ['id', 'name', 'club_logo_url']
                        },
                        {
                            model: NationTeam,
                            as: 'nationTeam',
                            attributes: ['id', 'name']
                        },
                        {
                            model: SkillStats,
                            as: 'skillSet'
                        },
                        {
                            model: PlayerVersionPosition,
                            as: 'positions',
                            include: [
                                {
                                    model: Position,
                                    as: 'position',
                                    attributes: ['id', 'code', 'name']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!player) {
            throw new NotFoundError('Player', playerId);
        }

        // Format response with only latest version
        const latestVersion = player.versions?.[0];
        const playerAny = player as any;
        
        return {
            id: player.id,
            externalPlayerId: player.external_player_id,
            shortName: player.short_name,
            longName: player.long_name,
            dob: player.dob,
            playerUrl: player.player_url,
            playerFaceUrl: player.player_face_url,
            nationality: playerAny.nationality,
            latestVersion: latestVersion ? {
                id: latestVersion.id,
                fifaVersion: latestVersion.fifa_version,
                fifaUpdate: latestVersion.fifa_update,
                overall: latestVersion.overall,
                potential: latestVersion.potential,
                age: latestVersion.age,
                heightCm: latestVersion.height_cm,
                weightKg: latestVersion.weight_kg,
                valueEur: latestVersion.value_eur,
                wageEur: latestVersion.wage_eur,
                playerPositions: latestVersion.player_positions,
                preferredFoot: latestVersion.preferred_foot,
                weakFoot: latestVersion.weak_foot,
                skillMoves: latestVersion.skill_moves,
                workRate: latestVersion.work_rate,
                bodyType: latestVersion.body_type,
                club: (latestVersion as any).club,
                nationTeam: (latestVersion as any).nationTeam,
                positions: (latestVersion as any).positions,
                skillSet: (latestVersion as any).skillSet
            } : null
        };
    }

    /**
     * Create new player with empty template
     */
    async createPlayer(userId: number, data: CreatePlayerDTO): Promise<any> {
        const transaction = await sequelize.transaction();

        try {
            // Create player
            const player = await Player.create({
                id: data.id,
                external_player_id: data.externalPlayerId,
                short_name: data.shortName,
                long_name: data.longName,
                nationality_id: data.nationalityId,
                user_id: userId,
                dob: data.dob,
                player_url: data.playerUrl,
                player_face_url: data.playerFaceUrl
            }, { transaction });

            // Create empty skill stats
            const skillStats = await SkillStats.create({}, { transaction });

            // Create initial player version (empty template)
            const playerVersion = await PlayerVersion.create({
                player_id: player.external_player_id,
                skill_set_id: skillStats.id,
                fifa_version: new Date().getFullYear(), // Current year as default
                overall: null,
                potential: null
            }, { transaction });

            await transaction.commit();

            return this.getPlayerById(player.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Update player and current version
     */
    async updatePlayer(
        playerId: number,
        playerData: UpdatePlayerDTO,
        versionData: UpdatePlayerVersionDTO,
        skillsData?: SkillStatsDTO
    ): Promise<any> {
        const transaction = await sequelize.transaction();

        try {
            const player = await Player.findByPk(playerId);
            if (!player) {
                throw new NotFoundError('Player', playerId);
            }

            // Update player basic info
            if (playerData && Object.keys(playerData).length > 0) {
                await player.update(playerData, { transaction });
            }

            // Get latest version with skill set
            const latestVersion = await PlayerVersion.findOne({
                where: { player_id: player.external_player_id },
                order: [['fifaVersion', 'DESC'], ['createdAt', 'DESC']],
                include: [{ model: SkillStats, as: 'skillSet', required: false }]
            });

            if (latestVersion) {
                // Update player version
                if (versionData && Object.keys(versionData).length > 0) {
                    await latestVersion.update(versionData, { transaction });

                    // Update positions if provided
                    if (versionData.playerPositions) {
                        await this.updatePlayerPositions(
                            latestVersion.id,
                            versionData.playerPositions,
                            transaction
                        );
                    }
                }

                // Create or update skills
                if (skillsData) {
                    if (!latestVersion.skillSet) {
                        // Create new skill set if it doesn't exist
                        const newSkillSet = await SkillStats.create(skillsData, { transaction });
                        await latestVersion.update({ skill_set_id: newSkillSet.id }, { transaction });
                    } else {
                        // Update existing skill set
                        await latestVersion.skillSet.update(skillsData, { transaction });
                    }
                }
            }

            await transaction.commit();

            return this.getPlayerById(playerId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Delete player (soft delete)
     */
    async deletePlayer(playerId: number): Promise<void> {
        const player = await Player.findByPk(playerId);
        if (!player) {
            throw new NotFoundError('Player', playerId);
        }

        // Sequelize will cascade delete PlayerVersions due to FK constraints
        await player.destroy();
    }

    /**
     * Get all versions of a player (for timeline)
     */
    async getPlayerVersions(playerId: number): Promise<any[]> {
        const player = await Player.findByPk(playerId);
        if (!player) {
            throw new NotFoundError('Player', playerId);
        }

        const versions = await PlayerVersion.findAll({
            where: { player_id: playerId },
            include: [
                {
                    model: Club,
                    as: 'club',
                    attributes: ['id', 'name']
                },
                {
                    model: SkillStats,
                    as: 'skillSet'
                }
            ],
            order: [['fifa_version', 'ASC'], ['fifa_update', 'ASC']]
        });

        return versions;
    }

    /**
     * Get player radar chart data (for Chart.js Radar Chart)
     * Returns the 6 main stats formatted for frontend visualization
     */
    async getPlayerRadarStats(playerId: number): Promise<any> {
        const player = await Player.findByPk(playerId, {
            include: [
                {
                    model: PlayerVersion,
                    as: 'versions',
                    include: [
                        {
                            model: SkillStats,
                            as: 'skillSet'
                        },
                        {
                            model: Club,
                            as: 'club',
                            attributes: ['id', 'name', 'club_logo_url']
                        },
                        {
                            model: PlayerVersionPosition,
                            as: 'positions',
                            include: [
                                {
                                    model: Position,
                                    as: 'position'
                                }
                            ]
                        }
                    ],
                    order: [['fifaVersion', 'DESC']],
                    limit: 1
                }
            ]
        });

        if (!player) {
            throw new NotFoundError('Player', playerId);
        }

        const latestVersion = player.versions?.[0];
        if (!latestVersion) {
            throw new NotFoundError('PlayerVersion for player', playerId);
        }

        const skills = latestVersion.skillSet;

        // Main 6 stats for radar chart
        const radarData = {
            labels: ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physic'],
            values: [
                skills?.pace ?? 0,
                skills?.shooting ?? 0,
                skills?.passing ?? 0,
                skills?.dribbling ?? 0,
                skills?.defending ?? 0,
                skills?.physic ?? 0
            ]
        };

        // Detailed stats breakdown (organized by category)
        const detailedStats = {
            attacking: {
                crossing: skills?.attacking_crossing ?? 0,
                finishing: skills?.attacking_finishing ?? 0,
                headingAccuracy: skills?.attacking_heading_accuracy ?? 0,
                shortPassing: skills?.attacking_short_passing ?? 0,
                volleys: skills?.attacking_volleys ?? 0
            },
            skill: {
                dribbling: skills?.skill_dribbling ?? 0,
                curve: skills?.skill_curve ?? 0,
                fkAccuracy: skills?.skill_fk_accuracy ?? 0,
                longPassing: skills?.skill_long_passing ?? 0,
                ballControl: skills?.skill_ball_control ?? 0
            },
            movement: {
                acceleration: skills?.movement_acceleration ?? 0,
                sprintSpeed: skills?.movement_sprint_speed ?? 0,
                agility: skills?.movement_agility ?? 0,
                reactions: skills?.movement_reactions ?? 0,
                balance: skills?.movement_balance ?? 0
            },
            power: {
                shotPower: skills?.power_shot_power ?? 0,
                jumping: skills?.power_jumping ?? 0,
                stamina: skills?.power_stamina ?? 0,
                strength: skills?.power_strength ?? 0,
                longShots: skills?.power_long_shots ?? 0
            },
            mentality: {
                aggression: skills?.mentality_aggression ?? 0,
                interceptions: skills?.mentality_interceptions ?? 0,
                positioning: skills?.mentality_positioning ?? 0,
                vision: skills?.mentality_vision ?? 0,
                penalties: skills?.mentality_penalties ?? 0,
                composure: skills?.mentality_composure ?? 0
            },
            defending: {
                markingAwareness: skills?.defending_marking_awareness ?? 0,
                standingTackle: skills?.defending_standing_tackle ?? 0,
                slidingTackle: skills?.defending_sliding_tackle ?? 0
            },
            goalkeeping: {
                diving: skills?.goalkeeping_diving ?? 0,
                handling: skills?.goalkeeping_handling ?? 0,
                kicking: skills?.goalkeeping_kicking ?? 0,
                positioning: skills?.goalkeeping_positioning ?? 0,
                reflexes: skills?.goalkeeping_reflexes ?? 0,
                speed: skills?.goalkeeping_speed ?? 0
            }
        };

        // Get primary position from player_positions string (e.g., "ST, CF")
        const primaryPosition = latestVersion.player_positions?.split(',')[0]?.trim() || 'N/A';

        return {
            playerInfo: {
                id: player.id,
                shortName: player.short_name,
                longName: player.long_name,
                playerFaceUrl: player.player_face_url,
                overall: latestVersion.overall,
                potential: latestVersion.potential,
                age: latestVersion.age,
                position: primaryPosition,
                club: (latestVersion as any).club?.name || 'Free Agent',
                clubLogo: (latestVersion as any).club?.club_logo_url || null,
                fifaVersion: latestVersion.fifa_version
            },
            radarChart: radarData,
            detailedStats
        };
    }

    /**
     * Update player positions (parse "ST, CF, LW" and create records)
     */
    private async updatePlayerPositions(
        playerVersionId: number,
        positionsString: string,
        transaction: Transaction
    ): Promise<void> {
        // Delete existing positions
        await PlayerVersionPosition.destroy({
            where: { player_version_id: playerVersionId },
            transaction
        });

        // Parse positions
        const positionCodes = positionsString
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);

        // Create new position records
        for (let i = 0; i < positionCodes.length; i++) {
            const position = await Position.findOne({
                where: { code: positionCodes[i] }
            });

            if (position) {
                await PlayerVersionPosition.create({
                    player_version_id: playerVersionId,
                    position_id: position.id,
                    is_primary: i === 0 // First position is primary
                }, { transaction });
            }
        }
    }
}
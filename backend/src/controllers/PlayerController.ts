// ============================================
// PLAYER CONTROLLER
// Handles HTTP requests for player operations
// Now uses FifaPlayer from dump (players table)
// ============================================

import { Response, NextFunction } from 'express';
import { FifaPlayerService } from '../services/player/FifaPlayerService';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
const ExcelJS = require('exceljs');

export class PlayerController {
    private fifaPlayerService: FifaPlayerService;

    constructor() {
        this.fifaPlayerService = new FifaPlayerService();
    }

    /**
     * GET /api/players
     * Get paginated list of players with filters
     */
    getPlayers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const filters = {
                name: req.query.name as string,
                clubName: req.query['club-name'] as string,
                position: req.query.position as string,
                nationalityName: req.query['nationality-name'] as string,
                fifaVersion: req.query['fifa-version'] as string,
                gender: req.query.gender ? (req.query.gender as string).toUpperCase() as 'M' | 'F' : undefined,
                overallMin: req.query['overall-min'] ? parseInt(req.query['overall-min'] as string) : undefined,
                overallMax: req.query['overall-max'] ? parseInt(req.query['overall-max'] as string) : undefined,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 20
            };

            const result = await this.fifaPlayerService.getPlayers(filters);

            return ApiResponse.successWithPagination(res, result.players, result.pagination, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/players/:id
     * Get single player with full details
     */
    getPlayerById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const playerId = parseInt(req.params.id);

            const player = await this.fifaPlayerService.getPlayerById(playerId);

            return ApiResponse.success(res, player, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/players/:id/radar-stats
     * Get comprehensive radar chart data for Chart.js
     * Includes main 6 stats + detailed breakdowns
     */
    getPlayerRadarStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const playerId = parseInt(req.params.id);

            const radarStats = await this.fifaPlayerService.getPlayerRadarStats(playerId);

            return ApiResponse.success(res, radarStats, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/players/:id/timeline
     * Get player evolution across FIFA versions
     */
    getPlayerTimeline = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const playerId = parseInt(req.params.id);
            const skillName = req.query.skill as string;

            const timeline = await this.fifaPlayerService.getPlayerTimeline(playerId, skillName);

            return ApiResponse.success(res, timeline, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/players/search
     * Search players by name
     */
    searchPlayers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const query = req.query.q as string;
            const gender = req.query.gender ? (req.query.gender as string).toUpperCase() as 'M' | 'F' : undefined;

            if (!query || query.length < 2) {
                return ApiResponse.error(res, 'INVALID_QUERY', 'Search query must be at least 2 characters', 400);
            }

            const players = await this.fifaPlayerService.searchPlayers(query, 20, undefined, gender);

            return ApiResponse.success(res, players, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/players/top-rated
     * Get top rated players
     */
    getTopRated = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const fifaVersion = req.query['fifa-version'] as string;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
            const gender = req.query.gender ? (req.query.gender as string).toUpperCase() as 'M' | 'F' : undefined;

            const players = await this.fifaPlayerService.getTopRatedPlayers({
                fifaVersion,
                limit,
                gender
            });

            return ApiResponse.success(res, players, 200);
        } catch (error) {
            next(error);
        }
    };

    createPlayer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const body = req.body;
            const playerData = {
                fifa_version: body.fifaVersion || body.fifa_version || new Date().getFullYear().toString(),
                fifa_update: body.fifaUpdate || body.fifa_update || '1',
                gender: body.gender || 'M',
                player_face_url: body.playerFaceUrl || body.player_face_url || 'https://cdn.sofifa.net/players/notfound_0_0.png',
                long_name: body.longName || body.long_name,
                short_name: body.shortName || body.short_name,
                player_positions: body.playerPositions || body.player_positions,
                club_name: body.clubName || body.club_name || null,
                nationality_name: body.nationalityName || body.nationality_name || null,
                overall: body.overall || 50,
                potential: body.potential || 50,
                value_eur: body.valueEur || body.value_eur || null,
                wage_eur: body.wageEur || body.wage_eur || null,
                age: body.age || 18,
                height_cm: body.heightCm || body.height_cm || null,
                weight_kg: body.weightKg || body.weight_kg || null,
                preferred_foot: body.preferredFoot || body.preferred_foot || 'Right',
                weak_foot: body.weakFoot || body.weak_foot || 3,
                skill_moves: body.skillMoves || body.skill_moves || 3,
                work_rate: body.workRate || body.work_rate || 'Medium/Medium',
                body_type: body.bodyType || body.body_type || 'Normal',
                pace: body.pace || 50,
                shooting: body.shooting || 50,
                passing: body.passing || 50,
                dribbling: body.dribbling || 50,
                defending: body.defending || 50,
                physic: body.physic || 50,
                attacking_crossing: body.attackingCrossing || body.attacking_crossing || null,
                attacking_finishing: body.attackingFinishing || body.attacking_finishing || null,
                attacking_heading_accuracy: body.attackingHeadingAccuracy || body.attacking_heading_accuracy || null,
                attacking_short_passing: body.attackingShortPassing || body.attacking_short_passing || null,
                attacking_volleys: body.attackingVolleys || body.attacking_volleys || null,
                skill_dribbling: body.skillDribbling || body.skill_dribbling || null,
                skill_curve: body.skillCurve || body.skill_curve || null,
                skill_fk_accuracy: body.skillFkAccuracy || body.skill_fk_accuracy || null,
                skill_long_passing: body.skillLongPassing || body.skill_long_passing || null,
                skill_ball_control: body.skillBallControl || body.skill_ball_control || null,
                movement_acceleration: body.movementAcceleration || body.movement_acceleration || null,
                movement_sprint_speed: body.movementSprintSpeed || body.movement_sprint_speed || null,
                movement_agility: body.movementAgility || body.movement_agility || null,
                movement_reactions: body.movementReactions || body.movement_reactions || null,
                movement_balance: body.movementBalance || body.movement_balance || null,
                power_shot_power: body.powerShotPower || body.power_shot_power || null,
                power_jumping: body.powerJumping || body.power_jumping || null,
                power_stamina: body.powerStamina || body.power_stamina || null,
                power_strength: body.powerStrength || body.power_strength || null,
                power_long_shots: body.powerLongShots || body.power_long_shots || null,
                mentality_aggression: body.mentalityAggression || body.mentality_aggression || null,
                mentality_interceptions: body.mentalityInterceptions || body.mentality_interceptions || null,
                mentality_positioning: body.mentalityPositioning || body.mentality_positioning || null,
                mentality_vision: body.mentalityVision || body.mentality_vision || null,
                mentality_penalties: body.mentalityPenalties || body.mentality_penalties || null,
                mentality_composure: body.mentalityComposure || body.mentality_composure || null,
                defending_marking: body.defendingMarking || body.defending_marking || null,
                defending_standing_tackle: body.defendingStandingTackle || body.defending_standing_tackle || null,
                defending_sliding_tackle: body.defendingSlidingTackle || body.defending_sliding_tackle || null,
                goalkeeping_diving: body.goalkeepingDiving || body.goalkeeping_diving || null,
                goalkeeping_handling: body.goalkeepingHandling || body.goalkeeping_handling || null,
                goalkeeping_kicking: body.goalkeepingKicking || body.goalkeeping_kicking || null,
                goalkeeping_positioning: body.goalkeepingPositioning || body.goalkeeping_positioning || null,
                goalkeeping_reflexes: body.goalkeepingReflexes || body.goalkeeping_reflexes || null,
                goalkeeping_speed: body.goalkeepingSpeed || body.goalkeeping_speed || null,
                player_traits: body.playerTraits || body.player_traits || null
            };

            const player = await this.fifaPlayerService.createPlayer(playerData);

            return ApiResponse.success(res, player, 201);
        } catch (error) {
            next(error);
        }
    };

    updatePlayer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const playerId = parseInt(req.params.id);
            const body = req.body;

            // Map camelCase to snake_case for fields that are present
            const playerData: any = {};

            // Basic fields
            if (body.fifaVersion !== undefined || body.fifa_version !== undefined) 
                playerData.fifa_version = body.fifaVersion || body.fifa_version;
            if (body.fifaUpdate !== undefined || body.fifa_update !== undefined) 
                playerData.fifa_update = body.fifaUpdate || body.fifa_update;
            if (body.gender !== undefined) 
                playerData.gender = body.gender;
            if (body.playerFaceUrl !== undefined || body.player_face_url !== undefined) 
                playerData.player_face_url = body.playerFaceUrl || body.player_face_url;
            if (body.longName !== undefined || body.long_name !== undefined) 
                playerData.long_name = body.longName || body.long_name;
            if (body.shortName !== undefined || body.short_name !== undefined) 
                playerData.short_name = body.shortName || body.short_name;
            if (body.playerPositions !== undefined || body.player_positions !== undefined) 
                playerData.player_positions = body.playerPositions || body.player_positions;
            if (body.clubName !== undefined || body.club_name !== undefined) 
                playerData.club_name = body.clubName || body.club_name;
            if (body.nationalityName !== undefined || body.nationality_name !== undefined) 
                playerData.nationality_name = body.nationalityName || body.nationality_name;

            // Stats
            if (body.overall !== undefined) playerData.overall = body.overall;
            if (body.potential !== undefined) playerData.potential = body.potential;
            if (body.valueEur !== undefined || body.value_eur !== undefined) 
                playerData.value_eur = body.valueEur || body.value_eur;
            if (body.wageEur !== undefined || body.wage_eur !== undefined) 
                playerData.wage_eur = body.wageEur || body.wage_eur;
            if (body.age !== undefined) playerData.age = body.age;
            if (body.heightCm !== undefined || body.height_cm !== undefined) 
                playerData.height_cm = body.heightCm || body.height_cm;
            if (body.weightKg !== undefined || body.weight_kg !== undefined) 
                playerData.weight_kg = body.weightKg || body.weight_kg;
            if (body.preferredFoot !== undefined || body.preferred_foot !== undefined) 
                playerData.preferred_foot = body.preferredFoot || body.preferred_foot;
            if (body.weakFoot !== undefined || body.weak_foot !== undefined) 
                playerData.weak_foot = body.weakFoot || body.weak_foot;
            if (body.skillMoves !== undefined || body.skill_moves !== undefined) 
                playerData.skill_moves = body.skillMoves || body.skill_moves;
            if (body.workRate !== undefined || body.work_rate !== undefined) 
                playerData.work_rate = body.workRate || body.work_rate;
            if (body.bodyType !== undefined || body.body_type !== undefined) 
                playerData.body_type = body.bodyType || body.body_type;

            // Main attributes
            if (body.pace !== undefined) playerData.pace = body.pace;
            if (body.shooting !== undefined) playerData.shooting = body.shooting;
            if (body.passing !== undefined) playerData.passing = body.passing;
            if (body.dribbling !== undefined) playerData.dribbling = body.dribbling;
            if (body.defending !== undefined) playerData.defending = body.defending;
            if (body.physic !== undefined) playerData.physic = body.physic;

            // Detailed stats
            if (body.attackingCrossing !== undefined || body.attacking_crossing !== undefined) 
                playerData.attacking_crossing = body.attackingCrossing || body.attacking_crossing;
            if (body.attackingFinishing !== undefined || body.attacking_finishing !== undefined) 
                playerData.attacking_finishing = body.attackingFinishing || body.attacking_finishing;
            if (body.attackingHeadingAccuracy !== undefined || body.attacking_heading_accuracy !== undefined) 
                playerData.attacking_heading_accuracy = body.attackingHeadingAccuracy || body.attacking_heading_accuracy;
            if (body.attackingShortPassing !== undefined || body.attacking_short_passing !== undefined) 
                playerData.attacking_short_passing = body.attackingShortPassing || body.attacking_short_passing;
            if (body.attackingVolleys !== undefined || body.attacking_volleys !== undefined) 
                playerData.attacking_volleys = body.attackingVolleys || body.attacking_volleys;
            if (body.skillDribbling !== undefined || body.skill_dribbling !== undefined) 
                playerData.skill_dribbling = body.skillDribbling || body.skill_dribbling;
            if (body.skillCurve !== undefined || body.skill_curve !== undefined) 
                playerData.skill_curve = body.skillCurve || body.skill_curve;
            if (body.skillFkAccuracy !== undefined || body.skill_fk_accuracy !== undefined) 
                playerData.skill_fk_accuracy = body.skillFkAccuracy || body.skill_fk_accuracy;
            if (body.skillLongPassing !== undefined || body.skill_long_passing !== undefined) 
                playerData.skill_long_passing = body.skillLongPassing || body.skill_long_passing;
            if (body.skillBallControl !== undefined || body.skill_ball_control !== undefined) 
                playerData.skill_ball_control = body.skillBallControl || body.skill_ball_control;
            if (body.movementAcceleration !== undefined || body.movement_acceleration !== undefined) 
                playerData.movement_acceleration = body.movementAcceleration || body.movement_acceleration;
            if (body.movementSprintSpeed !== undefined || body.movement_sprint_speed !== undefined) 
                playerData.movement_sprint_speed = body.movementSprintSpeed || body.movement_sprint_speed;
            if (body.movementAgility !== undefined || body.movement_agility !== undefined) 
                playerData.movement_agility = body.movementAgility || body.movement_agility;
            if (body.movementReactions !== undefined || body.movement_reactions !== undefined) 
                playerData.movement_reactions = body.movementReactions || body.movement_reactions;
            if (body.movementBalance !== undefined || body.movement_balance !== undefined) 
                playerData.movement_balance = body.movementBalance || body.movement_balance;
            if (body.powerShotPower !== undefined || body.power_shot_power !== undefined) 
                playerData.power_shot_power = body.powerShotPower || body.power_shot_power;
            if (body.powerJumping !== undefined || body.power_jumping !== undefined) 
                playerData.power_jumping = body.powerJumping || body.power_jumping;
            if (body.powerStamina !== undefined || body.power_stamina !== undefined) 
                playerData.power_stamina = body.powerStamina || body.power_stamina;
            if (body.powerStrength !== undefined || body.power_strength !== undefined) 
                playerData.power_strength = body.powerStrength || body.power_strength;
            if (body.powerLongShots !== undefined || body.power_long_shots !== undefined) 
                playerData.power_long_shots = body.powerLongShots || body.power_long_shots;
            if (body.mentalityAggression !== undefined || body.mentality_aggression !== undefined) 
                playerData.mentality_aggression = body.mentalityAggression || body.mentality_aggression;
            if (body.mentalityInterceptions !== undefined || body.mentality_interceptions !== undefined) 
                playerData.mentality_interceptions = body.mentalityInterceptions || body.mentality_interceptions;
            if (body.mentalityPositioning !== undefined || body.mentality_positioning !== undefined) 
                playerData.mentality_positioning = body.mentalityPositioning || body.mentality_positioning;
            if (body.mentalityVision !== undefined || body.mentality_vision !== undefined) 
                playerData.mentality_vision = body.mentalityVision || body.mentality_vision;
            if (body.mentalityPenalties !== undefined || body.mentality_penalties !== undefined) 
                playerData.mentality_penalties = body.mentalityPenalties || body.mentality_penalties;
            if (body.mentalityComposure !== undefined || body.mentality_composure !== undefined) 
                playerData.mentality_composure = body.mentalityComposure || body.mentality_composure;
            if (body.defendingMarking !== undefined || body.defending_marking !== undefined) 
                playerData.defending_marking = body.defendingMarking || body.defending_marking;
            if (body.defendingStandingTackle !== undefined || body.defending_standing_tackle !== undefined) 
                playerData.defending_standing_tackle = body.defendingStandingTackle || body.defending_standing_tackle;
            if (body.defendingSlidingTackle !== undefined || body.defending_sliding_tackle !== undefined) 
                playerData.defending_sliding_tackle = body.defendingSlidingTackle || body.defending_sliding_tackle;
            if (body.goalkeepingDiving !== undefined || body.goalkeeping_diving !== undefined) 
                playerData.goalkeeping_diving = body.goalkeepingDiving || body.goalkeeping_diving;
            if (body.goalkeepingHandling !== undefined || body.goalkeeping_handling !== undefined) 
                playerData.goalkeeping_handling = body.goalkeepingHandling || body.goalkeeping_handling;
            if (body.goalkeepingKicking !== undefined || body.goalkeeping_kicking !== undefined) 
                playerData.goalkeeping_kicking = body.goalkeepingKicking || body.goalkeeping_kicking;
            if (body.goalkeepingPositioning !== undefined || body.goalkeeping_positioning !== undefined) 
                playerData.goalkeeping_positioning = body.goalkeepingPositioning || body.goalkeeping_positioning;
            if (body.goalkeepingReflexes !== undefined || body.goalkeeping_reflexes !== undefined) 
                playerData.goalkeeping_reflexes = body.goalkeepingReflexes || body.goalkeeping_reflexes;
            if (body.goalkeepingSpeed !== undefined || body.goalkeeping_speed !== undefined) 
                playerData.goalkeeping_speed = body.goalkeepingSpeed || body.goalkeeping_speed;
            if (body.playerTraits !== undefined || body.player_traits !== undefined) 
                playerData.player_traits = body.playerTraits || body.player_traits;

            const player = await this.fifaPlayerService.updatePlayer(playerId, playerData);

            return ApiResponse.success(res, player, 200);
        } catch (error) {
            next(error);
        }
    };

    deletePlayer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const playerId = parseInt(req.params.id);

            const result = await this.fifaPlayerService.deletePlayer(playerId);

            return ApiResponse.success(res, result, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/players/export
     * Export filtered players to CSV or Excel (Protected)
     */
    exportPlayers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            console.log('📥 Export request received', req.query);
            
            const format = (req.query.format as string) || 'csv';
            
            if (format !== 'csv' && format !== 'xlsx') {
                return ApiResponse.error(res, 'INVALID_FORMAT', 'Format must be csv or xlsx', 400) as any;
            }

            // Extract filters from query
            const filters: any = {
                name: req.query.name as string,
                clubName: req.query.clubName as string,
                nationalityName: req.query.nationalityName as string,
                position: req.query.position as string,
                fifaVersion: req.query.fifaVersion as string,
                fifaUpdate: req.query.fifaUpdate as string,
                gender: req.query.gender ? (req.query.gender as string).toUpperCase() as 'M' | 'F' : undefined,
                overallMin: req.query.overallMin ? parseInt(req.query.overallMin as string) : undefined,
                overallMax: req.query.overallMax ? parseInt(req.query.overallMax as string) : undefined,
                potentialMin: req.query.potentialMin ? parseInt(req.query.potentialMin as string) : undefined,
                potentialMax: req.query.potentialMax ? parseInt(req.query.potentialMax as string) : undefined,
                ageMin: req.query.ageMin ? parseInt(req.query.ageMin as string) : undefined,
                ageMax: req.query.ageMax ? parseInt(req.query.ageMax as string) : undefined,
            };

            console.log('🔍 Fetching players with filters:', filters);
            const players = await this.fifaPlayerService.exportPlayers(filters, format as 'csv' | 'xlsx');
            console.log(`✅ Got ${players.length} players`);

            if (players.length === 0) {
                return ApiResponse.error(res, 'NO_DATA', 'No players found with the given filters', 404) as any;
            }

            if (format === 'csv') {
                // Generate CSV
                const { Parser } = require('json2csv');
                const fields = [
                    'id', 'long_name', 'short_name', 'player_positions', 'club_name', 
                    'nationality_name', 'overall', 'potential', 'age', 'value_eur', 
                    'wage_eur', 'fifa_version', 'fifa_update', 'gender',
                    'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic'
                ];
                
                const json2csvParser = new Parser({ fields });
                const csv = json2csvParser.parse(players);

                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="fifa-players-${Date.now()}.csv"`);
                res.status(200).send(csv);
            } else {
                // Generate Excel
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('FIFA Players');

                // Add headers
                worksheet.columns = [
                    { header: 'ID', key: 'id', width: 10 },
                    { header: 'Full Name', key: 'long_name', width: 30 },
                    { header: 'Short Name', key: 'short_name', width: 20 },
                    { header: 'Position', key: 'player_positions', width: 15 },
                    { header: 'Club', key: 'club_name', width: 25 },
                    { header: 'Nationality', key: 'nationality_name', width: 20 },
                    { header: 'Overall', key: 'overall', width: 10 },
                    { header: 'Potential', key: 'potential', width: 10 },
                    { header: 'Age', key: 'age', width: 10 },
                    { header: 'Value (EUR)', key: 'value_eur', width: 15 },
                    { header: 'Wage (EUR)', key: 'wage_eur', width: 15 },
                    { header: 'FIFA Version', key: 'fifa_version', width: 12 },
                    { header: 'FIFA Update', key: 'fifa_update', width: 12 },
                    { header: 'Gender', key: 'gender', width: 10 },
                    { header: 'Pace', key: 'pace', width: 10 },
                    { header: 'Shooting', key: 'shooting', width: 10 },
                    { header: 'Passing', key: 'passing', width: 10 },
                    { header: 'Dribbling', key: 'dribbling', width: 10 },
                    { header: 'Defending', key: 'defending', width: 10 },
                    { header: 'Physical', key: 'physic', width: 10 }
                ];

                // Style header row
                worksheet.getRow(1).font = { bold: true };
                worksheet.getRow(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4CAF50' }
                };

                // Add data
                players.forEach((player: any) => {
                    worksheet.addRow(player);
                });

                // Set response headers
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="fifa-players-${Date.now()}.xlsx"`);

                // Write to response
                await workbook.xlsx.write(res);
                res.status(200).end();
            }
        } catch (error) {
            console.error('Export error:', error);
            next(error);
        }
    };
}

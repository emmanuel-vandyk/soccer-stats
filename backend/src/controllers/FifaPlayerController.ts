// ============================================
// FIFA PLAYER CONTROLLER
// Handles HTTP requests for FIFA player data from the SQL dump
// ============================================

import { Request, Response, NextFunction } from 'express';
import { FifaPlayerService } from '../services/player/FifaPlayerService';
import { ApiResponse } from '../utils/ApiResponse';

export interface FifaPlayerFilters {
    name?: string;
    clubName?: string;
    nationalityName?: string;
    position?: string;
    fifaVersion?: string;
    fifaUpdate?: string;
    gender?: 'M' | 'F'; // M = Male, F = Female
    overallMin?: number;
    overallMax?: number;
    potentialMin?: number;
    potentialMax?: number;
    ageMin?: number;
    ageMax?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export class FifaPlayerController {
    private fifaPlayerService: FifaPlayerService;

    constructor() {
        this.fifaPlayerService = new FifaPlayerService();
    }

    /**
     * GET /api/fifa-players
     * Get paginated list of FIFA players with filters
     */
    getPlayers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const filters: FifaPlayerFilters = {
                name: req.query.name as string,
                clubName: req.query['club-name'] as string,
                nationalityName: req.query['nationality-name'] as string,
                position: req.query.position as string,
                fifaVersion: req.query['fifa-version'] as string,
                fifaUpdate: req.query['fifa-update'] as string,
                gender: req.query.gender ? (req.query.gender as string).toUpperCase() as 'M' | 'F' : undefined,
                overallMin: req.query['overall-min'] ? parseInt(req.query['overall-min'] as string) : undefined,
                overallMax: req.query['overall-max'] ? parseInt(req.query['overall-max'] as string) : undefined,
                potentialMin: req.query['potential-min'] ? parseInt(req.query['potential-min'] as string) : undefined,
                potentialMax: req.query['potential-max'] ? parseInt(req.query['potential-max'] as string) : undefined,
                ageMin: req.query['age-min'] ? parseInt(req.query['age-min'] as string) : undefined,
                ageMax: req.query['age-max'] ? parseInt(req.query['age-max'] as string) : undefined,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
                sortBy: req.query['sort-by'] as string || 'overall',
                sortOrder: (req.query['sort-order'] as 'ASC' | 'DESC') || 'DESC'
            };

            const result = await this.fifaPlayerService.getPlayers(filters);

            // Enhanced response with query metadata
            const response = {
                data: result.players,
                pagination: result.pagination,
                meta: result.queryMeta
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/fifa-players/:id
     * Get a single FIFA player by ID
     */
    getPlayerById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const playerId = parseInt(req.params.id);
            const player = await this.fifaPlayerService.getPlayerById(playerId);

            return ApiResponse.success(res, player, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/fifa-players/versions
     * Get list of available FIFA versions with enhanced metadata
     */
    getVersions = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const versions = await this.fifaPlayerService.getAvailableVersions();

            return ApiResponse.success(res, versions, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/fifa-players/filter-metadata
     * Get optimized metadata for frontend filter components
     */
    getFilterMetadata = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const fifaVersion = req.query['fifa-version'] as string;
            const fifaUpdate = req.query['fifa-update'] as string;
            
            const metadata = await this.fifaPlayerService.getFilterMetadata(fifaVersion, fifaUpdate);

            return ApiResponse.success(res, metadata, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/fifa-players/versions-stats
     * Get FIFA versions with detailed statistics
     */
    getVersionsWithStats = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const stats = await this.fifaPlayerService.getFifaVersionsWithStats();

            return ApiResponse.success(res, stats, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/fifa-players/overall-distribution
     * Get overall rating distribution for specific FIFA version
     */
    getOverallDistribution = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const fifaVersion = req.query['fifa-version'] as string;
            const fifaUpdate = req.query['fifa-update'] as string;
            
            const distribution = await this.fifaPlayerService.getOverallRatingDistribution(fifaVersion, fifaUpdate);

            return ApiResponse.success(res, distribution, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/fifa-players/top-rated
     * Get top rated players
     */
    getTopRated = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
            const fifaVersion = req.query['fifa-version'] as string;
            const fifaUpdate = req.query['fifa-update'] as string;
            const position = req.query.position as string;
            const gender = req.query.gender ? (req.query.gender as string).toUpperCase() as 'M' | 'F' : undefined;

            const players = await this.fifaPlayerService.getTopRatedPlayers(
                limit,
                gender,
                fifaVersion,
                fifaUpdate
            );

            return ApiResponse.success(res, players, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/fifa-players/search
     * Search players by name
     */
    searchPlayers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const query = req.query.q as string;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
            const fifaVersion = req.query['fifa-version'] as string;
            const gender = req.query.gender ? (req.query.gender as string).toUpperCase() as 'M' | 'F' : undefined;

            if (!query || query.length < 2) {
                return ApiResponse.error(res, 'INVALID_QUERY', 'Search query must be at least 2 characters', 400);
            }

            const players = await this.fifaPlayerService.searchPlayers(query, limit, gender, fifaVersion);

            return ApiResponse.success(res, players, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/fifa-players/stats/:id
     * Get detailed stats for a player
     */
    getPlayerStats = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const playerId = parseInt(req.params.id);
            const stats = await this.fifaPlayerService.getPlayerStats(playerId);

            return ApiResponse.success(res, stats, 200);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/fifa-players/:id/timeline
     * Get player evolution across FIFA versions
     */
    getPlayerTimeline = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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
     * GET /api/fifa-players/export
     * Export filtered players to CSV or Excel
     */
    exportPlayers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const format = (req.query.format as string) || 'csv';
            
            if (format !== 'csv' && format !== 'xlsx') {
                return ApiResponse.error(res, 'INVALID_FORMAT', 'Format must be csv or xlsx', 400) as any;
            }

            const filters = this.extractFilters(req);
            const players = await this.fifaPlayerService.exportPlayers(filters, format as 'csv' | 'xlsx');

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

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=fifa-players-${Date.now()}.csv`);
                res.send(csv);
            } else {
                // Generate Excel
                const ExcelJS = require('exceljs');
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
                res.setHeader('Content-Disposition', `attachment; filename=fifa-players-${Date.now()}.xlsx`);

                // Write to response
                await workbook.xlsx.write(res);
                res.end();
            }
        } catch (error) {
            next(error);
        }
    };
}

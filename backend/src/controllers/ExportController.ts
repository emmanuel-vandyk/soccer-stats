// ============================================
// EXPORT CONTROLLER
// Handles CSV/Excel export requests
// ============================================

import { Response, NextFunction } from 'express';
import { ExportService } from '../services/export-csv/ExportService';
import { AuthRequest, ExportFilters } from '../types';

export class ExportController {
  private exportService: ExportService;

  constructor() {
    this.exportService = new ExportService();
  }

  /**
   * GET /api/export/players
   * Export players list to CSV or Excel
   */
  exportPlayers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const filters: ExportFilters = {
        name: req.query.name as string,
        clubId: req.query['club-id'] ? parseInt(req.query['club-id'] as string) : undefined,
        clubName: req.query['club-name'] as string,
        positionCode: req.query['position-code'] as string,
        nationalityId: req.query['nationality-id'] ? parseInt(req.query['nationality-id'] as string) : undefined,
        leagueId: req.query['league-id'] ? parseInt(req.query['league-id'] as string) : undefined,
        fifaVersion: req.query['fifa-version'] ? parseInt(req.query['fifa-version'] as string) : undefined,
        overallMin: req.query['overall-min'] ? parseInt(req.query['overall-min'] as string) : undefined,
        overallMax: req.query['overall-max'] ? parseInt(req.query['overall-max'] as string) : undefined,
        format: (req.query.format as 'csv' | 'xlsx') || 'csv'
      };

      const { data, contentType, filename } = await this.exportService.export(filters);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      return res.send(data);
    } catch (error) {
      next(error);
    }
  };
}
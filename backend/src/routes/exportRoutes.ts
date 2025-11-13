// ============================================
// EXPORT ROUTES
// CSV/Excel export endpoints
// All routes are protected with authMiddleware
// ============================================

import { Router } from 'express';
import { ExportController } from '../controllers/ExportController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { query } from 'express-validator';
import { validate } from '../middlewares/validationMiddleware';

const router = Router();
const exportController = new ExportController();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/export/players?format=csv&name=Messi&clubId=123
 * Export players list to CSV or Excel
 * Accepts same filters as GET /api/players
 */
router.get(
    '/players',
    [
        query('format')
            .optional()
            .isIn(['csv', 'xlsx'])
            .withMessage('Format must be csv or xlsx')
    ],
    validate,
    exportController.exportPlayers
);

export default router;
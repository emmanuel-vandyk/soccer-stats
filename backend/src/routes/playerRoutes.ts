// ============================================
// PLAYER ROUTES
// Player management endpoints using FifaPlayer
// All routes are protected with authMiddleware
// ============================================

import { Router } from 'express';
import { PlayerController } from '../controllers/PlayerController';
import { playerIdValidator, playerQueryValidators } from '../validators/player';
import { validate } from '../middlewares/validationMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';
import { cacheMiddleware } from '../middlewares/cacheMiddleware';

const router = Router();
const playerController = new PlayerController();

// Cache times (in seconds)
const CACHE_5_MIN = 300;
const CACHE_1_MIN = 60;
const CACHE_10_MIN = 600;

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/players/export?format=csv
 * Export filtered players to CSV or Excel (Protected)
 * @access Protected (JWT required)
 * @query format (csv|xlsx), plus all filter parameters
 */
router.get('/export', playerController.exportPlayers);

/**
 * GET /api/players/search?q=Messi
 * Search players by name (must be before /:id)
 * @cache 1 minute
 */
router.get('/search', cacheMiddleware(CACHE_1_MIN), playerController.searchPlayers);

/**
 * GET /api/players/top-rated?fifaVersion=23&limit=10
 * Get top rated players
 * @cache 5 minutes
 */
router.get('/top-rated', cacheMiddleware(CACHE_5_MIN), playerController.getTopRated);

/**
 * GET /api/players
 * Get paginated list of players with filters
 * @cache 5 minutes
 */
router.get('/', playerQueryValidators, validate, cacheMiddleware(CACHE_5_MIN), playerController.getPlayers);

/**
 * GET /api/players/:id
 * Get single player with full details
 * @cache 10 minutes
 */
router.get('/:id', playerIdValidator, validate, cacheMiddleware(CACHE_10_MIN), playerController.getPlayerById);

/**
 * GET /api/players/:id/radar-stats
 * Get comprehensive radar chart data (Chart.js ready)
 * @cache 10 minutes
 */
router.get('/:id/radar-stats', playerIdValidator, validate, cacheMiddleware(CACHE_10_MIN), playerController.getPlayerRadarStats);

/**
 * GET /api/players/:id/timeline?skill=pace
 * Get player evolution across FIFA versions
 * @cache 10 minutes
 */
router.get('/:id/timeline', playerIdValidator, validate, cacheMiddleware(CACHE_10_MIN), playerController.getPlayerTimeline);

/**
 * POST /api/players
 * Create new player
 */
router.post('/', playerController.createPlayer);

/**
 * PUT /api/players/:id
 * Update player
 */
router.put('/:id', playerIdValidator, validate, playerController.updatePlayer);

/**
 * DELETE /api/players/:id
 * Delete player
 */
router.delete('/:id', playerIdValidator, validate, playerController.deletePlayer);

export default router;

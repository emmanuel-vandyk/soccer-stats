// ============================================
// FIFA PLAYER ROUTES
// Routes for FIFA player data endpoints
// ============================================

import { Router } from 'express';
import { FifaPlayerController } from '../controllers/FifaPlayerController';
import { cacheMiddleware } from '../middlewares/cacheMiddleware';

const router = Router();
const controller = new FifaPlayerController();

// Cache times (in seconds)
const CACHE_1_HOUR = 3600;
const CACHE_5_MIN = 300;
const CACHE_1_MIN = 60;

/**
 * @route   GET /api/fifa-players
 * @desc    Get paginated list of FIFA players with filters
 * @query   name, clubName, nationalityName, position, fifaVersion, fifaUpdate,
 *          overallMin, overallMax, potentialMin, potentialMax, ageMin, ageMax,
 *          page, limit, sortBy, sortOrder
 * @access  Public
 * @cache   5 minutes
 */
router.get('/', cacheMiddleware(CACHE_5_MIN), controller.getPlayers);

/**
 * @route   GET /api/fifa-players/versions
 * @desc    Get list of available FIFA versions and updates with enhanced metadata
 * @access  Public
 * @cache   1 hour
 */
router.get('/versions', cacheMiddleware(CACHE_1_HOUR), controller.getVersions);

/**
 * @route   GET /api/fifa-players/versions-stats
 * @desc    Get FIFA versions with detailed statistics
 * @access  Public
 * @cache   1 hour
 */
router.get('/versions-stats', cacheMiddleware(CACHE_1_HOUR), controller.getVersionsWithStats);

/**
 * @route   GET /api/fifa-players/filter-metadata
 * @desc    Get optimized metadata for frontend filter components
 * @query   fifa-version, fifa-update
 * @access  Public
 * @cache   1 hour
 */
router.get('/filter-metadata', cacheMiddleware(CACHE_1_HOUR), controller.getFilterMetadata);

/**
 * @route   GET /api/fifa-players/overall-distribution
 * @desc    Get overall rating distribution for specific FIFA version
 * @query   fifa-version, fifa-update
 * @access  Public
 * @cache   1 hour
 */
router.get('/overall-distribution', cacheMiddleware(CACHE_1_HOUR), controller.getOverallDistribution);

/**
 * @route   GET /api/fifa-players/top-rated
 * @desc    Get top rated players
 * @query   limit, fifaVersion, fifaUpdate, position
 * @access  Public
 * @cache   5 minutes
 */
router.get('/top-rated', cacheMiddleware(CACHE_5_MIN), controller.getTopRated);

/**
 * @route   GET /api/fifa-players/search
 * @desc    Search players by name
 * @query   q (search query), limit, fifaVersion
 * @access  Public
 * @cache   1 minute
 */
router.get('/search', cacheMiddleware(CACHE_1_MIN), controller.searchPlayers);

/**
 * @route   GET /api/fifa-players/:id
 * @desc    Get a single FIFA player by ID
 * @access  Public
 * @cache   1 hour
 */
router.get('/:id', cacheMiddleware(CACHE_1_HOUR), controller.getPlayerById);

/**
 * @route   GET /api/fifa-players/stats/:id
 * @desc    Get detailed stats for a player
 * @access  Public
 * @cache   1 hour
 */
router.get('/stats/:id', cacheMiddleware(CACHE_1_HOUR), controller.getPlayerStats);

/**
 * @route   GET /api/fifa-players/:id/timeline
 * @desc    Get player evolution across FIFA versions (all historical versions)
 * @query   skill (optional) - specific skill to track (pace, shooting, etc.)
 * @access  Public
 * @cache   1 hour
 */
router.get('/:id/timeline', cacheMiddleware(CACHE_1_HOUR), controller.getPlayerTimeline);

export default router;

import { Router } from 'express';
import { ProxyController } from '../controllers/ProxyController';

const router = Router();

/**
 * @route   GET /api/proxy/image
 * @desc    Proxy endpoint for SoFIFA player images
 * @query   url - The full URL of the image from SoFIFA
 * @access  Public
 * @example /api/proxy/image?url=https://cdn.sofifa.net/players/158/023/25_120.png
 */
router.get('/image', ProxyController.getPlayerImage);

export default router;

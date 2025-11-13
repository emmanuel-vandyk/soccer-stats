import { Request, Response } from 'express';
import axios from 'axios';

export class ProxyController {
    /**
     * Proxy endpoint for SoFIFA player images
     * This bypasses CORS issues by fetching images server-side
     */
    static async getPlayerImage(req: Request, res: Response): Promise<void> {
        try {
            const imageUrl = req.query.url as string;

            if (!imageUrl) {
                res.status(400).json({
                    success: false,
                    error: 'Image URL is required'
                });
                return;
            }

            // Validate that the URL is from SoFIFA
            if (!imageUrl.includes('sofifa.net') && !imageUrl.includes('sofifa.com')) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid image source. Only SoFIFA images are allowed.'
                });
                return;
            }

            // Fetch the image from SoFIFA
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Referer': 'https://sofifa.com/'
                },
                timeout: 10000
            });

            // Set appropriate headers
            const contentType = response.headers['content-type'] || 'image/png';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
            res.setHeader('Access-Control-Allow-Origin', '*');

            // Send the image
            res.send(response.data);

        } catch (error: any) {
            console.error('Error proxying image:', error.message);
            
            // Send error response
            res.status(error.response?.status || 500).json({
                success: false,
                error: 'Failed to fetch image',
                message: error.message
            });
        }
    }
}

/**
 * Main Routes Index
 * Aggregates all route modules
 */

import { Router, Request, Response } from 'express';
import restaurantRoutes from './restaurant';

const router = Router();

// Health check endpoint
function handleHealthCheck(_req: Request, res: Response): void {
    res.status(200).json({
        success: true,
        message: 'Jelly API is running (Supabase)',
        timestamp: new Date().toISOString(),
    });
}

router.get('/health', handleHealthCheck);

// API routes
router.use('/restaurants', restaurantRoutes);

export default router;

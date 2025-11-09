/**
 * Main Routes Index
 * Aggregates all route modules
 */

import { Router } from 'express';
import restaurantRoutes from './restaurant.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Jelly API is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
router.use('/restaurants', restaurantRoutes);

export default router;

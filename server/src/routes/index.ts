import { Router, Request, Response } from 'express';

import restaurantRoutes from './restaurant';
import userRoutes from './user';

const router = Router();

// Health check endpoint
function handleHealthCheck(_req: Request, res: Response): void {
    res.status(200).json({
        success: true,
        message: 'Jelly API is running',
        timestamp: new Date().toISOString(),
    });
}

router.get('/health', handleHealthCheck);

router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);

export default router;

import { Router, Request, Response } from 'express';
import restaurantRoutes from './restaurant';
import tagRoutes from './tag';
import tagTypeRoutes from './tagType';
import reviewRoutes from './review';
import restaurantImageRoutes from './restaurantImage';
import menuItemRoutes from './menuItem';
import socialPostRoutes from './socialPost';

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

// API routes
router.use('/restaurants', restaurantRoutes);
router.use('/tags', tagRoutes);
router.use('/tag-types', tagTypeRoutes);
router.use('/reviews', reviewRoutes);
router.use('/images', restaurantImageRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/social-posts', socialPostRoutes);

export default router;

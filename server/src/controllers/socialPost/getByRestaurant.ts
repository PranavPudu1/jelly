import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get social posts by restaurant ID
 */
export async function getByRestaurant(req: Request, res: Response): Promise<void> {
    try {
        const { restaurantId } = req.params;
        const validOnly = req.query.validOnly === 'true';

        const where: any = { restaurantId };
        if (validOnly) {
            where.valid = true;
        }

        const socialPosts = await prisma.socialPost.findMany({
            where,
            include: {
                tags: {
                    include: {
                        tagType: true,
                    },
                },
            },
            orderBy: { dateAdded: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: socialPosts,
            total: socialPosts.length,
        });
    }
    catch (error) {
        console.error('Error fetching social posts by restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch social posts',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

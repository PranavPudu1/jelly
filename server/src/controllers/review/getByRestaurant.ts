import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get reviews by restaurant ID
 */
export async function getByRestaurant(req: Request, res: Response): Promise<void> {
    try {
        const { restaurantId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [reviews, total, avgRating] = await Promise.all([
            prisma.review.findMany({
                where: { restaurantId },
                skip,
                take: limit,
                include: {
                    tags: {
                        include: {
                            tagType: true,
                        },
                    },
                    images: true,
                },
                orderBy: { dateAdded: 'desc' },
            }),
            prisma.review.count({ where: { restaurantId } }),
            prisma.review.aggregate({
                where: { restaurantId },
                _avg: { rating: true },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
            stats: {
                totalReviews: total,
                averageRating: avgRating._avg.rating,
            },
        });
    }
    catch (error) {
        console.error('Error fetching reviews by restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

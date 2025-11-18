import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get all reviews with pagination
 */
export async function getAll(req: Request, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        // Filter by restaurant
        if (req.query.restaurantId) {
            where.restaurantId = req.query.restaurantId;
        }

        // Filter by minimum rating
        if (req.query.minRating) {
            where.rating = { gte: parseFloat(req.query.minRating as string) };
        }

        // Filter by source
        if (req.query.source) {
            where.source = req.query.source;
        }

        // Search by review text
        if (req.query.search) {
            where.review = { contains: req.query.search as string, mode: 'insensitive' };
        }

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where,
                skip,
                take: limit,
                include: {
                    restaurant: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                        },
                    },
                    tags: {
                        include: {
                            tagType: true,
                        },
                    },
                    images: true,
                },
                orderBy: { dateAdded: 'desc' },
            }),
            prisma.review.count({ where }),
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
        });
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

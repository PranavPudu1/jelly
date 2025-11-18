import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get all social posts with pagination
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

        // Filter by source
        if (req.query.source) {
            where.source = req.query.source;
        }

        // Filter by validity
        if (req.query.valid !== undefined) {
            where.valid = req.query.valid === 'true';
        }

        const [socialPosts, total] = await Promise.all([
            prisma.socialPost.findMany({
                where,
                skip,
                take: limit,
                include: {
                    restaurant: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    tags: {
                        include: {
                            tagType: true,
                        },
                    },
                },
                orderBy: { dateAdded: 'desc' },
            }),
            prisma.socialPost.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: socialPosts,
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
        console.error('Error fetching social posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch social posts',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

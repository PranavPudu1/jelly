import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get all images for a specific restaurant
 */
export async function getByRestaurantId(req: Request, res: Response): Promise<void> {
    try {
        const { restaurantId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        // Optional source filter
        const where: any = { restaurantId };
        if (req.query.source) {
            where.source = req.query.source;
        }

        const [images, total] = await Promise.all([
            prisma.restaurantImage.findMany({
                where,
                skip,
                take: limit,
                include: {
                    tags: {
                        include: {
                            tagType: true,
                        },
                    },
                },
                orderBy: { dateAdded: 'desc' },
            }),
            prisma.restaurantImage.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: images,
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
        console.error('Error fetching restaurant images:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurant images',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

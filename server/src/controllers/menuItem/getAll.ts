import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get all menu items with pagination
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

        const [menuItems, total] = await Promise.all([
            prisma.menuItem.findMany({
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
                    images: true,
                },
                orderBy: { dateAdded: 'desc' },
            }),
            prisma.menuItem.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: menuItems,
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
        console.error('Error fetching menu items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch menu items',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

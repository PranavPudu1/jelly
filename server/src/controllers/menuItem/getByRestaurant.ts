import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get menu items by restaurant ID
 */
export async function getByRestaurant(req: Request, res: Response): Promise<void> {
    try {
        const { restaurantId } = req.params;

        const menuItems = await prisma.menuItem.findMany({
            where: { restaurantId },
            include: {
                tags: {
                    include: {
                        tagType: true,
                    },
                },
                images: true,
            },
            orderBy: { dateAdded: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: menuItems,
            total: menuItems.length,
        });
    }
    catch (error) {
        console.error('Error fetching menu items by restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch menu items',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

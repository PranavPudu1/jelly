import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Create a new menu item
 */
export async function create(req: Request, res: Response): Promise<void> {
    try {
        const { restaurantId, source, sourceId } = req.body;

        // Validate required fields
        if (!restaurantId) {
            res.status(400).json({
                success: false,
                message: 'restaurantId is required',
            });
            return;
        }

        // Check if restaurant exists
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
        });

        if (!restaurant) {
            res.status(404).json({
                success: false,
                message: 'Restaurant not found',
            });
            return;
        }

        const menuItem = await prisma.menuItem.create({
            data: {
                restaurantId,
                source,
                sourceId,
            },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                tags: true,
                images: true,
            },
        });

        res.status(201).json({
            success: true,
            data: menuItem,
            message: 'Menu item created successfully',
        });
    }
    catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create menu item',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

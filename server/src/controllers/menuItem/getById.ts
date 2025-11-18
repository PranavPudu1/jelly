import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get a single menu item by ID
 */
export async function getById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        const menuItem = await prisma.menuItem.findUnique({
            where: { id },
            include: {
                restaurant: true,
                tags: {
                    include: {
                        tagType: true,
                    },
                },
                images: true,
            },
        });

        if (!menuItem) {
            res.status(404).json({
                success: false,
                message: 'Menu item not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: menuItem,
        });
    }
    catch (error) {
        console.error('Error fetching menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch menu item',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

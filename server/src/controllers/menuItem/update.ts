import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Update a menu item
 */
export async function update(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if menu item exists
        const existingMenuItem = await prisma.menuItem.findUnique({
            where: { id },
        });

        if (!existingMenuItem) {
            res.status(404).json({
                success: false,
                message: 'Menu item not found',
            });
            return;
        }

        const menuItem = await prisma.menuItem.update({
            where: { id },
            data: updateData,
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

        res.status(200).json({
            success: true,
            data: menuItem,
            message: 'Menu item updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update menu item',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Delete a menu item
 */
export async function deleteMenuItem(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

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

        await prisma.menuItem.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete menu item',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

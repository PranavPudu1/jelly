import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Delete a restaurant
 */
export async function deleteRestaurant(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        // Check if restaurant exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { id },
        });

        if (!existingRestaurant) {
            res.status(404).json({
                success: false,
                message: 'Restaurant not found',
            });
            return;
        }

        await prisma.restaurant.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Restaurant deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete restaurant',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

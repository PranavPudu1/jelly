import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Delete a restaurant image
 */
export async function deleteRestaurantImage(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        // Check if image exists
        const existingImage = await prisma.restaurantImage.findUnique({
            where: { id },
        });

        if (!existingImage) {
            res.status(404).json({
                success: false,
                message: 'Restaurant image not found',
            });
            return;
        }

        await prisma.restaurantImage.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Restaurant image deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting restaurant image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete restaurant image',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Update a restaurant
 */
export async function update(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const updateData = req.body;

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

        const restaurant = await prisma.restaurant.update({
            where: { id },
            data: updateData,
            include: {
                tags: true,
                images: true,
                reviews: true,
                menu: true,
                socialMedia: true,
            },
        });

        res.status(200).json({
            success: true,
            data: restaurant,
            message: 'Restaurant updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update restaurant',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

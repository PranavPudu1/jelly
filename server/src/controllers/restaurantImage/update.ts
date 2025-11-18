import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Update a restaurant image
 */
export async function update(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const updateData = req.body;

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

        const image = await prisma.restaurantImage.update({
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
            },
        });

        res.status(200).json({
            success: true,
            data: image,
            message: 'Restaurant image updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating restaurant image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update restaurant image',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

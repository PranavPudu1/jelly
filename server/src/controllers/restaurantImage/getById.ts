import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get a single restaurant image by ID
 */
export async function getById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        const image = await prisma.restaurantImage.findUnique({
            where: { id },
            include: {
                restaurant: true,
                review: true,
                menuItem: true,
                tags: {
                    include: {
                        tagType: true,
                    },
                },
            },
        });

        if (!image) {
            res.status(404).json({
                success: false,
                message: 'Restaurant image not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: image,
        });
    }
    catch (error) {
        console.error('Error fetching restaurant image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurant image',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

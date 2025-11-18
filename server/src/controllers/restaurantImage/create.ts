import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Create a new restaurant image
 */
export async function create(req: Request, res: Response): Promise<void> {
    try {
        const { url, restaurantId, reviewId, menuItemId, sourceId, source } = req.body;

        // Validate required fields
        if (!url) {
            res.status(400).json({
                success: false,
                message: 'url is required',
            });
            return;
        }

        // Ensure at least one parent reference exists
        if (!restaurantId && !reviewId && !menuItemId) {
            res.status(400).json({
                success: false,
                message: 'At least one of restaurantId, reviewId, or menuItemId is required',
            });
            return;
        }

        const image = await prisma.restaurantImage.create({
            data: {
                url,
                restaurantId,
                reviewId,
                menuItemId,
                sourceId,
                source,
            },
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

        res.status(201).json({
            success: true,
            data: image,
            message: 'Restaurant image created successfully',
        });
    }
    catch (error) {
        console.error('Error creating restaurant image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create restaurant image',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

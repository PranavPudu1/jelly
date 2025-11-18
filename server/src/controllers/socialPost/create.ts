import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Create a new social post
 */
export async function create(req: Request, res: Response): Promise<void> {
    try {
        const { restaurantId, source, url, valid = true } = req.body;

        // Validate required fields
        if (!restaurantId || !source || !url) {
            res.status(400).json({
                success: false,
                message: 'restaurantId, source, and url are required',
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

        const socialPost = await prisma.socialPost.create({
            data: {
                restaurantId,
                source,
                url,
                valid,
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
            data: socialPost,
            message: 'Social post created successfully',
        });
    }
    catch (error) {
        console.error('Error creating social post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create social post',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

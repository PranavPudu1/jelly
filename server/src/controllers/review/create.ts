import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Create a new review
 */
export async function create(req: Request, res: Response): Promise<void> {
    try {
        const { restaurantId, review, rating, sourceId, source, postedBy } = req.body;

        // Validate required fields
        if (!restaurantId || !review || rating === undefined) {
            res.status(400).json({
                success: false,
                message: 'restaurantId, review, and rating are required',
            });
            return;
        }

        // Validate rating range
        if (rating < 0 || rating > 5) {
            res.status(400).json({
                success: false,
                message: 'Rating must be between 0 and 5',
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

        const newReview = await prisma.review.create({
            data: {
                restaurantId,
                review,
                rating,
                sourceId,
                source,
                postedBy,
            },
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

        res.status(201).json({
            success: true,
            data: newReview,
            message: 'Review created successfully',
        });
    }
    catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

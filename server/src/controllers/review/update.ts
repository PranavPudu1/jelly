import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Update a review
 */
export async function update(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if review exists
        const existingReview = await prisma.review.findUnique({
            where: { id },
        });

        if (!existingReview) {
            res.status(404).json({
                success: false,
                message: 'Review not found',
            });
            return;
        }

        // Validate rating if provided
        if (updateData.rating !== undefined) {
            if (updateData.rating < 0 || updateData.rating > 5) {
                res.status(400).json({
                    success: false,
                    message: 'Rating must be between 0 and 5',
                });
                return;
            }
        }

        const updatedReview = await prisma.review.update({
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
            data: updatedReview,
            message: 'Review updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

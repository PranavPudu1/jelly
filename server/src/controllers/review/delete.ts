import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Delete a review
 */
export async function deleteReview(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

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

        await prisma.review.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

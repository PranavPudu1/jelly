import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get a single review by ID
 */
export async function getById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        const review = await prisma.review.findUnique({
            where: { id },
            include: {
                restaurant: true,
                tags: {
                    include: {
                        tagType: true,
                    },
                },
                images: true,
            },
        });

        if (!review) {
            res.status(404).json({
                success: false,
                message: 'Review not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: review,
        });
    }
    catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch review',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

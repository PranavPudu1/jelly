import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Mark a social post as invalid
 */
export async function markInvalid(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        // Check if social post exists
        const existingSocialPost = await prisma.socialPost.findUnique({
            where: { id },
        });

        if (!existingSocialPost) {
            res.status(404).json({
                success: false,
                message: 'Social post not found',
            });
            return;
        }

        const socialPost = await prisma.socialPost.update({
            where: { id },
            data: { valid: false },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            data: socialPost,
            message: 'Social post marked as invalid',
        });
    }
    catch (error) {
        console.error('Error marking social post as invalid:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark social post as invalid',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

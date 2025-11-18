import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Update a social post
 */
export async function update(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const updateData = req.body;

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
            data: socialPost,
            message: 'Social post updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating social post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update social post',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

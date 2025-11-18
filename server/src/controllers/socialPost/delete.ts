import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Delete a social post
 */
export async function deleteSocialPost(req: Request, res: Response): Promise<void> {
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

        await prisma.socialPost.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Social post deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting social post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete social post',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get a single social post by ID
 */
export async function getById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        const socialPost = await prisma.socialPost.findUnique({
            where: { id },
            include: {
                restaurant: true,
                tags: {
                    include: {
                        tagType: true,
                    },
                },
            },
        });

        if (!socialPost) {
            res.status(404).json({
                success: false,
                message: 'Social post not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: socialPost,
        });
    }
    catch (error) {
        console.error('Error fetching social post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch social post',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

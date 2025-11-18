import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get a single tag by ID
 */
export async function getById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        const tag = await prisma.tag.findUnique({
            where: { id },
            include: {
                tagType: true,
                restaurants: true,
                restaurantImages: true,
                reviews: true,
                menuItems: true,
                socialPosts: true,
            },
        });

        if (!tag) {
            res.status(404).json({
                success: false,
                message: 'Tag not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: tag,
        });
    }
    catch (error) {
        console.error('Error fetching tag:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tag',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

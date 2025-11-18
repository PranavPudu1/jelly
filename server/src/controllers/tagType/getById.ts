import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get a single tag type by ID
 */
export async function getById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        const tagType = await prisma.tagType.findUnique({
            where: { id },
            include: {
                tags: {
                    take: 20,
                    orderBy: { dateAdded: 'desc' },
                },
                _count: {
                    select: { tags: true },
                },
            },
        });

        if (!tagType) {
            res.status(404).json({
                success: false,
                message: 'Tag type not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: tagType,
        });
    }
    catch (error) {
        console.error('Error fetching tag type:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tag type',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

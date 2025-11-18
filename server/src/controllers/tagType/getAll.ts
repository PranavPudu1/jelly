import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get all tag types
 */
export async function getAll(req: Request, res: Response): Promise<void> {
    try {
        const tagTypes = await prisma.tagType.findMany({
            include: {
                _count: {
                    select: { tags: true },
                },
            },
            orderBy: { value: 'asc' },
        });

        res.status(200).json({
            success: true,
            data: tagTypes,
        });
    }
    catch (error) {
        console.error('Error fetching tag types:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tag types',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get all tags with pagination
 */
export async function getAll(req: Request, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const where: any = {};

        // Filter by tag type
        if (req.query.tagTypeId) {
            where.tagTypeId = req.query.tagTypeId;
        }

        // Filter by source
        if (req.query.source) {
            where.source = req.query.source;
        }

        // Search by value
        if (req.query.search) {
            where.value = { contains: req.query.search as string, mode: 'insensitive' };
        }

        const [tags, total] = await Promise.all([
            prisma.tag.findMany({
                where,
                skip,
                take: limit,
                include: {
                    tagType: true,
                },
                orderBy: { dateAdded: 'desc' },
            }),
            prisma.tag.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: tags,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        });
    }
    catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tags',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

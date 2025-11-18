import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Create a new tag
 */
export async function create(req: Request, res: Response): Promise<void> {
    try {
        const { tagTypeId, value, source } = req.body;

        // Validate required fields
        if (!tagTypeId || !value) {
            res.status(400).json({
                success: false,
                message: 'tagTypeId and value are required',
            });
            return;
        }

        // Check if tag type exists
        const tagType = await prisma.tagType.findUnique({
            where: { id: tagTypeId },
        });

        if (!tagType) {
            res.status(404).json({
                success: false,
                message: 'Tag type not found',
            });
            return;
        }

        const tag = await prisma.tag.create({
            data: {
                tagTypeId,
                value,
                source,
            },
            include: {
                tagType: true,
            },
        });

        res.status(201).json({
            success: true,
            data: tag,
            message: 'Tag created successfully',
        });
    }
    catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create tag',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

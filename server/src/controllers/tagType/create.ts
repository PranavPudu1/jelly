import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Create a new tag type
 */
export async function create(req: Request, res: Response): Promise<void> {
    try {
        const { value } = req.body;

        // Validate required fields
        if (!value) {
            res.status(400).json({
                success: false,
                message: 'value is required',
            });
            return;
        }

        // Check if tag type with this value already exists
        const existingTagType = await prisma.tagType.findUnique({
            where: { value },
        });

        if (existingTagType) {
            res.status(409).json({
                success: false,
                message: 'Tag type with this value already exists',
            });
            return;
        }

        const tagType = await prisma.tagType.create({
            data: { value },
        });

        res.status(201).json({
            success: true,
            data: tagType,
            message: 'Tag type created successfully',
        });
    }
    catch (error) {
        console.error('Error creating tag type:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create tag type',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

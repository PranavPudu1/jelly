import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Update a tag type
 */
export async function update(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const { value } = req.body;

        // Check if tag type exists
        const existingTagType = await prisma.tagType.findUnique({
            where: { id },
        });

        if (!existingTagType) {
            res.status(404).json({
                success: false,
                message: 'Tag type not found',
            });
            return;
        }

        // Check if another tag type with this value already exists
        if (value) {
            const duplicateTagType = await prisma.tagType.findFirst({
                where: {
                    value,
                    id: { not: id },
                },
            });

            if (duplicateTagType) {
                res.status(409).json({
                    success: false,
                    message: 'Tag type with this value already exists',
                });
                return;
            }
        }

        const tagType = await prisma.tagType.update({
            where: { id },
            data: { value },
        });

        res.status(200).json({
            success: true,
            data: tagType,
            message: 'Tag type updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating tag type:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update tag type',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

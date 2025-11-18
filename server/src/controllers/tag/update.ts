import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Update a tag
 */
export async function update(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if tag exists
        const existingTag = await prisma.tag.findUnique({
            where: { id },
        });

        if (!existingTag) {
            res.status(404).json({
                success: false,
                message: 'Tag not found',
            });
            return;
        }

        // If updating tagTypeId, check if it exists
        if (updateData.tagTypeId) {
            const tagType = await prisma.tagType.findUnique({
                where: { id: updateData.tagTypeId },
            });

            if (!tagType) {
                res.status(404).json({
                    success: false,
                    message: 'Tag type not found',
                });
                return;
            }
        }

        const tag = await prisma.tag.update({
            where: { id },
            data: updateData,
            include: {
                tagType: true,
            },
        });

        res.status(200).json({
            success: true,
            data: tag,
            message: 'Tag updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating tag:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update tag',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

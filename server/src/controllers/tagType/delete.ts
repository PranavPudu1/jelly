import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Delete a tag type
 */
export async function deleteTagType(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        // Check if tag type exists
        const existingTagType = await prisma.tagType.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { tags: true },
                },
            },
        });

        if (!existingTagType) {
            res.status(404).json({
                success: false,
                message: 'Tag type not found',
            });
            return;
        }

        // Check if tag type has associated tags
        if (existingTagType._count.tags > 0) {
            res.status(409).json({
                success: false,
                message: `Cannot delete tag type with ${existingTagType._count.tags} associated tags`,
            });
            return;
        }

        await prisma.tagType.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Tag type deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting tag type:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete tag type',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

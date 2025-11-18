import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Delete a tag
 */
export async function deleteTag(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

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

        await prisma.tag.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Tag deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete tag',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

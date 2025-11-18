import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class TagTypeController {
    /**
     * Get all tag types
     */
    static async getAll(req: Request, res: Response): Promise<void> {
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

    /**
     * Get a single tag type by ID
     */
    static async getById(req: Request, res: Response): Promise<void> {
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

    /**
     * Create a new tag type
     */
    static async create(req: Request, res: Response): Promise<void> {
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

    /**
     * Update a tag type
     */
    static async update(req: Request, res: Response): Promise<void> {
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

    /**
     * Delete a tag type
     */
    static async delete(req: Request, res: Response): Promise<void> {
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
}

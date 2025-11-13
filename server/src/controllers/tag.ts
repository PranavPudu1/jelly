/**
 * Tag Controller
 * Handles HTTP requests for tag operations
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class TagController {
    /**
     * Get all tags with pagination
     */
    static async getAll(req: Request, res: Response): Promise<void> {
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
        } catch (error) {
            console.error('Error fetching tags:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch tags',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get a single tag by ID
     */
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const tag = await prisma.tag.findUnique({
                where: { id },
                include: {
                    tagType: true,
                    restaurants: true,
                    restaurantImages: true,
                    reviews: true,
                    menuItems: true,
                    socialPosts: true,
                },
            });

            if (!tag) {
                res.status(404).json({
                    success: false,
                    message: 'Tag not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: tag,
            });
        } catch (error) {
            console.error('Error fetching tag:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch tag',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Create a new tag
     */
    static async create(req: Request, res: Response): Promise<void> {
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
        } catch (error) {
            console.error('Error creating tag:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create tag',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Update a tag
     */
    static async update(req: Request, res: Response): Promise<void> {
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
        } catch (error) {
            console.error('Error updating tag:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update tag',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Delete a tag
     */
    static async delete(req: Request, res: Response): Promise<void> {
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
        } catch (error) {
            console.error('Error deleting tag:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete tag',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

/**
 * RestaurantImage Controller
 * Handles HTTP requests for restaurant image operations
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class RestaurantImageController {
    /**
     * Get all restaurant images with pagination
     */
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const where: any = {};

            // Filter by restaurant
            if (req.query.restaurantId) {
                where.restaurantId = req.query.restaurantId;
            }

            // Filter by source
            if (req.query.source) {
                where.source = req.query.source;
            }

            const [images, total] = await Promise.all([
                prisma.restaurantImage.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        restaurant: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        tags: {
                            include: {
                                tagType: true,
                            },
                        },
                    },
                    orderBy: { dateAdded: 'desc' },
                }),
                prisma.restaurantImage.count({ where }),
            ]);

            res.status(200).json({
                success: true,
                data: images,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page * limit < total,
                },
            });
        } catch (error) {
            console.error('Error fetching restaurant images:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch restaurant images',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get a single restaurant image by ID
     */
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const image = await prisma.restaurantImage.findUnique({
                where: { id },
                include: {
                    restaurant: true,
                    review: true,
                    menuItem: true,
                    tags: {
                        include: {
                            tagType: true,
                        },
                    },
                },
            });

            if (!image) {
                res.status(404).json({
                    success: false,
                    message: 'Restaurant image not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: image,
            });
        } catch (error) {
            console.error('Error fetching restaurant image:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch restaurant image',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Create a new restaurant image
     */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const { url, restaurantId, reviewId, menuItemId, sourceId, source } = req.body;

            // Validate required fields
            if (!url) {
                res.status(400).json({
                    success: false,
                    message: 'url is required',
                });
                return;
            }

            // Ensure at least one parent reference exists
            if (!restaurantId && !reviewId && !menuItemId) {
                res.status(400).json({
                    success: false,
                    message: 'At least one of restaurantId, reviewId, or menuItemId is required',
                });
                return;
            }

            const image = await prisma.restaurantImage.create({
                data: {
                    url,
                    restaurantId,
                    reviewId,
                    menuItemId,
                    sourceId,
                    source,
                },
                include: {
                    restaurant: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    tags: true,
                },
            });

            res.status(201).json({
                success: true,
                data: image,
                message: 'Restaurant image created successfully',
            });
        } catch (error) {
            console.error('Error creating restaurant image:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create restaurant image',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Update a restaurant image
     */
    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if image exists
            const existingImage = await prisma.restaurantImage.findUnique({
                where: { id },
            });

            if (!existingImage) {
                res.status(404).json({
                    success: false,
                    message: 'Restaurant image not found',
                });
                return;
            }

            const image = await prisma.restaurantImage.update({
                where: { id },
                data: updateData,
                include: {
                    restaurant: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    tags: true,
                },
            });

            res.status(200).json({
                success: true,
                data: image,
                message: 'Restaurant image updated successfully',
            });
        } catch (error) {
            console.error('Error updating restaurant image:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update restaurant image',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Delete a restaurant image
     */
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Check if image exists
            const existingImage = await prisma.restaurantImage.findUnique({
                where: { id },
            });

            if (!existingImage) {
                res.status(404).json({
                    success: false,
                    message: 'Restaurant image not found',
                });
                return;
            }

            await prisma.restaurantImage.delete({
                where: { id },
            });

            res.status(200).json({
                success: true,
                message: 'Restaurant image deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting restaurant image:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete restaurant image',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class SocialPostController {
    /**
     * Get all social posts with pagination
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

            // Filter by validity
            if (req.query.valid !== undefined) {
                where.valid = req.query.valid === 'true';
            }

            const [socialPosts, total] = await Promise.all([
                prisma.socialPost.findMany({
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
                prisma.socialPost.count({ where }),
            ]);

            res.status(200).json({
                success: true,
                data: socialPosts,
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
            console.error('Error fetching social posts:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch social posts',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get a single social post by ID
     */
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const socialPost = await prisma.socialPost.findUnique({
                where: { id },
                include: {
                    restaurant: true,
                    tags: {
                        include: {
                            tagType: true,
                        },
                    },
                },
            });

            if (!socialPost) {
                res.status(404).json({
                    success: false,
                    message: 'Social post not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: socialPost,
            });
        }
        catch (error) {
            console.error('Error fetching social post:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch social post',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Create a new social post
     */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const { restaurantId, source, url, valid = true } = req.body;

            // Validate required fields
            if (!restaurantId || !source || !url) {
                res.status(400).json({
                    success: false,
                    message: 'restaurantId, source, and url are required',
                });
                return;
            }

            // Check if restaurant exists
            const restaurant = await prisma.restaurant.findUnique({
                where: { id: restaurantId },
            });

            if (!restaurant) {
                res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
                return;
            }

            const socialPost = await prisma.socialPost.create({
                data: {
                    restaurantId,
                    source,
                    url,
                    valid,
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
                data: socialPost,
                message: 'Social post created successfully',
            });
        }
        catch (error) {
            console.error('Error creating social post:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create social post',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Update a social post
     */
    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if social post exists
            const existingSocialPost = await prisma.socialPost.findUnique({
                where: { id },
            });

            if (!existingSocialPost) {
                res.status(404).json({
                    success: false,
                    message: 'Social post not found',
                });
                return;
            }

            const socialPost = await prisma.socialPost.update({
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
                data: socialPost,
                message: 'Social post updated successfully',
            });
        }
        catch (error) {
            console.error('Error updating social post:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update social post',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Delete a social post
     */
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Check if social post exists
            const existingSocialPost = await prisma.socialPost.findUnique({
                where: { id },
            });

            if (!existingSocialPost) {
                res.status(404).json({
                    success: false,
                    message: 'Social post not found',
                });
                return;
            }

            await prisma.socialPost.delete({
                where: { id },
            });

            res.status(200).json({
                success: true,
                message: 'Social post deleted successfully',
            });
        }
        catch (error) {
            console.error('Error deleting social post:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete social post',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get social posts by restaurant ID
     */
    static async getByRestaurant(req: Request, res: Response): Promise<void> {
        try {
            const { restaurantId } = req.params;
            const validOnly = req.query.validOnly === 'true';

            const where: any = { restaurantId };
            if (validOnly) {
                where.valid = true;
            }

            const socialPosts = await prisma.socialPost.findMany({
                where,
                include: {
                    tags: {
                        include: {
                            tagType: true,
                        },
                    },
                },
                orderBy: { dateAdded: 'desc' },
            });

            res.status(200).json({
                success: true,
                data: socialPosts,
                total: socialPosts.length,
            });
        }
        catch (error) {
            console.error('Error fetching social posts by restaurant:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch social posts',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Mark a social post as invalid
     */
    static async markInvalid(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Check if social post exists
            const existingSocialPost = await prisma.socialPost.findUnique({
                where: { id },
            });

            if (!existingSocialPost) {
                res.status(404).json({
                    success: false,
                    message: 'Social post not found',
                });
                return;
            }

            const socialPost = await prisma.socialPost.update({
                where: { id },
                data: { valid: false },
                include: {
                    restaurant: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            res.status(200).json({
                success: true,
                data: socialPost,
                message: 'Social post marked as invalid',
            });
        }
        catch (error) {
            console.error('Error marking social post as invalid:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark social post as invalid',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

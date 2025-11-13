/**
 * Review Controller
 * Handles HTTP requests for review operations
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class ReviewController {
    /**
     * Get all reviews with pagination
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

            // Filter by minimum rating
            if (req.query.minRating) {
                where.rating = { gte: parseFloat(req.query.minRating as string) };
            }

            // Filter by source
            if (req.query.source) {
                where.source = req.query.source;
            }

            // Search by review text
            if (req.query.search) {
                where.review = { contains: req.query.search as string, mode: 'insensitive' };
            }

            const [reviews, total] = await Promise.all([
                prisma.review.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        restaurant: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                            },
                        },
                        tags: {
                            include: {
                                tagType: true,
                            },
                        },
                        images: true,
                    },
                    orderBy: { dateAdded: 'desc' },
                }),
                prisma.review.count({ where }),
            ]);

            res.status(200).json({
                success: true,
                data: reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page * limit < total,
                },
            });
        } catch (error) {
            console.error('Error fetching reviews:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch reviews',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get a single review by ID
     */
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const review = await prisma.review.findUnique({
                where: { id },
                include: {
                    restaurant: true,
                    tags: {
                        include: {
                            tagType: true,
                        },
                    },
                    images: true,
                },
            });

            if (!review) {
                res.status(404).json({
                    success: false,
                    message: 'Review not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: review,
            });
        } catch (error) {
            console.error('Error fetching review:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch review',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Create a new review
     */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const { restaurantId, review, rating, sourceId, source, postedBy } = req.body;

            // Validate required fields
            if (!restaurantId || !review || rating === undefined) {
                res.status(400).json({
                    success: false,
                    message: 'restaurantId, review, and rating are required',
                });
                return;
            }

            // Validate rating range
            if (rating < 0 || rating > 5) {
                res.status(400).json({
                    success: false,
                    message: 'Rating must be between 0 and 5',
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

            const newReview = await prisma.review.create({
                data: {
                    restaurantId,
                    review,
                    rating,
                    sourceId,
                    source,
                    postedBy,
                },
                include: {
                    restaurant: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    tags: true,
                    images: true,
                },
            });

            res.status(201).json({
                success: true,
                data: newReview,
                message: 'Review created successfully',
            });
        } catch (error) {
            console.error('Error creating review:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create review',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Update a review
     */
    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if review exists
            const existingReview = await prisma.review.findUnique({
                where: { id },
            });

            if (!existingReview) {
                res.status(404).json({
                    success: false,
                    message: 'Review not found',
                });
                return;
            }

            // Validate rating if provided
            if (updateData.rating !== undefined) {
                if (updateData.rating < 0 || updateData.rating > 5) {
                    res.status(400).json({
                        success: false,
                        message: 'Rating must be between 0 and 5',
                    });
                    return;
                }
            }

            const updatedReview = await prisma.review.update({
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
                    images: true,
                },
            });

            res.status(200).json({
                success: true,
                data: updatedReview,
                message: 'Review updated successfully',
            });
        } catch (error) {
            console.error('Error updating review:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update review',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Delete a review
     */
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Check if review exists
            const existingReview = await prisma.review.findUnique({
                where: { id },
            });

            if (!existingReview) {
                res.status(404).json({
                    success: false,
                    message: 'Review not found',
                });
                return;
            }

            await prisma.review.delete({
                where: { id },
            });

            res.status(200).json({
                success: true,
                message: 'Review deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting review:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete review',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get reviews by restaurant ID
     */
    static async getByRestaurant(req: Request, res: Response): Promise<void> {
        try {
            const { restaurantId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const [reviews, total, avgRating] = await Promise.all([
                prisma.review.findMany({
                    where: { restaurantId },
                    skip,
                    take: limit,
                    include: {
                        tags: {
                            include: {
                                tagType: true,
                            },
                        },
                        images: true,
                    },
                    orderBy: { dateAdded: 'desc' },
                }),
                prisma.review.count({ where: { restaurantId } }),
                prisma.review.aggregate({
                    where: { restaurantId },
                    _avg: { rating: true },
                }),
            ]);

            res.status(200).json({
                success: true,
                data: reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page * limit < total,
                },
                stats: {
                    totalReviews: total,
                    averageRating: avgRating._avg.rating,
                },
            });
        } catch (error) {
            console.error('Error fetching reviews by restaurant:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch reviews',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

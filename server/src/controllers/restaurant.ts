/**
 * Restaurant Controller
 * Handles HTTP requests for restaurant operations
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class RestaurantController {
    /**
     * Get all restaurants with pagination and filtering
     */
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const where: any = {};

            // Filter by rating
            if (req.query.minRating) {
                where.rating = { gte: parseFloat(req.query.minRating as string) };
            }

            // Filter by price
            if (req.query.price) {
                where.price = req.query.price;
            }

            // Search by name
            if (req.query.search) {
                where.name = { contains: req.query.search as string, mode: 'insensitive' };
            }

            const [restaurants, total] = await Promise.all([
                prisma.restaurant.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        tags: {
                            include: {
                                tagType: true,
                            },
                        },
                        images: true,
                        reviews: true,
                        menu: true,
                        socialMedia: true,
                    },
                    orderBy: { dateAdded: 'desc' },
                }),
                prisma.restaurant.count({ where }),
            ]);

            res.status(200).json({
                success: true,
                data: restaurants,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page * limit < total,
                },
            });
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch restaurants',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get a single restaurant by ID
     */
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const restaurant = await prisma.restaurant.findUnique({
                where: { id },
                include: {
                    tags: {
                        include: {
                            tagType: true,
                        },
                    },
                    images: {
                        include: {
                            tags: true,
                        },
                    },
                    reviews: {
                        include: {
                            tags: true,
                            images: true,
                        },
                    },
                    menu: {
                        include: {
                            tags: true,
                            images: true,
                        },
                    },
                    socialMedia: {
                        include: {
                            tags: true,
                        },
                    },
                },
            });

            if (!restaurant) {
                res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: restaurant,
            });
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch restaurant',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Create a new restaurant
     */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const {
                name,
                rating,
                lat,
                long,
                address,
                mapLink,
                price,
                phoneNumber,
                sourceId,
                source,
            } = req.body;

            // Validate required fields
            if (!name || rating === undefined || !lat || !long || !address || !price || !phoneNumber) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields',
                });
                return;
            }

            const restaurant = await prisma.restaurant.create({
                data: {
                    name,
                    rating,
                    lat,
                    long,
                    address,
                    mapLink,
                    price,
                    phoneNumber,
                    sourceId,
                    source,
                },
                include: {
                    tags: true,
                    images: true,
                    reviews: true,
                    menu: true,
                    socialMedia: true,
                },
            });

            res.status(201).json({
                success: true,
                data: restaurant,
                message: 'Restaurant created successfully',
            });
        } catch (error) {
            console.error('Error creating restaurant:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create restaurant',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Update a restaurant
     */
    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if restaurant exists
            const existingRestaurant = await prisma.restaurant.findUnique({
                where: { id },
            });

            if (!existingRestaurant) {
                res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
                return;
            }

            const restaurant = await prisma.restaurant.update({
                where: { id },
                data: updateData,
                include: {
                    tags: true,
                    images: true,
                    reviews: true,
                    menu: true,
                    socialMedia: true,
                },
            });

            res.status(200).json({
                success: true,
                data: restaurant,
                message: 'Restaurant updated successfully',
            });
        } catch (error) {
            console.error('Error updating restaurant:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update restaurant',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Delete a restaurant
     */
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Check if restaurant exists
            const existingRestaurant = await prisma.restaurant.findUnique({
                where: { id },
            });

            if (!existingRestaurant) {
                res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
                return;
            }

            await prisma.restaurant.delete({
                where: { id },
            });

            res.status(200).json({
                success: true,
                message: 'Restaurant deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete restaurant',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get restaurants near a location
     */
    static async getNearby(req: Request, res: Response): Promise<void> {
        try {
            const { lat, long, radius = 5000 } = req.query;

            if (!lat || !long) {
                res.status(400).json({
                    success: false,
                    message: 'Latitude and longitude are required',
                });
                return;
            }

            const latitude = parseFloat(lat as string);
            const longitude = parseFloat(long as string);
            const radiusMeters = parseFloat(radius as string);

            // Simple distance calculation (for precise geo queries, consider using PostGIS)
            const restaurants = await prisma.$queryRaw`
                SELECT *,
                (6371000 * acos(
                    cos(radians(${latitude})) *
                    cos(radians(lat)) *
                    cos(radians(long) - radians(${longitude})) +
                    sin(radians(${latitude})) *
                    sin(radians(lat))
                )) AS distance
                FROM restaurants
                HAVING distance < ${radiusMeters}
                ORDER BY distance
            `;

            res.status(200).json({
                success: true,
                data: restaurants,
            });
        } catch (error) {
            console.error('Error fetching nearby restaurants:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch nearby restaurants',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

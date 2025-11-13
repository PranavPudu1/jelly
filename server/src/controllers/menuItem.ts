/**
 * MenuItem Controller
 * Handles HTTP requests for menu item operations
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class MenuItemController {
    /**
     * Get all menu items with pagination
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

            const [menuItems, total] = await Promise.all([
                prisma.menuItem.findMany({
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
                        images: true,
                    },
                    orderBy: { dateAdded: 'desc' },
                }),
                prisma.menuItem.count({ where }),
            ]);

            res.status(200).json({
                success: true,
                data: menuItems,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page * limit < total,
                },
            });
        } catch (error) {
            console.error('Error fetching menu items:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch menu items',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get a single menu item by ID
     */
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const menuItem = await prisma.menuItem.findUnique({
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

            if (!menuItem) {
                res.status(404).json({
                    success: false,
                    message: 'Menu item not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: menuItem,
            });
        } catch (error) {
            console.error('Error fetching menu item:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch menu item',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Create a new menu item
     */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const { restaurantId, source, sourceId } = req.body;

            // Validate required fields
            if (!restaurantId) {
                res.status(400).json({
                    success: false,
                    message: 'restaurantId is required',
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

            const menuItem = await prisma.menuItem.create({
                data: {
                    restaurantId,
                    source,
                    sourceId,
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
                data: menuItem,
                message: 'Menu item created successfully',
            });
        } catch (error) {
            console.error('Error creating menu item:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create menu item',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Update a menu item
     */
    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if menu item exists
            const existingMenuItem = await prisma.menuItem.findUnique({
                where: { id },
            });

            if (!existingMenuItem) {
                res.status(404).json({
                    success: false,
                    message: 'Menu item not found',
                });
                return;
            }

            const menuItem = await prisma.menuItem.update({
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
                data: menuItem,
                message: 'Menu item updated successfully',
            });
        } catch (error) {
            console.error('Error updating menu item:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update menu item',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Delete a menu item
     */
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Check if menu item exists
            const existingMenuItem = await prisma.menuItem.findUnique({
                where: { id },
            });

            if (!existingMenuItem) {
                res.status(404).json({
                    success: false,
                    message: 'Menu item not found',
                });
                return;
            }

            await prisma.menuItem.delete({
                where: { id },
            });

            res.status(200).json({
                success: true,
                message: 'Menu item deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting menu item:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete menu item',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get menu items by restaurant ID
     */
    static async getByRestaurant(req: Request, res: Response): Promise<void> {
        try {
            const { restaurantId } = req.params;

            const menuItems = await prisma.menuItem.findMany({
                where: { restaurantId },
                include: {
                    tags: {
                        include: {
                            tagType: true,
                        },
                    },
                    images: true,
                },
                orderBy: { dateAdded: 'desc' },
            });

            res.status(200).json({
                success: true,
                data: menuItems,
                total: menuItems.length,
            });
        } catch (error) {
            console.error('Error fetching menu items by restaurant:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch menu items',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

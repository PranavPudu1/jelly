/**
 * Restaurant Controller
 * Handles HTTP requests and responses for restaurant endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { RestaurantService } from '../services/restaurant';
import type { GetRestaurantsQuery, SaveSwipeRequest } from '../types';
import { validationResult } from 'express-validator';

export class RestaurantController {
    private restaurantService: RestaurantService;

    constructor() {
        this.restaurantService = new RestaurantService();
    }

    /**
   * GET /api/restaurants
   * Get paginated list of restaurants, excluding ones user has swiped on
   */
    async getRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const query: GetRestaurantsQuery = {
                userId: req.query.userId as string,
                page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
                location: req.query.location as string,
            };

            const result = await this.restaurantService.getRestaurants(query);

            res.status(200).json({
                success: true,
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    hasMore: result.hasMore,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }

    /**
   * GET /api/restaurants/:id
   * Get a single restaurant by ID
   */
    async getRestaurantById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const restaurant = await this.restaurantService.getRestaurantById(id);

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
        }
        catch (error) {
            next(error);
        }
    }

    /**
   * POST /api/restaurants
   * Create a new restaurant (admin endpoint)
   */
    async createRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const restaurant = await this.restaurantService.createRestaurant(req.body);

            res.status(201).json({
                success: true,
                data: restaurant,
                message: 'Restaurant created successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    /**
   * PUT /api/restaurants/:id
   * Update a restaurant (admin endpoint)
   */
    async updateRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const { id } = req.params;
            const restaurant = await this.restaurantService.updateRestaurant(id, req.body);

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
                message: 'Restaurant updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    /**
   * DELETE /api/restaurants/:id
   * Delete a restaurant (admin endpoint)
   */
    async deleteRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await this.restaurantService.deleteRestaurant(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Restaurant deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    /**
   * POST /api/restaurants/swipe
   * Save user swipe action (like or dislike)
   */
    async saveSwipe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const swipeData: SaveSwipeRequest = req.body;
            const swipe = await this.restaurantService.saveSwipe(swipeData);

            res.status(201).json({
                success: true,
                data: swipe,
                message: 'Swipe saved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    /**
   * GET /api/restaurants/saved/:userId
   * Get user's saved (liked) restaurants
   */
    async getUserSavedRestaurants(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { userId } = req.params;

            const restaurants = await this.restaurantService.getUserSavedRestaurants(userId);

            res.status(200).json({
                success: true,
                data: restaurants,
                count: restaurants.length,
            });
        }
        catch (error) {
            next(error);
        }
    }
}

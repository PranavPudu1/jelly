/**
 * RestaurantImage Routes
 * Defines API endpoints for restaurant image operations
 */

import { Router } from 'express';
import { RestaurantImageController } from '../controllers/restaurantImage';

const router = Router();

// GET /api/images - Get all restaurant images with pagination and filters
router.get('/', RestaurantImageController.getAll);

// GET /api/images/:id - Get a single restaurant image by ID
router.get('/:id', RestaurantImageController.getById);

// POST /api/images - Create a new restaurant image
router.post('/', RestaurantImageController.create);

// PUT /api/images/:id - Update a restaurant image
router.put('/:id', RestaurantImageController.update);

// DELETE /api/images/:id - Delete a restaurant image
router.delete('/:id', RestaurantImageController.delete);

export default router;

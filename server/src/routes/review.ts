/**
 * Review Routes
 * Defines API endpoints for review operations
 */

import { Router } from 'express';
import { ReviewController } from '../controllers/review';

const router = Router();

// GET /api/reviews - Get all reviews with pagination and filters
router.get('/', ReviewController.getAll);

// GET /api/reviews/restaurant/:restaurantId - Get reviews by restaurant
router.get('/restaurant/:restaurantId', ReviewController.getByRestaurant);

// GET /api/reviews/:id - Get a single review by ID
router.get('/:id', ReviewController.getById);

// POST /api/reviews - Create a new review
router.post('/', ReviewController.create);

// PUT /api/reviews/:id - Update a review
router.put('/:id', ReviewController.update);

// DELETE /api/reviews/:id - Delete a review
router.delete('/:id', ReviewController.delete);

export default router;

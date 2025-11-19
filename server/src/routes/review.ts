import { Router } from 'express';
import * as ReviewController from '../controllers/review';
import { authenticate } from '../middleware/auth';
import { ownerOrAdmin } from '../middleware/rbac';

const router = Router();

// GET /api/reviews/restaurant/:restaurantId - Get reviews by restaurant
router.get('/restaurant/:restaurantId', ReviewController.getByRestaurant);

// GET /api/reviews/:id - Get a single review by ID
router.get('/:id', ReviewController.getById);

// POST /api/reviews - Create a new review (requires owner or admin)
router.post('/', authenticate, ownerOrAdmin, ReviewController.create);

// PUT /api/reviews/:id - Update a review (requires owner or admin)
router.put('/:id', authenticate, ownerOrAdmin, ReviewController.update);

// DELETE /api/reviews/:id - Delete a review (requires owner or admin)
router.delete('/:id', authenticate, ownerOrAdmin, ReviewController.delete);

export default router;

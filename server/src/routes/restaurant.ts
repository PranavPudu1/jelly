import { Router } from 'express';
import * as RestaurantController from '../controllers/restaurant';
import { authenticate } from '../middleware/auth';
import { ownerOrAdmin } from '../middleware/rbac';

const router = Router();

// GET /api/restaurants - Get restaurants with comprehensive filtering and pagination
router.get('/', RestaurantController.getRestaurants);

// GET /api/restaurants/:id - Get a single restaurant by ID
router.get('/:id', RestaurantController.getById);

// POST /api/restaurants - Create a new restaurant (requires owner or admin)
router.post('/', authenticate, ownerOrAdmin, RestaurantController.create);

// PUT /api/restaurants/:id - Update a restaurant (requires owner or admin)
router.put('/:id', authenticate, ownerOrAdmin, RestaurantController.update);

// DELETE /api/restaurants/:id - Delete a restaurant (requires owner or admin)
router.delete('/:id', authenticate, ownerOrAdmin, RestaurantController.delete);

export default router;

import { Router } from 'express';
import * as RestaurantImageController from '../controllers/restaurantImage';
import { authenticate } from '../middleware/auth';
import { ownerOrAdmin } from '../middleware/rbac';

const router = Router();

// GET /api/images/restaurant/:restaurantId - Get all images for a specific restaurant
router.get('/restaurant/:restaurantId', RestaurantImageController.getByRestaurantId);

// GET /api/images/:id - Get a single restaurant image by ID
router.get('/:id', RestaurantImageController.getById);

// POST /api/images - Create a new restaurant image (requires owner or admin)
router.post('/', authenticate, ownerOrAdmin, RestaurantImageController.create);

// PUT /api/images/:id - Update a restaurant image (requires owner or admin)
router.put('/:id', authenticate, ownerOrAdmin, RestaurantImageController.update);

// DELETE /api/images/:id - Delete a restaurant image (requires owner or admin)
router.delete('/:id', authenticate, ownerOrAdmin, RestaurantImageController.delete);

export default router;

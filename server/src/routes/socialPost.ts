import { Router } from 'express';
import * as SocialPostController from '../controllers/socialPost';
import { authenticate } from '../middleware/auth';
import { ownerOrAdmin } from '../middleware/rbac';

const router = Router();

// GET /api/social-posts/restaurant/:restaurantId - Get social posts by restaurant
router.get('/restaurant/:restaurantId', SocialPostController.getByRestaurant);

// GET /api/social-posts/:id - Get a single social post by ID
router.get('/:id', SocialPostController.getById);

// POST /api/social-posts - Create a new social post (requires owner or admin)
router.post('/', authenticate, ownerOrAdmin, SocialPostController.create);

// PUT /api/social-posts/:id - Update a social post (requires owner or admin)
router.put('/:id', authenticate, ownerOrAdmin, SocialPostController.update);

// PATCH /api/social-posts/:id/mark-invalid - Mark a social post as invalid (requires owner or admin)
router.patch('/:id/mark-invalid', authenticate, ownerOrAdmin, SocialPostController.markInvalid);

// DELETE /api/social-posts/:id - Delete a social post (requires owner or admin)
router.delete('/:id', authenticate, ownerOrAdmin, SocialPostController.delete);

export default router;

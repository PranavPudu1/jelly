import { Router } from 'express';
import { SocialPostController } from '../controllers/socialPost';

const router = Router();

// GET /api/social-posts - Get all social posts with pagination and filters
router.get('/', SocialPostController.getAll);

// GET /api/social-posts/restaurant/:restaurantId - Get social posts by restaurant
router.get('/restaurant/:restaurantId', SocialPostController.getByRestaurant);

// GET /api/social-posts/:id - Get a single social post by ID
router.get('/:id', SocialPostController.getById);

// POST /api/social-posts - Create a new social post
router.post('/', SocialPostController.create);

// PUT /api/social-posts/:id - Update a social post
router.put('/:id', SocialPostController.update);

// PATCH /api/social-posts/:id/mark-invalid - Mark a social post as invalid
router.patch('/:id/mark-invalid', SocialPostController.markInvalid);

// DELETE /api/social-posts/:id - Delete a social post
router.delete('/:id', SocialPostController.delete);

export default router;

import { Router } from 'express';
import * as TagTypeController from '../controllers/tagType';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/rbac';

const router = Router();

// GET /api/tag-types - Get all tag types
router.get('/', TagTypeController.getAll);

// GET /api/tag-types/:id - Get a single tag type by ID
router.get('/:id', TagTypeController.getById);

// POST /api/tag-types - Create a new tag type (requires admin)
router.post('/', authenticate, adminOnly, TagTypeController.create);

// PUT /api/tag-types/:id - Update a tag type (requires admin)
router.put('/:id', authenticate, adminOnly, TagTypeController.update);

// DELETE /api/tag-types/:id - Delete a tag type (requires admin)
router.delete('/:id', authenticate, adminOnly, TagTypeController.delete);

export default router;

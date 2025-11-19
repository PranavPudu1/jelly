import { Router } from 'express';
import * as TagController from '../controllers/tag';
import { authenticate } from '../middleware/auth';
import { ownerOrAdmin } from '../middleware/rbac';

const router = Router();

// GET /api/tags - Get all tags with pagination and filters
router.get('/', TagController.getAll);

// GET /api/tags/:id - Get a single tag by ID
router.get('/:id', TagController.getById);

// POST /api/tags - Create a new tag (requires owner or admin)
router.post('/', authenticate, ownerOrAdmin, TagController.create);

// PUT /api/tags/:id - Update a tag (requires owner or admin)
router.put('/:id', authenticate, ownerOrAdmin, TagController.update);

// DELETE /api/tags/:id - Delete a tag (requires owner or admin)
router.delete('/:id', authenticate, ownerOrAdmin, TagController.delete);

export default router;

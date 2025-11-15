import { Router } from 'express';
import { TagController } from '../controllers/tag';

const router = Router();

// GET /api/tags - Get all tags with pagination and filters
router.get('/', TagController.getAll);

// GET /api/tags/:id - Get a single tag by ID
router.get('/:id', TagController.getById);

// POST /api/tags - Create a new tag
router.post('/', TagController.create);

// PUT /api/tags/:id - Update a tag
router.put('/:id', TagController.update);

// DELETE /api/tags/:id - Delete a tag
router.delete('/:id', TagController.delete);

export default router;

import { Router } from 'express';
import { TagTypeController } from '../controllers/tagType';

const router = Router();

// GET /api/tag-types - Get all tag types
router.get('/', TagTypeController.getAll);

// GET /api/tag-types/:id - Get a single tag type by ID
router.get('/:id', TagTypeController.getById);

// POST /api/tag-types - Create a new tag type
router.post('/', TagTypeController.create);

// PUT /api/tag-types/:id - Update a tag type
router.put('/:id', TagTypeController.update);

// DELETE /api/tag-types/:id - Delete a tag type
router.delete('/:id', TagTypeController.delete);

export default router;

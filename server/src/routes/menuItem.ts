import { Router } from 'express';
import * as MenuItemController from '../controllers/menuItem';
import { authenticate } from '../middleware/auth';
import { ownerOrAdmin } from '../middleware/rbac';

const router = Router();

// GET /api/menu-items/restaurant/:restaurantId - Get menu items by restaurant
router.get('/restaurant/:restaurantId', MenuItemController.getByRestaurant);

// GET /api/menu-items/:id - Get a single menu item by ID
router.get('/:id', MenuItemController.getById);

// POST /api/menu-items - Create a new menu item (requires owner or admin)
router.post('/', authenticate, ownerOrAdmin, MenuItemController.create);

// PUT /api/menu-items/:id - Update a menu item (requires owner or admin)
router.put('/:id', authenticate, ownerOrAdmin, MenuItemController.update);

// DELETE /api/menu-items/:id - Delete a menu item (requires owner or admin)
router.delete('/:id', authenticate, ownerOrAdmin, MenuItemController.delete);

export default router;

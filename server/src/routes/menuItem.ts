/**
 * MenuItem Routes
 * Defines API endpoints for menu item operations
 */

import { Router } from 'express';
import { MenuItemController } from '../controllers/menuItem';

const router = Router();

// GET /api/menu-items - Get all menu items with pagination and filters
router.get('/', MenuItemController.getAll);

// GET /api/menu-items/restaurant/:restaurantId - Get menu items by restaurant
router.get('/restaurant/:restaurantId', MenuItemController.getByRestaurant);

// GET /api/menu-items/:id - Get a single menu item by ID
router.get('/:id', MenuItemController.getById);

// POST /api/menu-items - Create a new menu item
router.post('/', MenuItemController.create);

// PUT /api/menu-items/:id - Update a menu item
router.put('/:id', MenuItemController.update);

// DELETE /api/menu-items/:id - Delete a menu item
router.delete('/:id', MenuItemController.delete);

export default router;

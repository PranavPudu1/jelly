import { Router } from 'express';
import * as RestaurantController from '../controllers/restaurant';

const router = Router();

// GET /api/restaurants - Get all restaurants with pagination and filters
router.get('/', RestaurantController.getAll);

// GET /api/restaurants/nearby - Get restaurants near a location
router.get('/nearby', RestaurantController.getNearby);

// GET /api/restaurants/:id - Get a single restaurant by ID
router.get('/:id', RestaurantController.getById);

// POST /api/restaurants - Create a new restaurant
router.post('/', RestaurantController.create);

// PUT /api/restaurants/:id - Update a restaurant
router.put('/:id', RestaurantController.update);

// DELETE /api/restaurants/:id - Delete a restaurant
router.delete('/:id', RestaurantController.delete);

export default router;

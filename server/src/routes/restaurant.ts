/**
 * Restaurant Routes
 * Defines API endpoints for restaurant operations
 */

import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant';
import {
    getRestaurantsValidator,
    createRestaurantValidator,
    updateRestaurantValidator,
    saveSwipeValidator,
    restaurantIdValidator,
    userIdValidator,
} from '../middleware/validators';

const router = Router();
const restaurantController = new RestaurantController();

/**
 * @route   GET /api/restaurants
 * @desc    Get paginated list of restaurants (excludes user's swiped restaurants)
 * @query   userId, page, limit, cuisine, priceRange, location
 * @access  Public
 */
router.get('/', getRestaurantsValidator, restaurantController.getRestaurants);

/**
 * @route   GET /api/restaurants/:id
 * @desc    Get a single restaurant by ID
 * @param   id - Restaurant ID
 * @access  Public
 */
router.get('/:id', restaurantIdValidator, restaurantController.getRestaurantById);

/**
 * @route   POST /api/restaurants
 * @desc    Create a new restaurant
 * @body    Restaurant data
 * @access  Admin (add auth middleware later)
 */
router.post('/', createRestaurantValidator, restaurantController.createRestaurant);

/**
 * @route   PUT /api/restaurants/:id
 * @desc    Update a restaurant
 * @param   id - Restaurant ID
 * @body    Partial restaurant data
 * @access  Admin (add auth middleware later)
 */
router.put('/:id', updateRestaurantValidator, restaurantController.updateRestaurant);

/**
 * @route   DELETE /api/restaurants/:id
 * @desc    Delete a restaurant
 * @param   id - Restaurant ID
 * @access  Admin (add auth middleware later)
 */
router.delete('/:id', restaurantIdValidator, restaurantController.deleteRestaurant);

/**
 * @route   POST /api/restaurants/swipe
 * @desc    Save user swipe action (like or dislike)
 * @body    { userId, restaurantId, action }
 * @access  Public
 */
router.post('/swipe', saveSwipeValidator, restaurantController.saveSwipe);

/**
 * @route   GET /api/restaurants/saved/:userId
 * @desc    Get user's saved (liked) restaurants
 * @param   userId - User ID
 * @access  Public
 */
router.get('/saved/:userId', userIdValidator, restaurantController.getUserSavedRestaurants);

export default router;

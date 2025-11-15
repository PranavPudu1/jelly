import { body, query, param } from 'express-validator';

/**
 * Validation rules for GET /api/restaurants
 */
export const getRestaurantsValidator = [
    query('userId').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('location').optional().isString().trim(),
    query('latitude').optional().isFloat(),
    query('longitude').optional().isFloat(),
    query('maxDistanceMeters').optional().isInt({ min: 1 }).toInt(),
    query('tags').optional().isArray(),
    query('tags.*').isString(),
    query('minRating').optional().isFloat({ min: 0, max: 5 }),
];

/**
 * Validation rules for POST /api/restaurants
 */
export const createRestaurantValidator = [
    body('source').isIn(['YELP', 'GOOGLE']).withMessage('Source must be YELP or GOOGLE'),
    body('sourceId').optional().isString().trim(),
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('image_url').isURL().withMessage('Valid image URL is required'),
    body('is_closed').optional().isBoolean(),
    body('url').isURL().withMessage('Valid URL is required'),
    body('review_count').optional().isInt({ min: 0 }),
    body('rating').isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('long')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    body('transactions').optional().isArray(),
    body('transactions.*').isString(),
    body('price').optional().isString().trim(),
    body('address').isString().trim().notEmpty().withMessage('Address is required'),
    body('city').isString().trim().notEmpty().withMessage('City is required'),
    body('country').isString().trim().notEmpty().withMessage('Country is required'),
    body('state').isString().trim().notEmpty().withMessage('State is required'),
    body('zipCode').isInt().withMessage('Zip code must be a number'),
    body('phone').optional().isString().trim(),
    body('instagram').optional().isString().trim(),
    body('tiktok').optional().isString().trim(),
    body('tag_ids').optional().isArray(),
    body('tag_ids.*').isString(),
];

/**
 * Validation rules for PUT /api/restaurants/:id
 */
export const updateRestaurantValidator = [
    param('id').isString().trim().notEmpty().withMessage('Restaurant ID is required'),
    body('sourceId').optional().isString().trim(),
    body('name').optional().isString().trim().notEmpty(),
    body('image_url').optional().isURL(),
    body('is_closed').optional().isBoolean(),
    body('url').optional().isURL(),
    body('review_count').optional().isInt({ min: 0 }),
    body('rating').optional().isFloat({ min: 0, max: 5 }),
    body('lat').optional().isFloat({ min: -90, max: 90 }),
    body('long').optional().isFloat({ min: -180, max: 180 }),
    body('transactions').optional().isArray(),
    body('transactions.*').optional().isString(),
    body('price').optional().isString().trim(),
    body('address').optional().isString().trim(),
    body('city').optional().isString().trim(),
    body('country').optional().isString().trim(),
    body('state').optional().isString().trim(),
    body('zipCode').optional().isInt(),
    body('phone').optional().isString().trim(),
    body('instagram').optional().isString().trim(),
    body('tiktok').optional().isString().trim(),
];

/**
 * Validation rules for POST /api/restaurants/swipe
 */
export const saveSwipeValidator = [
    body('user_id').isString().trim().notEmpty().withMessage('User ID is required'),
    body('restaurant_id').isString().trim().notEmpty().withMessage('Restaurant ID is required'),
    body('decided')
        .isBoolean()
        .withMessage('Decided must be a boolean (true for like, false for pass)'),
    body('session_id').optional().isString().trim(),
];

/**
 * Validation rules for restaurant ID parameter
 */
export const restaurantIdValidator = [
    param('id').isString().trim().notEmpty().withMessage('Restaurant ID is required'),
];

/**
 * Validation rules for user ID parameter
 */
export const userIdValidator = [
    param('userId').isString().trim().notEmpty().withMessage('User ID is required'),
];

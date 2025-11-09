/**
 * Request Validation Middleware
 * Uses express-validator for request validation
 */

import { body, query, param } from 'express-validator';

/**
 * Validation rules for GET /api/restaurants
 */
export const getRestaurantsValidator = [
    query('userId').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('cuisine').optional().isString().trim(),
    query('priceRange').optional().isIn(['$', '$$', '$$$', '$$$$']),
    query('location').optional().isString().trim(),
];

/**
 * Validation rules for POST /api/restaurants
 */
export const createRestaurantValidator = [
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('tagline').isString().trim().notEmpty().withMessage('Tagline is required'),
    body('location').isString().trim().notEmpty().withMessage('Location is required'),
    body('imageUrl').isURL().withMessage('Valid image URL is required'),
    body('additionalPhotos').isArray().withMessage('Additional photos must be an array'),
    body('additionalPhotos.*').isURL().withMessage('Each photo must be a valid URL'),
    body('popularItems').isArray().withMessage('Popular items must be an array'),
    body('popularItems.*.name').isString().trim().notEmpty(),
    body('popularItems.*.price').isString().trim().notEmpty(),
    body('popularItems.*.emoji').isString().trim().notEmpty(),
    body('reviews').isArray().withMessage('Reviews must be an array'),
    body('reviews.*.text').isString().trim().notEmpty(),
    body('reviews.*.author').isString().trim().notEmpty(),
    body('ambianceTags').isArray().withMessage('Ambiance tags must be an array'),
    body('ambianceTags.*').isString().trim(),
    body('reservationInfo').isString().trim().notEmpty().withMessage('Reservation info is required'),
    body('priceRange')
        .isIn(['$', '$$', '$$$', '$$$$'])
        .withMessage('Price range must be $, $$, $$$, or $$$$'),
    body('cuisine').isString().trim().notEmpty().withMessage('Cuisine is required'),
];

/**
 * Validation rules for PUT /api/restaurants/:id
 */
export const updateRestaurantValidator = [
    param('id').isString().trim().notEmpty().withMessage('Restaurant ID is required'),
    body('name').optional().isString().trim().notEmpty(),
    body('tagline').optional().isString().trim().notEmpty(),
    body('location').optional().isString().trim().notEmpty(),
    body('imageUrl').optional().isURL(),
    body('additionalPhotos').optional().isArray(),
    body('additionalPhotos.*').optional().isURL(),
    body('popularItems').optional().isArray(),
    body('reviews').optional().isArray(),
    body('ambianceTags').optional().isArray(),
    body('reservationInfo').optional().isString().trim(),
    body('priceRange').optional().isIn(['$', '$$', '$$$', '$$$$']),
    body('cuisine').optional().isString().trim(),
];

/**
 * Validation rules for POST /api/restaurants/swipe
 */
export const saveSwipeValidator = [
    body('userId').isString().trim().notEmpty().withMessage('User ID is required'),
    body('restaurantId').isString().trim().notEmpty().withMessage('Restaurant ID is required'),
    body('action')
        .isIn(['like', 'dislike'])
        .withMessage('Action must be either "like" or "dislike"'),
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

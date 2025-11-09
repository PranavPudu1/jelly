/**
 * Central Type Exports
 * Re-export all types for easier imports across the application
 */

export type {
    Restaurant,
    MenuItem,
    Review,
    UserSwipe,
    PaginatedResponse,
    GetRestaurantsQuery,
    SaveSwipeRequest,
} from '../models/restaurant.model';

export type { ApiError } from '../middleware/errorHandler';

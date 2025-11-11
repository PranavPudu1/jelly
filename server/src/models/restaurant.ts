/**
 * Restaurant Data Models
 * Re-exports types from the centralized type system
 *
 * @deprecated This file is kept for backward compatibility.
 * New code should import directly from '@/types' or '../types'
 */

// Re-export enums (as both types and values)
export {
    Source,
    TagType,
} from '../types';

// Re-export type-only exports
export type {
    // Database entities
    TimestampedEntity,
    Restaurant,
    Tag,
    Review,
    RestaurantImage,
    RestaurantItem,
    User,
    UserPreferences,
    UserSwipe,
    UserSave,
    Session,
    RestaurantTag,
    RestaurantReview,
    RestaurantImageLink,
    RestaurantItemLink,
    RestaurantItemImage,
    RestaurantItemTag,
    RestaurantImageTag,
    // DTOs
    PaginatedResponse,
    RestaurantPopulated,
    GetRestaurantsQuery,
    CreateRestaurantRequest,
    UpdateRestaurantRequest,
    SaveSwipeRequest,
    CreateReviewRequest,
    SaveRestaurantRequest,
    CreateTagRequest,
    ApiErrorResponse,
} from '../types';

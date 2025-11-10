/**
 * Restaurant Data Models
 * Re-exports types from the centralized type system
 *
 * @deprecated This file is kept for backward compatibility.
 * New code should import directly from '@/types' or '../types'
 */

// Re-export enums (as both types and values)
export {
    PriceTier,
    Status,
    SwipeDecision,
    ImageRole,
    ReviewSource,
    ModerationStatus,
    Provider,
    MenuStatus,
} from '../types';

// Re-export type-only exports
export type {
    // Database entities
    GeoPoint,
    DayHours,
    SpecialDayHours,
    Restaurant,
    RestaurantStats,
    Cuisine,
    RestaurantCuisine,
    Tag,
    RestaurantTag,
    User,
    UserPreferences,
    UserSwipe,
    SavedRestaurant,
    RestaurantImage,
    Review,
    ReviewImage,
    Hours,
    PlaceSource,
    RestaurantAlias,
    Menu,
    MenuSection,
    MenuItem,
    // DTOs
    PaginatedResponse,
    RestaurantWithStats,
    RestaurantPopulated,
    GetRestaurantsQuery,
    CreateRestaurantRequest,
    UpdateRestaurantRequest,
    SaveSwipeRequest,
    CreateReviewRequest,
    SaveRestaurantRequest,
    LegacyMenuItem,
    LegacyReview,
    LegacyRestaurant,
} from '../types';

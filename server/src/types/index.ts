/**
 * Central Type Exports
 * Re-export all types for convenient imports across the application
 *
 * Usage:
 *   import { Restaurant, PriceTier, CreateRestaurantRequest } from '@/types';
 */

// ============================================================
// ENUMS
// ============================================================
export {
    PriceTier,
    Status,
    SwipeDecision,
    ImageRole,
    ReviewSource,
    ModerationStatus,
    Provider,
    MenuStatus,
} from './enums';

// ============================================================
// DATABASE ENTITY TYPES
// ============================================================
export type {
    TimestampedEntity,
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
} from './database.types';

// ============================================================
// DTO TYPES
// ============================================================
export type {
    PaginatedResponse,
    RestaurantWithStats,
    RestaurantPopulated,
    ApiErrorResponse,
    GetRestaurantsQuery,
    CreateRestaurantRequest,
    UpdateRestaurantRequest,
    SaveSwipeRequest,
    CreateReviewRequest,
    SaveRestaurantRequest,
    // Legacy types
    LegacyMenuItem,
    LegacyReview,
    LegacyRestaurant,
} from './dto.types';

// ============================================================
// SUPABASE TYPES
// ============================================================
export type {
    Database,
    Tables,
    TablesInsert,
    TablesUpdate,
    Enums,
    Views,
    Functions,
} from './supabase.types';

// ============================================================
// ERROR TYPES
// ============================================================
export type { ApiError } from '../middleware/errorHandler';

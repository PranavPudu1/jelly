/**
 * Central export point for all type definitions
 */

// Export enums (as both types and values)
export { Source, TagType } from './enums';

// Export database types
export type {
    TimestampedEntity,
    Restaurant,
    Tag,
    Review,
    RestaurantImage,
    RestaurantItem,
    User,
    UserSwipe,
    UserSave,
    Session,
    UserPreferences,
    RestaurantTag,
    RestaurantReview,
    RestaurantImageLink,
    RestaurantItemLink,
    RestaurantItemImage,
    RestaurantItemTag,
    RestaurantImageTag,
} from './database.types';

// Export DTO types
export type {
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
} from './dto.types';

// Export Supabase types
export type {
    Database,
    Tables,
    TablesInsert,
    TablesUpdate,
    Enums,
    Functions,
    Views,
} from './supabase.types';

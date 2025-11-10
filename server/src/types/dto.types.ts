/**
 * Data Transfer Objects (DTOs)
 * Request and response types for API endpoints
 */

import { PriceTier, SwipeDecision, ReviewSource } from './enums';
import { Restaurant, RestaurantImage, Review } from './database.types';

// ============================================================
// RESPONSE TYPES
// ============================================================

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}

/**
 * Restaurant with aggregated statistics
 * Used for list views and detail views
 */
export interface RestaurantWithStats extends Restaurant {
    // Stats from restaurant_stats table
    rating_avg?: number;
    rating_count?: number;
    photo_count?: number;
    save_count?: number;
    like_count?: number;
    last_review_at?: string;
}

/**
 * Restaurant with populated relations
 * Includes related data for complete views
 */
export interface RestaurantPopulated extends RestaurantWithStats {
    cuisines?: string[];
    tags?: string[];
    images?: RestaurantImage[];
    reviews?: Review[];
    hours?: {
        mon?: any;
        tue?: any;
        wed?: any;
        thu?: any;
        fri?: any;
        sat?: any;
        sun?: any;
        special_days?: any;
    };
}

/**
 * API error response
 */
export interface ApiErrorResponse {
    error: {
        code: string;
        message: string;
        details?: any;
    };
}

// ============================================================
// REQUEST TYPES - QUERY PARAMETERS
// ============================================================

/**
 * Query parameters for GET /restaurants
 */
export interface GetRestaurantsQuery {
    // Pagination
    page?: number;
    limit?: number;

    // User context
    userId?: string;

    // Filters
    cuisines?: string[]; // Array of cuisine IDs or names
    tags?: string[]; // Array of tag IDs or names
    priceMin?: PriceTier;
    priceMax?: PriceTier;
    minRating?: number;
    openNowOnly?: boolean;

    // Location-based
    location?: string;
    latitude?: number;
    longitude?: number;
    maxDistanceMeters?: number;

    // Search
    search?: string;
}

// ============================================================
// REQUEST TYPES - BODY PAYLOADS
// ============================================================

/**
 * Create restaurant request
 */
export interface CreateRestaurantRequest {
    // Required fields
    name: string;
    latitude: number;
    longitude: number;
    price_tier: PriceTier;

    // Address fields
    formatted_address?: string;
    street?: string;
    city_id?: string;
    region?: string;
    postal_code?: string;
    country_code?: string;

    // Contact
    phone?: string;
    website?: string;

    // Relations
    cuisine_ids?: string[];
    tag_ids?: string[];
}

/**
 * Update restaurant request
 * All fields optional - partial update
 */
export interface UpdateRestaurantRequest {
    name?: string;
    formatted_address?: string;
    street?: string;
    city_id?: string;
    region?: string;
    postal_code?: string;
    country_code?: string;
    latitude?: number;
    longitude?: number;
    price_tier?: PriceTier;
    status?: string;
    phone?: string;
    website?: string;
    is_active?: boolean;
}

/**
 * Save user swipe decision
 */
export interface SaveSwipeRequest {
    user_id: string;
    restaurant_id: string;
    decision: SwipeDecision;
    session_id?: string;
}

/**
 * Create review request
 */
export interface CreateReviewRequest {
    restaurant_id: string;
    author_user_id?: string;
    source: ReviewSource;
    rating?: number;
    title?: string;
    body: string;
    is_anonymous?: boolean;
    visited_at?: string;
}

/**
 * Save restaurant to favorites
 */
export interface SaveRestaurantRequest {
    user_id: string;
    restaurant_id: string;
    notes?: string;
}

// ============================================================
// LEGACY TYPES (for backward compatibility)
// ============================================================

/**
 * @deprecated Use MenuItem from database.types.ts
 */
export interface LegacyMenuItem {
    name: string;
    price: string;
    emoji: string;
    imageUrl: string;
}

/**
 * @deprecated Use Review from database.types.ts
 */
export interface LegacyReview {
    text: string;
    author: string;
}

/**
 * @deprecated Legacy restaurant format
 */
export interface LegacyRestaurant {
    id?: string;
    name: string;
    tagline: string;
    location: string;
    imageUrl: string;
    additionalPhotos: string[];
    popularItems: LegacyMenuItem[];
    reviews: LegacyReview[];
    ambianceTags: string[];
    reservationInfo: string;
    priceRange: string; // '$', '$$', '$$$', '$$$$'
    cuisine: string;
    createdAt?: Date;
    updatedAt?: Date;
}

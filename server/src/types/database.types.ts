/**
 * Database Entity Types
 * Type-safe representations of database tables
 * Maps directly to the PostgreSQL schema
 */

import {
    PriceTier,
    Status,
    SwipeDecision,
    ImageRole,
    ReviewSource,
    ModerationStatus,
    Provider,
    MenuStatus,
} from './enums';

/**
 * Base interface for entities with timestamps
 */
export interface TimestampedEntity {
    created_at: string;
    updated_at: string;
}

/**
 * Geographic point using PostGIS
 * Stored as GEOGRAPHY(POINT, 4326) in database
 */
export interface GeoPoint {
    type: 'Point';
    coordinates: [longitude: number, latitude: number];
}

/**
 * Opening hours for a specific day
 */
export interface DayHours {
    open: string; // HH:MM format
    close: string; // HH:MM format
    is_closed?: boolean;
}

/**
 * Special day hours (holidays, etc.)
 */
export interface SpecialDayHours {
    date: string; // YYYY-MM-DD format
    hours?: DayHours;
    is_closed: boolean;
    note?: string;
}

// ============================================================
// CORE ENTITY TYPES
// ============================================================

/**
 * Hours table
 * Stores operating hours for restaurants
 */
export interface Hours {
    id: string;
    mon?: DayHours;
    tue?: DayHours;
    wed?: DayHours;
    thu?: DayHours;
    fri?: DayHours;
    sat?: DayHours;
    sun?: DayHours;
    special_days?: SpecialDayHours[];
}

/**
 * Restaurant entity
 * Core table for restaurant data
 */
export interface Restaurant extends TimestampedEntity {
    id: string;
    name: string;
    formatted_address?: string;
    street?: string;
    city_id?: string;
    region?: string;
    postal_code?: string;
    country_code?: string;
    geo: GeoPoint | string; // Can be GeoJSON object or PostGIS string
    price_tier: PriceTier;
    status: Status;
    phone?: string;
    website?: string;
    is_active: boolean;
    hours_id?: string;
}

/**
 * Restaurant statistics
 * Aggregated data for a restaurant
 */
export interface RestaurantStats {
    restaurant_id: string;
    rating_avg?: number;
    rating_count: number;
    photo_count: number;
    save_count: number;
    like_count: number;
    last_review_at?: string;
}

/**
 * Cuisine entity
 * Supports hierarchical cuisines with parent_id
 */
export interface Cuisine {
    id: string;
    name: string;
    parent_id?: string;
}

/**
 * Restaurant-Cuisine junction
 * Many-to-many relationship
 */
export interface RestaurantCuisine {
    restaurant_id: string;
    cuisine_id: string;
}

/**
 * Tag entity
 * Used for ambiance, dietary restrictions, etc.
 */
export interface Tag {
    id: string;
    name: string;
    type: string;
}

/**
 * Restaurant-Tag junction
 * Many-to-many relationship
 */
export interface RestaurantTag {
    restaurant_id: string;
    tag_id: string;
}

// ============================================================
// USER ENTITY TYPES
// ============================================================

/**
 * User entity
 */
export interface User extends TimestampedEntity {
    id: string;
    email?: string;
    display_name?: string;
    avatar_url?: string;
    auth_provider?: string;
    auth_provider_id?: string;
    last_login_at?: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
    user_id: string;
    preferred_cuisines?: string[];
    excluded_cuisines?: string[];
    preferred_price_tiers?: PriceTier[];
    preferred_tags?: string[];
    max_distance_meters?: number;
    dietary_restrictions?: string[];
}

/**
 * User swipe record
 * Tracks user's like/pass decisions
 */
export interface UserSwipe extends TimestampedEntity {
    id: string;
    user_id: string;
    restaurant_id: string;
    decision: SwipeDecision;
    decided_at: string;
    session_id?: string;
}

/**
 * Saved restaurant (deprecated, use UserSwipe with LIKE)
 */
export interface SavedRestaurant extends TimestampedEntity {
    id: string;
    user_id: string;
    restaurant_id: string;
    notes?: string;
}

// ============================================================
// MEDIA ENTITY TYPES
// ============================================================

/**
 * Restaurant image
 */
export interface RestaurantImage extends TimestampedEntity {
    id: string;
    restaurant_id: string;
    url: string;
    role: ImageRole;
    attribution?: string;
    width?: number;
    height?: number;
    sort_order: number;
}

/**
 * Review entity
 */
export interface Review extends TimestampedEntity {
    id: string;
    restaurant_id: string;
    author_user_id?: string;
    source: ReviewSource;
    source_review_id?: string;
    rating?: number;
    title?: string;
    body: string;
    is_anonymous: boolean;
    moderation_status: ModerationStatus;
    visited_at?: string;
    helpful_count: number;
}

/**
 * Review image
 */
export interface ReviewImage extends TimestampedEntity {
    id: string;
    review_id: string;
    url: string;
    attribution?: string;
    width?: number;
    height?: number;
    sort_order: number;
}

// ============================================================
// EXTERNAL SOURCE ENTITY TYPES
// ============================================================

/**
 * External place source reference
 * Links to Google Places, Yelp, etc.
 */
export interface PlaceSource extends TimestampedEntity {
    id: string;
    restaurant_id: string;
    provider: Provider;
    provider_place_id: string;
    provider_url?: string;
    last_synced_at?: string;
}

/**
 * Restaurant aliases
 * Alternative names for the same restaurant
 */
export interface RestaurantAlias extends TimestampedEntity {
    id: string;
    restaurant_id: string;
    alias_name: string;
    language_code?: string;
}

// ============================================================
// MENU ENTITY TYPES
// ============================================================

/**
 * Menu entity
 * A restaurant can have multiple menus (dinner, lunch, etc.)
 */
export interface Menu extends TimestampedEntity {
    id: string;
    restaurant_id: string;
    name: string;
    description?: string;
    status: MenuStatus;
    effective_from?: string;
    effective_to?: string;
}

/**
 * Menu section
 * Groups menu items (appetizers, mains, etc.)
 */
export interface MenuSection extends TimestampedEntity {
    id: string;
    menu_id: string;
    name: string;
    description?: string;
    sort_order: number;
}

/**
 * Menu item
 */
export interface MenuItem extends TimestampedEntity {
    id: string;
    section_id: string;
    name: string;
    description?: string;
    price?: number;
    currency_code: string;
    image_url?: string;
    is_available: boolean;
    dietary_info?: string[];
    sort_order: number;
}

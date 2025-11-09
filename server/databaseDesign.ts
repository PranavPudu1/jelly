// --- Shared Enums ---
export type PriceTier = 'FREE' | 'CHEAP' | 'MODERATE' | 'EXPENSIVE' | 'LUXURY';
export type Status = 'ACTIVE' | 'INACTIVE' | 'CLOSED';
export type SwipeDecision = 'LIKE' | 'PASS' | 'SUPERLIKE';
export type ImageRole = 'COVER' | 'FOOD' | 'AMBIENCE' | 'MENU_PAGE' | 'LOGO';
export type ReviewSource = 'GOOGLE' | 'YELP' | 'MANUAL' | 'ZOMATO' | 'OTHER';
export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type Provider = 'GOOGLE' | 'YELP' | 'TRIPADVISOR' | 'OPENTABLE';
export type MenuStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// --- Common ---
export interface GeoPoint {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface Timestamps {
    created_at?: string;
    updated_at?: string;
}

export interface Restaurant extends Timestamps {
    id: string; // UUIDv7
    name: string;
    formatted_address?: string;
    street?: string;
    city_id?: string; // FK
    region?: string;
    postal_code?: string;
    country_code?: string; // 2-char ISO
    geo: GeoPoint;
    price_tier: PriceTier;
    status: Status;
    phone?: string;
    website?: string;
    is_active: boolean;
    hours_id?: string | null; // FK
}

export interface RestaurantStats {
    restaurant_id: string; // FK + PK
    rating_avg?: number;
    rating_count?: number;
    photo_count?: number;
    save_count?: number;
    like_count?: number;
    last_review_at?: string;
}

export interface Cuisine {
    id: string;
    name: string;
    parent_id?: string | null;
}

export interface RestaurantCuisine {
    restaurant_id: string;
    cuisine_id: string;
}

export interface Tag {
    id: string;
    name: string;
    type: string; // could be enum later
}

export interface RestaurantTag {
    restaurant_id: string;
    tag_id: string;
}

export interface User extends Timestamps {
    id: string;
    phone_e164: string;
    email?: string | null;
    password_hash: string;
    password_algo: string;
    name?: string;
    last_geo?: GeoPoint | null;
    last_loc_updated_at?: string | null;
    last_active_at?: string;
}

export interface UserPreferences {
    user_id: string; // PK + FK
    max_distance_m?: number;
    price_min?: PriceTier;
    price_max?: PriceTier;
    cuisines?: string[]; // stored as JSONB
    dietary_tags?: string[];
    open_now_only: boolean;
}

export interface UserSwipe {
    id: string; // UUIDv7
    user_id: string;
    restaurant_id: string;
    decision: SwipeDecision;
    decided_at: string;
    session_id?: string | null;
}

export interface SavedRestaurant {
    id: string;
    user_id: string;
    restaurant_id: string;
    saved_at: string;
}

export interface RestaurantImage {
    id: string;
    restaurant_id: string;
    uploaded_by_user_id?: string | null;
    role: ImageRole;
    storage_provider?: string;
    storage_key?: string;
    url?: string;
    width?: number;
    height?: number;
    bytes?: number;
    content_type?: string;
    blurhash?: string;
    attribution?: string;
    is_primary: boolean;
    uploaded_at?: string;
}

export interface Review {
    id: string;
    restaurant_id: string;
    author_user_id?: string | null;
    source: ReviewSource;
    source_review_id?: string | null;
    rating?: number; // 1–5
    title?: string | null;
    body: string;
    language?: string | null;
    is_anonymous: boolean;
    moderation_status: ModerationStatus;
    helpful_count: number;
    visited_at?: string | null;
    created_at: string;
}

export interface ReviewImage {
    id: string;
    review_id: string;
    image_id: string;
}

export interface Hours {
    id: string;
    mon?: Record<string, any>;
    tue?: Record<string, any>;
    wed?: Record<string, any>;
    thu?: Record<string, any>;
    fri?: Record<string, any>;
    sat?: Record<string, any>;
    sun?: Record<string, any>;
    special_days?: Record<string, any>;
}

export interface PlaceSource {
    id: string;
    provider: Provider;
    provider_place_id: string;
    raw_json: Record<string, any>;
    fetched_at: string;
}

export interface RestaurantAlias {
    restaurant_id: string;
    provider: Provider;
    provider_place_id: string;
    confidence: number;
    is_primary_source: boolean;
}

export interface Menu {
    id: string;
    restaurant_id: string;
    version: number;
    currency: string; // 3-char code
    source: Provider;
    status: MenuStatus;
    effective_from?: string;
    effective_to?: string;
    created_at?: string;
}

export interface MenuSection {
    id: string;
    menu_id: string;
    name: string;
    position: number;
}

export interface MenuItem {
    id: string;
    section_id: string;
    name: string;
    description?: string;
    price_decimal?: number;
    flags?: Record<string, any>;
    image_id?: string | null;
    position?: number;
}

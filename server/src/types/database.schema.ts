/**
 * Supabase Database Schema
 * Auto-generated types for type-safe database queries
 *
 * This schema should be generated using:
 * npx supabase gen types typescript --project-id <project-id> > src/types/database.schema.ts
 *
 * For now, we provide a manual schema definition
 */

export interface Database {
    public: {
        Tables: {
            restaurants: {
                Row: {
                    id: string;
                    name: string;
                    formatted_address: string | null;
                    street: string | null;
                    city_id: string | null;
                    region: string | null;
                    postal_code: string | null;
                    country_code: string | null;
                    geo: unknown; // PostGIS GEOGRAPHY type
                    price_tier: Database['public']['Enums']['price_tier'];
                    status: Database['public']['Enums']['status'];
                    phone: string | null;
                    website: string | null;
                    is_active: boolean;
                    hours_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    formatted_address?: string | null;
                    street?: string | null;
                    city_id?: string | null;
                    region?: string | null;
                    postal_code?: string | null;
                    country_code?: string | null;
                    geo: unknown;
                    price_tier: Database['public']['Enums']['price_tier'];
                    status?: Database['public']['Enums']['status'];
                    phone?: string | null;
                    website?: string | null;
                    is_active?: boolean;
                    hours_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    formatted_address?: string | null;
                    street?: string | null;
                    city_id?: string | null;
                    region?: string | null;
                    postal_code?: string | null;
                    country_code?: string | null;
                    geo?: unknown;
                    price_tier?: Database['public']['Enums']['price_tier'];
                    status?: Database['public']['Enums']['status'];
                    phone?: string | null;
                    website?: string | null;
                    is_active?: boolean;
                    hours_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            restaurant_stats: {
                Row: {
                    restaurant_id: string;
                    rating_avg: number | null;
                    rating_count: number;
                    photo_count: number;
                    save_count: number;
                    like_count: number;
                    last_review_at: string | null;
                };
                Insert: {
                    restaurant_id: string;
                    rating_avg?: number | null;
                    rating_count?: number;
                    photo_count?: number;
                    save_count?: number;
                    like_count?: number;
                    last_review_at?: string | null;
                };
                Update: {
                    restaurant_id?: string;
                    rating_avg?: number | null;
                    rating_count?: number;
                    photo_count?: number;
                    save_count?: number;
                    like_count?: number;
                    last_review_at?: string | null;
                };
            };
            cuisines: {
                Row: {
                    id: string;
                    name: string;
                    parent_id: string | null;
                };
                Insert: {
                    id?: string;
                    name: string;
                    parent_id?: string | null;
                };
                Update: {
                    id?: string;
                    name?: string;
                    parent_id?: string | null;
                };
            };
            restaurant_cuisines: {
                Row: {
                    restaurant_id: string;
                    cuisine_id: string;
                };
                Insert: {
                    restaurant_id: string;
                    cuisine_id: string;
                };
                Update: {
                    restaurant_id?: string;
                    cuisine_id?: string;
                };
            };
            tags: {
                Row: {
                    id: string;
                    name: string;
                    type: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    type: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    type?: string;
                };
            };
            restaurant_tags: {
                Row: {
                    restaurant_id: string;
                    tag_id: string;
                };
                Insert: {
                    restaurant_id: string;
                    tag_id: string;
                };
                Update: {
                    restaurant_id?: string;
                    tag_id?: string;
                };
            };
            users: {
                Row: {
                    id: string;
                    email: string | null;
                    display_name: string | null;
                    avatar_url: string | null;
                    auth_provider: string | null;
                    auth_provider_id: string | null;
                    last_login_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email?: string | null;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    auth_provider?: string | null;
                    auth_provider_id?: string | null;
                    last_login_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    auth_provider?: string | null;
                    auth_provider_id?: string | null;
                    last_login_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            user_preferences: {
                Row: {
                    user_id: string;
                    preferred_cuisines: string[] | null;
                    excluded_cuisines: string[] | null;
                    preferred_price_tiers: Database['public']['Enums']['price_tier'][] | null;
                    preferred_tags: string[] | null;
                    max_distance_meters: number | null;
                    dietary_restrictions: string[] | null;
                };
                Insert: {
                    user_id: string;
                    preferred_cuisines?: string[] | null;
                    excluded_cuisines?: string[] | null;
                    preferred_price_tiers?: Database['public']['Enums']['price_tier'][] | null;
                    preferred_tags?: string[] | null;
                    max_distance_meters?: number | null;
                    dietary_restrictions?: string[] | null;
                };
                Update: {
                    user_id?: string;
                    preferred_cuisines?: string[] | null;
                    excluded_cuisines?: string[] | null;
                    preferred_price_tiers?: Database['public']['Enums']['price_tier'][] | null;
                    preferred_tags?: string[] | null;
                    max_distance_meters?: number | null;
                    dietary_restrictions?: string[] | null;
                };
            };
            user_swipes: {
                Row: {
                    id: string;
                    user_id: string;
                    restaurant_id: string;
                    decision: Database['public']['Enums']['swipe_decision'];
                    decided_at: string;
                    session_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    restaurant_id: string;
                    decision: Database['public']['Enums']['swipe_decision'];
                    decided_at?: string;
                    session_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    restaurant_id?: string;
                    decision?: Database['public']['Enums']['swipe_decision'];
                    decided_at?: string;
                    session_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            saved_restaurants: {
                Row: {
                    id: string;
                    user_id: string;
                    restaurant_id: string;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    restaurant_id: string;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    restaurant_id?: string;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            restaurant_images: {
                Row: {
                    id: string;
                    restaurant_id: string;
                    url: string;
                    role: Database['public']['Enums']['image_role'];
                    attribution: string | null;
                    width: number | null;
                    height: number | null;
                    sort_order: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    restaurant_id: string;
                    url: string;
                    role: Database['public']['Enums']['image_role'];
                    attribution?: string | null;
                    width?: number | null;
                    height?: number | null;
                    sort_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    restaurant_id?: string;
                    url?: string;
                    role?: Database['public']['Enums']['image_role'];
                    attribution?: string | null;
                    width?: number | null;
                    height?: number | null;
                    sort_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            reviews: {
                Row: {
                    id: string;
                    restaurant_id: string;
                    author_user_id: string | null;
                    source: Database['public']['Enums']['review_source'];
                    source_review_id: string | null;
                    rating: number | null;
                    title: string | null;
                    body: string;
                    is_anonymous: boolean;
                    moderation_status: Database['public']['Enums']['moderation_status'];
                    visited_at: string | null;
                    helpful_count: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    restaurant_id: string;
                    author_user_id?: string | null;
                    source: Database['public']['Enums']['review_source'];
                    source_review_id?: string | null;
                    rating?: number | null;
                    title?: string | null;
                    body: string;
                    is_anonymous?: boolean;
                    moderation_status?: Database['public']['Enums']['moderation_status'];
                    visited_at?: string | null;
                    helpful_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    restaurant_id?: string;
                    author_user_id?: string | null;
                    source?: Database['public']['Enums']['review_source'];
                    source_review_id?: string | null;
                    rating?: number | null;
                    title?: string | null;
                    body?: string;
                    is_anonymous?: boolean;
                    moderation_status?: Database['public']['Enums']['moderation_status'];
                    visited_at?: string | null;
                    helpful_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            review_images: {
                Row: {
                    id: string;
                    review_id: string;
                    url: string;
                    attribution: string | null;
                    width: number | null;
                    height: number | null;
                    sort_order: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    review_id: string;
                    url: string;
                    attribution?: string | null;
                    width?: number | null;
                    height?: number | null;
                    sort_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    review_id?: string;
                    url?: string;
                    attribution?: string | null;
                    width?: number | null;
                    height?: number | null;
                    sort_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            hours: {
                Row: {
                    id: string;
                    mon: unknown | null;
                    tue: unknown | null;
                    wed: unknown | null;
                    thu: unknown | null;
                    fri: unknown | null;
                    sat: unknown | null;
                    sun: unknown | null;
                    special_days: unknown | null;
                };
                Insert: {
                    id?: string;
                    mon?: unknown | null;
                    tue?: unknown | null;
                    wed?: unknown | null;
                    thu?: unknown | null;
                    fri?: unknown | null;
                    sat?: unknown | null;
                    sun?: unknown | null;
                    special_days?: unknown | null;
                };
                Update: {
                    id?: string;
                    mon?: unknown | null;
                    tue?: unknown | null;
                    wed?: unknown | null;
                    thu?: unknown | null;
                    fri?: unknown | null;
                    sat?: unknown | null;
                    sun?: unknown | null;
                    special_days?: unknown | null;
                };
            };
            place_sources: {
                Row: {
                    id: string;
                    restaurant_id: string;
                    provider: Database['public']['Enums']['provider'];
                    provider_place_id: string;
                    provider_url: string | null;
                    last_synced_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    restaurant_id: string;
                    provider: Database['public']['Enums']['provider'];
                    provider_place_id: string;
                    provider_url?: string | null;
                    last_synced_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    restaurant_id?: string;
                    provider?: Database['public']['Enums']['provider'];
                    provider_place_id?: string;
                    provider_url?: string | null;
                    last_synced_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            restaurant_aliases: {
                Row: {
                    id: string;
                    restaurant_id: string;
                    alias_name: string;
                    language_code: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    restaurant_id: string;
                    alias_name: string;
                    language_code?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    restaurant_id?: string;
                    alias_name?: string;
                    language_code?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            menus: {
                Row: {
                    id: string;
                    restaurant_id: string;
                    name: string;
                    description: string | null;
                    status: Database['public']['Enums']['menu_status'];
                    effective_from: string | null;
                    effective_to: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    restaurant_id: string;
                    name: string;
                    description?: string | null;
                    status?: Database['public']['Enums']['menu_status'];
                    effective_from?: string | null;
                    effective_to?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    restaurant_id?: string;
                    name?: string;
                    description?: string | null;
                    status?: Database['public']['Enums']['menu_status'];
                    effective_from?: string | null;
                    effective_to?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            menu_sections: {
                Row: {
                    id: string;
                    menu_id: string;
                    name: string;
                    description: string | null;
                    sort_order: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    menu_id: string;
                    name: string;
                    description?: string | null;
                    sort_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    menu_id?: string;
                    name?: string;
                    description?: string | null;
                    sort_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            menu_items: {
                Row: {
                    id: string;
                    section_id: string;
                    name: string;
                    description: string | null;
                    price: number | null;
                    currency_code: string;
                    image_url: string | null;
                    is_available: boolean;
                    dietary_info: string[] | null;
                    sort_order: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    section_id: string;
                    name: string;
                    description?: string | null;
                    price?: number | null;
                    currency_code?: string;
                    image_url?: string | null;
                    is_available?: boolean;
                    dietary_info?: string[] | null;
                    sort_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    section_id?: string;
                    name?: string;
                    description?: string | null;
                    price?: number | null;
                    currency_code?: string;
                    image_url?: string | null;
                    is_available?: boolean;
                    dietary_info?: string[] | null;
                    sort_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {
            restaurants_with_stats: {
                Row: {
                    id: string;
                    name: string;
                    formatted_address: string | null;
                    street: string | null;
                    city_id: string | null;
                    region: string | null;
                    postal_code: string | null;
                    country_code: string | null;
                    geo: unknown;
                    price_tier: Database['public']['Enums']['price_tier'];
                    status: Database['public']['Enums']['status'];
                    phone: string | null;
                    website: string | null;
                    is_active: boolean;
                    hours_id: string | null;
                    created_at: string;
                    updated_at: string;
                    rating_avg: number | null;
                    rating_count: number;
                    photo_count: number;
                    save_count: number;
                    like_count: number;
                    last_review_at: string | null;
                };
            };
        };
        Functions: {
            restaurants_within_distance: {
                Args: {
                    lat: number;
                    lon: number;
                    distance_meters: number;
                };
                Returns: {
                    id: string;
                    distance: number;
                }[];
            };
        };
        Enums: {
            price_tier: 'FREE' | 'CHEAP' | 'MODERATE' | 'EXPENSIVE' | 'LUXURY';
            status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
            swipe_decision: 'LIKE' | 'PASS' | 'SUPERLIKE';
            image_role: 'COVER' | 'FOOD' | 'AMBIENCE' | 'MENU_PAGE' | 'LOGO';
            review_source: 'GOOGLE' | 'YELP' | 'MANUAL' | 'ZOMATO' | 'OTHER';
            moderation_status: 'PENDING' | 'APPROVED' | 'REJECTED';
            provider: 'GOOGLE' | 'YELP' | 'TRIPADVISOR' | 'OPENTABLE';
            menu_status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
        };
    };
}

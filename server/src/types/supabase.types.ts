/**
 * Supabase Database Type Definitions
 * Auto-generated types for Supabase database schema
 */

import { Source } from './enums';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            restaurants: {
                Row: {
                    id: string;
                    source_id: string | null;
                    source: Source;
                    name: string;
                    image_url: string;
                    is_closed: boolean;
                    url: string;
                    review_count: number;
                    rating: number;
                    lat: number;
                    long: number;
                    geo: unknown | null;
                    transactions: string[];
                    price: string | null;
                    address: string;
                    city: string;
                    country: string;
                    state: string;
                    zip_code: number;
                    phone: string | null;
                    instagram: string | null;
                    tiktok: string | null;
                    date_added: string;
                };
                Insert: {
                    id?: string;
                    source_id?: string | null;
                    source: Source;
                    name: string;
                    image_url: string;
                    is_closed?: boolean;
                    url: string;
                    review_count?: number;
                    rating?: number;
                    lat: number;
                    long: number;
                    geo?: unknown | null;
                    transactions?: string[];
                    price?: string | null;
                    address: string;
                    city: string;
                    country: string;
                    state: string;
                    zip_code: number;
                    phone?: string | null;
                    instagram?: string | null;
                    tiktok?: string | null;
                    date_added?: string;
                };
                Update: {
                    id?: string;
                    source_id?: string | null;
                    source?: Source;
                    name?: string;
                    image_url?: string;
                    is_closed?: boolean;
                    url?: string;
                    review_count?: number;
                    rating?: number;
                    lat?: number;
                    long?: number;
                    geo?: unknown | null;
                    transactions?: string[];
                    price?: string | null;
                    address?: string;
                    city?: string;
                    country?: string;
                    state?: string;
                    zip_code?: number;
                    phone?: string | null;
                    instagram?: string | null;
                    tiktok?: string | null;
                    date_added?: string;
                };
            };
            tags: {
                Row: {
                    id: string;
                    source: Source;
                    value: string;
                    type: 'FOOD' | 'AMBIANCE';
                    source_alias: string | null;
                };
                Insert: {
                    id?: string;
                    source: Source;
                    value: string;
                    type: 'FOOD' | 'AMBIANCE';
                    source_alias?: string | null;
                };
                Update: {
                    id?: string;
                    source?: Source;
                    value?: string;
                    type?: 'FOOD' | 'AMBIANCE';
                    source_alias?: string | null;
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
            reviews: {
                Row: {
                    id: string;
                    source_id: string | null;
                    source: Source;
                    source_url: string | null;
                    review: string;
                    rating: number;
                    date_created: string;
                    reviewed_by: string | null;
                };
                Insert: {
                    id?: string;
                    source_id?: string | null;
                    source: Source;
                    source_url?: string | null;
                    review: string;
                    rating: number;
                    date_created?: string;
                    reviewed_by?: string | null;
                };
                Update: {
                    id?: string;
                    source_id?: string | null;
                    source?: Source;
                    source_url?: string | null;
                    review?: string;
                    rating?: number;
                    date_created?: string;
                    reviewed_by?: string | null;
                };
            };
            restaurant_reviews: {
                Row: {
                    restaurant_id: string;
                    review_id: string;
                };
                Insert: {
                    restaurant_id: string;
                    review_id: string;
                };
                Update: {
                    restaurant_id?: string;
                    review_id?: string;
                };
            };
            restaurant_images: {
                Row: {
                    id: string;
                    source_id: string | null;
                    source: Source;
                    url: string;
                    date_added: string;
                };
                Insert: {
                    id?: string;
                    source_id?: string | null;
                    source: Source;
                    url: string;
                    date_added?: string;
                };
                Update: {
                    id?: string;
                    source_id?: string | null;
                    source?: Source;
                    url?: string;
                    date_added?: string;
                };
            };
            restaurant_image_links: {
                Row: {
                    restaurant_id: string;
                    image_id: string;
                };
                Insert: {
                    restaurant_id: string;
                    image_id: string;
                };
                Update: {
                    restaurant_id?: string;
                    image_id?: string;
                };
            };
            restaurant_image_tags: {
                Row: {
                    image_id: string;
                    tag_id: string;
                };
                Insert: {
                    image_id: string;
                    tag_id: string;
                };
                Update: {
                    image_id?: string;
                    tag_id?: string;
                };
            };
            restaurant_items: {
                Row: {
                    id: string;
                    source_id: string | null;
                    source: Source;
                    name: string;
                    description: string | null;
                    date_added: string;
                };
                Insert: {
                    id?: string;
                    source_id?: string | null;
                    source: Source;
                    name: string;
                    description?: string | null;
                    date_added?: string;
                };
                Update: {
                    id?: string;
                    source_id?: string | null;
                    source?: Source;
                    name?: string;
                    description?: string | null;
                    date_added?: string;
                };
            };
            restaurant_item_links: {
                Row: {
                    restaurant_id: string;
                    item_id: string;
                    is_popular: boolean;
                };
                Insert: {
                    restaurant_id: string;
                    item_id: string;
                    is_popular?: boolean;
                };
                Update: {
                    restaurant_id?: string;
                    item_id?: string;
                    is_popular?: boolean;
                };
            };
            restaurant_item_images: {
                Row: {
                    item_id: string;
                    image_id: string;
                };
                Insert: {
                    item_id: string;
                    image_id: string;
                };
                Update: {
                    item_id?: string;
                    image_id?: string;
                };
            };
            restaurant_item_tags: {
                Row: {
                    item_id: string;
                    tag_id: string;
                };
                Insert: {
                    item_id: string;
                    tag_id: string;
                };
                Update: {
                    item_id?: string;
                    tag_id?: string;
                };
            };
            users: {
                Row: {
                    id: string;
                    email: string | null;
                    name: string;
                    last_login: string;
                    lat: number;
                    long: number;
                    geo: unknown | null;
                };
                Insert: {
                    id?: string;
                    email?: string | null;
                    name: string;
                    last_login?: string;
                    lat: number;
                    long: number;
                    geo?: unknown | null;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    name?: string;
                    last_login?: string;
                    lat?: number;
                    long?: number;
                    geo?: unknown | null;
                };
            };
            sessions: {
                Row: {
                    id: string;
                    user_id: string;
                    date_started: string;
                    date_ended: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    date_started?: string;
                    date_ended?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    date_started?: string;
                    date_ended?: string | null;
                };
            };
            user_swipes: {
                Row: {
                    id: string;
                    user_id: string;
                    restaurant_id: string;
                    session_id: string | null;
                    decided: boolean;
                    date_swiped: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    restaurant_id: string;
                    session_id?: string | null;
                    decided: boolean;
                    date_swiped?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    restaurant_id?: string;
                    session_id?: string | null;
                    decided?: boolean;
                    date_swiped?: string;
                };
            };
            user_saves: {
                Row: {
                    id: string;
                    user_id: string;
                    restaurant_id: string;
                    session_id: string | null;
                    swipe_id: string | null;
                    date_saved: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    restaurant_id: string;
                    session_id?: string | null;
                    swipe_id?: string | null;
                    date_saved?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    restaurant_id?: string;
                    session_id?: string | null;
                    swipe_id?: string | null;
                    date_saved?: string;
                };
            };
            user_preferences: {
                Row: {
                    id: string;
                    user_id: string;
                    date_changed: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    date_changed?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    date_changed?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
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
                    distance_meters: number;
                }[];
            };
        };
        Enums: {
            source_type: Source;
            tag_type: 'FOOD' | 'AMBIANCE';
        };
    };
}

export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type Functions = Database['public']['Functions'];
export type Views = Database['public']['Views'];

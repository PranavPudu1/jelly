/**
 * Supabase Configuration
 * Initializes Supabase client connection
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

let supabase: SupabaseClient<Database>;

/**
 * Initialize Supabase Client
 */
export function initializeSupabase(): SupabaseClient<Database> {
    if (supabase) {
        return supabase;
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
        }

        supabase = createClient<Database>(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        console.log('✅ Supabase initialized successfully');
        return supabase;
    }
    catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        throw new Error('Supabase initialization failed');
    }
}

/**
 * Get Supabase instance
 */
export function getSupabase(): SupabaseClient<Database> {
    if (!supabase) {
        return initializeSupabase();
    }
    return supabase;
}

/**
 * Table names constants
 */
export const TABLES = {
    RESTAURANTS: 'restaurants',
    TAGS: 'tags',
    RESTAURANT_TAGS: 'restaurant_tags',
    REVIEWS: 'reviews',
    RESTAURANT_REVIEWS: 'restaurant_reviews',
    RESTAURANT_IMAGES: 'restaurant_images',
    RESTAURANT_IMAGE_LINKS: 'restaurant_image_links',
    RESTAURANT_IMAGE_TAGS: 'restaurant_image_tags',
    RESTAURANT_ITEMS: 'restaurant_items',
    RESTAURANT_ITEM_LINKS: 'restaurant_item_links',
    RESTAURANT_ITEM_IMAGES: 'restaurant_item_images',
    RESTAURANT_ITEM_TAGS: 'restaurant_item_tags',
    USERS: 'users',
    SESSIONS: 'sessions',
    USER_SWIPES: 'user_swipes',
    USER_SAVES: 'user_saves',
    USER_PREFERENCES: 'user_preferences',
} as const;

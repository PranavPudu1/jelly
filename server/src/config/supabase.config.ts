/**
 * Supabase Configuration
 * Initializes Supabase client connection
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

let supabase: SupabaseClient;

/**
 * Initialize Supabase Client
 */
export const initializeSupabase = (): SupabaseClient => {
    if (supabase) {
        return supabase;
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
        }

        supabase = createClient(supabaseUrl, supabaseKey, {
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
};

/**
 * Get Supabase instance
 */
export const getSupabase = (): SupabaseClient => {
    if (!supabase) {
        return initializeSupabase();
    }
    return supabase;
};

/**
 * Table names constants
 */
export const TABLES = {
    RESTAURANTS: 'restaurants',
    RESTAURANT_STATS: 'restaurant_stats',
    CUISINES: 'cuisines',
    RESTAURANT_CUISINES: 'restaurant_cuisines',
    TAGS: 'tags',
    RESTAURANT_TAGS: 'restaurant_tags',
    USERS: 'users',
    USER_PREFERENCES: 'user_preferences',
    USER_SWIPES: 'user_swipes',
    SAVED_RESTAURANTS: 'saved_restaurants',
    RESTAURANT_IMAGES: 'restaurant_images',
    REVIEWS: 'reviews',
    REVIEW_IMAGES: 'review_images',
    HOURS: 'hours',
    PLACE_SOURCES: 'place_sources',
    RESTAURANT_ALIASES: 'restaurant_aliases',
    MENUS: 'menus',
    MENU_SECTIONS: 'menu_sections',
    MENU_ITEMS: 'menu_items',
} as const;

/**
 * Restaurant Service
 * Handles business logic and Supabase queries for restaurants
 */

import { getSupabase, TABLES } from '../config/supabase.config';
import type {
    UserSwipe,
    PaginatedResponse,
    GetRestaurantsQuery,
    SaveSwipeRequest,
    RestaurantWithStats,
    CreateRestaurantRequest,
    UpdateRestaurantRequest,
} from '../types';
import { SwipeDecision } from '../types';
import { config } from '../config/env.config';

export class RestaurantService {
    private supabase = getSupabase();

    /**
     * Get paginated restaurants excluding those the user has already swiped on
     * Supports filtering by cuisine, price tier, location, distance, tags, and rating
     */
    async getRestaurants(
        queryParams: GetRestaurantsQuery
    ): Promise<PaginatedResponse<RestaurantWithStats>> {
        const {
            userId,
            page = 1,
            limit = config.DEFAULT_PAGE_SIZE,
            cuisines,
            priceMin,
            priceMax,
            latitude,
            longitude,
            maxDistanceMeters,
            tags,
            minRating,
        } = queryParams;

        // Enforce max page size
        const pageSize = Math.min(limit, config.MAX_PAGE_SIZE);
        const offset = (page - 1) * pageSize;

        try {
            // Get user's swiped restaurant IDs if userId is provided
            const swipedRestaurantIds = userId ? await this.getUserSwipedRestaurants(userId) : [];

            // Build base query using the restaurants_with_stats view
            let query = this.supabase
                .from('restaurants_with_stats')
                .select('*', { count: 'exact' })
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            // Apply filters
            if (swipedRestaurantIds.length > 0) {
                query = query.not('id', 'in', `(${swipedRestaurantIds.join(',')})`);
            }

            if (priceMin || priceMax) {
                const priceTiers = ['FREE', 'CHEAP', 'MODERATE', 'EXPENSIVE', 'LUXURY'];
                const minIndex = priceMin ? priceTiers.indexOf(priceMin) : 0;
                const maxIndex = priceMax ? priceTiers.indexOf(priceMax) : priceTiers.length - 1;
                const allowedTiers = priceTiers.slice(minIndex, maxIndex + 1);
                query = query.in('price_tier', allowedTiers);
            }

            if (minRating) {
                query = query.gte('rating_avg', minRating);
            }

            // Filter by cuisines (requires join)
            if (cuisines && cuisines.length > 0) {
                const { data: restaurantCuisines } = await this.supabase
                    .from(TABLES.RESTAURANT_CUISINES)
                    .select('restaurant_id')
                    .in('cuisine_id', cuisines);

                if (restaurantCuisines && restaurantCuisines.length > 0) {
                    const restaurantIds = restaurantCuisines.map((rc) => rc.restaurant_id);
                    query = query.in('id', restaurantIds);
                } else {
                    // No restaurants match the cuisine filter
                    return {
                        data: [],
                        page,
                        limit: pageSize,
                        total: 0,
                        hasMore: false,
                    };
                }
            }

            // Filter by tags (requires join)
            if (tags && tags.length > 0) {
                const { data: restaurantTags } = await this.supabase
                    .from(TABLES.RESTAURANT_TAGS)
                    .select('restaurant_id')
                    .in('tag_id', tags);

                if (restaurantTags && restaurantTags.length > 0) {
                    const restaurantIds = restaurantTags.map((rt) => rt.restaurant_id);
                    query = query.in('id', restaurantIds);
                } else {
                    // No restaurants match the tag filter
                    return {
                        data: [],
                        page,
                        limit: pageSize,
                        total: 0,
                        hasMore: false,
                    };
                }
            }

            // Geospatial filtering (if latitude/longitude provided)
            if (latitude !== undefined && longitude !== undefined && maxDistanceMeters) {
                // Use PostGIS ST_DWithin for efficient distance queries
                const { data: nearbyRestaurants, error: geoError } = await this.supabase.rpc(
                    'restaurants_within_distance',
                    {
                        lat: latitude,
                        lon: longitude,
                        distance_meters: maxDistanceMeters,
                    }
                );

                if (geoError) {
                    console.error('Geospatial query error:', geoError);
                } else if (nearbyRestaurants && nearbyRestaurants.length > 0) {
                    const nearbyIds = nearbyRestaurants.map((r: any) => r.id);
                    query = query.in('id', nearbyIds);
                } else {
                    // No restaurants within distance
                    return {
                        data: [],
                        page,
                        limit: pageSize,
                        total: 0,
                        hasMore: false,
                    };
                }
            }

            // Execute paginated query
            const { data, error, count } = await query.range(offset, offset + pageSize - 1);

            if (error) {
                console.error('Error fetching restaurants:', error);
                throw new Error(`Failed to fetch restaurants: ${error.message}`);
            }

            const total = count || 0;

            return {
                data: (data || []) as RestaurantWithStats[],
                page,
                limit: pageSize,
                total,
                hasMore: offset + pageSize < total,
            };
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            throw new Error('Failed to fetch restaurants');
        }
    }

    /**
     * Get a single restaurant by ID with stats
     */
    async getRestaurantById(id: string): Promise<RestaurantWithStats | null> {
        try {
            const { data, error } = await this.supabase
                .from('restaurants_with_stats')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Not found
                    return null;
                }
                console.error('Error fetching restaurant by ID:', error);
                throw new Error(`Failed to fetch restaurant: ${error.message}`);
            }

            return data as RestaurantWithStats;
        } catch (error) {
            console.error('Error fetching restaurant by ID:', error);
            throw new Error('Failed to fetch restaurant');
        }
    }

    /**
     * Create a new restaurant
     */
    async createRestaurant(
        restaurantData: CreateRestaurantRequest
    ): Promise<RestaurantWithStats> {
        try {
            const { cuisine_ids, tag_ids, latitude, longitude, ...restaurantFields } =
                restaurantData;

            // Create GeoJSON point for PostGIS
            const geoPoint = `POINT(${longitude} ${latitude})`;

            const { data, error } = await this.supabase
                .from(TABLES.RESTAURANTS)
                .insert({
                    ...restaurantFields,
                    geo: geoPoint,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating restaurant:', error);
                throw new Error(`Failed to create restaurant: ${error.message}`);
            }

            const restaurantId = data.id;

            // Add cuisine associations
            if (cuisine_ids && cuisine_ids.length > 0) {
                const cuisineAssociations = cuisine_ids.map((cuisine_id) => ({
                    restaurant_id: restaurantId,
                    cuisine_id,
                }));

                const { error: cuisineError } = await this.supabase
                    .from(TABLES.RESTAURANT_CUISINES)
                    .insert(cuisineAssociations);

                if (cuisineError) {
                    console.error('Error adding cuisines:', cuisineError);
                }
            }

            // Add tag associations
            if (tag_ids && tag_ids.length > 0) {
                const tagAssociations = tag_ids.map((tag_id) => ({
                    restaurant_id: restaurantId,
                    tag_id,
                }));

                const { error: tagError } = await this.supabase
                    .from(TABLES.RESTAURANT_TAGS)
                    .insert(tagAssociations);

                if (tagError) {
                    console.error('Error adding tags:', tagError);
                }
            }

            // Fetch the created restaurant with stats
            const created = await this.getRestaurantById(restaurantId);
            if (!created) {
                throw new Error('Failed to fetch created restaurant');
            }

            return created;
        } catch (error) {
            console.error('Error creating restaurant:', error);
            throw new Error('Failed to create restaurant');
        }
    }

    /**
     * Update a restaurant
     */
    async updateRestaurant(
        id: string,
        updates: UpdateRestaurantRequest
    ): Promise<RestaurantWithStats | null> {
        try {
            const { latitude, longitude, ...otherUpdates } = updates;

            const updateData: any = { ...otherUpdates };

            // Update geo point if coordinates provided
            if (latitude !== undefined && longitude !== undefined) {
                updateData.geo = `POINT(${longitude} ${latitude})`;
            }

            const { error } = await this.supabase
                .from(TABLES.RESTAURANTS)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Not found
                    return null;
                }
                console.error('Error updating restaurant:', error);
                throw new Error(`Failed to update restaurant: ${error.message}`);
            }

            // Fetch the updated restaurant with stats
            return await this.getRestaurantById(id);
        } catch (error) {
            console.error('Error updating restaurant:', error);
            throw new Error('Failed to update restaurant');
        }
    }

    /**
     * Delete a restaurant
     */
    async deleteRestaurant(id: string): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from(TABLES.RESTAURANTS)
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting restaurant:', error);
                throw new Error(`Failed to delete restaurant: ${error.message}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            throw new Error('Failed to delete restaurant');
        }
    }

    /**
     * Save user swipe (like, pass, or superlike)
     */
    async saveSwipe(swipeData: SaveSwipeRequest): Promise<UserSwipe> {
        const { user_id, restaurant_id, decision, session_id } = swipeData;

        try {
            // Upsert the swipe (insert or update if exists)
            const { data, error } = await this.supabase
                .from(TABLES.USER_SWIPES)
                .upsert(
                    {
                        user_id,
                        restaurant_id,
                        decision,
                        session_id,
                        decided_at: new Date().toISOString(),
                    },
                    {
                        onConflict: 'user_id,restaurant_id',
                    }
                )
                .select()
                .single();

            if (error) {
                console.error('Error saving swipe:', error);
                throw new Error(`Failed to save swipe: ${error.message}`);
            }

            return data as UserSwipe;
        } catch (error) {
            console.error('Error saving swipe:', error);
            throw new Error('Failed to save swipe');
        }
    }

    /**
     * Get all restaurant IDs that a user has swiped on
     */
    private async getUserSwipedRestaurants(userId: string): Promise<string[]> {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.USER_SWIPES)
                .select('restaurant_id')
                .eq('user_id', userId);

            if (error) {
                console.error('Error fetching user swipes:', error);
                return [];
            }

            return (data || []).map((swipe) => swipe.restaurant_id);
        } catch (error) {
            console.error('Error fetching user swipes:', error);
            return [];
        }
    }

    /**
     * Get user's saved restaurants (liked only)
     */
    async getUserSavedRestaurants(userId: string): Promise<RestaurantWithStats[]> {
        try {
            // Get liked restaurant IDs from swipes
            const { data: swipes, error: swipesError } = await this.supabase
                .from(TABLES.USER_SWIPES)
                .select('restaurant_id')
                .eq('user_id', userId)
                .eq('decision', 'LIKE' as SwipeDecision);

            if (swipesError) {
                console.error('Error fetching user swipes:', swipesError);
                throw new Error(`Failed to fetch saved restaurants: ${swipesError.message}`);
            }

            if (!swipes || swipes.length === 0) {
                return [];
            }

            const restaurantIds = swipes.map((swipe) => swipe.restaurant_id);

            // Fetch restaurants with stats
            const { data, error } = await this.supabase
                .from('restaurants_with_stats')
                .select('*')
                .in('id', restaurantIds);

            if (error) {
                console.error('Error fetching saved restaurants:', error);
                throw new Error(`Failed to fetch saved restaurants: ${error.message}`);
            }

            return (data || []) as RestaurantWithStats[];
        } catch (error) {
            console.error('Error fetching user saved restaurants:', error);
            throw new Error('Failed to fetch saved restaurants');
        }
    }
}

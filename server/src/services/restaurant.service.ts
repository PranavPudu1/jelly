/**
 * Restaurant Service (New Schema)
 * Handles business logic and Supabase queries for restaurants using the new simplified schema
 */

import { getSupabase } from '../config/supabase.config';
import type {
    Restaurant,
    UserSwipe,
    PaginatedResponse,
    GetRestaurantsQuery,
    SaveSwipeRequest,
    CreateRestaurantRequest,
    UpdateRestaurantRequest,
    RestaurantPopulated,
    Tag,
    Review,
    RestaurantImage,
    RestaurantItem,
    Database,
    TablesInsert,
    TablesUpdate,
} from '../types';

export class RestaurantService {
    private supabase = getSupabase();

    /**
     * Get paginated restaurants excluding those the user has already swiped on
     */
    async getRestaurants(
        queryParams: GetRestaurantsQuery
    ): Promise<PaginatedResponse<Restaurant>> {
        const {
            userId,
            page = 1,
            limit = 20,
            latitude,
            longitude,
            maxDistanceMeters,
            tags,
            minRating,
        } = queryParams;

        const pageSize = Math.min(limit, 100); // Max 100 items per page
        const offset = (page - 1) * pageSize;

        try {
            // Get user's swiped restaurant IDs if userId is provided
            const swipedRestaurantIds = userId ? await this.getUserSwipedRestaurants(userId) : [];

            // Build base query
            let query = this.supabase
                .from('restaurants')
                .select('*', { count: 'exact' })
                .eq('is_closed', false)
                .order('date_added', { ascending: false });

            // Apply filters
            if (swipedRestaurantIds.length > 0) {
                query = query.not('id', 'in', `(${swipedRestaurantIds.join(',')})`);
            }

            if (minRating) {
                query = query.gte('rating', minRating);
            }

            // Filter by tags (requires join)
            if (tags && tags.length > 0) {
                const { data: restaurantTags } = await this.supabase
                    .from('restaurant_tags')
                    .select('restaurant_id')
                    .in('tag_id', tags) as any;

                if (restaurantTags && restaurantTags.length > 0) {
                    const restaurantIds = restaurantTags.map((rt: any) => rt.restaurant_id);
                    query = query.in('id', restaurantIds);
                } else {
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
                data: (data || []) as Restaurant[],
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
     * Get a single restaurant by ID with all its relationships populated
     */
    async getRestaurantById(id: string): Promise<RestaurantPopulated | null> {
        try {
            // Get base restaurant
            const { data: restaurant, error } = await this.supabase
                .from('restaurants')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                console.error('Error fetching restaurant by ID:', error);
                throw new Error(`Failed to fetch restaurant: ${error.message}`);
            }

            if (!restaurant) {
                return null;
            }

            // Fetch related data in parallel
            const [tagsResult, reviewsResult, imagesResult, menuItemsResult] = await Promise.all([
                this.getRestaurantTags(id),
                this.getRestaurantReviews(id),
                this.getRestaurantImages(id),
                this.getRestaurantMenuItems(id),
            ]);

            const populated: RestaurantPopulated = {
                ...restaurant as Restaurant,
                tags: tagsResult,
                reviews: reviewsResult,
                images: imagesResult,
                menu: menuItemsResult.all,
                popularItems: menuItemsResult.popular,
            };

            return populated;
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
    ): Promise<Restaurant> {
        try {
            const { tag_ids, ...restaurantFields } = restaurantData;

            const { data, error } = await this.supabase
                .from('restaurants')
                .insert(restaurantFields)
                .select()
                .single();

            if (error) {
                console.error('Error creating restaurant:', error);
                throw new Error(`Failed to create restaurant: ${error.message}`);
            }

            const restaurantId = data.id;

            // Add tag associations
            if (tag_ids && tag_ids.length > 0) {
                const tagAssociations = tag_ids.map((tag_id) => ({
                    restaurant_id: restaurantId,
                    tag_id,
                }));

                const { error: tagError } = await this.supabase
                    .from('restaurant_tags')
                    .insert(tagAssociations);

                if (tagError) {
                    console.error('Error adding tags:', tagError);
                }
            }

            return data as Restaurant;
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
    ): Promise<Restaurant | null> {
        try {
            const { error, data } = await this.supabase
                .from('restaurants')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                console.error('Error updating restaurant:', error);
                throw new Error(`Failed to update restaurant: ${error.message}`);
            }

            return data as Restaurant;
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
                .from('restaurants')
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
     * Save user swipe
     */
    async saveSwipe(swipeData: SaveSwipeRequest): Promise<UserSwipe> {
        const { user_id, restaurant_id, decided, session_id } = swipeData;

        try {
            // Upsert the swipe
            const { data, error } = await this.supabase
                .from('user_swipes')
                .upsert(
                    {
                        user_id,
                        restaurant_id,
                        decided,
                        session_id: session_id || null,
                        date_swiped: new Date().toISOString(),
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

            // If decided is true (liked), also save to user_saves
            if (decided) {
                await this.supabase
                    .from('user_saves')
                    .upsert(
                        {
                            user_id,
                            restaurant_id,
                            session_id: session_id || null,
                            swipe_id: data.id,
                        },
                        {
                            onConflict: 'user_id,restaurant_id',
                        }
                    );
            }

            return data as UserSwipe;
        } catch (error) {
            console.error('Error saving swipe:', error);
            throw new Error('Failed to save swipe');
        }
    }

    /**
     * Get user's saved (liked) restaurants
     */
    async getUserSavedRestaurants(userId: string): Promise<Restaurant[]> {
        try {
            const { data: saves, error: savesError } = await this.supabase
                .from('user_saves')
                .select('restaurant_id')
                .eq('user_id', userId);

            if (savesError) {
                console.error('Error fetching user saves:', savesError);
                throw new Error(`Failed to fetch saved restaurants: ${savesError.message}`);
            }

            if (!saves || saves.length === 0) {
                return [];
            }

            const restaurantIds = saves.map((save) => save.restaurant_id);

            const { data, error } = await this.supabase
                .from('restaurants')
                .select('*')
                .in('id', restaurantIds);

            if (error) {
                console.error('Error fetching saved restaurants:', error);
                throw new Error(`Failed to fetch saved restaurants: ${error.message}`);
            }

            return (data || []) as Restaurant[];
        } catch (error) {
            console.error('Error fetching user saved restaurants:', error);
            throw new Error('Failed to fetch saved restaurants');
        }
    }

    // Private helper methods

    private async getUserSwipedRestaurants(userId: string): Promise<string[]> {
        try {
            const { data, error } = await this.supabase
                .from('user_swipes')
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

    private async getRestaurantTags(restaurantId: string): Promise<Tag[]> {
        const { data, error } = await this.supabase
            .from('restaurant_tags')
            .select(`
                tag_id,
                tags:tag_id (*)
            `)
            .eq('restaurant_id', restaurantId);

        if (error) {
            console.error('Error fetching restaurant tags:', error);
            return [];
        }

        return (data || [])
            .map((item: any) => item.tags)
            .filter(Boolean) as Tag[];
    }

    private async getRestaurantReviews(restaurantId: string): Promise<Review[]> {
        const { data, error } = await this.supabase
            .from('restaurant_reviews')
            .select(`
                review_id,
                reviews:review_id (*)
            `)
            .eq('restaurant_id', restaurantId);

        if (error) {
            console.error('Error fetching restaurant reviews:', error);
            return [];
        }

        return (data || [])
            .map((item: any) => item.reviews)
            .filter(Boolean) as Review[];
    }

    private async getRestaurantImages(restaurantId: string): Promise<RestaurantImage[]> {
        const { data, error } = await this.supabase
            .from('restaurant_image_links')
            .select(`
                image_id,
                restaurant_images:image_id (*)
            `)
            .eq('restaurant_id', restaurantId);

        if (error) {
            console.error('Error fetching restaurant images:', error);
            return [];
        }

        return (data || [])
            .map((item: any) => item.restaurant_images)
            .filter(Boolean) as RestaurantImage[];
    }

    private async getRestaurantMenuItems(restaurantId: string): Promise<{
        all: RestaurantItem[];
        popular: RestaurantItem[];
    }> {
        const { data, error } = await this.supabase
            .from('restaurant_item_links')
            .select(`
                item_id,
                is_popular,
                restaurant_items:item_id (*)
            `)
            .eq('restaurant_id', restaurantId);

        if (error) {
            console.error('Error fetching restaurant menu items:', error);
            return { all: [], popular: [] };
        }

        const allItems = (data || [])
            .map((item: any) => item.restaurant_items)
            .filter(Boolean) as RestaurantItem[];

        const popularItems = (data || [])
            .filter((item: any) => item.is_popular)
            .map((item: any) => item.restaurant_items)
            .filter(Boolean) as RestaurantItem[];

        return { all: allItems, popular: popularItems };
    }
}

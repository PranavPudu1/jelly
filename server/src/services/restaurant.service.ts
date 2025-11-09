/**
 * Restaurant Service
 * Handles business logic and Firestore queries for restaurants
 */

import { getFirestore, COLLECTIONS } from '../config/firebase.config';
import {
    Restaurant,
    UserSwipe,
    PaginatedResponse,
    GetRestaurantsQuery,
    SaveSwipeRequest,
} from '../models/restaurant.model';
import { config } from '../config/env.config';

export class RestaurantService {
    private db = getFirestore();

    /**
   * Get paginated restaurants excluding those the user has already swiped on
   */
    async getRestaurants(
        queryParams: GetRestaurantsQuery
    ): Promise<PaginatedResponse<Restaurant>> {
        const {
            userId,
            page = 1,
            limit = config.DEFAULT_PAGE_SIZE,
            cuisine,
            priceRange,
            location,
        } = queryParams;

        // Enforce max page size
        const pageSize = Math.min(limit, config.MAX_PAGE_SIZE);
        const offset = (page - 1) * pageSize;

        try {
            // Get user's swiped restaurant IDs if userId is provided
            const swipedRestaurantIds = userId ? await this.getUserSwipedRestaurants(userId) : [];

            // Build Firestore query
            let query = this.db.collection(COLLECTIONS.RESTAURANTS).orderBy('createdAt', 'desc');

            // Apply filters
            if (cuisine) {
                query = query.where('cuisine', '==', cuisine);
            }
            if (priceRange) {
                query = query.where('priceRange', '==', priceRange);
            }
            if (location) {
                query = query.where('location', '==', location);
            }

            // Execute query
            const snapshot = await query.get();

            // Filter out swiped restaurants and apply pagination manually
            // (Firestore doesn't support NOT IN for arrays larger than 10 items)
            const allRestaurants: Restaurant[] = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                .filter((restaurant) => !swipedRestaurantIds.includes(restaurant.id!)) as Restaurant[];

            const total = allRestaurants.length;
            const paginatedRestaurants = allRestaurants.slice(offset, offset + pageSize);

            return {
                data: paginatedRestaurants,
                page,
                limit: pageSize,
                total,
                hasMore: offset + pageSize < total,
            };
        }
        catch (error) {
            console.error('Error fetching restaurants:', error);
            throw new Error('Failed to fetch restaurants');
        }
    }

    /**
   * Get a single restaurant by ID
   */
    async getRestaurantById(id: string): Promise<Restaurant | null> {
        try {
            const doc = await this.db.collection(COLLECTIONS.RESTAURANTS).doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return {
                id: doc.id,
                ...doc.data(),
            } as Restaurant;
        }
        catch (error) {
            console.error('Error fetching restaurant by ID:', error);
            throw new Error('Failed to fetch restaurant');
        }
    }

    /**
   * Create a new restaurant
   */
    async createRestaurant(restaurant: Omit<Restaurant, 'id'>): Promise<Restaurant> {
        try {
            const now = new Date();
            const docRef = await this.db.collection(COLLECTIONS.RESTAURANTS).add({
                ...restaurant,
                createdAt: now,
                updatedAt: now,
            });

            const newDoc = await docRef.get();
            return {
                id: newDoc.id,
                ...newDoc.data(),
            } as Restaurant;
        }
        catch (error) {
            console.error('Error creating restaurant:', error);
            throw new Error('Failed to create restaurant');
        }
    }

    /**
   * Update a restaurant
   */
    async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | null> {
        try {
            const docRef = this.db.collection(COLLECTIONS.RESTAURANTS).doc(id);
            const doc = await docRef.get();

            if (!doc.exists) {
                return null;
            }

            await docRef.update({
                ...updates,
                updatedAt: new Date(),
            });

            const updatedDoc = await docRef.get();
            return {
                id: updatedDoc.id,
                ...updatedDoc.data(),
            } as Restaurant;
        }
        catch (error) {
            console.error('Error updating restaurant:', error);
            throw new Error('Failed to update restaurant');
        }
    }

    /**
   * Delete a restaurant
   */
    async deleteRestaurant(id: string): Promise<boolean> {
        try {
            const docRef = this.db.collection(COLLECTIONS.RESTAURANTS).doc(id);
            const doc = await docRef.get();

            if (!doc.exists) {
                return false;
            }

            await docRef.delete();
            return true;
        }
        catch (error) {
            console.error('Error deleting restaurant:', error);
            throw new Error('Failed to delete restaurant');
        }
    }

    /**
   * Save user swipe (like or dislike)
   */
    async saveSwipe(swipeData: SaveSwipeRequest): Promise<UserSwipe> {
        const { userId, restaurantId, action } = swipeData;

        try {
            // Check if swipe already exists
            const existingSwipe = await this.db
                .collection(COLLECTIONS.USER_SWIPES)
                .where('userId', '==', userId)
                .where('restaurantId', '==', restaurantId)
                .get();

            // If swipe exists, update it
            if (!existingSwipe.empty) {
                const docRef = existingSwipe.docs[0].ref;
                await docRef.update({
                    action,
                    timestamp: new Date(),
                });

                const updatedDoc = await docRef.get();
                return {
                    id: updatedDoc.id,
                    ...updatedDoc.data(),
                } as UserSwipe;
            }

            // Otherwise, create new swipe
            const swipe: Omit<UserSwipe, 'id'> = {
                userId,
                restaurantId,
                action,
                timestamp: new Date(),
            };

            const docRef = await this.db.collection(COLLECTIONS.USER_SWIPES).add(swipe);
            const newDoc = await docRef.get();

            return {
                id: newDoc.id,
                ...newDoc.data(),
            } as UserSwipe;
        }
        catch (error) {
            console.error('Error saving swipe:', error);
            throw new Error('Failed to save swipe');
        }
    }

    /**
   * Get all restaurant IDs that a user has swiped on
   */
    private async getUserSwipedRestaurants(userId: string): Promise<string[]> {
        try {
            const snapshot = await this.db
                .collection(COLLECTIONS.USER_SWIPES)
                .where('userId', '==', userId)
                .get();

            return snapshot.docs.map((doc) => doc.data().restaurantId);
        }
        catch (error) {
            console.error('Error fetching user swipes:', error);
            return [];
        }
    }

    /**
   * Get user's saved restaurants (liked only)
   */
    async getUserSavedRestaurants(userId: string): Promise<Restaurant[]> {
        try {
            const swipesSnapshot = await this.db
                .collection(COLLECTIONS.USER_SWIPES)
                .where('userId', '==', userId)
                .where('action', '==', 'like')
                .get();

            const restaurantIds = swipesSnapshot.docs.map((doc) => doc.data().restaurantId);

            if (restaurantIds.length === 0) {
                return [];
            }

            // Firestore 'in' query supports up to 10 items at a time
            const restaurants: Restaurant[] = [];
            const chunks = this.chunkArray(restaurantIds, 10);

            for (const chunk of chunks) {
                const snapshot = await this.db
                    .collection(COLLECTIONS.RESTAURANTS)
                    .where('__name__', 'in', chunk)
                    .get();

                const chunkRestaurants = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Restaurant[];

                restaurants.push(...chunkRestaurants);
            }

            return restaurants;
        }
        catch (error) {
            console.error('Error fetching user saved restaurants:', error);
            throw new Error('Failed to fetch saved restaurants');
        }
    }

    /**
   * Helper: Split array into chunks
   */
    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}

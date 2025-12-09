import { createContext, PropsWithChildren, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Restaurant, SavedRestaurant } from '../types';

const SAVED_RESTAURANTS_KEY = '@saved_restaurants';

interface SavedRestaurantsContextType {
    savedRestaurants: SavedRestaurant[];
    saveRestaurant: (restaurant: Restaurant, preferences?: Record<string, number>) => Promise<void>;
    unsaveRestaurant: (restaurantId: string) => Promise<void>;
    clearAllSavedRestaurants: () => Promise<void>;
    isRestaurantSaved: (restaurantId: string) => boolean;
    getSavedRestaurant: (restaurantId: string) => SavedRestaurant | undefined;
    isLoading: boolean;
}

export const SavedRestaurantsContext = createContext<SavedRestaurantsContextType>({
    savedRestaurants: [],
    saveRestaurant: async () => {},
    unsaveRestaurant: async () => {},
    clearAllSavedRestaurants: async () => {},
    isRestaurantSaved: () => false,
    getSavedRestaurant: () => undefined,
    isLoading: true,
});

export function useSavedRestaurants() {
    const context = useContext(SavedRestaurantsContext);
    if (!context) {
        throw new Error('useSavedRestaurants must be used within SavedRestaurantsProvider');
    }
    return context;
}

export default function SavedRestaurantsProvider({ children }: PropsWithChildren) {
    const [savedRestaurants, setSavedRestaurants] = useState<SavedRestaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved restaurants from AsyncStorage on mount
    useEffect(() => {
        loadSavedRestaurants();
    }, []);

    async function loadSavedRestaurants() {
        try {
            const saved = await AsyncStorage.getItem(SAVED_RESTAURANTS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Backward compatibility: Check if old format (Restaurant[]) or new format (SavedRestaurant[])
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // If first item has 'restaurant' property, it's new format
                    if ('restaurant' in parsed[0]) {
                        setSavedRestaurants(parsed as SavedRestaurant[]);
                    } else {
                        // Old format - migrate to new format
                        const migrated: SavedRestaurant[] = parsed.map((r: Restaurant) => ({
                            restaurant: r,
                            savedAt: Date.now(),
                            preferences: undefined,
                        }));
                        setSavedRestaurants(migrated);
                        // Save migrated data
                        await AsyncStorage.setItem(SAVED_RESTAURANTS_KEY, JSON.stringify(migrated));
                    }
                }
            }
        }
        catch (error) {
            console.error('Error loading saved restaurants:', error);
        }
        finally {
            setIsLoading(false);
        }
    }

    async function saveRestaurant(restaurant: Restaurant, preferences?: Record<string, number>) {
        try {
            // Check if already saved
            const isAlreadySaved = savedRestaurants.some((saved) => saved.restaurant.id === restaurant.id);
            if (isAlreadySaved) {
                return;
            }

            // Create saved restaurant object with metadata
            const savedRestaurant: SavedRestaurant = {
                restaurant,
                savedAt: Date.now(),
                preferences,
            };

            // Add to beginning of list (most recent first)
            const updated = [savedRestaurant, ...savedRestaurants];
            setSavedRestaurants(updated);
            await AsyncStorage.setItem(SAVED_RESTAURANTS_KEY, JSON.stringify(updated));
        }
        catch (error) {
            console.error('Error saving restaurant:', error);
        }
    }

    async function unsaveRestaurant(restaurantId: string) {
        try {
            const updated = savedRestaurants.filter((saved) => saved.restaurant.id !== restaurantId);
            setSavedRestaurants(updated);
            await AsyncStorage.setItem(SAVED_RESTAURANTS_KEY, JSON.stringify(updated));
        }
        catch (error) {
            console.error('Error unsaving restaurant:', error);
        }
    }

    function isRestaurantSaved(restaurantId: string): boolean {
        return savedRestaurants.some((saved) => saved.restaurant.id === restaurantId);
    }

    function getSavedRestaurant(restaurantId: string): SavedRestaurant | undefined {
        return savedRestaurants.find((saved) => saved.restaurant.id === restaurantId);
    }

    async function clearAllSavedRestaurants() {
        try {
            setSavedRestaurants([]);
            await AsyncStorage.removeItem(SAVED_RESTAURANTS_KEY);
        }
        catch (error) {
            console.error('Error clearing saved restaurants:', error);
        }
    }

    return (
        <SavedRestaurantsContext.Provider
            value={ {
                savedRestaurants,
                saveRestaurant,
                unsaveRestaurant,
                clearAllSavedRestaurants,
                isRestaurantSaved,
                getSavedRestaurant,
                isLoading,
            } }
        >
            { children }
        </SavedRestaurantsContext.Provider>
    );
}

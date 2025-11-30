import { Restaurant } from '../types';

interface UserPreferences {
    lookingFor?: string;
    rankedPreferences?: string[];
    additionalInfo?: string;
}

/**
 * Score a restaurant based on user preferences
 */
export function scoreRestaurant(
    restaurant: Restaurant,
    preferences: UserPreferences | null
): number {
    if (!preferences) return 0;

    let score = 0;
    const ranked = preferences.rankedPreferences || [];

    // Base score from rating (0-5)
    score += restaurant.rating;

    // Score based on ranked preferences (most important = higher weight)
    ranked.forEach((pref, index) => {
        const weight = ranked.length - index; // First item gets highest weight

        switch (pref.toLowerCase()) {
            case 'food variety':
                // Higher score for restaurants with more food items
                score += (restaurant.foodItems?.length || 0) * weight * 0.5;
                break;

            case 'ambiance':
                // Higher score for restaurants with ambience photos
                score += (restaurant.ambiencePhotos?.length || 0) * weight * 0.3;
                break;

            case 'location':
                // If user values location, prioritize closer restaurants
                // (In a real app, you'd use actual distance calculation)
                if (restaurant.lat && restaurant.long) {
                    score += weight * 2;
                }
                break;

            case 'price':
                // Match price preference
                // Assuming user wants good value ($$-$$$)
                if (restaurant.priceLevel === '$$' || restaurant.priceLevel === '$$$') {
                    score += weight * 3;
                }
                break;

            case 'reviews':
                // Higher score for restaurants with more reviews and higher ratings
                const reviewCount = restaurant.reviews?.length || 0;
                score += (reviewCount * 0.5 + restaurant.rating * 2) * weight * 0.4;
                break;
        }
    });

    // Boost score if cuisine matches lookingFor
    if (preferences.lookingFor) {
        const lookingForLower = preferences.lookingFor.toLowerCase();
        const cuisineLower = restaurant.cuisine?.toLowerCase() || '';

        if (cuisineLower.includes(lookingForLower) || lookingForLower.includes(cuisineLower)) {
            score += 10; // Big boost for matching what user is looking for
        }
    }

    // Boost for matching additional preferences
    if (preferences.additionalInfo) {
        const additionalLower = preferences.additionalInfo.toLowerCase();

        // Check for dietary restrictions/preferences
        if (additionalLower.includes('vegetarian') && cuisineLower.includes('vegetarian')) {
            score += 5;
        }
        if (additionalLower.includes('gluten') && cuisineLower.includes('gluten')) {
            score += 5;
        }
    }

    return score;
}

/**
 * Sort restaurants based on user preferences
 */
export function sortRestaurantsByPreferences(
    restaurants: Restaurant[],
    preferences: UserPreferences | null
): Restaurant[] {
    if (!preferences || !preferences.rankedPreferences?.length) {
        // No preferences, return as-is
        return restaurants;
    }

    // Score each restaurant
    const scored = restaurants.map(restaurant => ({
        restaurant,
        score: scoreRestaurant(restaurant, preferences),
    }));

    // Sort by score (descending)
    scored.sort((a, b) => b.score - a.score);

    // Return sorted restaurants
    return scored.map(item => item.restaurant);
}

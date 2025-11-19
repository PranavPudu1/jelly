import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Get restaurants near a location
 */
export async function getNearby(req: Request, res: Response): Promise<void> {
    try {
        const { lat, long, radius = 5000, price, rating, cuisine } = req.query;

        if (!lat || !long) {
            res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required',
            });
            return;
        }

        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(long as string);
        const radiusMeters = parseFloat(radius as string);
        const minRating = rating ? parseFloat(rating as string) : undefined;

        // Fetch all restaurants using Prisma with tags included for cuisine filtering
        const allRestaurants = await prisma.restaurant.findMany({
            include: {
                tags: true,
            },
        });

        // Calculate distance for each restaurant and apply filters
        const restaurantsWithDistance = allRestaurants
            .map((restaurant) => ({
                ...restaurant,
                distance: calculateDistance(latitude, longitude, restaurant.lat, restaurant.long),
            }))
            .filter((restaurant) => {
                // Filter by radius/distance
                if (restaurant.distance >= radiusMeters) {
                    return false;
                }

                // Filter by price
                if (price && restaurant.price !== price) {
                    return false;
                }

                // Filter by rating
                if (minRating !== undefined && restaurant.rating < minRating) {
                    return false;
                }

                // Filter by cuisine (check if any tag value matches)
                if (cuisine) {
                    const cuisineString = (cuisine as string).toLowerCase();
                    const hasCuisine = restaurant.tags.some((tag) =>
                        tag.value.toLowerCase().includes(cuisineString)
                    );
                    if (!hasCuisine) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => a.distance - b.distance);

        res.status(200).json({
            success: true,
            data: restaurantsWithDistance,
        });
    } catch (error) {
        console.error('Error fetching nearby restaurants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nearby restaurants',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

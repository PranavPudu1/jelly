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
 * Calculate bounding box for initial geo-filtering
 */
function calculateBoundingBox(lat: number, long: number, radiusMeters: number) {
    const latDiff = radiusMeters / 111000; // ~111km per degree latitude
    const longDiff = radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180));

    return {
        minLat: lat - latDiff,
        maxLat: lat + latDiff,
        minLong: long - longDiff,
        maxLong: long + longDiff,
    };
}

/**
 * Calculate ambiance score from AI-tagged ambiance images
 */
function calculateAmbianceScore(restaurant: any): number {
    // Filter for ambiance-tagged images
    const ambianceImages = restaurant.images.filter((image: any) =>
        image.tags?.some((tag: any) => tag.value.toLowerCase() === 'ambiance')
    );

    // If no ambiance images, fall back to overall rating
    if (ambianceImages.length === 0) {
        return restaurant.rating / 5;
    }

    // Average the ratings of ambiance images
    const totalRating = ambianceImages.reduce((sum: number, image: any) => sum + (image.rating || 0), 0);
    const averageRating = totalRating / ambianceImages.length;

    // Normalize to 0-1 scale (ratings are 1-5)
    return averageRating / 5;
}

/**
 * Calculate custom score based on user preferences
 */
function calculateScore(
    restaurant: any,
    distance: number,
    radiusMeters: number,
    preferences?: {
        foodQuality?: number;
        ambiance?: number;
        proximity?: number;
        price?: number;
        reviews?: number;
    }
): { score: number; breakdown: any | null } {
    if (!preferences) return { score: 0, breakdown: null };

    const {
        foodQuality = 0,
        ambiance = 0,
        proximity = 0,
        price: priceWeight = 0,
        reviews: reviewsWeight = 0,
    } = preferences;

    // Normalize rating (0-5 scale) - for food quality
    const ratingScore = restaurant.rating / 5;

    // Calculate ambiance score from AI-tagged images
    const ambianceScore = calculateAmbianceScore(restaurant);

    // Normalize proximity (inverse: closer = higher score)
    const proximityScore = 1 - distance / radiusMeters;

    // Normalize price ($ = 1, $$ = 2, $$$ = 3, $$$$ = 4)
    const priceValue = restaurant.price.length;
    const priceScore = 1 - (priceValue - 1) / 3; // Inverse: cheaper = higher score

    // Review count score (more reviews = more reliable)
    const reviewCount = restaurant.reviews?.length || 0;
    const reviewScore = Math.min(reviewCount / 50, 1); // Normalize to max of 50 reviews

    // Calculate weighted components
    const weighted = {
        foodQuality: ratingScore * foodQuality,
        ambiance: ambianceScore * ambiance, // Now using actual ambiance image ratings!
        proximity: proximityScore * proximity,
        price: priceScore * priceWeight,
        reviews: reviewScore * reviewsWeight,
    };

    const score =
        weighted.foodQuality + weighted.ambiance + weighted.proximity + weighted.price + weighted.reviews;

    return {
        score,
        breakdown: {
            raw: {
                ratingScore,
                ambianceScore,
                proximityScore,
                priceScore,
                reviewScore,
                reviewCount,
                priceValue,
            },
            weighted,
            weights: {
                foodQuality,
                ambiance,
                proximity,
                price: priceWeight,
                reviews: reviewsWeight,
            },
            totalScore: score,
        },
    };
}

function logScoreBreakdown(
    restaurant: any,
    distance: number,
    radiusMeters: number,
    breakdown: any,
    preferences?: Record<string, number>
): void {
    if (!breakdown) return;

    // Compact, structured log so you can see why each restaurant ranks where it does
    console.log(
        `[score-debug] ${restaurant.name} (${restaurant.id})`,
        JSON.stringify(
            {
                distanceMeters: Math.round(distance),
                radiusMeters,
                weights: preferences,
                raw: breakdown.raw,
                weighted: breakdown.weighted,
                totalScore: breakdown.totalScore,
            },
            null,
            2
        )
    );
}

/**
 * Check if ambiance is a high priority for the user (top 2 preferences)
 */
function isAmbianceHighPriority(preferences?: Record<string, number>): boolean {
    if (!preferences) return false;

    // Get all preference values and sort them in descending order
    const sortedWeights = Object.entries(preferences)
        .map(([key, value]) => ({ key, value }))
        .sort((a, b) => b.value - a.value);

    // Check if ambiance is in the top 2
    const top2Keys = sortedWeights.slice(0, 2).map(item => item.key);
    return top2Keys.includes('ambiance');
}

/**
 * Transform restaurant data into app-ready JSON format
 */
function transformRestaurant(restaurant: any, distance: number, preferences?: Record<string, number>) {
    const allImages = restaurant.images.map((image: any) => ({
        id: image.id,
        url: image.url,
        tags: image.tags,
    }));

    // Smart hero image selection based on ambiance priority
    let heroImage = '';
    if (isAmbianceHighPriority(preferences)) {
        // Find ambiance-tagged images
        const ambianceImages = restaurant.images.filter((image: any) =>
            image.tags?.some((tag: any) => tag.value.toLowerCase() === 'ambiance')
        );
        // Use highest-rated ambiance image as hero, or fall back to first image
        heroImage = ambianceImages[0]?.url || allImages[0]?.url || '';
    }
    else {
        // Default behavior: use highest-rated image overall
        heroImage = allImages[0]?.url || '';
    }

    const ambientImages = allImages.slice(1, 4).map((img: any) => img.url);

    // Get menu item images for popular dish photos
    const menuImages = restaurant.menu
        .flatMap((menuItem: any) => menuItem.images.map((img: any) => img.url))
        .slice(0, 5);

    const popularDishPhotos = menuImages.length > 0 ? menuImages : allImages.slice(0, 5).map((img: any) => img.url);

    // Get cuisine tags
    const cuisineTags = restaurant.tags
        .filter((tag: any) => tag.tagType?.value === 'cuisine')
        .map((tag: any) => tag.value);

    // Smart review selection based on ambiance priority
    let topReview = null;
    if (isAmbianceHighPriority(preferences)) {
        // Prioritize reviews that mention ambiance-related keywords
        const ambianceKeywords = ['ambiance', 'atmosphere', 'decor', 'vibe', 'aesthetic', 'cozy', 'elegant', 'modern', 'rustic', 'romantic'];

        // Find reviews with ambiance-related tags or content
        const ambianceReviews = restaurant.reviews.filter((review: any) => {
            const reviewText = (review.review || '').toLowerCase();
            const hasTags = review.tags?.some((tag: any) =>
                ambianceKeywords.some(keyword => tag.value.toLowerCase().includes(keyword))
            );
            const hasContent = ambianceKeywords.some(keyword => reviewText.includes(keyword));
            return hasTags || hasContent;
        });

        // Use ambiance-focused review if found, otherwise use top-rated review
        const selectedReview = ambianceReviews[0] || restaurant.reviews[0];
        topReview = selectedReview
            ? {
                author: selectedReview.postedBy || 'Anonymous',
                rating: selectedReview.rating,
                quote: selectedReview.review,
            }
            : null;
    }
    else {
        // Default behavior: use highest-rated review
        topReview = restaurant.reviews[0]
            ? {
                author: restaurant.reviews[0].postedBy || 'Anonymous',
                rating: restaurant.reviews[0].rating,
                quote: restaurant.reviews[0].review,
            }
            : null;
    }

    // Get social media handles
    const socialMedia = {
        instagram: restaurant.socialMedia.find((s: any) => s.source === 'instagram')?.url || null,
        tiktok: restaurant.socialMedia.find((s: any) => s.source === 'tiktok')?.url || null,
    };

    return {
        id: restaurant.id,
        name: restaurant.name,
        distance: Math.round(distance),
        price: restaurant.price,
        rating: restaurant.rating,
        heroImage,
        ambientImages,
        popularDishPhotos,
        menu: restaurant.menu.map((menuItem: any) => ({
            id: menuItem.id,
            images: menuItem.images.map((img: any) => img.url),
            tags: menuItem.tags.map((tag: any) => tag.value),
        })),
        topReview,
        cuisine: cuisineTags,
        socialMedia,
        address: restaurant.address,
        phoneNumber: restaurant.phoneNumber,
        lat: restaurant.lat,
        long: restaurant.long,
        mapLink: restaurant.mapLink,
        // Include score for debugging (only present when using custom sorting)
        ...(restaurant.score !== undefined && { score: restaurant.score }),
    };
}

/**
 * Get restaurants with comprehensive filtering, ranking, and pagination
 * GET /restaurants?lat=40.7128&long=-74.0060&radius=5000&page=1&pageSize=10
 */
export async function getRestaurants(req: Request, res: Response): Promise<void> {
    try {
        const {
            lat,
            long,
            radius = '5000',
            price,
            minRating,
            types,
            dietaryRestrictions,
            sortBy = 'distance',
            preferences,
            page = '1',
            pageSize = '10',
        } = req.query;

        // Validate required parameters
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
        const pageNum = parseInt(page as string);
        const pageSizeNum = parseInt(pageSize as string);

        // Parse array parameters
        const priceFilters = price ? (Array.isArray(price) ? price : [price]) : undefined;
        const typeFilters = types ? (Array.isArray(types) ? types : [types]) : undefined;
        const dietaryFilters = dietaryRestrictions
            ? Array.isArray(dietaryRestrictions)
                ? dietaryRestrictions
                : [dietaryRestrictions]
            : undefined;

        // Parse preferences if provided
        const userPreferences = preferences ? JSON.parse(preferences as string) : undefined;

        // Calculate bounding box for initial filtering
        const { minLat, maxLat, minLong, maxLong } = calculateBoundingBox(latitude, longitude, radiusMeters);

        // Build Prisma where clause
        const where: any = {
            lat: { gte: minLat, lte: maxLat },
            long: { gte: minLong, lte: maxLong },
        };

        // Add price filter
        if (priceFilters && priceFilters.length > 0) {
            where.price = { in: priceFilters };
        }

        // Add minimum rating filter
        if (minRating) {
            where.rating = { gte: parseFloat(minRating as string) };
        }

        // Add type/cuisine filter
        if (typeFilters && typeFilters.length > 0) {
            where.tags = {
                some: {
                    value: { in: typeFilters },
                },
            };
        }

        // Fetch restaurants with all related data
        const restaurants = await prisma.restaurant.findMany({
            where,
            include: {
                images: {
                    orderBy: { rating: 'desc' },
                    include: {
                        tags: true, // Include image tags for ambiance scoring
                    },
                },
                reviews: {
                    orderBy: { rating: 'desc' },
                    include: {
                        images: true,
                        tags: true,
                    },
                },
                menu: {
                    include: {
                        images: true,
                        tags: true,
                    },
                },
                socialMedia: true,
                tags: {
                    include: {
                        tagType: true,
                    },
                },
            },
        });

        // Calculate distances and apply additional filters
        let restaurantsWithDistance = restaurants
            .map((restaurant) => {
                const distance = calculateDistance(latitude, longitude, restaurant.lat, restaurant.long);
                return {
                    ...restaurant,
                    distance,
                };
            })
            .filter((restaurant) => {
                // Exact distance filter (Haversine)
                if (restaurant.distance > radiusMeters) {
                    return false;
                }

                // Dietary restrictions filter
                if (dietaryFilters && dietaryFilters.length > 0) {
                    const hasDietaryOption = restaurant.tags.some((tag) =>
                        dietaryFilters.some((filter) => tag.value.toLowerCase().includes((filter as string).toLowerCase()))
                    );
                    if (!hasDietaryOption) {
                        return false;
                    }
                }

                return true;
            });

        // Calculate scores and sort
        if (sortBy === 'custom' && userPreferences) {
            restaurantsWithDistance = restaurantsWithDistance
                .map((restaurant) => ({
                    ...restaurant,
                    ...(() => {
                        const { score, breakdown } = calculateScore(
                            restaurant,
                            restaurant.distance,
                            radiusMeters,
                            userPreferences
                        );
                        logScoreBreakdown(restaurant, restaurant.distance, radiusMeters, breakdown, userPreferences);
                        return { score };
                    })(),
                }))
                .sort((a, b) => b.score - a.score);
        }
        else if (sortBy === 'rating') {
            restaurantsWithDistance.sort((a, b) => b.rating - a.rating);
        }
        else {
            // Default: sort by distance
            restaurantsWithDistance.sort((a, b) => a.distance - b.distance);
        }

        // Apply pagination
        const totalCount = restaurantsWithDistance.length;
        const totalPages = Math.ceil(totalCount / pageSizeNum);
        const startIndex = (pageNum - 1) * pageSizeNum;
        const endIndex = startIndex + pageSizeNum;
        const paginatedRestaurants = restaurantsWithDistance.slice(startIndex, endIndex);

        // Transform data to app-ready format
        const transformedRestaurants = paginatedRestaurants.map((restaurant) =>
            transformRestaurant(restaurant, restaurant.distance, userPreferences)
        );

        res.status(200).json({
            success: true,
            data: transformedRestaurants,
            pagination: {
                page: pageNum,
                pageSize: pageSizeNum,
                totalCount,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPreviousPage: pageNum > 1,
            },
        });
    }
    catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurants',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

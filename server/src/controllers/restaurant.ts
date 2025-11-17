import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class RestaurantController {
    /**
     * Get all restaurants with pagination and filtering
     */
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const where: any = {};

            // Filter by rating
            if (req.query.minRating) {
                where.rating = { gte: parseFloat(req.query.minRating as string) };
            }

            // Filter by price
            if (req.query.price) {
                where.price = req.query.price;
            }

            // Search by name
            if (req.query.search) {
                where.name = { contains: req.query.search as string, mode: 'insensitive' };
            }

            const [restaurants, total] = await Promise.all([
                prisma.restaurant.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        tags: {
                            include: {
                                tagType: true,
                            },
                        },
                        images: {
                            include: {
                                tags: {
                                    include: {
                                        tagType: true,
                                    },
                                },
                            },
                        },
                        reviews: {
                            include: {
                                images: true,
                            },
                        },
                        menu: {
                            include: {
                                images: true,
                            },
                        },
                        socialMedia: true,
                    },
                    orderBy: { dateAdded: 'desc' },
                }),
                prisma.restaurant.count({ where }),
            ]);

            // Transform to match frontend expectations
            const transformedRestaurants = restaurants.map(restaurant => {
                // Extract classified images
                const allImages = restaurant.images.map(image => {
                    const classificationTag = image.tags.find(
                        tag => tag.tagType.value === 'image_classification'
                    );
                    return {
                        id: image.id,
                        url: image.url,
                        classification: classificationTag?.value || 'general',
                    };
                });

                const heroImage = allImages.find(img => img.classification === 'hero')?.url
                    || allImages[0]?.url || '';

                const ambientImage = allImages.find(img => img.classification === 'ambience')?.url
                    || allImages[1]?.url || '';

                const ambiencePhotos = allImages
                    .filter(img => img.classification === 'ambience')
                    .map(img => ({ imageUrl: img.url }));

                // Extract menu images
                const menuImages = restaurant.menu
                    .flatMap(menuItem => menuItem.images.map(img => img.url));

                // Create food items from menu items (if any exist)
                const foodItems = restaurant.menu.length > 0
                    ? restaurant.menu.map((menuItem, idx) => {
                        const itemImages = menuItem.images.map(img => img.url);
                        const defaultReview = restaurant.reviews[0];

                        return {
                            name: `Featured Dish ${idx + 1}`,
                            images: itemImages,
                            reviews: defaultReview ? [{
                                author: defaultReview.postedBy || 'Anonymous',
                                quote: defaultReview.review,
                                rating: defaultReview.rating,
                            }] : [],
                        };
                    })
                    : [];

                // Extract top review
                const topReview = restaurant.reviews[0];

                // Extract cuisine
                const cuisineTag = restaurant.tags.find((t: any) => t.tagType?.value === 'cuisine');

                // Build info list
                const infoList = [
                    { icon: 'location', text: restaurant.address },
                    { icon: 'call', text: restaurant.phoneNumber },
                ];

                return {
                    id: restaurant.id,
                    name: restaurant.name,
                    rating: restaurant.rating,
                    priceLevel: restaurant.price,
                    cuisine: cuisineTag?.value || 'Restaurant',
                    heroImageUrl: heroImage,
                    ambientImageUrl: ambientImage,
                    reviewQuote: topReview?.review || '',
                    reviewAuthor: topReview?.postedBy || '',
                    infoList,
                    instagramHandle: restaurant.socialMedia.find(s => s.source === 'instagram')?.url,
                    tiktokHandle: restaurant.socialMedia.find(s => s.source === 'tiktok')?.url,
                    foodItems,
                    ambiencePhotos,
                    menuImages,
                    reviews: restaurant.reviews.map(r => ({
                        author: r.postedBy || 'Anonymous',
                        quote: r.review,
                        rating: r.rating,
                    })),
                    lat: restaurant.lat,
                    long: restaurant.long,
                    address: restaurant.address,
                    popularDishPhotos: allImages
                        .filter(img => img.classification === 'food')
                        .slice(0, 5)
                        .map(img => img.url),
                };
            });

            res.status(200).json({
                success: true,
                data: transformedRestaurants,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page * limit < total,
                },
            });
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch restaurants',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get a single restaurant by ID
     */
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const restaurant = await prisma.restaurant.findUnique({
                where: { id },
                include: {
                    tags: {
                        include: {
                            tagType: true,
                        },
                    },
                    images: {
                        include: {
                            tags: {
                                include: {
                                    tagType: true,
                                },
                            },
                        },
                    },
                    reviews: {
                        include: {
                            tags: true,
                            images: true,
                        },
                    },
                    menu: {
                        include: {
                            tags: true,
                            images: true,
                        },
                    },
                    socialMedia: {
                        include: {
                            tags: true,
                        },
                    },
                },
            });

            if (!restaurant) {
                res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
                return;
            }

            // Transform to match frontend expectations
            const allImages = restaurant.images.map(image => {
                const classificationTag = image.tags.find(
                    tag => tag.tagType.value === 'image_classification'
                );
                return {
                    id: image.id,
                    url: image.url,
                    classification: classificationTag?.value || 'general',
                };
            });

            const heroImage = allImages.find(img => img.classification === 'hero')?.url
                || allImages[0]?.url || '';

            const ambientImage = allImages.find(img => img.classification === 'ambience')?.url
                || allImages[1]?.url || '';

            const ambiencePhotos = allImages
                .filter(img => img.classification === 'ambience')
                .map(img => ({ imageUrl: img.url }));

            const menuImages = restaurant.menu
                .flatMap(menuItem => menuItem.images.map(img => img.url));

            const foodItems = restaurant.menu.length > 0
                ? restaurant.menu.map((menuItem, idx) => {
                    const itemImages = menuItem.images.map(img => img.url);
                    const defaultReview = restaurant.reviews[0];

                    return {
                        name: `Featured Dish ${idx + 1}`,
                        images: itemImages,
                        reviews: defaultReview ? [{
                            author: defaultReview.postedBy || 'Anonymous',
                            quote: defaultReview.review,
                            rating: defaultReview.rating,
                        }] : [],
                    };
                })
                : [];

            const topReview = restaurant.reviews[0];
            const cuisineTag = restaurant.tags.find((t: any) => t.tagType?.value === 'cuisine');

            const infoList = [
                { icon: 'location', text: restaurant.address },
                { icon: 'call', text: restaurant.phoneNumber },
            ];

            const transformedRestaurant = {
                id: restaurant.id,
                name: restaurant.name,
                rating: restaurant.rating,
                priceLevel: restaurant.price,
                cuisine: cuisineTag?.value || 'Restaurant',
                heroImageUrl: heroImage,
                ambientImageUrl: ambientImage,
                reviewQuote: topReview?.review || '',
                reviewAuthor: topReview?.postedBy || '',
                infoList,
                instagramHandle: restaurant.socialMedia.find(s => s.source === 'instagram')?.url,
                tiktokHandle: restaurant.socialMedia.find(s => s.source === 'tiktok')?.url,
                foodItems,
                ambiencePhotos,
                menuImages,
                reviews: restaurant.reviews.map(r => ({
                    author: r.postedBy || 'Anonymous',
                    quote: r.review,
                    rating: r.rating,
                })),
                lat: restaurant.lat,
                long: restaurant.long,
                address: restaurant.address,
                popularDishPhotos: allImages
                    .filter(img => img.classification === 'food')
                    .slice(0, 5)
                    .map(img => img.url),
            };

            res.status(200).json({
                success: true,
                data: transformedRestaurant,
            });
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch restaurant',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Create a new restaurant
     */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const {
                name,
                rating,
                lat,
                long,
                address,
                mapLink,
                price,
                phoneNumber,
                sourceId,
                source,
            } = req.body;

            // Validate required fields
            if (!name || rating === undefined || !lat || !long || !address || !price || !phoneNumber) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields',
                });
                return;
            }

            const restaurant = await prisma.restaurant.create({
                data: {
                    name,
                    rating,
                    lat,
                    long,
                    address,
                    mapLink,
                    price,
                    phoneNumber,
                    sourceId,
                    source,
                },
                include: {
                    tags: true,
                    images: true,
                    reviews: true,
                    menu: true,
                    socialMedia: true,
                },
            });

            res.status(201).json({
                success: true,
                data: restaurant,
                message: 'Restaurant created successfully',
            });
        } catch (error) {
            console.error('Error creating restaurant:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create restaurant',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Update a restaurant
     */
    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if restaurant exists
            const existingRestaurant = await prisma.restaurant.findUnique({
                where: { id },
            });

            if (!existingRestaurant) {
                res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
                return;
            }

            const restaurant = await prisma.restaurant.update({
                where: { id },
                data: updateData,
                include: {
                    tags: true,
                    images: true,
                    reviews: true,
                    menu: true,
                    socialMedia: true,
                },
            });

            res.status(200).json({
                success: true,
                data: restaurant,
                message: 'Restaurant updated successfully',
            });
        } catch (error) {
            console.error('Error updating restaurant:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update restaurant',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Delete a restaurant
     */
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Check if restaurant exists
            const existingRestaurant = await prisma.restaurant.findUnique({
                where: { id },
            });

            if (!existingRestaurant) {
                res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
                return;
            }

            await prisma.restaurant.delete({
                where: { id },
            });

            res.status(200).json({
                success: true,
                message: 'Restaurant deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete restaurant',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get restaurants near a location
     */
    static async getNearby(req: Request, res: Response): Promise<void> {
        try {
            const { lat, long, radius = 5000 } = req.query;

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

            // Simple distance calculation (for precise geo queries, consider using PostGIS)
            const restaurants = await prisma.$queryRaw`
                SELECT *,
                (6371000 * acos(
                    cos(radians(${latitude})) *
                    cos(radians(lat)) *
                    cos(radians(long) - radians(${longitude})) +
                    sin(radians(${latitude})) *
                    sin(radians(lat))
                )) AS distance
                FROM restaurants
                HAVING distance < ${radiusMeters}
                ORDER BY distance
            `;

            res.status(200).json({
                success: true,
                data: restaurants,
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
}

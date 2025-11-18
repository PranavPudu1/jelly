import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get all restaurants with pagination and filtering
 */
export async function getAll(req: Request, res: Response): Promise<void> {
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

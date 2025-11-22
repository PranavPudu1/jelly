import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get a single restaurant by ID
 */
export async function getById(req: Request, res: Response): Promise<void> {
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
                images: true,
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
        const allImages = restaurant.images.map(image => ({
            id: image.id,
            url: image.url,
        }));

        const heroImage = allImages[0]?.url || '';
        const ambientImage = allImages[1]?.url || '';

        const ambiencePhotos = allImages
            .slice(2, 7)
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
                .slice(0, 5)
                .map(img => img.url),
        };

        res.status(200).json({
            success: true,
            data: transformedRestaurant,
        });
    }
    catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurant',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

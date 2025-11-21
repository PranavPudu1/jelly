import type {
    Restaurant,
    Review,
    FoodItem,
    AmbiencePhoto,
    Info,
} from '../types';

/**
 * Backend Restaurant Interface (from Prisma schema)
 */
interface BackendRestaurant {
    id: string;
    name: string;
    rating: number;
    lat: number;
    long: number;
    address: string;
    mapLink?: string;
    price: string;
    phoneNumber?: string;
    sourceId?: string;
    source?: string;
    dateAdded: string;
    tags: Array<{
        id: string;
        value: string;
        tagType: {
            id: string;
            value: string;
        };
    }>;
    images: Array<{
        id: string;
        imageUrl: string;
        classification: string;
    }>;
    reviews: Array<{
        id: string;
        author?: string;
        rating?: number;
        text?: string;
        images?: Array<{
            imageUrl: string;
        }>;
    }>;
    menu: Array<{
        id: string;
        name?: string;
        images?: Array<{
            imageUrl: string;
        }>;
    }>;
    socialMedia: Array<{
        id: string;
        platform: string;
        handle: string;
    }>;
}

/**
 * Transform backend restaurant data to frontend Restaurant type
 */
export function transformRestaurantData(
    backendData: BackendRestaurant,
): Restaurant {
    // Extract images by classification
    const heroImages = backendData.images.filter(
        (img) => img.classification === 'hero',
    );
    const ambientImages = backendData.images.filter(
        (img) => img.classification === 'ambiance',
    );
    const foodImages = backendData.images.filter(
        (img) => img.classification === 'food',
    );
    const menuImagesList = backendData.images.filter(
        (img) => img.classification === 'menu',
    );

    // Extract cuisine from tags
    const cuisineTag = backendData.tags.find(
        (tag) => tag.tagType.value === 'cuisine',
    );
    const cuisine = cuisineTag?.value || 'Restaurant';

    // Extract social media handles
    const instagramHandle = backendData.socialMedia.find(
        (sm) => sm.platform === 'instagram',
    )?.handle;
    const tiktokHandle = backendData.socialMedia.find(
        (sm) => sm.platform === 'tiktok',
    )?.handle;

    // Transform reviews
    const reviews: Review[] = backendData.reviews
        .filter((review) => review.author && review.text)
        .map((review) => ({
            author: review.author || 'Anonymous',
            quote: review.text || '',
            rating: review.rating || 5,
        }));

    // Get first review for hero section
    const firstReview = reviews[0] || {
        author: 'Customer',
        quote: 'Great restaurant experience!',
        rating: 5,
    };

    // Build info list from tags and data
    const infoList: Info[] = [];

    // Add location info
    infoList.push({
        label: 'Location',
        value: extractLocationFromAddress(backendData.address),
        icon: 'location',
    });

    // Add info from tags
    const barTag = backendData.tags.find(
        (tag) => tag.tagType.value === 'bar_type',
    );
    if (barTag) {
        infoList.push({
            label: 'Bar',
            value: barTag.value,
            icon: 'glass',
        });
    }

    const musicTag = backendData.tags.find(
        (tag) => tag.tagType.value === 'music',
    );
    if (musicTag) {
        infoList.push({
            label: 'Live Music',
            value: musicTag.value,
            icon: 'musical-notes',
        });
    }

    const kidFriendlyTag = backendData.tags.find(
        (tag) => tag.tagType.value === 'kid_friendly',
    );
    if (kidFriendlyTag) {
        infoList.push({
            label: 'Kid-Friendly',
            value: kidFriendlyTag.value,
            icon: 'happy',
        });
    }

    // Transform menu items into food items
    const foodItems: FoodItem[] = backendData.menu
        .slice(0, 6)
        .map((menuItem, index) => {
            const itemImages =
                menuItem.images?.map((img) => img.imageUrl) || [];
            // If menu item has no images, try to use food images
            const images =
                itemImages.length > 0
                    ? itemImages
                    : foodImages
                        .slice(index, index + 1)
                        .map((img) => img.imageUrl);

            // Find reviews that might be related to this item (simplified approach)
            const itemReviews = reviews.slice(index, index + 1);

            return {
                name: menuItem.name || 'Special Dish',
                images:
                    images.length > 0
                        ? images
                        : [
                            'https://via.placeholder.com/400x400?text=Food+Image',
                        ],
                reviews:
                    itemReviews.length > 0
                        ? itemReviews
                        : [
                            {
                                author: 'Customer',
                                quote: 'Delicious!',
                                rating: 5,
                            },
                        ],
            };
        });

    // If no menu items, create food items from food images
    if (foodItems.length === 0 && foodImages.length > 0) {
        foodImages.slice(0, 3).forEach((img, index) => {
            foodItems.push({
                name: `Signature Dish ${index + 1}`,
                images: [img.imageUrl],
                reviews:
                    reviews.slice(index, index + 1).length > 0
                        ? reviews.slice(index, index + 1)
                        : [
                            {
                                author: 'Customer',
                                quote: 'Amazing dish!',
                                rating: 5,
                            },
                        ],
            });
        });
    }

    // Transform ambience photos
    const ambiencePhotos: AmbiencePhoto[] = ambientImages.map((img, index) => ({
        imageUrl: img.imageUrl,
        review: reviews[index],
    }));

    // Ensure we have at least one ambience photo
    if (ambiencePhotos.length === 0 && heroImages.length > 1) {
        ambiencePhotos.push({
            imageUrl: heroImages[1].imageUrl,
        });
    }

    return {
        id: backendData.id,
        name: backendData.name,
        rating: backendData.rating,
        priceLevel: backendData.price,
        cuisine,
        heroImageUrl:
            heroImages[0]?.imageUrl ||
            'https://via.placeholder.com/800x600?text=Restaurant+Image',
        ambientImageUrl:
            ambientImages[0]?.imageUrl ||
            heroImages[0]?.imageUrl ||
            'https://via.placeholder.com/800x600?text=Ambiance',
        reviewQuote: firstReview.quote,
        reviewAuthor: firstReview.author,
        infoList,
        instagramHandle,
        tiktokHandle,
        foodItems,
        ambiencePhotos,
        reviews,
        menuImages: menuImagesList.map((img) => img.imageUrl),
        popularDishPhotos: foodImages.slice(0, 5).map((img) => img.imageUrl),
    };
}

/**
 * Extract location name from address (simplified)
 */
function extractLocationFromAddress(address: string): string {
    // Try to extract neighborhood or area from address
    // This is a simplified approach - you may want to enhance this
    const parts = address.split(',');
    if (parts.length >= 2) {
        return parts[1].trim();
    }
    return 'Local Area';
}

/**
 * Transform an array of backend restaurants
 */
export function transformRestaurantsArray(
    backendRestaurants: BackendRestaurant[],
): Restaurant[] {
    return backendRestaurants.map(transformRestaurantData);
}

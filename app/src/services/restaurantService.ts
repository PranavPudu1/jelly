import { supabase } from '../lib/supabase';
import { Restaurant } from '../types';

// Database restaurant type (from Supabase)
interface DbRestaurant {
    id: string;
    source_id: string;
    source: 'YELP' | 'GOOGLE';
    name: string;
    image_url: string;
    is_closed: boolean;
    url: string;
    review_count: number;
    rating: number;
    lat: number;
    long: number;
    transactions: string[];
    price: string;
    address: string;
    city: string;
    country: string;
    state: string;
    zip_code: number;
    phone: string;
    instagram: string | null;
    tiktok: string | null;
    cuisine_type: string | null;
    date_added: string;
}

interface DbRestaurantImage {
    id: string;
    image_url: string;
    image_type: 'COVER' | 'FOOD' | 'AMBIANCE' | 'MENU';
    is_primary: boolean;
    display_order: number;
}

interface DbReview {
    id: string;
    review_text: string;
    author_name: string;
    rating: number;
    created_at: string;
}

/**
 * Transform database restaurant to app Restaurant type
 */
function transformRestaurant(
    dbRestaurant: DbRestaurant,
    images: DbRestaurantImage[] = [],
    reviews: DbReview[] = []
): Restaurant {
    // Format full address
    const fullAddress = [
        dbRestaurant.address,
        dbRestaurant.city,
        dbRestaurant.state,
        dbRestaurant.zip_code
    ].filter(Boolean).join(', ');

    // Get hero image (primary image or first COVER type or fallback)
    const heroImage = images.find(img => img.is_primary) ||
                      images.find(img => img.image_type === 'COVER') ||
                      images[0];
    const heroImageUrl = heroImage?.image_url || dbRestaurant.image_url;

    // Get food images
    const foodImages = images
        .filter(img => img.image_type === 'FOOD')
        .sort((a, b) => a.display_order - b.display_order)
        .map(img => img.image_url);

    // Get ambiance images
    const ambianceImages = images
        .filter(img => img.image_type === 'AMBIANCE')
        .sort((a, b) => a.display_order - b.display_order)
        .map(img => img.image_url);

    // Use first ambiance image for ambiance card, or fallback to hero
    const ambientImageUrl = ambianceImages[0] || heroImageUrl;

    // Create food items from food images
    const foodItems = foodImages.slice(0, 3).map((imageUrl, idx) => {
        // Find a review that might be about food
        const relevantReview = reviews[idx] || reviews[0];

        return {
            name: idx === 0 ? 'Signature Dish' : idx === 1 ? 'Chef\'s Special' : 'House Favorite',
            images: [imageUrl],
            reviews: relevantReview ? [{
                author: relevantReview.author_name || 'Google User',
                quote: relevantReview.review_text || 'Delicious!',
                rating: relevantReview.rating || dbRestaurant.rating,
            }] : []
        };
    });

    // If no food images, create placeholder with hero image
    if (foodItems.length === 0) {
        foodItems.push({
            name: 'Popular Dish',
            images: [heroImageUrl],
            reviews: reviews[0] ? [{
                author: reviews[0].author_name || 'Google User',
                quote: reviews[0].review_text || 'Great food!',
                rating: reviews[0].rating || dbRestaurant.rating,
            }] : []
        });
    }

    // Create ambiance photos array
    const ambiencePhotos = ambianceImages.map(url => ({ imageUrl: url }));

    // If no ambiance images, use hero image
    if (ambiencePhotos.length === 0) {
        ambiencePhotos.push({ imageUrl: heroImageUrl });
    }

    // Transform reviews for app
    const transformedReviews = reviews.slice(0, 5).map(review => ({
        author: review.author_name || 'Google User',
        quote: review.review_text || 'Great place!',
        rating: review.rating || dbRestaurant.rating
    }));

    // Use first review for the quote card
    const firstReview = reviews[0];

    return {
        id: dbRestaurant.id,
        name: dbRestaurant.name,
        rating: dbRestaurant.rating,
        priceLevel: dbRestaurant.price,
        cuisine: dbRestaurant.cuisine_type || 'American',
        heroImageUrl,
        ambientImageUrl,
        reviewQuote: firstReview?.review_text || 'The food here is absolutely incredible! Highly recommend.',
        reviewAuthor: firstReview?.author_name || 'Google User',
        infoList: [
            {
                label: 'Location',
                value: fullAddress,
                icon: 'location'
            },
            {
                label: 'Phone',
                value: dbRestaurant.phone || 'No phone',
                icon: 'call'
            },
            {
                label: 'Reviews',
                value: `${dbRestaurant.review_count.toLocaleString()} reviews`,
                icon: 'star'
            },
            {
                label: 'Dining',
                value: dbRestaurant.transactions.length > 0
                    ? dbRestaurant.transactions.join(', ')
                    : 'Dine-in',
                icon: 'restaurant'
            },
        ],
        instagramHandle: dbRestaurant.instagram || undefined,
        tiktokHandle: dbRestaurant.tiktok || undefined,
        foodItems,
        ambiencePhotos,
        reviews: transformedReviews,
        menuImages: [],
        popularDishPhotos: foodImages.length > 0 ? foodImages : [heroImageUrl],
    };
}

/**
 * Fetch restaurants from Supabase with images and reviews
 */
export async function fetchRestaurants(options?: {
    limit?: number;
    offset?: number;
    minRating?: number;
    priceLevel?: string[];
    city?: string;
}): Promise<Restaurant[]> {
    try {
        let query = supabase
            .from('restaurants')
            .select('*')
            .eq('is_closed', false)
            .order('rating', { ascending: false });

        // Apply filters
        if (options?.minRating) {
            query = query.gte('rating', options.minRating);
        }

        if (options?.priceLevel && options.priceLevel.length > 0) {
            query = query.in('price', options.priceLevel);
        }

        if (options?.city) {
            query = query.eq('city', options.city);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(
                options.offset,
                options.offset + (options.limit || 10) - 1
            );
        }

        const { data: restaurants, error } = await query;

        if (error) {
            console.error('Error fetching restaurants:', error);
            throw error;
        }

        if (!restaurants || restaurants.length === 0) {
            return [];
        }

        // Fetch images and reviews for all restaurants in parallel
        const restaurantIds = restaurants.map(r => r.id);

        const [imagesResult, reviewsResult] = await Promise.all([
            supabase
                .from('restaurant_image')
                .select('*')
                .in('restaurant_id', restaurantIds)
                .order('display_order', { ascending: true }),
            supabase
                .from('reviews')
                .select('id, review_text, author_name, rating, created_at, restaurant_id')
                .in('restaurant_id', restaurantIds)
                .order('created_at', { ascending: false })
                .limit(5 * restaurantIds.length) // 5 reviews per restaurant max
        ]);

        // Group images and reviews by restaurant ID
        const imagesByRestaurant = new Map<string, DbRestaurantImage[]>();
        const reviewsByRestaurant = new Map<string, DbReview[]>();

        if (imagesResult.data) {
            imagesResult.data.forEach((img: any) => {
                const list = imagesByRestaurant.get(img.restaurant_id) || [];
                list.push(img);
                imagesByRestaurant.set(img.restaurant_id, list);
            });
        }

        if (reviewsResult.data) {
            reviewsResult.data.forEach((review: any) => {
                const list = reviewsByRestaurant.get(review.restaurant_id) || [];
                list.push(review);
                reviewsByRestaurant.set(review.restaurant_id, list);
            });
        }

        // Transform all restaurants
        return restaurants.map(restaurant =>
            transformRestaurant(
                restaurant,
                imagesByRestaurant.get(restaurant.id) || [],
                reviewsByRestaurant.get(restaurant.id) || []
            )
        );
    } catch (error) {
        console.error('Error in fetchRestaurants:', error);
        throw error;
    }
}

/**
 * Fetch a single restaurant by ID with images and reviews
 */
export async function fetchRestaurantById(id: string): Promise<Restaurant | null> {
    try {
        const [restaurantResult, imagesResult, reviewsResult] = await Promise.all([
            supabase.from('restaurants').select('*').eq('id', id).single(),
            supabase
                .from('restaurant_image')
                .select('*')
                .eq('restaurant_id', id)
                .order('display_order', { ascending: true }),
            supabase
                .from('reviews')
                .select('id, review_text, author_name, rating, created_at')
                .eq('restaurant_id', id)
                .order('created_at', { ascending: false })
                .limit(5)
        ]);

        if (restaurantResult.error) {
            console.error('Error fetching restaurant:', restaurantResult.error);
            throw restaurantResult.error;
        }

        if (!restaurantResult.data) {
            return null;
        }

        return transformRestaurant(
            restaurantResult.data,
            imagesResult.data || [],
            reviewsResult.data || []
        );
    } catch (error) {
        console.error('Error in fetchRestaurantById:', error);
        throw error;
    }
}

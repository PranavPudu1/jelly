/**
 * Database Seeding Script
 * Seeds the database with sample restaurants for testing
 */

import { getSupabase } from '../config/supabase.config';
import { Source, TagType } from '../types';
import type { TablesInsert } from '../types/supabase.types';

const supabase = getSupabase();

async function seedDatabase() {
    console.log('Starting database seeding...');

    try {
        // Sample restaurants
        const sampleRestaurants: TablesInsert<'restaurants'>[] = [
            {
                source: Source.YELP,
                source_id: 'sample-1',
                name: 'The Golden Spoon',
                image_url: 'https://example.com/images/golden-spoon.jpg',
                is_closed: false,
                url: 'https://yelp.com/golden-spoon',
                review_count: 150,
                rating: 4.5,
                lat: 37.7749,
                long: -122.4194,
                transactions: ['pickup', 'delivery'],
                price: '$$',
                address: '123 Market St',
                city: 'San Francisco',
                country: 'USA',
                state: 'CA',
                zip_code: 94102,
                phone: '+1-415-555-0123',
                instagram: '@goldenspoon',
            },
            {
                source: Source.GOOGLE,
                source_id: 'sample-2',
                name: 'Pasta Paradise',
                image_url: 'https://example.com/images/pasta-paradise.jpg',
                is_closed: false,
                url: 'https://google.com/pasta-paradise',
                review_count: 220,
                rating: 4.7,
                lat: 37.7849,
                long: -122.4094,
                transactions: ['pickup', 'delivery', 'dine-in'],
                price: '$$$',
                address: '456 Mission St',
                city: 'San Francisco',
                country: 'USA',
                state: 'CA',
                zip_code: 94103,
                phone: '+1-415-555-0456',
                tiktok: '@pastaparadise',
            },
            {
                source: Source.YELP,
                source_id: 'sample-3',
                name: 'Sushi Sensation',
                image_url: 'https://example.com/images/sushi-sensation.jpg',
                is_closed: false,
                url: 'https://yelp.com/sushi-sensation',
                review_count: 300,
                rating: 4.8,
                lat: 37.7949,
                long: -122.3994,
                transactions: ['pickup', 'delivery'],
                price: '$$$$',
                address: '789 Bush St',
                city: 'San Francisco',
                country: 'USA',
                state: 'CA',
                zip_code: 94108,
                phone: '+1-415-555-0789',
                instagram: '@sushisensation',
                tiktok: '@sushisensation',
            },
        ];

        console.log('Inserting restaurants...');
        const { data: restaurants, error: restaurantsError } = await supabase
            .from('restaurants')
            .insert(sampleRestaurants as any)
            .select() as any;

        if (restaurantsError) {
            console.error('Error inserting restaurants:', restaurantsError);
            throw restaurantsError;
        }

        console.log(`✓ Inserted ${restaurants?.length || 0} restaurants`);

        // Sample tags
        const sampleTags: TablesInsert<'tags'>[] = [
            { source: Source.YELP, value: 'Italian', type: TagType.FOOD },
            { source: Source.YELP, value: 'Romantic', type: TagType.AMBIANCE },
            { source: Source.GOOGLE, value: 'Pasta', type: TagType.FOOD },
            { source: Source.GOOGLE, value: 'Cozy', type: TagType.AMBIANCE },
            { source: Source.YELP, value: 'Japanese', type: TagType.FOOD },
            { source: Source.YELP, value: 'Sushi', type: TagType.FOOD },
            { source: Source.YELP, value: 'Modern', type: TagType.AMBIANCE },
        ];

        console.log('Inserting tags...');
        const { data: tags, error: tagsError } = await supabase
            .from('tags')
            .insert(sampleTags as any)
            .select() as any;

        if (tagsError) {
            console.error('Error inserting tags:', tagsError);
            throw tagsError;
        }

        console.log(`✓ Inserted ${tags?.length || 0} tags`);

        // Link tags to restaurants
        if (restaurants && tags && restaurants.length > 0 && tags.length > 0) {
            const restaurantTags: TablesInsert<'restaurant_tags'>[] = [
                { restaurant_id: restaurants[0].id, tag_id: tags[0].id }, // Golden Spoon - Italian
                { restaurant_id: restaurants[0].id, tag_id: tags[1].id }, // Golden Spoon - Romantic
                { restaurant_id: restaurants[1].id, tag_id: tags[2].id }, // Pasta Paradise - Pasta
                { restaurant_id: restaurants[1].id, tag_id: tags[3].id }, // Pasta Paradise - Cozy
                { restaurant_id: restaurants[2].id, tag_id: tags[4].id }, // Sushi Sensation - Japanese
                { restaurant_id: restaurants[2].id, tag_id: tags[5].id }, // Sushi Sensation - Sushi
                { restaurant_id: restaurants[2].id, tag_id: tags[6].id }, // Sushi Sensation - Modern
            ];

            console.log('Linking tags to restaurants...');
            const { error: linkError } = await supabase
                .from('restaurant_tags')
                .insert(restaurantTags as any);

            if (linkError) {
                console.error('Error linking tags:', linkError);
                throw linkError;
            }

            console.log(`✓ Linked tags to restaurants`);
        }

        // Sample restaurant images (additional to the main image_url on restaurant)
        if (restaurants && restaurants.length > 0) {
            const sampleImages: TablesInsert<'restaurant_images'>[] = [
                {
                    source: Source.YELP,
                    source_id: 'img-1',
                    url: 'https://example.com/images/golden-spoon-interior.jpg',
                },
                {
                    source: Source.YELP,
                    source_id: 'img-2',
                    url: 'https://example.com/images/golden-spoon-dish.jpg',
                },
                {
                    source: Source.GOOGLE,
                    source_id: 'img-3',
                    url: 'https://example.com/images/pasta-paradise-dish1.jpg',
                },
                {
                    source: Source.GOOGLE,
                    source_id: 'img-4',
                    url: 'https://example.com/images/pasta-paradise-dish2.jpg',
                },
                {
                    source: Source.YELP,
                    source_id: 'img-5',
                    url: 'https://example.com/images/sushi-platter.jpg',
                },
                {
                    source: Source.YELP,
                    source_id: 'img-6',
                    url: 'https://example.com/images/sushi-bar.jpg',
                },
            ];

            console.log('Inserting restaurant images...');
            const { data: images, error: imagesError } = await supabase
                .from('restaurant_images')
                .insert(sampleImages as any)
                .select() as any;

            if (imagesError) {
                console.error('Error inserting images:', imagesError);
                throw imagesError;
            }

            console.log(`✓ Inserted ${images?.length || 0} restaurant images`);

            // Link images to restaurants
            if (images && images.length > 0) {
                const restaurantImageLinks: TablesInsert<'restaurant_image_links'>[] = [
                    { restaurant_id: restaurants[0].id, image_id: images[0].id },
                    { restaurant_id: restaurants[0].id, image_id: images[1].id },
                    { restaurant_id: restaurants[1].id, image_id: images[2].id },
                    { restaurant_id: restaurants[1].id, image_id: images[3].id },
                    { restaurant_id: restaurants[2].id, image_id: images[4].id },
                    { restaurant_id: restaurants[2].id, image_id: images[5].id },
                ];

                console.log('Linking images to restaurants...');
                const { error: linkError } = await supabase
                    .from('restaurant_image_links')
                    .insert(restaurantImageLinks as any);

                if (linkError) {
                    console.error('Error linking images:', linkError);
                    throw linkError;
                }

                console.log(`✓ Linked images to restaurants`);

                // Link tags to images
                if (tags && tags.length > 0) {
                    const imageTagLinks: TablesInsert<'restaurant_image_tags'>[] = [
                        { image_id: images[1].id, tag_id: tags[0].id }, // Golden Spoon dish - Italian
                        { image_id: images[2].id, tag_id: tags[2].id }, // Pasta dish - Pasta
                        { image_id: images[3].id, tag_id: tags[2].id }, // Pasta dish 2 - Pasta
                        { image_id: images[4].id, tag_id: tags[5].id }, // Sushi platter - Sushi
                    ];

                    console.log('Linking tags to images...');
                    const { error: tagLinkError } = await supabase
                        .from('restaurant_image_tags')
                        .insert(imageTagLinks as any);

                    if (tagLinkError) {
                        console.error('Error linking tags to images:', tagLinkError);
                        throw tagLinkError;
                    }

                    console.log(`✓ Linked tags to images`);
                }
            }

            // Sample menu items
            const sampleItems: TablesInsert<'restaurant_items'>[] = [
                {
                    source: Source.YELP,
                    source_id: 'item-1',
                    name: 'Spaghetti Carbonara',
                    description: 'Classic Italian pasta with eggs, cheese, and pancetta',
                },
                {
                    source: Source.YELP,
                    source_id: 'item-2',
                    name: 'Tiramisu',
                    description: 'Traditional Italian coffee-flavored dessert',
                },
                {
                    source: Source.GOOGLE,
                    source_id: 'item-3',
                    name: 'Fettuccine Alfredo',
                    description: 'Creamy pasta with parmesan cheese sauce',
                },
                {
                    source: Source.GOOGLE,
                    source_id: 'item-4',
                    name: 'Penne Arrabbiata',
                    description: 'Spicy tomato pasta with garlic and red chili',
                },
                {
                    source: Source.YELP,
                    source_id: 'item-5',
                    name: 'Omakase Selection',
                    description: "Chef's choice of 12 pieces of premium sushi",
                },
                {
                    source: Source.YELP,
                    source_id: 'item-6',
                    name: 'Salmon Sashimi',
                    description: 'Fresh Atlantic salmon, thinly sliced',
                },
            ];

            console.log('Inserting restaurant items...');
            const { data: items, error: itemsError } = await supabase
                .from('restaurant_items')
                .insert(sampleItems as any)
                .select() as any;

            if (itemsError) {
                console.error('Error inserting items:', itemsError);
                throw itemsError;
            }

            console.log(`✓ Inserted ${items?.length || 0} restaurant items`);

            // Link items to restaurants
            if (items && items.length > 0) {
                const restaurantItemLinks: TablesInsert<'restaurant_item_links'>[] = [
                    { restaurant_id: restaurants[0].id, item_id: items[0].id, is_popular: true },
                    { restaurant_id: restaurants[0].id, item_id: items[1].id, is_popular: false },
                    { restaurant_id: restaurants[1].id, item_id: items[2].id, is_popular: true },
                    { restaurant_id: restaurants[1].id, item_id: items[3].id, is_popular: true },
                    { restaurant_id: restaurants[2].id, item_id: items[4].id, is_popular: true },
                    { restaurant_id: restaurants[2].id, item_id: items[5].id, is_popular: false },
                ];

                console.log('Linking items to restaurants...');
                const { error: linkError } = await supabase
                    .from('restaurant_item_links')
                    .insert(restaurantItemLinks as any);

                if (linkError) {
                    console.error('Error linking items:', linkError);
                    throw linkError;
                }

                console.log(`✓ Linked items to restaurants`);

                // Link tags to items
                if (tags && tags.length > 0) {
                    const itemTagLinks: TablesInsert<'restaurant_item_tags'>[] = [
                        { item_id: items[0].id, tag_id: tags[0].id }, // Carbonara - Italian
                        { item_id: items[0].id, tag_id: tags[2].id }, // Carbonara - Pasta
                        { item_id: items[1].id, tag_id: tags[0].id }, // Tiramisu - Italian
                        { item_id: items[2].id, tag_id: tags[2].id }, // Fettuccine - Pasta
                        { item_id: items[3].id, tag_id: tags[2].id }, // Penne - Pasta
                        { item_id: items[4].id, tag_id: tags[5].id }, // Omakase - Sushi
                        { item_id: items[5].id, tag_id: tags[5].id }, // Salmon - Sushi
                    ];

                    console.log('Linking tags to items...');
                    const { error: tagLinkError } = await supabase
                        .from('restaurant_item_tags')
                        .insert(itemTagLinks as any);

                    if (tagLinkError) {
                        console.error('Error linking tags to items:', tagLinkError);
                        throw tagLinkError;
                    }

                    console.log(`✓ Linked tags to items`);
                }

                // Link images to items
                if (images && images.length > 0) {
                    const itemImageLinks: TablesInsert<'restaurant_item_images'>[] = [
                        { item_id: items[0].id, image_id: images[1].id }, // Carbonara image
                        { item_id: items[2].id, image_id: images[2].id }, // Fettuccine image
                        { item_id: items[3].id, image_id: images[3].id }, // Penne image
                        { item_id: items[4].id, image_id: images[4].id }, // Omakase image
                    ];

                    console.log('Linking images to items...');
                    const { error: linkError } = await supabase
                        .from('restaurant_item_images')
                        .insert(itemImageLinks as any);

                    if (linkError) {
                        console.error('Error linking images to items:', linkError);
                        throw linkError;
                    }

                    console.log(`✓ Linked images to items`);
                }
            }
        }

        // Sample reviews
        if (restaurants && restaurants.length > 0) {
            const sampleReviews: TablesInsert<'reviews'>[] = [
                {
                    source: Source.YELP,
                    source_id: 'review-1',
                    source_url: 'https://yelp.com/reviews/1',
                    review: 'Amazing food and great atmosphere! The carbonara was perfectly cooked.',
                    rating: 5,
                    reviewed_by: 'John Doe',
                },
                {
                    source: Source.YELP,
                    source_id: 'review-2',
                    source_url: 'https://yelp.com/reviews/2',
                    review: 'Lovely romantic spot. The tiramisu was divine!',
                    rating: 4.5,
                    reviewed_by: 'Sarah Johnson',
                },
                {
                    source: Source.GOOGLE,
                    source_id: 'review-3',
                    source_url: 'https://google.com/reviews/3',
                    review: 'Best pasta in town! The alfredo sauce is incredibly creamy.',
                    rating: 4.5,
                    reviewed_by: 'Jane Smith',
                },
                {
                    source: Source.GOOGLE,
                    source_id: 'review-4',
                    source_url: 'https://google.com/reviews/4',
                    review: 'Cozy place with excellent service. Will definitely come back!',
                    rating: 5,
                    reviewed_by: 'Mike Chen',
                },
                {
                    source: Source.YELP,
                    source_id: 'review-5',
                    source_url: 'https://yelp.com/reviews/5',
                    review: 'The freshest sushi in San Francisco. Omakase was outstanding!',
                    rating: 5,
                    reviewed_by: 'Emily Davis',
                },
                {
                    source: Source.YELP,
                    source_id: 'review-6',
                    source_url: 'https://yelp.com/reviews/6',
                    review: 'Modern ambiance and incredible quality. A bit pricey but worth it.',
                    rating: 4.5,
                    reviewed_by: 'David Kim',
                },
            ];

            console.log('Inserting reviews...');
            const { data: reviews, error: reviewsError } = await supabase
                .from('reviews')
                .insert(sampleReviews as any)
                .select() as any;

            if (reviewsError) {
                console.error('Error inserting reviews:', reviewsError);
                throw reviewsError;
            }

            console.log(`✓ Inserted ${reviews?.length || 0} reviews`);

            // Link reviews to restaurants
            if (reviews && reviews.length > 0) {
                const restaurantReviews: TablesInsert<'restaurant_reviews'>[] = [
                    { restaurant_id: restaurants[0].id, review_id: reviews[0].id },
                    { restaurant_id: restaurants[0].id, review_id: reviews[1].id },
                    { restaurant_id: restaurants[1].id, review_id: reviews[2].id },
                    { restaurant_id: restaurants[1].id, review_id: reviews[3].id },
                    { restaurant_id: restaurants[2].id, review_id: reviews[4].id },
                    { restaurant_id: restaurants[2].id, review_id: reviews[5].id },
                ];

                console.log('Linking reviews to restaurants...');
                const { error: linkError } = await supabase
                    .from('restaurant_reviews')
                    .insert(restaurantReviews as any);

                if (linkError) {
                    console.error('Error linking reviews:', linkError);
                    throw linkError;
                }

                console.log(`✓ Linked reviews to restaurants`);
            }
        }

        console.log('\n✅ Database seeding completed successfully!');
    } catch (error) {
        console.error('\n❌ Database seeding failed:', error);
        process.exit(1);
    }
}

// Run the seeding
seedDatabase();

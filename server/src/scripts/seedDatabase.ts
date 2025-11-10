/**
 * Database Seeding Script
 * Populates Supabase with sample restaurant data using the comprehensive schema
 */

import { initializeSupabase, TABLES } from '../config/supabase.config';
import { PriceTier } from '../types';

interface SeedRestaurant {
    name: string;
    formatted_address: string;
    latitude: number;
    longitude: number;
    price_tier: PriceTier;
    phone?: string;
    website?: string;
    cuisines: string[];
    tags: string[];
}

const sampleRestaurants: SeedRestaurant[] = [
    {
        name: 'Sushi Garden',
        formatted_address: '123 E 10th St, New York, NY 10003',
        latitude: 40.7295,
        longitude: -73.9876,
        price_tier: PriceTier.EXPENSIVE,
        phone: '+1-212-555-0101',
        website: 'https://sushigarden.example.com',
        cuisines: ['Japanese', 'Sushi'],
        tags: ['Intimate', 'Authentic', 'Date Night', 'Fresh Fish'],
    },
    {
        name: 'Taco Theory',
        formatted_address: '456 Mission St, San Francisco, CA 94110',
        latitude: 37.7599,
        longitude: -122.4148,
        price_tier: PriceTier.MODERATE,
        phone: '+1-415-555-0102',
        website: 'https://tacotheory.example.com',
        cuisines: ['Mexican', 'Fusion'],
        tags: ['Trendy', 'Lively', 'Creative', 'Cocktails'],
    },
    {
        name: 'Pasta Lab',
        formatted_address: '789 W Randolph St, Chicago, IL 60607',
        latitude: 41.8847,
        longitude: -87.6476,
        price_tier: PriceTier.EXPENSIVE,
        phone: '+1-312-555-0103',
        website: 'https://pastalab.example.com',
        cuisines: ['Italian', 'Contemporary'],
        tags: ['Romantic', 'Elegant', 'Cozy', 'Handmade Pasta'],
    },
    {
        name: 'Burger Haus',
        formatted_address: '321 Bedford Ave, Brooklyn, NY 11211',
        latitude: 40.7181,
        longitude: -73.9571,
        price_tier: PriceTier.MODERATE,
        phone: '+1-718-555-0104',
        cuisines: ['American', 'Burgers'],
        tags: ['Casual', 'Hip', 'Fun', 'Craft Beer'],
    },
    {
        name: 'Pho King',
        formatted_address: '567 Bolsa Ave, Westminster, CA 92683',
        latitude: 33.7455,
        longitude: -117.9943,
        price_tier: PriceTier.CHEAP,
        phone: '+1-714-555-0105',
        cuisines: ['Vietnamese'],
        tags: ['Authentic', 'Casual', 'Family-Friendly', 'Quick Service'],
    },
];

// Sample reviews to add
const sampleReviews = [
    {
        restaurantName: 'Sushi Garden',
        reviews: [
            {
                rating: 5,
                body: 'Best sushi in NYC. The omakase was incredible! Fresh ingredients and expert preparation.',
                source: 'MANUAL' as const,
            },
            {
                rating: 4.5,
                body: 'Fresh fish, authentic flavors. Will be back for sure!',
                source: 'MANUAL' as const,
            },
        ],
    },
    {
        restaurantName: 'Taco Theory',
        reviews: [
            {
                rating: 4.5,
                body: 'Innovative takes on classic tacos. Love the Korean BBQ fusion!',
                source: 'MANUAL' as const,
            },
            {
                rating: 5,
                body: 'Great vibe, amazing cocktails, creative menu. A must-visit!',
                source: 'MANUAL' as const,
            },
        ],
    },
    {
        restaurantName: 'Pasta Lab',
        reviews: [
            {
                rating: 5,
                body: 'Pasta perfection! You can taste the quality in every bite.',
                source: 'MANUAL' as const,
            },
            {
                rating: 5,
                body: 'Best Italian outside of Italy. The truffle carbonara is life-changing.',
                source: 'MANUAL' as const,
            },
        ],
    },
    {
        restaurantName: 'Burger Haus',
        reviews: [
            {
                rating: 4,
                body: 'These are not your average burgers. Premium quality ingredients!',
                source: 'MANUAL' as const,
            },
            {
                rating: 4.5,
                body: 'Great beer selection and the truffle fries are absolutely addictive.',
                source: 'MANUAL' as const,
            },
        ],
    },
    {
        restaurantName: 'Pho King',
        reviews: [
            {
                rating: 5,
                body: 'Most authentic pho outside of Vietnam. The broth is incredible!',
                source: 'MANUAL' as const,
            },
            {
                rating: 5,
                body: 'Family-run gem. Always fresh, always delicious. Cash only but worth it!',
                source: 'MANUAL' as const,
            },
        ],
    },
];

/**
 * Seed the database with sample restaurants
 */
const seedDatabase = async (): Promise<void> => {
    try {
        console.log('🌱 Starting database seeding...');

        const supabase = initializeSupabase();

        // First, create cuisines
        console.log('\n📋 Creating cuisines...');
        const cuisineNames = Array.from(
            new Set(sampleRestaurants.flatMap((r) => r.cuisines))
        );
        const cuisineMap = new Map<string, string>();

        for (const cuisineName of cuisineNames) {
            const { data, error } = await supabase
                .from(TABLES.CUISINES)
                .insert({ name: cuisineName })
                .select()
                .single();

            if (error) {
                console.error(`Error creating cuisine ${cuisineName}:`, error.message);
            } else {
                cuisineMap.set(cuisineName, data.id);
                console.log(`✅ Created cuisine: ${cuisineName}`);
            }
        }

        // Create tags
        console.log('\n🏷️  Creating tags...');
        const tagNames = Array.from(new Set(sampleRestaurants.flatMap((r) => r.tags)));
        const tagMap = new Map<string, string>();

        for (const tagName of tagNames) {
            const { data, error } = await supabase
                .from(TABLES.TAGS)
                .insert({ name: tagName, type: 'ambiance' })
                .select()
                .single();

            if (error) {
                console.error(`Error creating tag ${tagName}:`, error.message);
            } else {
                tagMap.set(tagName, data.id);
                console.log(`✅ Created tag: ${tagName}`);
            }
        }

        // Create restaurants
        console.log('\n🍽️  Creating restaurants...');
        const restaurantMap = new Map<string, string>();

        for (const restaurant of sampleRestaurants) {
            const { cuisines, tags, latitude, longitude, ...restaurantData } = restaurant;

            // Insert restaurant with PostGIS point
            const { data, error } = await supabase
                .from(TABLES.RESTAURANTS)
                .insert({
                    ...restaurantData,
                    geo: `POINT(${longitude} ${latitude})`,
                })
                .select()
                .single();

            if (error) {
                console.error(`Error creating restaurant ${restaurant.name}:`, error.message);
                continue;
            }

            restaurantMap.set(restaurant.name, data.id);
            console.log(`✅ Created restaurant: ${restaurant.name} (ID: ${data.id})`);

            // Add cuisine associations
            for (const cuisineName of cuisines) {
                const cuisineId = cuisineMap.get(cuisineName);
                if (cuisineId) {
                    await supabase.from(TABLES.RESTAURANT_CUISINES).insert({
                        restaurant_id: data.id,
                        cuisine_id: cuisineId,
                    });
                }
            }

            // Add tag associations
            for (const tagName of tags) {
                const tagId = tagMap.get(tagName);
                if (tagId) {
                    await supabase.from(TABLES.RESTAURANT_TAGS).insert({
                        restaurant_id: data.id,
                        tag_id: tagId,
                    });
                }
            }
        }

        // Create reviews
        console.log('\n⭐ Creating reviews...');
        for (const restaurantReviews of sampleReviews) {
            const restaurantId = restaurantMap.get(restaurantReviews.restaurantName);
            if (!restaurantId) continue;

            for (const review of restaurantReviews.reviews) {
                const { error } = await supabase.from(TABLES.REVIEWS).insert({
                    restaurant_id: restaurantId,
                    source: review.source,
                    rating: review.rating,
                    body: review.body,
                    is_anonymous: true,
                    moderation_status: 'APPROVED',
                });

                if (error) {
                    console.error(
                        `Error creating review for ${restaurantReviews.restaurantName}:`,
                        error.message
                    );
                } else {
                    console.log(
                        `✅ Created review for ${restaurantReviews.restaurantName} (${review.rating}★)`
                    );
                }
            }
        }

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - ${cuisineMap.size} cuisines created`);
        console.log(`   - ${tagMap.size} tags created`);
        console.log(`   - ${restaurantMap.size} restaurants created`);
        console.log(
            `   - ${sampleReviews.reduce((sum, r) => sum + r.reviews.length, 0)} reviews created`
        );

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();

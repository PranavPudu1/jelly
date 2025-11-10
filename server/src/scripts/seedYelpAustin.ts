/**
 * Yelp API Seeding Script
 * Fetches 150 restaurants in Austin, TX from Yelp API and populates the database
 */

import { getSupabase } from '../config/supabase.config';
import { Source, TagType } from '../types';
import type { TablesInsert } from '../types/supabase.types';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = getSupabase();

// Yelp API configuration
const YELP_API_KEY = process.env.YELP_API_KEY;
const YELP_API_URL = 'https://api.yelp.com/v3/businesses/search';
const LOCATION = 'Austin, TX';
const LIMIT_PER_REQUEST = 50; // Yelp API max per request
const TOTAL_RESTAURANTS = 150;

interface YelpCategory {
    alias: string;
    title: string;
}

interface YelpCoordinates {
    latitude: number;
    longitude: number;
}

interface YelpLocation {
    address1: string;
    address2?: string;
    address3?: string;
    city: string;
    zip_code: string;
    country: string;
    state: string;
    display_address: string[];
}

interface YelpBusiness {
    id: string;
    alias: string;
    name: string;
    image_url: string;
    is_closed: boolean;
    url: string;
    review_count: number;
    categories: YelpCategory[];
    rating: number;
    coordinates: YelpCoordinates;
    transactions: string[];
    price?: string;
    location: YelpLocation;
    phone: string;
    display_phone: string;
    distance: number;
}

interface YelpSearchResponse {
    businesses: YelpBusiness[];
    total: number;
    region: {
        center: {
            longitude: number;
            latitude: number;
        };
    };
}

/**
 * Fetch restaurants from Yelp API
 */
async function fetchYelpRestaurants(offset: number): Promise<YelpBusiness[]> {
    if (!YELP_API_KEY) {
        throw new Error('Missing YELP_API_KEY environment variable');
    }

    const url = new URL(YELP_API_URL);
    url.searchParams.append('location', LOCATION);
    url.searchParams.append('limit', LIMIT_PER_REQUEST.toString());
    url.searchParams.append('offset', offset.toString());
    url.searchParams.append('sort_by', 'best_match');
    url.searchParams.append('term', 'restaurants');

    console.log(`Fetching restaurants from Yelp API (offset: ${offset})...`);

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${YELP_API_KEY}`,
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Yelp API request failed: ${response.status} ${response.statusText}`);
    }

    const data: YelpSearchResponse = await response.json();
    console.log(`✓ Fetched ${data.businesses.length} restaurants from Yelp`);

    return data.businesses;
}

/**
 * Transform Yelp business data to database format
 */
function transformYelpToRestaurant(business: YelpBusiness): TablesInsert<'restaurants'> {
    return {
        source: Source.YELP,
        source_id: business.id,
        name: business.name,
        image_url: business.image_url || 'https://via.placeholder.com/400x300?text=No+Image',
        is_closed: business.is_closed,
        url: business.url,
        review_count: business.review_count,
        rating: business.rating,
        lat: business.coordinates.latitude,
        long: business.coordinates.longitude,
        transactions: business.transactions,
        price: business.price,
        address: business.location.address1 || '',
        city: business.location.city,
        country: business.location.country,
        state: business.location.state,
        zip_code: parseInt(business.location.zip_code) || 0,
        phone: business.phone || business.display_phone || '',
    };
}

/**
 * Extract unique tags from Yelp categories
 */
function extractTags(businesses: YelpBusiness[]): { value: string; sourceAlias: string }[] {
    const tagMap = new Map<string, string>();

    businesses.forEach(business => {
        business.categories.forEach(category => {
            if (!tagMap.has(category.title)) {
                tagMap.set(category.title, category.alias);
            }
        });
    });

    return Array.from(tagMap.entries()).map(([title, alias]) => ({
        value: title,
        sourceAlias: alias,
    }));
}

/**
 * Main seeding function
 */
async function seedYelpAustin() {
    console.log('Starting Yelp Austin restaurant seeding...\n');

    try {
        // Fetch all restaurants
        const allBusinesses: YelpBusiness[] = [];
        let offset = 0;

        while (allBusinesses.length < TOTAL_RESTAURANTS) {
            const businesses = await fetchYelpRestaurants(offset);

            if (businesses.length === 0) {
                console.log('No more restaurants available from Yelp API');
                break;
            }

            allBusinesses.push(...businesses);
            offset += LIMIT_PER_REQUEST;

            // Add a small delay to respect rate limits
            if (allBusinesses.length < TOTAL_RESTAURANTS) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        const restaurantsToSeed = allBusinesses.slice(0, TOTAL_RESTAURANTS);
        console.log(`\n✓ Total restaurants fetched: ${restaurantsToSeed.length}\n`);

        // Transform and insert restaurants
        console.log('Inserting restaurants into database...');
        const restaurantData = restaurantsToSeed.map(transformYelpToRestaurant);

        const { data: restaurants, error: restaurantsError } = await supabase
            .from('restaurants')
            .insert(restaurantData as any)
            .select() as any;

        if (restaurantsError) {
            console.error('Error inserting restaurants:', restaurantsError);
            throw restaurantsError;
        }

        console.log(`✓ Inserted ${restaurants?.length || 0} restaurants\n`);

        // Extract and insert unique tags
        console.log('Extracting and inserting tags...');
        const uniqueTags = extractTags(restaurantsToSeed);

        const tagsData: TablesInsert<'tags'>[] = uniqueTags.map(tag => ({
            source: Source.YELP,
            value: tag.value,
            type: TagType.FOOD, // Yelp categories are primarily food-related
            source_alias: tag.sourceAlias,
        }));

        const { data: tags, error: tagsError } = await supabase
            .from('tags')
            .insert(tagsData as any)
            .select() as any;

        if (tagsError) {
            console.error('Error inserting tags:', tagsError);
            throw tagsError;
        }

        console.log(`✓ Inserted ${tags?.length || 0} tags\n`);

        // Create a map of tag values to tag IDs for linking
        const tagMap = new Map<string, string>();
        tags?.forEach((tag: any) => {
            tagMap.set(tag.value, tag.id);
        });

        // Link tags to restaurants
        console.log('Linking tags to restaurants...');
        const restaurantTagLinks: TablesInsert<'restaurant_tags'>[] = [];

        restaurantsToSeed.forEach((business, index) => {
            const restaurant = restaurants?.[index];
            if (!restaurant) return;

            business.categories.forEach(category => {
                const tagId = tagMap.get(category.title);
                if (tagId) {
                    restaurantTagLinks.push({
                        restaurant_id: restaurant.id,
                        tag_id: tagId,
                    });
                }
            });
        });

        if (restaurantTagLinks.length > 0) {
            const { error: linkError } = await supabase
                .from('restaurant_tags')
                .insert(restaurantTagLinks as any);

            if (linkError) {
                console.error('Error linking tags to restaurants:', linkError);
                throw linkError;
            }

            console.log(`✓ Created ${restaurantTagLinks.length} restaurant-tag links\n`);
        }

        // Summary
        console.log('========================================');
        console.log('✅ Yelp Austin seeding completed successfully!');
        console.log('========================================');
        console.log(`Restaurants inserted: ${restaurants?.length || 0}`);
        console.log(`Tags inserted: ${tags?.length || 0}`);
        console.log(`Restaurant-tag links created: ${restaurantTagLinks.length}`);
        console.log('========================================\n');

    } catch (error) {
        console.error('\n❌ Yelp Austin seeding failed:', error);
        process.exit(1);
    }
}

// Run the seeding
seedYelpAustin();

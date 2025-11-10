/**
 * Foursquare Places API Seeding Script
 * Fetches 150 restaurants in Austin, TX from Foursquare Places API and populates the database
 */

import { getSupabase } from '../config/supabase.config';
import { Source, TagType } from '../types';
import type { TablesInsert } from '../types/supabase.types';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = getSupabase();

// Foursquare API configuration
const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;
const FOURSQUARE_SEARCH_URL = 'https://places-api.foursquare.com/places/search';
const FOURSQUARE_DETAILS_URL = 'https://places-api.foursquare.com/places';
const AUSTIN_COORDINATES = { lat: 30.2672, lng: -97.7431 }; // Austin, TX coordinates
const LIMIT_PER_REQUEST = 50; // Foursquare API max per request
const TOTAL_RESTAURANTS = 1;

interface FoursquareCategory {
    id: number;
    name: string;
    short_name: string;
    plural_name: string;
    icon: {
        prefix: string;
        suffix: string;
    };
}

interface FoursquareGeocode {
    main: {
        latitude: number;
        longitude: number;
    };
}

interface FoursquareLocation {
    address?: string;
    address_extended?: string;
    census_block?: string;
    country: string;
    cross_street?: string;
    dma?: string;
    formatted_address: string;
    locality?: string;
    postcode?: string;
    region?: string;
}

interface FoursquarePlace {
    fsq_id: string;
    categories: FoursquareCategory[];
    chains: any[];
    distance: number;
    geocodes: FoursquareGeocode;
    link?: string;
    location: FoursquareLocation;
    name: string;
    related_places?: any;
    timezone?: string;
}

interface FoursquarePlaceDetails extends FoursquarePlace {
    description?: string;
    email?: string;
    fax?: string;
    hours?: {
        display: string;
        is_local_holiday: boolean;
        open_now: boolean;
        regular: Array<{
            close: string;
            day: number;
            open: string;
        }>;
    };
    hours_popular?: Array<{
        close: string;
        day: number;
        open: string;
    }>;
    photos?: Array<{
        id: string;
        created_at: string;
        prefix: string;
        suffix: string;
        width: number;
        height: number;
    }>;
    popularity?: number;
    price?: number;
    rating?: number;
    social_media?: {
        facebook_id?: string;
        instagram?: string;
        twitter?: string;
    };
    stats?: {
        total_photos: number;
        total_ratings: number;
        total_tips: number;
    };
    tastes?: string[];
    tel?: string;
    verified?: boolean;
    website?: string;
}

interface FoursquareSearchResponse {
    results: FoursquarePlace[];
    context: {
        geo_bounds: {
            circle: {
                center: {
                    latitude: number;
                    longitude: number;
                };
                radius: number;
            };
        };
    };
}

/**
 * Fetch restaurants from Foursquare Places API
 */
async function fetchFoursquarePlaces(offset: number): Promise<FoursquarePlace[]> {
    if (!process.env.FOURSQUARE_API_KEY) {
        throw new Error('Missing FOURSQUARE_API_KEY environment variable');
    }

    const AUSTIN_COORDINATES = { lat: 30.2672, lng: -97.7431 };
    const LIMIT_PER_REQUEST = 50;

    const url = new URL(FOURSQUARE_SEARCH_URL);
    url.searchParams.append('ll', `${AUSTIN_COORDINATES.lat},${AUSTIN_COORDINATES.lng}`);
    url.searchParams.append('radius', '20000'); // 20 km
    url.searchParams.append('categories', '13000'); // Food & Dining
    url.searchParams.append('limit', LIMIT_PER_REQUEST.toString());
    url.searchParams.append('offset', offset.toString());
    url.searchParams.append('sort', 'POPULARITY');

    console.log(`Fetching places from Foursquare API (offset: ${offset})...`);
    console.log('Fetching from: ' + url.toString());

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}`,
            Accept: 'application/json',
            'Accept-Version': '2024-10-01', // required for new API
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Foursquare API request failed: ${response.status} ${response.statusText} - ${errorText}`
        );
    }

    const data: FoursquareSearchResponse = (await response.json() as any);
    console.log(`✓ Fetched ${data.results.length} places from Foursquare`);

    return data.results;
}

/**
 * Fetch detailed information for a specific place
 */
async function fetchPlaceDetails(fsqId: string): Promise<FoursquarePlaceDetails | null> {
    if (!FOURSQUARE_API_KEY) {
        throw new Error('Missing FOURSQUARE_API_KEY environment variable');
    }

    const url = `${FOURSQUARE_DETAILS_URL}/${fsqId}`;
    const params = new URLSearchParams({
        fields: 'fsq_id,name,geocodes,location,categories,tel,email,website,social_media,hours,rating,popularity,price,photos,stats,description,tastes,verified',
    });

    try {
        const response = await fetch(`${url}?${params.toString()}`, {
            method: 'GET',
            headers: {
                Authorization: FOURSQUARE_API_KEY,
                Accept: 'application/json',
                'Accept-Version': '2024-10-01',
            },
        });

        if (!response.ok) {
            console.warn(`Failed to fetch details for ${fsqId}: ${response.status}`);
            return null;
        }

        const data: FoursquarePlaceDetails = (await response.json()) as any;
        return data;
    } catch (error) {
        console.warn(`Error fetching details for ${fsqId}:`, error);
        return null;
    }
}

/**
 * Transform Foursquare place data to database format
 */
function transformFoursquareToRestaurant(
    place: FoursquarePlace,
    details?: FoursquarePlaceDetails | null
): TablesInsert<'restaurants'> {
    // Build image URL from photos if available
    let imageUrl = 'https://via.placeholder.com/400x300?text=No+Image';
    if (details?.photos && details.photos.length > 0) {
        const photo = details.photos[0];
        imageUrl = `${photo.prefix}original${photo.suffix}`;
    }

    // Extract price (Foursquare uses 1-4 scale)
    let price: string | undefined;
    if (details?.price) {
        price = '$'.repeat(details.price);
    }

    // Parse address
    const address = place.location.address || place.location.formatted_address.split(',')[0] || '';
    const city = place.location.locality || 'Austin';
    const state = place.location.region || 'TX';
    const zipCode = parseInt(place.location.postcode || '0') || 0;
    const country = place.location.country || 'US';

    // Extract phone
    const phone = details?.tel || '';

    // Extract social media
    const instagram = details?.social_media?.instagram;

    // Build URL
    const url = details?.website || place.link || `https://foursquare.com/v/${place.fsq_id}`;

    // Rating (Foursquare uses 0-10 scale, convert to 0-5)
    const rating = details?.rating ? details.rating / 2 : 0;

    // Review count from stats
    const reviewCount = details?.stats?.total_ratings || 0;

    return {
        source: Source.FOURSQUARE,
        source_id: place.fsq_id,
        name: place.name,
        image_url: imageUrl,
        is_closed: false, // Foursquare doesn't provide closed status in search results
        url: url,
        review_count: reviewCount,
        rating: rating,
        lat: place.geocodes.main.latitude,
        long: place.geocodes.main.longitude,
        transactions: [], // Foursquare doesn't have transaction types like Yelp
        price: price,
        address: address,
        city: city,
        country: country,
        state: state,
        zip_code: zipCode,
        phone: phone,
        instagram: instagram,
    };
}

/**
 * Extract unique tags from Foursquare categories
 */
function extractTags(places: FoursquarePlace[]): { value: string; sourceAlias: string }[] {
    const tagMap = new Map<string, string>();

    places.forEach((place) => {
        place.categories.forEach((category) => {
            if (!tagMap.has(category.name)) {
                tagMap.set(category.name, category.id.toString());
            }
        });
    });

    return Array.from(tagMap.entries()).map(([name, id]) => ({
        value: name,
        sourceAlias: id,
    }));
}

/**
 * Main seeding function
 */
async function seedFoursquareAustin() {
    console.log('Starting Foursquare Austin restaurant seeding...\n');

    try {
        // Fetch all places
        const allPlaces: FoursquarePlace[] = [];
        let offset = 0;

        while (allPlaces.length < TOTAL_RESTAURANTS) {
            const places = await fetchFoursquarePlaces(offset);

            console.log(places);

            if (places.length === 0) {
                console.log('No more places available from Foursquare API');
                break;
            }

            allPlaces.push(...places);
            offset += LIMIT_PER_REQUEST;

            // Add a small delay to respect rate limits
            if (allPlaces.length < TOTAL_RESTAURANTS) {
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
        }

        // const placesToSeed = allPlaces.slice(0, TOTAL_RESTAURANTS);
        // console.log(`\n✓ Total places fetched: ${placesToSeed.length}\n`);

        // // Fetch detailed information for each place
        // console.log('Fetching detailed information for each place...');
        // const placeDetails: Map<string, FoursquarePlaceDetails | null> = new Map();

        // for (let i = 0; i < placesToSeed.length; i++) {
        //     const place = placesToSeed[i];
        //     const details = await fetchPlaceDetails(place.fsq_id);
        //     placeDetails.set(place.fsq_id, details);

        //     // Progress indicator
        //     if ((i + 1) % 10 === 0) {
        //         console.log(`  Progress: ${i + 1}/${placesToSeed.length} places`);
        //     }

        //     // Rate limiting - wait 100ms between requests
        //     await new Promise(resolve => setTimeout(resolve, 100));
        // }

        // console.log(`✓ Fetched details for ${placesToSeed.length} places\n`);

        // // Transform and insert restaurants
        // console.log('Inserting restaurants into database...');
        // const restaurantData = placesToSeed.map(place =>
        //     transformFoursquareToRestaurant(place, placeDetails.get(place.fsq_id))
        // );

        // const { data: restaurants, error: restaurantsError } = await supabase
        //     .from('restaurants')
        //     .insert(restaurantData as any)
        //     .select() as any;

        // if (restaurantsError) {
        //     console.error('Error inserting restaurants:', restaurantsError);
        //     throw restaurantsError;
        // }

        // console.log(`✓ Inserted ${restaurants?.length || 0} restaurants\n`);

        // // Extract and insert unique tags
        // console.log('Extracting and inserting tags...');
        // const uniqueTags = extractTags(placesToSeed);

        // const tagsData: TablesInsert<'tags'>[] = uniqueTags.map(tag => ({
        //     source: Source.FOURSQUARE,
        //     value: tag.value,
        //     type: TagType.FOOD, // Foursquare categories are primarily food-related
        //     source_alias: tag.sourceAlias,
        // }));

        // const { data: tags, error: tagsError } = await supabase
        //     .from('tags')
        //     .insert(tagsData as any)
        //     .select() as any;

        // if (tagsError) {
        //     console.error('Error inserting tags:', tagsError);
        //     throw tagsError;
        // }

        // console.log(`✓ Inserted ${tags?.length || 0} tags\n`);

        // // Create a map of tag values to tag IDs for linking
        // const tagMap = new Map<string, string>();
        // tags?.forEach((tag: any) => {
        //     tagMap.set(tag.value, tag.id);
        // });

        // // Link tags to restaurants
        // console.log('Linking tags to restaurants...');
        // const restaurantTagLinks: TablesInsert<'restaurant_tags'>[] = [];

        // placesToSeed.forEach((place, index) => {
        //     const restaurant = restaurants?.[index];
        //     if (!restaurant) return;

        //     place.categories.forEach(category => {
        //         const tagId = tagMap.get(category.name);
        //         if (tagId) {
        //             restaurantTagLinks.push({
        //                 restaurant_id: restaurant.id,
        //                 tag_id: tagId,
        //             });
        //         }
        //     });
        // });

        // if (restaurantTagLinks.length > 0) {
        //     const { error: linkError } = await supabase
        //         .from('restaurant_tags')
        //         .insert(restaurantTagLinks as any);

        //     if (linkError) {
        //         console.error('Error linking tags to restaurants:', linkError);
        //         throw linkError;
        //     }

        //     console.log(`✓ Created ${restaurantTagLinks.length} restaurant-tag links\n`);
        // }

        // // Insert additional photos as restaurant images
        // console.log('Inserting additional restaurant images...');
        // const imageData: TablesInsert<'restaurant_images'>[] = [];
        // const imageLinks: Array<{ restaurantId: string; imageData: TablesInsert<'restaurant_images'> }> = [];

        // placesToSeed.forEach((place, index) => {
        //     const restaurant = restaurants?.[index];
        //     const details = placeDetails.get(place.fsq_id);

        //     if (!restaurant || !details?.photos) return;

        //     // Skip the first photo as it's already the main image_url
        //     details.photos.slice(1, 6).forEach((photo, photoIndex) => {
        //         const imageUrl = `${photo.prefix}original${photo.suffix}`;
        //         const imageRecord: TablesInsert<'restaurant_images'> = {
        //             source: Source.FOURSQUARE,
        //             source_id: photo.id,
        //             url: imageUrl,
        //         };

        //         imageLinks.push({
        //             restaurantId: restaurant.id,
        //             imageData: imageRecord,
        //         });
        //     });
        // });

        // if (imageLinks.length > 0) {
        //     const imagesToInsert = imageLinks.map(link => link.imageData);

        //     const { data: images, error: imagesError } = await supabase
        //         .from('restaurant_images')
        //         .insert(imagesToInsert as any)
        //         .select() as any;

        //     if (imagesError) {
        //         console.error('Error inserting images:', imagesError);
        //     } else {
        //         console.log(`✓ Inserted ${images?.length || 0} restaurant images`);

        //         // Link images to restaurants
        //         const restaurantImageLinks: TablesInsert<'restaurant_image_links'>[] = images?.map((image: any, index: number) => ({
        //             restaurant_id: imageLinks[index].restaurantId,
        //             image_id: image.id,
        //         })) || [];

        //         if (restaurantImageLinks.length > 0) {
        //             const { error: linkError } = await supabase
        //                 .from('restaurant_image_links')
        //                 .insert(restaurantImageLinks as any);

        //             if (linkError) {
        //                 console.error('Error linking images to restaurants:', linkError);
        //             } else {
        //                 console.log(`✓ Linked ${restaurantImageLinks.length} images to restaurants\n`);
        //             }
        //         }
        //     }
        // }

        // // Summary
        // console.log('========================================');
        // console.log('✅ Foursquare Austin seeding completed successfully!');
        // console.log('========================================');
        // console.log(`Restaurants inserted: ${restaurants?.length || 0}`);
        // console.log(`Tags inserted: ${tags?.length || 0}`);
        // console.log(`Restaurant-tag links created: ${restaurantTagLinks.length}`);
        // console.log(`Additional images inserted: ${imageLinks.length}`);
        // console.log('========================================\n');
    } catch (error) {
        console.error('\n❌ Foursquare Austin seeding failed:', error);
        process.exit(1);
    }
}

// Run the seeding
seedFoursquareAustin();

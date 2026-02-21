#!/usr/bin/env node

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // Google Places API configuration
    GOOGLE_API_KEY: process.env.GOOGLE_PLACES_API_KEY?.replace(/["']/g, '').trim(),
    GOOGLE_API_BASE_URL: 'https://places.googleapis.com/v1',

    // Target configuration
    TARGET_RESTAURANTS: 500,
    MAX_RESULTS_PER_SEARCH: 20, // Google API limit

    // Austin neighborhoods and areas to search
    SEARCH_LOCATIONS: [
        // Original 12
        { name: 'Downtown Austin', lat: 30.2672, lng: -97.7431, radius: 2000 },
        { name: 'South Congress', lat: 30.2447, lng: -97.7501, radius: 2000 },
        { name: 'East Austin', lat: 30.2631, lng: -97.7186, radius: 2000 },
        { name: 'West Campus', lat: 30.2866, lng: -97.7456, radius: 2000 },
        { name: 'North Loop', lat: 30.3139, lng: -97.7261, radius: 2000 },
        { name: 'Mueller', lat: 30.2955, lng: -97.7069, radius: 2000 },
        { name: 'Zilker', lat: 30.2669, lng: -97.7731, radius: 2000 },
        { name: 'Clarksville', lat: 30.2841, lng: -97.7636, radius: 1500 },
        { name: 'Hyde Park', lat: 30.3065, lng: -97.7331, radius: 1500 },
        { name: 'Bouldin Creek', lat: 30.2514, lng: -97.7636, radius: 1500 },
        { name: 'Barton Hills', lat: 30.2594, lng: -97.7814, radius: 1500 },
        { name: 'Westlake', lat: 30.2986, lng: -97.8125, radius: 2000 },
        // Expanded coverage
        { name: 'South Lamar', lat: 30.2358, lng: -97.7686, radius: 2000 },
        { name: 'Rainey Street', lat: 30.2588, lng: -97.7368, radius: 1200 },
        { name: 'Red River District', lat: 30.2700, lng: -97.7368, radius: 1200 },
        { name: 'The Domain', lat: 30.4022, lng: -97.7328, radius: 2000 },
        { name: 'North Burnet', lat: 30.3558, lng: -97.7261, radius: 2000 },
        { name: 'Cherrywood', lat: 30.2780, lng: -97.7186, radius: 1500 },
        { name: 'Travis Heights', lat: 30.2430, lng: -97.7368, radius: 1500 },
        { name: 'Oak Hill', lat: 30.2275, lng: -97.8653, radius: 2000 },
        { name: 'Cedar Park', lat: 30.5052, lng: -97.8203, radius: 2500 },
        { name: 'Round Rock', lat: 30.5083, lng: -97.6789, radius: 2500 },
        { name: 'Pflugerville', lat: 30.4394, lng: -97.6200, radius: 2000 },
        { name: 'Lakeway', lat: 30.3585, lng: -97.9772, radius: 2000 },
        { name: 'South Austin Slaughter', lat: 30.1697, lng: -97.7828, radius: 2000 },
        { name: 'Allandale', lat: 30.3416, lng: -97.7500, radius: 1500 },
    ],

    // Rate limiting
    MAX_REQUESTS_PER_SECOND: 5,
    DELAY_BETWEEN_REQUESTS: 250, // ms

    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // ms

    // Progress tracking
    LOG_PROGRESS_EVERY: 10,
};

// Validate environment variables
function validateConfig() {
    if (!CONFIG.GOOGLE_API_KEY) {
        console.error('\n❌ Missing GOOGLE_PLACES_API_KEY in .env file\n');
        process.exit(1);
    }
}

const prisma = new PrismaClient();

class RateLimiter {
    constructor() {
        this.lastRequestTime = 0;
    }

    async throttle() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < CONFIG.DELAY_BETWEEN_REQUESTS) {
            const delay = CONFIG.DELAY_BETWEEN_REQUESTS - timeSinceLastRequest;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }

        this.lastRequestTime = Date.now();
    }
}

const rateLimiter = new RateLimiter();

async function retryWithBackoff(fn, retries = CONFIG.MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;

            const delay = CONFIG.RETRY_DELAY * Math.pow(2, i);
            console.log(`  ⚠️  Retry ${i + 1}/${retries} after ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
}

/**
 * Search for restaurants in a specific location
 * @param {Object} location - Location object with lat, lng, radius, name
 * @returns {Promise<Array>} Array of place IDs
 */
async function searchRestaurantsInLocation(location) {
    await rateLimiter.throttle();

    try {
        const response = await fetch(`${CONFIG.GOOGLE_API_BASE_URL}/places:searchText`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': CONFIG.GOOGLE_API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName',
            },
            body: JSON.stringify({
                textQuery: `restaurants in ${location.name}, Austin, TX`,
                locationBias: {
                    circle: {
                        center: {
                            latitude: location.lat,
                            longitude: location.lng,
                        },
                        radius: location.radius,
                    },
                },
                maxResultCount: CONFIG.MAX_RESULTS_PER_SEARCH,
            }),
        });

        console.log(response);

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        const places = data.places || [];

        return places;
    } catch (error) {
        console.error(`  ❌ Error searching ${location.name}:`, error.message);
        return [];
    }
}

/**
 * Get detailed information about a place
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} Place details
 */
async function getPlaceDetails(placeId) {
    await rateLimiter.throttle();

    try {
        const response = await fetch(`${CONFIG.GOOGLE_API_BASE_URL}/places/${placeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': CONFIG.GOOGLE_API_KEY,
                'X-Goog-FieldMask': [
                    'id',
                    'displayName',
                    'formattedAddress',
                    'location',
                    'rating',
                    'userRatingCount',
                    'priceLevel',
                    'nationalPhoneNumber',
                    'websiteUri',
                    'googleMapsUri',
                    'photos',
                    'reviews',
                    'types',
                    'addressComponents',
                ].join(','),
            },
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`  ❌ Error fetching details for ${placeId}:`, error.message);
        throw error;
    }
}

// ============================================================================
// DATA TRANSFORMATION HELPERS
// ============================================================================

/**
 * Map Google price level to our price format
 * @param {string} googlePriceLevel - PRICE_LEVEL_FREE, PRICE_LEVEL_INEXPENSIVE, etc.
 * @returns {string} Price string ($$, $$$, etc.)
 */
function mapPriceLevel(googlePriceLevel) {
    const mapping = {
        PRICE_LEVEL_FREE: '$',
        PRICE_LEVEL_INEXPENSIVE: '$',
        PRICE_LEVEL_MODERATE: '$$',
        PRICE_LEVEL_EXPENSIVE: '$$$',
        PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
    };

    return mapping[googlePriceLevel] || '$$';
}

/**
 * Extract cuisines from Google place types
 * @param {Array} types - Google place types
 * @returns {Array} Cuisine names
 */
function extractCuisines(types = []) {
    const cuisineMap = {
        american_restaurant: 'American',
        italian_restaurant: 'Italian',
        chinese_restaurant: 'Chinese',
        japanese_restaurant: 'Japanese',
        mexican_restaurant: 'Mexican',
        thai_restaurant: 'Thai',
        indian_restaurant: 'Indian',
        french_restaurant: 'French',
        mediterranean_restaurant: 'Mediterranean',
        greek_restaurant: 'Greek',
        spanish_restaurant: 'Spanish',
        vietnamese_restaurant: 'Vietnamese',
        korean_restaurant: 'Korean',
        seafood_restaurant: 'Seafood',
        steak_house: 'Steakhouse',
        sushi_restaurant: 'Sushi',
        pizza_restaurant: 'Pizza',
        sandwich_shop: 'Sandwiches',
        bar: 'Bar & Grill',
        barbecue_restaurant: 'BBQ',
        cafe: 'Cafe',
        bakery: 'Bakery',
        fast_food_restaurant: 'Fast Food',
        hamburger_restaurant: 'Burgers',
        breakfast_restaurant: 'Breakfast',
        brunch_restaurant: 'Brunch',
    };

    const cuisines = [];
    for (const type of types) {
        if (cuisineMap[type]) {
            cuisines.push(cuisineMap[type]);
        }
    }

    return cuisines.length > 0 ? cuisines : ['American'];
}

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

/**
 * Check if a restaurant already exists in database by Google place ID
 * @param {string} googlePlaceId - Google Place ID
 * @returns {Promise<boolean>} True if exists
 */
async function restaurantExists(googlePlaceId) {
    const restaurant = await prisma.restaurant.findFirst({
        where: {
            sourceId: googlePlaceId,
            source: 'GOOGLE',
        },
    });

    return !!restaurant;
}

/**
 * Get or create a cuisine tag type
 * @returns {Promise<string>} TagType ID for cuisine
 */
async function getCuisineTagType() {
    let tagType = await prisma.tagType.findUnique({
        where: { value: 'cuisine' },
    });

    if (!tagType) {
        tagType = await prisma.tagType.create({
            data: { value: 'cuisine' },
        });
    }

    return tagType.id;
}

/**
 * Get or create a cuisine tag
 * @param {string} cuisineName - Cuisine name
 * @param {string} tagTypeId - TagType ID
 * @returns {Promise<string>} Tag ID
 */
async function getOrCreateCuisineTag(cuisineName, tagTypeId) {
    let tag = await prisma.tag.findFirst({
        where: {
            value: cuisineName,
            tagTypeId: tagTypeId,
        },
    });

    if (!tag) {
        tag = await prisma.tag.create({
            data: {
                value: cuisineName,
                tagTypeId: tagTypeId,
                source: 'GOOGLE',
            },
        });
    }

    return tag.id;
}

/**
 * Insert restaurant data into database
 * @param {Object} placeDetails - Google Place details
 * @returns {Promise<Object>} Created restaurant
 */
async function insertRestaurant(placeDetails) {
    const priceString = mapPriceLevel(placeDetails.priceLevel);

    // Get first photo URL if available
    let imageUrl = 'https://via.placeholder.com/400x300?text=Restaurant';
    if (placeDetails.photos && placeDetails.photos.length > 0) {
        const photoName = placeDetails.photos[0].name;
        imageUrl = `${CONFIG.GOOGLE_API_BASE_URL}/${photoName}/media?maxWidthPx=800&key=${CONFIG.GOOGLE_API_KEY}`;
    }

    const restaurantData = {
        sourceId: placeDetails.id,
        source: 'GOOGLE',
        name: placeDetails.displayName?.text || 'Unknown Restaurant',
        address: placeDetails.formattedAddress || '',
        lat: placeDetails.location?.latitude || 0,
        long: placeDetails.location?.longitude || 0,
        mapLink: placeDetails.googleMapsUri || '',
        price: priceString,
        phoneNumber: placeDetails.nationalPhoneNumber || '',
        rating: placeDetails.rating || 0,
    };

    const restaurant = await prisma.restaurant.create({
        data: restaurantData,
    });

    return restaurant;
}

/**
 * Insert restaurant images
 * @param {string} restaurantId - Restaurant ID
 * @param {Array} photos - Google photos array
 */
async function insertImages(restaurantId, photos = []) {
    if (photos.length === 0) return;

    const imagesToInsert = photos.slice(0, 8).map((photo, index) => ({
        restaurantId,
        url: `${CONFIG.GOOGLE_API_BASE_URL}/${photo.name}/media?maxWidthPx=800&key=${CONFIG.GOOGLE_API_KEY}`,
        source: 'GOOGLE',
        sourceId: photo.name,
    }));

    await prisma.restaurantImage.createMany({
        data: imagesToInsert,
        skipDuplicates: true,
    });
}

/**
 * Insert restaurant reviews
 * @param {string} restaurantId - Restaurant ID
 * @param {Array} reviews - Google reviews array
 */
async function insertReviews(restaurantId, reviews = []) {
    if (reviews.length === 0) return;

    const reviewsData = reviews.slice(0, 5).map((review) => ({
        restaurantId,
        rating: review.rating || 0,
        review: review.text?.text || '',
        postedBy: review.authorAttribution?.displayName || 'Anonymous',
        source: 'GOOGLE',
        sourceId: review.name || '',
    }));

    await prisma.review.createMany({
        data: reviewsData,
        skipDuplicates: true,
    });
}

/**
 * Insert restaurant cuisines as tags
 * @param {string} restaurantId - Restaurant ID
 * @param {Array} types - Google place types
 */
async function insertCuisineTags(restaurantId, types) {
    const cuisines = extractCuisines(types);
    const tagTypeId = await getCuisineTagType();

    for (const cuisineName of cuisines) {
        const tagId = await getOrCreateCuisineTag(cuisineName, tagTypeId);

        // Connect tag to restaurant
        await prisma.restaurant.update({
            where: { id: restaurantId },
            data: {
                tags: {
                    connect: { id: tagId },
                },
            },
        });
    }
}

// ============================================================================
// MAIN PROCESSING FUNCTION
// ============================================================================

/**
 * Process a single restaurant
 * @param {Object} place - Basic place info from search
 * @param {number} index - Current index
 * @param {number} total - Total count
 */
async function processRestaurant(place, index, total) {
    const placeId = place.id;
    const placeName = place.displayName?.text || 'Unknown';

    console.log(`\n[${index + 1}/${total}] Processing: ${placeName}`);
    console.log(`  Place ID: ${placeId}`);

    try {
        // Check if already exists
        const exists = await restaurantExists(placeId);
        if (exists) {
            console.log('  ⏭️  Already exists, skipping...');
            return { success: true, skipped: true };
        }

        // Get detailed information
        console.log('  📥 Fetching details...');
        const placeDetails = await retryWithBackoff(() => getPlaceDetails(placeId));

        // Insert restaurant
        console.log('  💾 Inserting restaurant...');
        const restaurant = await insertRestaurant(placeDetails);

        // Insert images
        console.log(`  📸 Inserting images (${(placeDetails.photos || []).length})...`);
        await insertImages(restaurant.id, placeDetails.photos);

        // Insert reviews
        console.log(`  ⭐ Inserting reviews (${(placeDetails.reviews || []).length})...`);
        await insertReviews(restaurant.id, placeDetails.reviews);

        // Insert cuisines as tags
        console.log('  🍽️  Inserting cuisines...');
        await insertCuisineTags(restaurant.id, placeDetails.types);

        console.log(`  ✅ Completed successfully!`);

        return { success: true, skipped: false, restaurantId: restaurant.id };
    } catch (error) {
        console.error(`  ❌ Failed to process: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    console.log('\n════════════════════════════════════════════════════════');
    console.log('   Google Places Restaurant Ingestion Script');
    console.log('   Target: 150 Restaurants in Austin, TX');
    console.log('════════════════════════════════════════════════════════\n');

    // Validate configuration
    validateConfig();

    console.log('Configuration:');
    console.log(`  Target Restaurants: ${CONFIG.TARGET_RESTAURANTS}`);
    console.log(`  Search Locations: ${CONFIG.SEARCH_LOCATIONS.length}`);
    console.log(`  Rate Limit: ${CONFIG.MAX_REQUESTS_PER_SECOND} req/sec\n`);

    const startTime = Date.now();

    try {
        // Collect unique places from all locations
        const allPlaces = new Map(); // Use Map to deduplicate by place ID

        console.log('🔍 Searching for restaurants across Austin neighborhoods...\n');

        for (const location of CONFIG.SEARCH_LOCATIONS) {
            console.log(`📍 Searching ${location.name}...`);
            const places = await searchRestaurantsInLocation(location);
            console.log(`   Found ${places.length} restaurants`);

            // Add to map (automatically deduplicates)
            places.forEach((place) => {
                if (!allPlaces.has(place.id)) {
                    allPlaces.set(place.id, place);
                }
            });

            console.log(`   Total unique: ${allPlaces.size}`);

            // Stop if we have enough
            if (allPlaces.size >= CONFIG.TARGET_RESTAURANTS) {
                console.log(
                    `\n✅ Reached target of ${CONFIG.TARGET_RESTAURANTS} unique restaurants!\n`
                );
                break;
            }
        }

        const uniquePlaces = Array.from(allPlaces.values());
        const placesToProcess = uniquePlaces.slice(0, CONFIG.TARGET_RESTAURANTS);

        console.log('\n════════════════════════════════════════════════════════');
        console.log(`   Found ${uniquePlaces.length} unique restaurants`);
        console.log(`   Processing ${placesToProcess.length} restaurants`);
        console.log('════════════════════════════════════════════════════════');

        if (placesToProcess.length === 0) {
            console.log('No restaurants found. Exiting.');
            return;
        }

        // Process each restaurant
        const results = {
            total: placesToProcess.length,
            succeeded: 0,
            skipped: 0,
            failed: 0,
        };

        for (let i = 0; i < placesToProcess.length; i++) {
            const result = await processRestaurant(placesToProcess[i], i, placesToProcess.length);

            if (result.success) {
                if (result.skipped) {
                    results.skipped++;
                } else {
                    results.succeeded++;
                }
            } else {
                results.failed++;
            }

            // Progress report
            if ((i + 1) % CONFIG.LOG_PROGRESS_EVERY === 0) {
                console.log('\n────────────────────────────────────────────────────────');
                console.log(`Progress: ${i + 1}/${placesToProcess.length}`);
                console.log(`  ✅ Succeeded: ${results.succeeded}`);
                console.log(`  ⏭️  Skipped: ${results.skipped}`);
                console.log(`  ❌ Failed: ${results.failed}`);
                console.log('────────────────────────────────────────────────────────');
            }
        }

        // Final summary
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log('\n════════════════════════════════════════════════════════');
        console.log('   Final Summary');
        console.log('════════════════════════════════════════════════════════\n');
        console.log(`Total Restaurants Processed: ${results.total}`);
        console.log(`✅ Successfully Ingested: ${results.succeeded}`);
        console.log(`⏭️  Skipped (Already Exist): ${results.skipped}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`\n⏱️  Total Time: ${duration}s`);
        console.log('\n════════════════════════════════════════════════════════\n');
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
if (require.main === module) {
    main().catch((error) => {
        console.error('Unhandled error:', error);
        prisma.$disconnect();
        process.exit(1);
    });
}

module.exports = { main };

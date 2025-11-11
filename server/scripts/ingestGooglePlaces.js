#!/usr/bin/env node

/**
 * Google Places API Ingestion Script
 *
 * This script fetches restaurant data from Google Places API (New) and populates
 * the Supabase database with comprehensive restaurant information including:
 * - Restaurant details (name, address, location, etc.)
 * - Photos (downloaded and uploaded to Supabase Storage)
 * - Reviews
 * - Operating hours
 * - Statistics
 * - Source tracking for deduplication
 *
 * Usage: node scripts/ingest-google-places.js
 */

require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // Google Places API configuration
    GOOGLE_API_KEY: process.env.GOOGLE_PLACES_API_KEY?.replace(/["']/g, '').trim(),
    GOOGLE_API_BASE_URL: 'https://places.googleapis.com/v1',

    // Search configuration
    SEARCH_QUERY: 'restaurants in downtown Austin, TX',
    LOCATION: {
        latitude: 30.2672, // Downtown Austin, TX (6th Street Entertainment District)
        longitude: -97.7404,
    },
    SEARCH_RADIUS: 3000, // 3km radius (focused on downtown)
    MAX_RESTAURANTS: 10, // Start with 10 for testing

    // Rate limiting (Google Places API limit)
    MAX_REQUESTS_PER_SECOND: 5,
    DELAY_BETWEEN_REQUESTS: 250, // ms (1000ms / 5 = 200ms, add buffer)

    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // ms

    // Image configuration
    MAX_PHOTOS_PER_RESTAURANT: 8,
    PHOTO_MAX_WIDTH: 1200,
    PHOTO_MAX_HEIGHT: 1200,

    // Progress tracking
    LOG_PROGRESS_EVERY: 5,

    // Supabase configuration
    SUPABASE_URL: process.env.SUPABASE_URL?.trim(),
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY?.trim(),
    STORAGE_BUCKET: 'restaurant-images',
};

// Validate environment variables
function validateConfig() {
    const required = ['GOOGLE_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
    const missing = required.filter((key) => !CONFIG[key]);

    if (missing.length > 0) {
        console.error('\n❌ Missing required environment variables:');
        missing.forEach((key) => console.error(`  - ${key}`));
        console.error('\nPlease check your .env file\n');
        process.exit(1);
    }
}

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY);

// ============================================================================
// RATE LIMITING
// ============================================================================

class RateLimiter {
    constructor(maxPerSecond) {
        this.maxPerSecond = maxPerSecond;
        this.queue = [];
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

const rateLimiter = new RateLimiter(CONFIG.MAX_REQUESTS_PER_SECOND);

// ============================================================================
// RETRY LOGIC
// ============================================================================

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

// ============================================================================
// GOOGLE PLACES API FUNCTIONS
// ============================================================================

/**
 * Search for restaurants using Google Places Text Search API
 * @returns {Promise<Array>} Array of place IDs
 */
async function searchRestaurants() {
    console.log(`\n🔍 Searching for restaurants in ${CONFIG.SEARCH_QUERY}...\n`);

    await rateLimiter.throttle();

    try {
        const response = await axios.post(
            `${CONFIG.GOOGLE_API_BASE_URL}/places:searchText`,
            {
                textQuery: CONFIG.SEARCH_QUERY,
                locationBias: {
                    circle: {
                        center: {
                            latitude: CONFIG.LOCATION.latitude,
                            longitude: CONFIG.LOCATION.longitude,
                        },
                        radius: CONFIG.SEARCH_RADIUS,
                    },
                },
                maxResultCount: Math.min(CONFIG.MAX_RESTAURANTS, 20), // API limit per request
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': CONFIG.GOOGLE_API_KEY,
                    'X-Goog-FieldMask': 'places.id,places.displayName',
                },
            }
        );

        const places = response.data.places || [];
        console.log(`✅ Found ${places.length} restaurants\n`);

        return places.slice(0, CONFIG.MAX_RESTAURANTS);
    } catch (error) {
        console.error('❌ Error searching restaurants:', error.response?.data || error.message);
        throw error;
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
        const response = await axios.get(`${CONFIG.GOOGLE_API_BASE_URL}/places/${placeId}`, {
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
                    'regularOpeningHours',
                    'photos',
                    'reviews',
                    'types',
                    'addressComponents',
                ].join(','),
            },
        });

        return response.data;
    } catch (error) {
        console.error(
            `  ❌ Error fetching details for ${placeId}:`,
            error.response?.data || error.message
        );
        throw error;
    }
}

/**
 * Download a photo from Google Places
 * @param {string} photoName - Photo resource name from Places API
 * @param {number} maxWidth - Maximum width
 * @returns {Promise<Buffer>} Image buffer
 */
async function downloadPhoto(photoName, maxWidth = CONFIG.PHOTO_MAX_WIDTH) {
    await rateLimiter.throttle();

    try {
        const response = await axios.get(`${CONFIG.GOOGLE_API_BASE_URL}/${photoName}/media`, {
            params: {
                maxWidthPx: maxWidth,
                key: CONFIG.GOOGLE_API_KEY,
            },
            responseType: 'arraybuffer',
        });

        return Buffer.from(response.data);
    } catch (error) {
        console.error(`  ⚠️  Error downloading photo ${photoName}:`, error.message);
        return null;
    }
}

// ============================================================================
// DATA TRANSFORMATION HELPERS
// ============================================================================

/**
 * Parse Google address components into structured address
 * @param {Array} addressComponents - Google address components
 * @returns {Object} Parsed address
 */
function parseAddress(addressComponents = []) {
    const address = {
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country_code: 'US',
    };

    for (const component of addressComponents) {
        const types = component.types || [];

        if (types.includes('street_number')) {
            address.street = component.longText;
        } else if (types.includes('route')) {
            address.street = address.street
                ? `${address.street} ${component.longText}`
                : component.longText;
        } else if (types.includes('locality')) {
            address.city = component.longText;
        } else if (types.includes('administrative_area_level_1')) {
            address.state = component.shortText;
        } else if (types.includes('postal_code')) {
            address.postal_code = component.longText;
        } else if (types.includes('country')) {
            address.country_code = component.shortText;
        }
    }

    return address;
}

/**
 * Map Google price level to our price tier enum
 * @param {string} googlePriceLevel - PRICE_LEVEL_FREE, PRICE_LEVEL_INEXPENSIVE, etc.
 * @returns {number} Price tier (1-4)
 */
function mapPriceLevel(googlePriceLevel) {
    const mapping = {
        PRICE_LEVEL_FREE: 1,
        PRICE_LEVEL_INEXPENSIVE: 1,
        PRICE_LEVEL_MODERATE: 2,
        PRICE_LEVEL_EXPENSIVE: 3,
        PRICE_LEVEL_VERY_EXPENSIVE: 4,
    };

    return mapping[googlePriceLevel] || 2; // Default to moderate
}

/**
 * Extract cuisines from Google place types
 * @param {Array} types - Google place types
 * @returns {Array} Cuisine names
 */
function extractCuisines(types = []) {
    // Map of Google types to cuisine names
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
    };

    const cuisines = [];
    for (const type of types) {
        if (cuisineMap[type]) {
            cuisines.push(cuisineMap[type]);
        }
    }

    // If no specific cuisine found, default to 'American'
    return cuisines.length > 0 ? cuisines : ['American'];
}

/**
 * Parse Google opening hours into our hours table format
 * @param {Object} regularOpeningHours - Google opening hours
 * @returns {Array} Hours records
 */
function parseOpeningHours(regularOpeningHours) {
    if (!regularOpeningHours || !regularOpeningHours.periods) {
        return [];
    }

    const hours = [];

    for (const period of regularOpeningHours.periods) {
        if (!period.open) continue;

        const dayOfWeek = period.open.day; // 0 = Sunday, 6 = Saturday
        const openTime = period.open.hour
            ? `${String(period.open.hour).padStart(2, '0')}:${String(period.open.minute || 0).padStart(2, '0')}:00`
            : null;
        const closeTime = period.close
            ? `${String(period.close.hour).padStart(2, '0')}:${String(period.close.minute || 0).padStart(2, '0')}:00`
            : null;

        hours.push({
            day_of_week: dayOfWeek,
            open_time: openTime,
            close_time: closeTime,
            is_closed: false,
        });
    }

    return hours;
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
    const { data, error } = await supabase
        .from('restaurants')
        .select('id')
        .eq('source', 'GOOGLE')
        .eq('source_id', googlePlaceId)
        .single();

    if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found
        console.error('  ⚠️  Error checking for existing restaurant:', error.message);
    }

    return !!data;
}

/**
 * Get or create a cuisine
 * @param {string} cuisineName - Cuisine name
 * @returns {Promise<string>} Cuisine ID
 */
async function getOrCreateCuisine(cuisineName) {
    // First, try to find existing
    const { data: existing } = await supabase
        .from('cuisine')
        .select('id')
        .eq('name', cuisineName)
        .single();

    if (existing) {
        return existing.id;
    }

    // Create new
    const { data: newCuisine, error } = await supabase
        .from('cuisine')
        .insert({
            name: cuisineName,
            icon: '🍽️', // Default icon
        })
        .select('id')
        .single();

    if (error) {
        console.error(`  ⚠️  Error creating cuisine ${cuisineName}:`, error.message);
        return null;
    }

    return newCuisine.id;
}

/**
 * Upload image to Supabase Storage
 * @param {Buffer} imageBuffer - Image data
 * @param {string} restaurantId - Restaurant ID
 * @param {number} index - Photo index
 * @returns {Promise<string>} Public URL
 */
async function uploadImage(imageBuffer, restaurantId, index) {
    try {
        // Process image with sharp (resize if needed)
        const processedImage = await sharp(imageBuffer)
            .resize(CONFIG.PHOTO_MAX_WIDTH, CONFIG.PHOTO_MAX_HEIGHT, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg({ quality: 85 })
            .toBuffer();

        const fileName = `${restaurantId}/${Date.now()}_${index}.jpg`;

        const { data, error } = await supabase.storage
            .from(CONFIG.STORAGE_BUCKET)
            .upload(fileName, processedImage, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error(`  ⚠️  Error uploading image:`, error.message);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(CONFIG.STORAGE_BUCKET)
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    } catch (error) {
        console.error(`  ⚠️  Error processing image:`, error.message);
        return null;
    }
}

/**
 * Insert restaurant data into database
 * @param {Object} placeDetails - Google Place details
 * @returns {Promise<string>} Restaurant ID
 */
async function insertRestaurant(placeDetails) {
    const address = parseAddress(placeDetails.addressComponents);

    // Map price level to string format ($$, $$$, etc.)
    const priceLevel = placeDetails.priceLevel;
    let priceString = '$$'; // Default
    if (priceLevel === 'PRICE_LEVEL_INEXPENSIVE') priceString = '$';
    else if (priceLevel === 'PRICE_LEVEL_MODERATE') priceString = '$$';
    else if (priceLevel === 'PRICE_LEVEL_EXPENSIVE') priceString = '$$$';
    else if (priceLevel === 'PRICE_LEVEL_VERY_EXPENSIVE') priceString = '$$$$';

    const restaurantData = {
        source_id: placeDetails.id, // Google place ID
        source: 'GOOGLE',
        name: placeDetails.displayName?.text || 'Unknown Restaurant',
        image_url: 'https://via.placeholder.com/400x300?text=Restaurant', // Placeholder, will be updated with real photo
        address: address.street,
        city: address.city,
        state: address.state,
        zip_code: address.postal_code,
        country: address.country_code,
        lat: placeDetails.location.latitude,
        long: placeDetails.location.longitude,
        phone: placeDetails.nationalPhoneNumber,
        url: placeDetails.websiteUri,
        price: priceString,
        rating: placeDetails.rating || 0,
        review_count: placeDetails.userRatingCount || 0,
        is_closed: false,
    };

    const { data, error } = await supabase
        .from('restaurants')
        .insert(restaurantData)
        .select('id')
        .single();

    if (error) {
        console.error('  ❌ Error inserting restaurant:', error.message);
        throw error;
    }

    return data.id;
}

/**
 * Insert restaurant statistics
 * @param {string} restaurantId - Restaurant ID
 * @param {Object} placeDetails - Google Place details
 */
async function insertRestaurantStats(restaurantId, placeDetails) {
    const statsData = {
        restaurant_id: restaurantId,
        total_reviews: placeDetails.userRatingCount || 0,
        avg_rating: placeDetails.rating || 0,
        total_swipes: 0,
        total_saves: 0,
    };

    const { error } = await supabase.from('restaurant_stats').insert(statsData);

    if (error) {
        console.error('  ⚠️  Error inserting stats:', error.message);
    }
}

/**
 * Process and insert restaurant photos
 * @param {string} restaurantId - Restaurant ID
 * @param {Array} photos - Google photos array
 * @returns {Promise<string>} Hero image URL
 */
async function processPhotos(restaurantId, photos = []) {
    if (photos.length === 0) return null;

    const photosToProcess = photos.slice(0, CONFIG.MAX_PHOTOS_PER_RESTAURANT);
    let heroImageUrl = null;

    for (let i = 0; i < photosToProcess.length; i++) {
        const photo = photosToProcess[i];

        // Download photo from Google
        const imageBuffer = await downloadPhoto(photo.name);
        if (!imageBuffer) continue;

        // Upload to Supabase Storage
        const publicUrl = await uploadImage(imageBuffer, restaurantId, i);
        if (!publicUrl) continue;

        // First photo is the hero/cover image
        if (i === 0) {
            heroImageUrl = publicUrl;

            // Update restaurant with hero image
            await supabase
                .from('restaurants')
                .update({ image_url: publicUrl })
                .eq('id', restaurantId);
        }

        // Insert into restaurant_image table
        await supabase.from('restaurant_image').insert({
            restaurant_id: restaurantId,
            image_url: publicUrl,
            image_type: i === 0 ? 'COVER' : 'AMBIANCE',
            is_primary: i === 0,
            display_order: i,
        });
    }

    return heroImageUrl;
}

/**
 * Insert restaurant reviews
 * @param {string} restaurantId - Restaurant ID
 * @param {Array} reviews - Google reviews array
 */
async function insertReviews(restaurantId, reviews = []) {
    if (reviews.length === 0) return;

    const reviewsData = reviews.map((review) => ({
        restaurant_id: restaurantId,
        user_id: null, // External reviews don't have user_id
        rating: review.rating || 0,
        review_text: review.text?.text,
        author_name: review.authorAttribution?.displayName,
        source: 'GOOGLE',
        source_id: review.name,
        created_at: review.publishTime,
    }));

    const { error } = await supabase.from('reviews').insert(reviewsData);

    if (error) {
        console.error('  ⚠️  Error inserting reviews:', error.message);
    }
}

/**
 * Insert operating hours
 * @param {string} restaurantId - Restaurant ID
 * @param {Object} regularOpeningHours - Google opening hours
 */
async function insertHours(restaurantId, regularOpeningHours) {
    const hours = parseOpeningHours(regularOpeningHours);
    if (hours.length === 0) return;

    const hoursData = hours.map((hour) => ({
        restaurant_id: restaurantId,
        ...hour,
    }));

    const { error } = await supabase.from('hours').insert(hoursData);

    if (error) {
        console.error('  ⚠️  Error inserting hours:', error.message);
    }
}

/**
 * Insert place source tracking
 * @param {string} restaurantId - Restaurant ID
 * @param {Object} placeDetails - Full Google Place details
 */
async function insertPlaceSource(restaurantId, placeDetails) {
    const sourceData = {
        restaurant_id: restaurantId,
        source_name: 'GOOGLE',
        source_place_id: placeDetails.id,
        raw_response: placeDetails,
        last_synced_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('place_source').insert(sourceData);

    if (error) {
        console.error('  ⚠️  Error inserting place source:', error.message);
    }
}

/**
 * Insert restaurant alias for deduplication
 * @param {string} restaurantId - Restaurant ID
 * @param {Object} placeDetails - Google Place details
 */
async function insertRestaurantAlias(restaurantId, placeDetails) {
    const aliasData = {
        canonical_restaurant_id: restaurantId,
        source_name: 'GOOGLE',
        source_place_id: placeDetails.id,
        alias_name: placeDetails.displayName?.text,
        alias_address: placeDetails.formattedAddress,
    };

    const { error } = await supabase.from('restaurant_alias').insert(aliasData);

    if (error) {
        console.error('  ⚠️  Error inserting alias:', error.message);
    }
}

/**
 * Insert restaurant cuisines
 * @param {string} restaurantId - Restaurant ID
 * @param {Array} types - Google place types
 */
async function insertCuisines(restaurantId, types) {
    const cuisines = extractCuisines(types);

    for (const cuisineName of cuisines) {
        const cuisineId = await getOrCreateCuisine(cuisineName);
        if (!cuisineId) continue;

        // Insert junction record
        await supabase.from('restaurant_cuisine').insert({
            restaurant_id: restaurantId,
            cuisine_id: cuisineId,
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
        const restaurantId = await insertRestaurant(placeDetails);

        // Insert stats
        console.log('  📊 Inserting stats...');
        await insertRestaurantStats(restaurantId, placeDetails);

        // Process photos
        console.log(
            `  📸 Processing photos (${Math.min((placeDetails.photos || []).length, CONFIG.MAX_PHOTOS_PER_RESTAURANT)})...`
        );
        await processPhotos(restaurantId, placeDetails.photos);

        // Insert reviews
        console.log(`  ⭐ Inserting reviews (${(placeDetails.reviews || []).length})...`);
        await insertReviews(restaurantId, placeDetails.reviews);

        // Insert hours
        console.log('  🕐 Inserting hours...');
        await insertHours(restaurantId, placeDetails.regularOpeningHours);

        // Insert place source
        console.log('  🔗 Inserting source tracking...');
        await insertPlaceSource(restaurantId, placeDetails);

        // Insert cuisines
        console.log('  🍽️  Inserting cuisines...');
        await insertCuisines(restaurantId, placeDetails.types);

        console.log(`  ✅ Completed successfully!`);

        return { success: true, skipped: false, restaurantId };
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
    console.log('════════════════════════════════════════════════════════\n');

    // Validate configuration
    validateConfig();

    console.log('Configuration:');
    console.log(
        `  Location: Austin, TX (${CONFIG.LOCATION.latitude}, ${CONFIG.LOCATION.longitude})`
    );
    console.log(`  Max Restaurants: ${CONFIG.MAX_RESTAURANTS}`);
    console.log(`  Max Photos per Restaurant: ${CONFIG.MAX_PHOTOS_PER_RESTAURANT}`);
    console.log(`  Rate Limit: ${CONFIG.MAX_REQUESTS_PER_SECOND} req/sec\n`);

    // Ensure storage bucket exists
    console.log('🗂️  Checking storage bucket...');
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === CONFIG.STORAGE_BUCKET);

    if (!bucketExists) {
        console.log(`  Creating bucket: ${CONFIG.STORAGE_BUCKET}...`);
        const { error } = await supabase.storage.createBucket(CONFIG.STORAGE_BUCKET, {
            public: true,
        });
        if (error) {
            console.error(`  ❌ Failed to create bucket: ${error.message}`);
            process.exit(1);
        }
    }
    console.log('  ✅ Bucket ready\n');

    const startTime = Date.now();

    try {
        // Step 1: Search for restaurants
        const places = await searchRestaurants();

        if (places.length === 0) {
            console.log('No restaurants found. Exiting.');
            return;
        }

        // Step 2: Process each restaurant
        const results = {
            total: places.length,
            succeeded: 0,
            skipped: 0,
            failed: 0,
        };

        console.log('════════════════════════════════════════════════════════');
        console.log('   Processing Restaurants');
        console.log('════════════════════════════════════════════════════════');

        for (let i = 0; i < places.length; i++) {
            const result = await processRestaurant(places[i], i, places.length);

            if (result.success) {
                if (result.skipped) {
                    results.skipped++;
                } else {
                    results.succeeded++;
                }
            } else {
                results.failed++;
            }

            // Progress report every N restaurants
            if ((i + 1) % CONFIG.LOG_PROGRESS_EVERY === 0) {
                console.log('\n────────────────────────────────────────────────────────');
                console.log(`Progress: ${i + 1}/${places.length}`);
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
        console.log(`Total Restaurants: ${results.total}`);
        console.log(`✅ Successfully Ingested: ${results.succeeded}`);
        console.log(`⏭️  Skipped (Already Exist): ${results.skipped}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`\n⏱️  Total Time: ${duration}s`);
        console.log('\n════════════════════════════════════════════════════════\n');
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch((error) => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}

module.exports = { main };

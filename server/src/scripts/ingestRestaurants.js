#!/usr/bin/env node

/**
 * Comprehensive Restaurant Ingestion Script
 *
 * This script provides a complete end-to-end workflow for ingesting restaurants:
 * 1. Searches Google Places for restaurants in a given location
 * 2. Inserts restaurant data (skips duplicates)
 * 3. Tags restaurant images using OpenAI Vision API
 * 4. Tags restaurant reviews using OpenAI GPT-4o
 * 5. Calculates ambiance scores
 * 6. Calculates food quality scores
 *
 * Usage:
 *   node src/scripts/ingestRestaurants.js --lat=30.2672 --lng=-97.7431 --count=10 --radius=2000
 *
 * Parameters:
 *   --lat: Latitude of search center (required)
 *   --lng: Longitude of search center (required)
 *   --count: Number of restaurants to ingest (required)
 *   --radius: Search radius in meters (default: 2000)
 *   --location-name: Optional name for the location (default: "Custom Location")
 */

import dotenv from 'dotenv';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Initialize clients
const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // Google Places API configuration
    GOOGLE_API_KEY: process.env.GOOGLE_PLACES_API_KEY?.replace(/["']/g, '').trim(),
    GOOGLE_API_BASE_URL: 'https://places.googleapis.com/v1',
    MAX_RESULTS_PER_SEARCH: 20, // Google API limit per request (will use pagination for more)

    // Rate limiting
    DELAY_BETWEEN_REQUESTS: 250, // ms
    DELAY_BETWEEN_PAGES: 2000, // ms between pagination requests (required by Google)
    RETRY_DELAY_MS: 1000, // Initial retry delay (exponential backoff)
    MAX_RETRIES: 3,

    // OpenAI configuration
    OPENAI_MODEL: 'gpt-4o',
    IMAGE_BATCH_SIZE: 5, // Process images in batches
    REVIEW_BATCH_SIZE: 10, // Process reviews in batches
    REQUEST_TIMEOUT_MS: 30000,
};

// Parse command line arguments
const args = process.argv.slice(2);
const parsedArgs = {};
args.forEach((arg) => {
    const [key, value] = arg.replace('--', '').split('=');
    parsedArgs[key] = value;
});

// Validate required arguments
function validateArgs() {
    const required = ['lat', 'lng', 'count'];
    const missing = required.filter((key) => !parsedArgs[key]);

    if (missing.length > 0) {
        console.error(`\n❌ Missing required arguments: ${missing.join(', ')}\n`);
        console.log('Usage:');
        console.log(
            '  node src/scripts/ingestRestaurants.js --lat=30.2672 --lng=-97.7431 --count=10 --radius=2000\n'
        );
        process.exit(1);
    }

    if (!CONFIG.GOOGLE_API_KEY) {
        console.error('\n❌ Missing GOOGLE_PLACES_API_KEY in .env file\n');
        process.exit(1);
    }

    if (!process.env.OPENAI_API_KEY) {
        console.error('\n❌ Missing OPENAI_API_KEY in .env file\n');
        process.exit(1);
    }
}

const SEARCH_CONFIG = {
    lat: parseFloat(parsedArgs.lat),
    lng: parseFloat(parsedArgs.lng),
    count: 150,// parseInt(parsedArgs.count),
    radius: parseInt(parsedArgs.radius) || 2000,
    locationName: parsedArgs['location-name'] || 'Custom Location',
};

// ============================================================================
// RATE LIMITING & RETRY HELPERS
// ============================================================================

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

async function retry(fn, maxRetries = CONFIG.MAX_RETRIES, context = 'operation') {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt < maxRetries) {
                const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt);
                console.warn(
                    `  ⚠️  Retry ${attempt + 1}/${maxRetries} for ${context} after ${delay}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw new Error(`Failed after ${maxRetries} retries (${context}): ${lastError.message}`);
}

// ============================================================================
// STEP 1: GOOGLE PLACES INGESTION
// ============================================================================

async function searchRestaurants(location, pageToken = null) {
    await rateLimiter.throttle();

    try {
        const requestBody = {
            textQuery: `restaurants in ${location.locationName}`,
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
        };

        // Add page token if provided
        if (pageToken) {
            requestBody.pageToken = pageToken;
        }

        const response = await fetch(`${CONFIG.GOOGLE_API_BASE_URL}/places:searchText`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': CONFIG.GOOGLE_API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,nextPageToken',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        return {
            places: data.places || [],
            nextPageToken: data.nextPageToken || null,
        };
    } catch (error) {
        console.error(`  ❌ Error searching restaurants:`, error.message);
        return { places: [], nextPageToken: null };
    }
}

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

async function restaurantExists(googlePlaceId, name, lat, lng) {
    // Check by Google Place ID
    const bySourceId = await prisma.restaurant.findFirst({
        where: {
            sourceId: googlePlaceId,
            source: 'GOOGLE',
        },
    });

    if (bySourceId) return true;

    // Check by name and location (within 50 meters)
    const nearby = await prisma.restaurant.findMany({
        where: {
            name: name,
        },
    });

    // Simple distance check (approximate)
    for (const restaurant of nearby) {
        const latDiff = Math.abs(restaurant.lat - lat);
        const lngDiff = Math.abs(restaurant.long - lng);
        // Roughly 0.0005 degrees ≈ 50 meters
        if (latDiff < 0.0005 && lngDiff < 0.0005) {
            return true;
        }
    }

    return false;
}

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

async function insertRestaurant(placeDetails) {
    const priceString = mapPriceLevel(placeDetails.priceLevel);

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

    // Insert images
    if (placeDetails.photos && placeDetails.photos.length > 0) {
        const imagesToInsert = placeDetails.photos.slice(0, 8).map((photo) => ({
            restaurantId: restaurant.id,
            url: `${CONFIG.GOOGLE_API_BASE_URL}/${photo.name}/media?maxWidthPx=800&key=${CONFIG.GOOGLE_API_KEY}`,
            source: 'GOOGLE',
            sourceId: photo.name,
        }));

        await prisma.restaurantImage.createMany({
            data: imagesToInsert,
            skipDuplicates: true,
        });
    }

    // Insert reviews
    if (placeDetails.reviews && placeDetails.reviews.length > 0) {
        const reviewsData = placeDetails.reviews.slice(0, 5).map((review) => ({
            restaurantId: restaurant.id,
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

    // Insert cuisines as tags
    const cuisines = extractCuisines(placeDetails.types);
    const tagTypeId = await getCuisineTagType();

    for (const cuisineName of cuisines) {
        const tagId = await getOrCreateCuisineTag(cuisineName, tagTypeId);
        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: {
                tags: {
                    connect: { id: tagId },
                },
            },
        });
    }

    return restaurant;
}

// ============================================================================
// STEP 2: TAG RESTAURANT IMAGES
// ============================================================================

async function urlToBase64(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: CONFIG.REQUEST_TIMEOUT_MS,
        });

        const buffer = Buffer.from(response.data, 'binary');
        const base64 = buffer.toString('base64');
        const mimeType = response.headers['content-type'] || 'image/jpeg';

        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        throw new Error(`Failed to fetch image from URL: ${error.message}`);
    }
}

async function classifyImage(imageUrl) {
    const systemPrompt = `You are classifying restaurant images and generating descriptive tags.

Return JSON only:
{
  "category": "ambiance" | "food" | "other",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Rules:
- Generate EXACTLY 5 contextual, multi-word descriptive tags (2-4 words each).
- Tags should be specific and descriptive (e.g., "rustic wooden decor", "crispy golden fries", "intimate candlelit atmosphere").
- Avoid generic single words - be specific and contextual.
- Tags should capture the essence, mood, quality, and distinctive features of the image.`;

    try {
        const base64Image = await urlToBase64(imageUrl);

        const response = await openai.chat.completions.create({
            model: CONFIG.OPENAI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: base64Image,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Empty response from OpenAI API');
        }

        const result = JSON.parse(content);
        return {
            category: result.category,
            tags: result.tags,
        };
    } catch (error) {
        throw new Error(`Image classification failed: ${error.message}`);
    }
}

async function getOrCreateTagType(value) {
    let tagType = await prisma.tagType.findUnique({
        where: { value },
    });

    if (!tagType) {
        tagType = await prisma.tagType.create({
            data: { value },
        });
    }

    return tagType;
}

async function getOrCreateTag(value, tagTypeId, source = 'openai-vision') {
    let tag = await prisma.tag.findFirst({
        where: {
            value,
            tagTypeId,
        },
    });

    if (!tag) {
        tag = await prisma.tag.create({
            data: {
                value,
                tagTypeId,
                source,
            },
        });
    }

    return tag;
}

async function tagImage(image) {
    try {
        console.log(`    📸 Tagging image ${image.id}...`);

        const classification = await retry(
            () => classifyImage(image.url),
            CONFIG.MAX_RETRIES,
            `image ${image.id}`
        );

        const tagTypeValue = classification.category === 'food' ? 'cuisine' : 'ambiance';
        const tagType = await getOrCreateTagType(tagTypeValue);

        const tags = await Promise.all(
            classification.tags.map((tagValue) =>
                getOrCreateTag(tagValue.trim(), tagType.id, 'openai-vision')
            )
        );

        await prisma.restaurantImage.update({
            where: { id: image.id },
            data: {
                tags: {
                    connect: tags.map((tag) => ({ id: tag.id })),
                },
            },
        });

        console.log(`    ✅ Image tagged: ${classification.category}`);
        return true;
    } catch (error) {
        console.error(`    ❌ Failed to tag image ${image.id}: ${error.message}`);
        return false;
    }
}

// ============================================================================
// STEP 3: TAG RESTAURANT REVIEWS
// ============================================================================

async function extractKeywordsFromReview(reviewText) {
    const systemPrompt = `You are analyzing restaurant reviews to extract descriptive, multi-word contextual tags.

Return JSON only:
{
  "tags": [
    {"phrase": "descriptive phrase 1", "category": "cuisine" | "ambiance"},
    {"phrase": "descriptive phrase 2", "category": "cuisine" | "ambiance"},
    {"phrase": "descriptive phrase 3", "category": "cuisine" | "ambiance"},
    {"phrase": "descriptive phrase 4", "category": "cuisine" | "ambiance"},
    {"phrase": "descriptive phrase 5", "category": "cuisine" | "ambiance"}
  ]
}

Rules:
- Extract EXACTLY 5 descriptive, contextual tags from the review.
- Tags should be short phrases (2-5 words) that capture specific aspects of the experience.
- Categorize each tag as either "cuisine" (food-related) or "ambiance" (atmosphere/environment-related).
- Choose the most meaningful and distinctive phrases that capture the essence of the review.
- Phrases should be descriptive and specific (e.g., "perfectly cooked pasta", "cozy romantic atmosphere", "authentic Italian flavors").
- Avoid generic phrases - be specific and contextual to what the review describes.
- Convert all phrases to lowercase.
- Prioritize phrases that would help users discover similar restaurants or experiences.`;

    try {
        const response = await openai.chat.completions.create({
            model: CONFIG.OPENAI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: `Extract 5 contextual tags from this review:\n\n${reviewText}`,
                },
            ],
            max_tokens: 400,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Empty response from OpenAI API');
        }

        const result = JSON.parse(content);
        return result;
    } catch (error) {
        throw new Error(`Tag extraction failed: ${error.message}`);
    }
}

async function tagReview(review) {
    try {
        console.log(`    📝 Tagging review ${review.id}...`);

        const taggingResult = await retry(
            () => extractKeywordsFromReview(review.review),
            CONFIG.MAX_RETRIES,
            `review ${review.id}`
        );

        const tagTypes = {};
        for (const tagPhrase of taggingResult.tags) {
            if (!tagTypes[tagPhrase.category]) {
                tagTypes[tagPhrase.category] = await getOrCreateTagType(tagPhrase.category);
            }
        }

        const tags = await Promise.all(
            taggingResult.tags.map((tagPhrase) =>
                getOrCreateTag(tagPhrase.phrase, tagTypes[tagPhrase.category].id, 'openai-gpt4o')
            )
        );

        await prisma.review.update({
            where: { id: review.id },
            data: {
                tags: {
                    connect: tags.map((tag) => ({ id: tag.id })),
                },
            },
        });

        console.log(`    ✅ Review tagged with ${tags.length} tags`);
        return true;
    } catch (error) {
        console.error(`    ❌ Failed to tag review ${review.id}: ${error.message}`);
        return false;
    }
}

// ============================================================================
// STEP 4: CALCULATE AMBIANCE SCORE
// ============================================================================

async function analyzeAmbiance(restaurant) {
    try {
        const imageTags = restaurant.images.flatMap((i) => i.tags.map((t) => t.value));
        const reviewTags = restaurant.reviews.flatMap((r) => r.tags.map((t) => t.value));

        const priceRange = restaurant.price || 'Unknown';

        const prompt = `Analyze this restaurant's ambiance based on the following data.

Restaurant: ${restaurant.name}
Price Range: ${priceRange}
Image tags: ${imageTags.join(', ')}
Review tags: ${reviewTags.join(', ')}

IMPORTANT: "Good ambiance" is context-dependent and should match the restaurant's style. However, EXCEPTIONAL ambiance goes beyond just being "appropriate" - it means the atmosphere is notably memorable, immersive, well-designed, and creates a distinct experience.

Rate the following ambiance qualities from 0-10:

- vibrant: energetic, colorful, lively atmosphere with strong visual appeal
- romantic: suitable for dates, intimate atmosphere, mood-setting lighting/decor
- trendy: modern, stylish, instagram-worthy, contemporary design
- stylish: well-designed, aesthetically pleasing, cohesive visual identity
- immersive: transportive theming, creates a distinct world or experience
- inviting: warm, welcoming, makes guests want to stay and return

Provide an overall "ambiance quality" score from 0-10:
- 9-10: Exceptional, memorable, immersive experience
- 7-8: Very good, well-designed, notable atmosphere
- 5-6: Good, pleasant, appropriate but not particularly distinctive
- 3-4: Average, functional but forgettable
- 0-2: Poor, lacking, or uncomfortable

Return as JSON: { vibrant: n, romantic: n, trendy: n, stylish: n, immersive: n, inviting: n, overall: n }`;

        const response = await openai.chat.completions.create({
            model: CONFIG.OPENAI_MODEL,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
        });

        const content = response.choices[0].message.content;
        const scores = JSON.parse(content);

        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { ambianceScore: scores.overall },
        });

        console.log(`    🎯 Ambiance score: ${scores.overall}/10`);
        return true;
    } catch (error) {
        console.error(`    ❌ Failed to analyze ambiance: ${error.message}`);
        return false;
    }
}

// ============================================================================
// STEP 5: CALCULATE FOOD QUALITY SCORE
// ============================================================================

async function analyzeFoodQuality(restaurant) {
    try {
        const imageTags = restaurant.images.flatMap((i) => i.tags.map((t) => t.value));
        const reviewTags = restaurant.reviews.flatMap((r) => r.tags.map((t) => t.value));

        const priceRange = restaurant.price || 'Unknown';

        const prompt = `Analyze this restaurant's food quality based on the following data.

Restaurant: ${restaurant.name}
Price Range: ${priceRange}
Image tags: ${imageTags.join(', ')}
Review tags: ${reviewTags.join(', ')}

IMPORTANT: "Good food" is context-dependent and should match the restaurant's concept. However, EXCEPTIONAL food goes beyond just being "appropriate" - it means the cuisine is notably memorable, skillfully executed, uses quality ingredients, and delivers a distinct culinary experience.

Rate the following food quality attributes from 0-10:

- flavorful: bold, well-balanced, complex flavors that create memorable taste experiences
- authentic: true to culinary tradition, respects cultural roots, genuine execution (when applicable)
- satisfying: portion sizes appropriate, leaves diners content, well-composed and fulfilling dishes
- comforting: soul-satisfying, evokes warmth and nostalgia, creates emotional connection through food
- aromatic: enticing smells, fragrant spices/herbs, dishes that engage the senses before first bite
- appetizing: visually appealing presentation, dishes that look as good as they taste, inviting plating

Provide an overall "food quality" score from 0-10:
- 9-10: Exceptional, memorable, masterfully executed cuisine
- 7-8: Very good, skillfully prepared, notable quality and technique
- 5-6: Good, tasty, well-prepared but not particularly distinctive
- 3-4: Average, acceptable but forgettable, lacks refinement
- 0-2: Poor, low-quality ingredients or execution

Return as JSON: { flavorful: n, authentic: n, satisfying: n, comforting: n, aromatic: n, appetizing: n, overall: n }`;

        const response = await openai.chat.completions.create({
            model: CONFIG.OPENAI_MODEL,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
        });

        const content = response.choices[0].message.content;
        const scores = JSON.parse(content);

        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { foodQualityScore: scores.overall },
        });

        console.log(`    🍽️  Food quality score: ${scores.overall}/10`);
        return true;
    } catch (error) {
        console.error(`    ❌ Failed to analyze food quality: ${error.message}`);
        return false;
    }
}

// ============================================================================
// MAIN PROCESSING FUNCTION
// ============================================================================

async function processRestaurant(place, index, total) {
    const placeId = place.id;
    const placeName = place.displayName?.text || 'Unknown';

    console.log(`\n[${ index + 1}/${total}] 🍽️  Processing: ${placeName}`);
    console.log(`  Place ID: ${placeId}`);

    try {
        // STEP 1: Check if already exists
        console.log('  🔍 Checking for duplicates...');
        const placeDetails = await retry(() => getPlaceDetails(placeId));

        const exists = await restaurantExists(
            placeId,
            placeDetails.displayName?.text || 'Unknown',
            placeDetails.location?.latitude || 0,
            placeDetails.location?.longitude || 0
        );

        if (exists) {
            console.log('  ⏭️  Already exists, skipping...');
            return { success: true, skipped: true };
        }

        // STEP 2: Insert restaurant
        console.log('  💾 Inserting restaurant data...');
        const restaurant = await insertRestaurant(placeDetails);
        console.log(
            `  ✅ Restaurant inserted with ${placeDetails.photos?.length || 0} images and ${
                placeDetails.reviews?.length || 0
            } reviews`
        );

        // STEP 3: Tag images
        console.log('  📸 Tagging restaurant images...');
        const images = await prisma.restaurantImage.findMany({
            where: { restaurantId: restaurant.id },
        });

        for (const image of images) {
            await tagImage(image);
            await new Promise((resolve) => setTimeout(resolve, 500)); // Throttle
        }

        // STEP 4: Tag reviews
        console.log('  📝 Tagging restaurant reviews...');
        const reviews = await prisma.review.findMany({
            where: { restaurantId: restaurant.id },
        });

        for (const review of reviews) {
            if (review.review && review.review.trim().length > 0) {
                await tagReview(review);
                await new Promise((resolve) => setTimeout(resolve, 500)); // Throttle
            }
        }

        // Fetch restaurant with all tags for scoring
        const restaurantWithTags = await prisma.restaurant.findUnique({
            where: { id: restaurant.id },
            include: {
                images: {
                    include: {
                        tags: true,
                    },
                },
                reviews: {
                    include: {
                        tags: true,
                    },
                },
            },
        });

        // STEP 5: Calculate ambiance score
        console.log('  🎨 Calculating ambiance score...');
        await analyzeAmbiance(restaurantWithTags);

        // STEP 6: Calculate food quality score
        console.log('  🍽️  Calculating food quality score...');
        await analyzeFoodQuality(restaurantWithTags);

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
    console.log('   Comprehensive Restaurant Ingestion Script');
    console.log('════════════════════════════════════════════════════════\n');

    // Validate configuration
    validateArgs();

    console.log('Configuration:');
    console.log(`  Location: ${SEARCH_CONFIG.locationName}`);
    console.log(`  Latitude: ${SEARCH_CONFIG.lat}`);
    console.log(`  Longitude: ${SEARCH_CONFIG.lng}`);
    console.log(`  Radius: ${SEARCH_CONFIG.radius}m`);
    console.log(`  Target Count: ${SEARCH_CONFIG.count}\n`);

    const startTime = Date.now();

    try {
        // Search for restaurants with pagination
        console.log('🔍 Searching for restaurants...\n');

        let allPlaces = [];
        let nextPageToken = null;
        let pageNum = 1;

        // Keep fetching until we have enough restaurants or no more results
        while (allPlaces.length < SEARCH_CONFIG.count) {
            console.log(`  Fetching page ${pageNum}...`);

            const result = await searchRestaurants(SEARCH_CONFIG, nextPageToken);

            if (result.places.length === 0) {
                console.log(`  No more restaurants available.`);
                break;
            }

            allPlaces = allPlaces.concat(result.places);
            console.log(`  Found ${result.places.length} restaurants (Total: ${allPlaces.length})`);

            nextPageToken = result.nextPageToken;

            // If we have enough restaurants or no more pages, stop
            if (allPlaces.length >= SEARCH_CONFIG.count || !nextPageToken) {
                break;
            }

            // Google requires a short delay between pagination requests
            console.log(`  Waiting before next page...`);
            await new Promise((resolve) => setTimeout(resolve, CONFIG.DELAY_BETWEEN_PAGES));
            pageNum++;
        }

        console.log(`\n  Total found: ${allPlaces.length} restaurants\n`);

        if (allPlaces.length === 0) {
            console.log('No restaurants found. Exiting.');
            return;
        }

        const placesToProcess = allPlaces.slice(0, SEARCH_CONFIG.count);

        console.log('════════════════════════════════════════════════════════');
        console.log(`   Processing ${placesToProcess.length} restaurants`);
        console.log('════════════════════════════════════════════════════════');

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

main();

// Run the script
// if (require.main === module) {
//     main().catch((error) => {
//         console.error('Unhandled error:', error);
//         prisma.$disconnect();
//         process.exit(1);
//     });
// }

// export { main };

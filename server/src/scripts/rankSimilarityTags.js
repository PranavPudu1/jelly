/**
 * Restaurant Ambiance Score Computation Script
 *
 * This script precomputes similarity scores for restaurants based on their ambiance tags.
 * It uses OpenAI embeddings to compare restaurant tags against ideal ambiance characteristics.
 *
 * How it works:
 * 1. Defines ideal ambiance tags (editable below)
 * 2. Generates embeddings for ideal tags and averages them
 * 3. For each restaurant:
 *    - Aggregates all ambiance tags (from restaurant tags AND review tags)
 *    - Generates embeddings for the restaurant's ambiance tags
 *    - Computes cosine similarity between restaurant and ideal embeddings
 *    - Normalizes score to 0-1 range
 *    - Updates the restaurant's ambianceScore in the database
 *
 * Features:
 * - Batch processing for efficiency
 * - Progress logging
 * - Error handling with retry logic
 * - Handles restaurants with no ambiance tags (score = 0)
 *
 * Usage:
 *   node src/scripts/rankSimilarityTags.js
 */

import dotenv from 'dotenv';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize clients
const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================
// EDIT THESE IDEAL TAGS TO MATCH YOUR BUSINESS REQUIREMENTS
// ============================================================

const IDEAL_AMBIANCE_TAGS = [
    'cozy',
    'romantic',
    'intimate',
    'stylish',
    'warm',
    'inviting',
];

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    BATCH_SIZE: 10, // Number of restaurants to process concurrently
    MAX_RETRIES: 3, // Maximum retry attempts for failed API calls
    RETRY_DELAY_MS: 1000, // Initial retry delay (exponential backoff)
    OPENAI_EMBEDDING_MODEL: 'text-embedding-3-small', // OpenAI embedding model
    EMBEDDING_DIMENSIONS: 1536, // Dimensions for text-embedding-3-small
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Implements exponential backoff retry logic
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {string} context - Context description for logging
 * @returns {Promise<any>} Result of the function
 */
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
                    `⚠️  Retry ${attempt + 1}/${maxRetries} for ${context} after ${delay}ms. Error: ${error.message}`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw new Error(`Failed after ${maxRetries} retries (${context}): ${lastError.message}`);
}

/**
 * Generates an embedding for a text using OpenAI API
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} Embedding vector
 */
async function generateEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: CONFIG.OPENAI_EMBEDDING_MODEL,
            input: text,
        });

        return response.data[0].embedding;
    } catch (error) {
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
}

/**
 * Computes the average of multiple embedding vectors
 * @param {number[][]} embeddings - Array of embedding vectors
 * @returns {number[]} Average embedding vector
 */
function averageEmbeddings(embeddings) {
    if (embeddings.length === 0) {
        return new Array(CONFIG.EMBEDDING_DIMENSIONS).fill(0);
    }

    const sum = new Array(CONFIG.EMBEDDING_DIMENSIONS).fill(0);

    embeddings.forEach((embedding) => {
        embedding.forEach((value, index) => {
            sum[index] += value;
        });
    });

    return sum.map((value) => value / embeddings.length);
}

/**
 * Computes cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} Cosine similarity (0-1 range, where 1 is most similar)
 */
function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    // Cosine similarity ranges from -1 to 1, normalize to 0-1
    const similarity = dotProduct / (magnitudeA * magnitudeB);
    return (similarity + 1) / 2; // Convert from [-1, 1] to [0, 1]
}

// ============================================================================
// CORE PROCESSING FUNCTIONS
// ============================================================================

/**
 * Generates the ideal ambiance embedding (average of all ideal tags)
 * @returns {Promise<number[]>} Average embedding of ideal tags
 */
async function generateIdealAmbianceEmbedding() {
    console.log(`\n📊 Generating ideal ambiance embedding from ${IDEAL_AMBIANCE_TAGS.length} tags...`);
    console.log(`   Ideal tags: ${IDEAL_AMBIANCE_TAGS.join(', ')}`);

    try {
        const embeddings = await Promise.all(
            IDEAL_AMBIANCE_TAGS.map((tag) =>
                retry(() => generateEmbedding(tag), CONFIG.MAX_RETRIES, `ideal tag "${tag}"`)
            )
        );

        const averageEmbedding = averageEmbeddings(embeddings);
        console.log(`✅ Generated ideal ambiance embedding (${averageEmbedding.length} dimensions)`);

        return averageEmbedding;
    } catch (error) {
        throw new Error(`Failed to generate ideal ambiance embedding: ${error.message}`);
    }
}

/**
 * Gets the TagType ID for "ambiance"
 * @returns {Promise<string|null>} TagType ID or null if not found
 */
async function getAmbianceTagTypeId() {
    try {
        const tagType = await prisma.tagType.findUnique({
            where: { value: 'ambiance' },
        });

        if (!tagType) {
            console.warn('⚠️  No "ambiance" TagType found in database');
            return null;
        }

        return tagType.id;
    } catch (error) {
        throw new Error(`Failed to get ambiance TagType: ${error.message}`);
    }
}

/**
 * Aggregates all ambiance tags for a restaurant (from both direct tags and review tags)
 * @param {string} restaurantId - The restaurant ID
 * @param {string} ambianceTagTypeId - The ambiance TagType ID
 * @returns {Promise<string[]>} Array of unique ambiance tag values
 */
async function getRestaurantAmbianceTags(restaurantId, ambianceTagTypeId) {
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: {
                // Direct restaurant tags
                tags: {
                    where: { tagTypeId: ambianceTagTypeId },
                },
                // Restaurant images with ambiance tags
                images: {
                    include: {
                        tags: {
                            where: { tagTypeId: ambianceTagTypeId },
                        },
                    },
                },
                // Reviews with ambiance tags
                reviews: {
                    include: {
                        tags: {
                            where: { tagTypeId: ambianceTagTypeId },
                        },
                    },
                },
            },
        });

        if (!restaurant) {
            throw new Error(`Restaurant ${restaurantId} not found`);
        }

        // Collect all tag values
        const tagValues = new Set();

        // Direct restaurant tags
        restaurant.tags.forEach((tag) => tagValues.add(tag.value));

        // Tags from images
        restaurant.images.forEach((image) => {
            image.tags.forEach((tag) => tagValues.add(tag.value));
        });

        // Tags from reviews
        restaurant.reviews.forEach((review) => {
            review.tags.forEach((tag) => tagValues.add(tag.value));
        });

        return Array.from(tagValues);
    } catch (error) {
        throw new Error(`Failed to get ambiance tags for restaurant ${restaurantId}: ${error.message}`);
    }
}

/**
 * Processes a single restaurant and computes its ambiance score
 * @param {object} restaurant - Restaurant object from database
 * @param {number[]} idealEmbedding - The ideal ambiance embedding
 * @param {string} ambianceTagTypeId - The ambiance TagType ID
 * @returns {Promise<object>} Result with success status and score
 */
async function processRestaurant(restaurant, idealEmbedding, ambianceTagTypeId) {
    const startTime = Date.now();

    try {
        console.log(`\n🍽️  Processing: ${restaurant.name} (ID: ${restaurant.id})`);

        // Get all ambiance tags for this restaurant
        const ambianceTags = await getRestaurantAmbianceTags(restaurant.id, ambianceTagTypeId);

        if (ambianceTags.length === 0) {
            console.log(`   ⚠️  No ambiance tags found. Setting score to 0.`);

            // Update with score of 0
            await prisma.restaurant.update({
                where: { id: restaurant.id },
                data: { ambianceScore: 0 },
            });

            const duration = Date.now() - startTime;
            console.log(`   ✅ Score: 0.00 (no tags) - Updated in ${duration}ms`);

            return { success: true, score: 0, tagCount: 0 };
        }

        console.log(`   📋 Found ${ambianceTags.length} ambiance tags: ${ambianceTags.join(', ')}`);

        // Generate embeddings for all restaurant ambiance tags
        console.log(`   🔄 Generating embeddings...`);
        const restaurantEmbeddings = await Promise.all(
            ambianceTags.map((tag) =>
                retry(
                    () => generateEmbedding(tag),
                    CONFIG.MAX_RETRIES,
                    `restaurant ${restaurant.name} tag "${tag}"`
                )
            )
        );

        // Average the restaurant's tag embeddings
        const restaurantAvgEmbedding = averageEmbeddings(restaurantEmbeddings);

        // Compute cosine similarity
        const similarity = cosineSimilarity(idealEmbedding, restaurantAvgEmbedding);

        // Update the restaurant's ambianceScore
        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { ambianceScore: similarity },
        });

        const duration = Date.now() - startTime;
        console.log(`   ✅ Score: ${similarity.toFixed(4)} (${ambianceTags.length} tags) - Updated in ${duration}ms`);

        return { success: true, score: similarity, tagCount: ambianceTags.length };
    } catch (error) {
        console.error(`   ❌ Failed to process ${restaurant.name}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Processes a batch of restaurants concurrently
 * @param {Array<object>} restaurants - Array of restaurant objects
 * @param {number[]} idealEmbedding - The ideal ambiance embedding
 * @param {string} ambianceTagTypeId - The ambiance TagType ID
 * @returns {Promise<object>} Processing statistics
 */
async function processBatch(restaurants, idealEmbedding, ambianceTagTypeId) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔄 Processing batch of ${restaurants.length} restaurants...`);
    console.log(`${'='.repeat(70)}`);

    const results = await Promise.allSettled(
        restaurants.map((restaurant) =>
            processRestaurant(restaurant, idealEmbedding, ambianceTagTypeId)
        )
    );

    const stats = {
        total: results.length,
        successful: 0,
        failed: 0,
        withTags: 0,
        withoutTags: 0,
        totalTags: 0,
        avgScore: 0,
    };

    let scoreSum = 0;

    results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
            stats.successful++;
            stats.totalTags += result.value.tagCount;
            scoreSum += result.value.score;

            if (result.value.tagCount > 0) {
                stats.withTags++;
            } else {
                stats.withoutTags++;
            }
        } else {
            stats.failed++;
        }
    });

    stats.avgScore = stats.successful > 0 ? scoreSum / stats.successful : 0;

    console.log(`\n📊 Batch complete:`);
    console.log(`   ✅ Successful: ${stats.successful}/${stats.total}`);
    console.log(`   ❌ Failed: ${stats.failed}`);
    console.log(`   🏷️  Restaurants with ambiance tags: ${stats.withTags}`);
    console.log(`   ⚠️  Restaurants without ambiance tags: ${stats.withoutTags}`);
    console.log(`   📈 Average score: ${stats.avgScore.toFixed(4)}`);

    return stats;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main function to orchestrate the score computation process
 */
async function run() {
    console.log('🚀 Starting restaurant ambiance score computation\n');
    console.log(`Configuration:
  - Batch size: ${CONFIG.BATCH_SIZE}
  - Max retries: ${CONFIG.MAX_RETRIES}
  - OpenAI model: ${CONFIG.OPENAI_EMBEDDING_MODEL}
  - Embedding dimensions: ${CONFIG.EMBEDDING_DIMENSIONS}
\n`);

    const startTime = Date.now();
    const globalStats = {
        totalProcessed: 0,
        totalSuccessful: 0,
        totalFailed: 0,
        totalWithTags: 0,
        totalWithoutTags: 0,
        totalTags: 0,
        avgScore: 0,
    };

    try {
        // Validate environment
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }

        // Generate ideal ambiance embedding
        const idealEmbedding = await generateIdealAmbianceEmbedding();

        // Get ambiance TagType ID
        const ambianceTagTypeId = await getAmbianceTagTypeId();
        if (!ambianceTagTypeId) {
            throw new Error('Cannot proceed without "ambiance" TagType. Please create it first.');
        }

        // Get total count of restaurants
        const totalRestaurants = await prisma.restaurant.count();
        console.log(`\n📍 Found ${totalRestaurants} restaurants to process\n`);

        let batchNumber = 0;
        let skip = 0;
        let hasMoreRestaurants = true;
        let scoreSum = 0;

        while (hasMoreRestaurants) {
            batchNumber++;

            // Fetch next batch of restaurants
            const restaurants = await prisma.restaurant.findMany({
                take: CONFIG.BATCH_SIZE,
                skip: skip,
                orderBy: { dateAdded: 'asc' },
            });

            if (restaurants.length === 0) {
                console.log('\n✨ No more restaurants to process. Complete!');
                hasMoreRestaurants = false;
                break;
            }

            // Process the batch
            const batchStats = await processBatch(restaurants, idealEmbedding, ambianceTagTypeId);

            // Update global statistics
            globalStats.totalProcessed += batchStats.total;
            globalStats.totalSuccessful += batchStats.successful;
            globalStats.totalFailed += batchStats.failed;
            globalStats.totalWithTags += batchStats.withTags;
            globalStats.totalWithoutTags += batchStats.withoutTags;
            globalStats.totalTags += batchStats.totalTags;
            scoreSum += batchStats.avgScore * batchStats.successful;

            // Update skip for next batch
            skip += CONFIG.BATCH_SIZE;

            // Check if we're done
            if (restaurants.length < CONFIG.BATCH_SIZE || skip >= totalRestaurants) {
                console.log('\n✨ Processed all restaurants!');
                hasMoreRestaurants = false;
            }
        }

        // Calculate global average score
        globalStats.avgScore =
            globalStats.totalSuccessful > 0 ? scoreSum / globalStats.totalSuccessful : 0;

        // Final summary
        const duration = Date.now() - startTime;
        const durationSec = (duration / 1000).toFixed(2);

        console.log(`\n${'='.repeat(70)}`);
        console.log('FINAL SUMMARY');
        console.log(`${'='.repeat(70)}`);
        console.log(`Total restaurants processed: ${globalStats.totalProcessed}`);
        console.log(`✅ Successful: ${globalStats.totalSuccessful}`);
        console.log(`❌ Failed: ${globalStats.totalFailed}`);
        console.log(`🏷️  Restaurants with ambiance tags: ${globalStats.totalWithTags}`);
        console.log(`⚠️  Restaurants without ambiance tags: ${globalStats.totalWithoutTags}`);
        console.log(`📊 Total ambiance tags processed: ${globalStats.totalTags}`);
        console.log(`📈 Average ambiance score: ${globalStats.avgScore.toFixed(4)}`);
        console.log(`⏱️  Total duration: ${durationSec}s`);
        console.log(
            `📈 Average time per restaurant: ${globalStats.totalProcessed > 0 ? (duration / globalStats.totalProcessed).toFixed(0) : 0}ms`
        );
        console.log(`${'='.repeat(70)}\n`);
    } catch (error) {
        console.error(`\n❌ Fatal error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    } finally {
        // Cleanup
        await prisma.$disconnect();
    }
}

// ============================================================================
// SCRIPT ENTRY POINT
// ============================================================================

// Execute the script
run()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });

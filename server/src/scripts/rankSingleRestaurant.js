/**
 * Single Restaurant Ambiance Analysis Script (GPT-4o)
 *
 * This script analyzes a restaurant's ambiance using GPT-4o based on image tags
 * and review tags. It generates scores for various ambiance qualities.
 *
 * How it works:
 * 1. Fetches restaurant data including images and reviews with their tags
 * 2. Sends all tag data to GPT-4o with a structured prompt
 * 3. Receives ambiance quality scores (romantic, lively, refined, cozy, trendy, unique, overall)
 * 4. Outputs results to a JSON file in src/scripts/output/
 *
 * Output format:
 * {
 *   "restaurant": { "id": "...", "name": "...", "category": "...", "priceRange": "..." },
 *   "analysis": {
 *     "timestamp": "...",
 *     "scores": {
 *       "romantic": 8,
 *       "lively": 7,
 *       "refined": 6,
 *       "cozy": 9,
 *       "trendy": 8,
 *       "unique": 10,
 *       "overall": 8
 *     },
 *     "imageTags": [...],
 *     "reviewTags": [...]
 *   }
 * }
 *
 * Usage:
 *   1. Set the RESTAURANT_NAME constant below
 *   2. Run: node src/scripts/rankSingleRestaurant.js
 *   3. Check output in src/scripts/output/{restaurant_name}_ambiance_scores.json
 */

import dotenv from 'dotenv';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

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

// ***** SET THE RESTAURANT NAME HERE *****
const RESTAURANT_NAME = "Alamo Drafthouse Cinema Mueller";

const CONFIG = {
    MAX_RETRIES: 3, // Maximum retry attempts for failed API calls
    RETRY_DELAY_MS: 1000, // Initial retry delay (exponential backoff)
    OPENAI_MODEL: 'gpt-4o', // OpenAI chat model
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
 * Analyzes restaurant ambiance using GPT-4o
 * @param {object} restaurant - Restaurant data with images and reviews
 * @returns {Promise<object>} Ambiance scores
 */
async function analyzeAmbianceWithLLM(restaurant) {
    try {
        const imageTags = restaurant.images.flatMap(i => i.tags.map(t => t.value));
        const reviewTags = restaurant.reviews.flatMap(r => r.tags.map(t => t.value));

        const prompt = `Analyze this restaurant's ambiance based on the following data.

Restaurant: ${restaurant.name}
Category: ${restaurant.category}
Price Range: ${restaurant.priceRange}
Image tags: ${imageTags.join(', ')}
Review tags: ${reviewTags.join(', ')}

IMPORTANT: "Good ambiance" is context-dependent and should match the restaurant's style. However, EXCEPTIONAL ambiance goes beyond just being "appropriate" - it means the atmosphere is notably memorable, immersive, well-designed, and creates a distinct experience.

Examples of ambiance quality levels:
- EXCEPTIONAL (8-10): Yamas Austin (Greek) - immersive Mediterranean atmosphere, distinctive blue/white aesthetic, transportive experience, cohesive theming, memorable design
- GOOD (6-7): Pleasant Greek restaurant - clean, some cultural touches, comfortable but not particularly memorable
- AVERAGE (4-5): Generic restaurant with standard decor, functional but forgettable atmosphere
- POOR (0-3): Lacking atmosphere, poorly maintained, or uncomfortable environment

A tiki bar with tropical/forest vibes can score 9-10 if the theming is immersive and well-executed. A minimalist modern restaurant can score 9-10 if the design is striking and intentional. The tags should reflect DISTINCTIVENESS and QUALITY of execution, not just appropriateness.

Rate the following ambiance qualities from 0-10:

- vibrant: energetic, colorful, lively atmosphere with strong visual appeal
- romantic: suitable for dates, intimate atmosphere, mood-setting lighting/decor
- trendy: modern, stylish, instagram-worthy, contemporary design
- stylish: well-designed, aesthetically pleasing, cohesive visual identity
- immersive: transportive theming, creates a distinct world or experience (CRITICAL for high scores)
- inviting: warm, welcoming, makes guests want to stay and return

Provide an overall "ambiance quality" score from 0-10:
- 9-10: Exceptional, memorable, immersive experience (like Yamas Austin)
- 7-8: Very good, well-designed, notable atmosphere
- 5-6: Good, pleasant, appropriate but not particularly distinctive
- 3-4: Average, functional but forgettable
- 0-2: Poor, lacking, or uncomfortable

The overall score should reflect how MEMORABLE and WELL-EXECUTED the ambiance is. A restaurant with rich, distinctive tags (e.g., "blue-domed", "Mediterranean", "vine-covered", "open-air") should score much higher than one with generic tags (e.g., "clean", "nice", "comfortable").

Return as JSON: { vibrant: n, romantic: n, trendy: n, stylish: n, immersive: n, inviting: n, overall: n }`;

        const response = await openai.chat.completions.create({
            model: CONFIG.OPENAI_MODEL,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
        });

        const content = response.choices[0].message.content;
        const scores = JSON.parse(content);

        return {
            scores,
            imageTags,
            reviewTags
        };
    } catch (error) {
        throw new Error(`Failed to analyze ambiance with LLM: ${error.message}`);
    }
}

// ============================================================================
// CORE PROCESSING FUNCTIONS
// ============================================================================

/**
 * Fetches restaurant data with all necessary tags
 * @param {string} restaurantName - The restaurant name
 * @returns {Promise<object>} Restaurant with images and reviews
 */
async function getRestaurantWithTags(restaurantName) {
    try {
        const restaurant = await prisma.restaurant.findFirst({
            where: { name: restaurantName },
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

        if (!restaurant) {
            throw new Error(`Restaurant "${restaurantName}" not found in database`);
        }

        return restaurant;
    } catch (error) {
        throw new Error(`Failed to fetch restaurant data: ${error.message}`);
    }
}

/**
 * Processes a single restaurant and analyzes its ambiance using GPT-4o
 * @param {object} restaurant - Restaurant object from database
 * @returns {Promise<object>} Result with ambiance scores
 */
async function processRestaurant(restaurant) {
    const startTime = Date.now();

    try {
        console.log(`\n🍽️  Processing: ${restaurant.name} (ID: ${restaurant.id})`);
        console.log(`   Category: ${restaurant.category}`);
        console.log(`   Price Range: ${restaurant.priceRange}`);
        console.log(`   Images: ${restaurant.images.length}`);
        console.log(`   Reviews: ${restaurant.reviews.length}`);

        // Count total tags
        const totalImageTags = restaurant.images.reduce((sum, img) => sum + img.tags.length, 0);
        const totalReviewTags = restaurant.reviews.reduce((sum, rev) => sum + rev.tags.length, 0);
        console.log(`   Image tags: ${totalImageTags}`);
        console.log(`   Review tags: ${totalReviewTags}`);

        if (totalImageTags === 0 && totalReviewTags === 0) {
            console.log(`   ⚠️  No tags found for analysis.`);
            const duration = Date.now() - startTime;
            console.log(`   ✅ Completed in ${duration}ms`);
            return { success: false, error: 'No tags available for analysis' };
        }

        // Analyze ambiance with GPT-4o
        console.log(`\n   🤖 Analyzing ambiance with GPT-4o...`);
        const result = await retry(
            () => analyzeAmbianceWithLLM(restaurant),
            CONFIG.MAX_RETRIES,
            `GPT-4o analysis for ${restaurant.name}`
        );

        const duration = Date.now() - startTime;
        console.log(`   ✅ Completed in ${duration}ms`);

// { vibrant: n, romantic: n, trendy: n, stylish: n, immersive: n, inviting: n, overall: n }

        // Display scores
        console.log(`\n   🎯 Ambiance Scores:`);
        console.log(`      Vibrant: ${result.scores.vibrant}/10`);
        console.log(`      Romantic: ${result.scores.romantic}/10`);
        console.log(`      Trendy: ${result.scores.trendy}/10`);
        console.log(`      Stylish: ${result.scores.stylish}/10`);
        console.log(`      Immersive: ${result.scores.immersive}/10`);
        console.log(`      Inviting: ${result.scores.inviting}/10`);
        console.log(`      Overall: ${result.scores.overall}/10`);

        return {
            success: true,
            scores: result.scores,
            imageTags: result.imageTags,
            reviewTags: result.reviewTags,
        };
    } catch (error) {
        console.error(`   ❌ Failed to process ${restaurant.name}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main function to orchestrate the ambiance analysis process
 */
async function run() {
    console.log('🚀 Starting single restaurant ambiance analysis (GPT-4o)\n');
    console.log(`Configuration:
  - Restaurant name: ${RESTAURANT_NAME}
  - Max retries: ${CONFIG.MAX_RETRIES}
  - OpenAI model: ${CONFIG.OPENAI_MODEL}
\n`);

    const startTime = Date.now();

    try {
        // Validate environment
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }

        // Find the restaurant by name and fetch all required data
        console.log(`🔍 Looking for restaurant: "${RESTAURANT_NAME}"...`);
        const restaurant = await getRestaurantWithTags(RESTAURANT_NAME);
        console.log(`✅ Found restaurant: ${restaurant.name} (ID: ${restaurant.id})`);

        // Process the restaurant
        console.log(`\n${'='.repeat(70)}`);
        const result = await processRestaurant(restaurant);
        console.log(`${'='.repeat(70)}`);

        if (!result.success) {
            throw new Error(result.error || 'Failed to analyze restaurant');
        }

        // Prepare output data
        const outputData = {
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                category: restaurant.category,
                priceRange: restaurant.priceRange,
            },
            analysis: {
                timestamp: new Date().toISOString(),
                scores: result.scores,
                imageTags: result.imageTags,
                reviewTags: result.reviewTags,
            },
        };

        // Create output directory if it doesn't exist
        const outputDir = path.join(process.cwd(), 'src', 'scripts', 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Generate filename from restaurant name
        const safeFileName = restaurant.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        const outputPath = path.join(outputDir, `${safeFileName}_ambiance_scores.json`);

        // Write to JSON file
        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

        console.log(`Image tags analyzed: ${result.imageTags.length}`);
        console.log(`Review tags analyzed: ${result.reviewTags.length}`);
        console.log(`📁 Output saved to: ${outputPath}`);
        console.log(`⏱️  Total duration: ${durationSec}s`);
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

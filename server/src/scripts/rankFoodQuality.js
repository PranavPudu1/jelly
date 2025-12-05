/**
 * Bulk Restaurant Food Quality Analysis Script (GPT-4o)
 *
 * This script analyzes ALL restaurants' food quality using GPT-4o based on image tags
 * and review tags. It generates scores for various food quality attributes and updates
 * the foodQualityScore field in the database.
 *
 * How it works:
 * 1. Fetches all restaurants from the database
 * 2. For each restaurant, analyzes food quality using GPT-4o
 * 3. Updates the restaurant's foodQualityScore field in the database
 * 4. Saves individual analysis results to JSON files
 * 5. Generates a summary report of all processed restaurants
 *
 * Usage:
 *   node src/scripts/rankFoodQuality.js
 *
 * Optional flags:
 *   --skip-existing: Skip restaurants that already have a foodQualityScore
 *   --limit=N: Only process first N restaurants
 *   --start-from=N: Skip first N restaurants
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

const CONFIG = {
    MAX_RETRIES: 3, // Maximum retry attempts for failed API calls
    RETRY_DELAY_MS: 1000, // Initial retry delay (exponential backoff)
    OPENAI_MODEL: 'gpt-4o', // OpenAI chat model
    BATCH_DELAY_MS: 500, // Delay between restaurants to avoid rate limits
};

// Parse command line arguments
const args = process.argv.slice(2);
const SKIP_EXISTING = args.includes('--skip-existing');
const LIMIT = args.find(arg => arg.startsWith('--limit='))?.split('=')[1];
const START_FROM = args.find(arg => arg.startsWith('--start-from='))?.split('=')[1];

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
 * Analyzes restaurant food quality using GPT-4o
 * @param {object} restaurant - Restaurant data with images and reviews
 * @returns {Promise<object>} Food quality scores
 */
async function analyzeFoodQualityWithLLM(restaurant) {
    try {
        const imageTags = restaurant.images.flatMap(i => i.tags.map(t => t.value));
        const reviewTags = restaurant.reviews.flatMap(r => r.tags.map(t => t.value));

        // Use price field from schema instead of priceRange
        const priceRange = restaurant.price || 'Unknown';

        const prompt = `Analyze this restaurant's food quality based on the following data.

Restaurant: ${restaurant.name}
Price Range: ${priceRange}
Image tags: ${imageTags.join(', ')}
Review tags: ${reviewTags.join(', ')}

IMPORTANT: "Good food quality" is context-dependent and should match the restaurant's style and price point. However, EXCEPTIONAL food quality goes beyond just being "appropriate" - it means the food is notably superior, memorable, skillfully prepared, and creates a distinct culinary experience.

Examples of food quality levels:
- EXCEPTIONAL (8-10): Michelin-starred or equivalent - extraordinary ingredients, masterful technique, innovative preparations, unforgettable flavors, perfect execution
- VERY GOOD (6-7): High-quality ingredients, skilled preparation, consistently delicious, well-executed dishes, above average for the category
- GOOD (4-5): Decent quality, satisfying food, competent preparation, meets expectations but not particularly memorable
- AVERAGE (2-3): Basic quality, inconsistent execution, standard ingredients, forgettable dishes
- POOR (0-1): Low quality ingredients, poor execution, disappointing or unpleasant food

A fine dining restaurant with tags like "wagyu", "truffle", "perfectly seared", "exquisite presentation" can score 9-10 if execution matches the premium ingredients. A taco truck with tags like "authentic", "fresh tortillas", "flavorful", "juicy meat" can also score 9-10 if the food is exceptionally well-executed for its category.

Rate the following food quality attributes from 0-10:

- freshness: ingredients are fresh, vibrant, high quality
- flavor: delicious, well-seasoned, balanced, memorable taste
- presentation: visually appealing, thoughtful plating, professional appearance
- technique: skillful preparation, proper cooking methods, culinary expertise
- authenticity: true to cuisine style, traditional methods, genuine recipes (if applicable)
- creativity: innovative dishes, unique combinations, artistic interpretations
- consistency: reliable quality, well-executed across dishes
- value: quality justifies the price point, good portion sizes for cost

Provide an overall "food quality" score from 0-10:
- 9-10: Exceptional, world-class food that's memorable and masterfully executed
- 7-8: Very good, high-quality food with skilled preparation
- 5-6: Good, satisfying food that meets expectations
- 3-4: Average, acceptable but nothing special
- 0-2: Poor, disappointing or low quality

The overall score should reflect how MEMORABLE and WELL-EXECUTED the food is. Focus on food-related tags like dish names, ingredients, cooking methods, taste descriptors, and food quality mentions in reviews. Ambiance tags should not heavily influence the food quality score.

Return as JSON: { freshness: n, flavor: n, presentation: n, technique: n, authenticity: n, creativity: n, consistency: n, value: n, overall: n }`;

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
        throw new Error(`Failed to analyze food quality with LLM: ${error.message}`);
    }
}

/**
 * Processes a single restaurant and analyzes its food quality using GPT-4o
 * @param {object} restaurant - Restaurant object from database
 * @param {number} index - Current index for progress tracking
 * @param {number} total - Total number of restaurants
 * @returns {Promise<object>} Result with food quality scores
 */
async function processRestaurant(restaurant, index, total) {
    const startTime = Date.now();

    try {
        console.log(`\n[${ index + 1}/${total}] 🍽️  Processing: ${restaurant.name}`);
        console.log(`   ID: ${restaurant.id}`);
        console.log(`   Current food quality score: ${restaurant.foodQualityScore || 'None'}`);
        console.log(`   Images: ${restaurant.images.length}`);
        console.log(`   Reviews: ${restaurant.reviews.length}`);

        // Count total tags
        const totalImageTags = restaurant.images.reduce((sum, img) => sum + img.tags.length, 0);
        const totalReviewTags = restaurant.reviews.reduce((sum, rev) => sum + rev.tags.length, 0);
        console.log(`   Image tags: ${totalImageTags}`);
        console.log(`   Review tags: ${totalReviewTags}`);

        if (totalImageTags === 0 && totalReviewTags === 0) {
            console.log(`   ⚠️  No tags found for analysis - skipping.`);
            const duration = Date.now() - startTime;
            console.log(`   ⏭️  Skipped in ${duration}ms`);
            return { success: false, skipped: true, reason: 'No tags available for analysis' };
        }

        // Analyze food quality with GPT-4o
        console.log(`   🤖 Analyzing food quality with GPT-4o...`);
        const result = await retry(
            () => analyzeFoodQualityWithLLM(restaurant),
            CONFIG.MAX_RETRIES,
            `GPT-4o analysis for ${restaurant.name}`
        );

        // Update database with overall food quality score
        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { foodQualityScore: result.scores.overall }
        });

        const duration = Date.now() - startTime;
        console.log(`   ✅ Completed in ${duration}ms`);

        // Display scores
        console.log(`\n   🎯 Food Quality Scores:`);
        console.log(`      Freshness: ${result.scores.freshness}/10`);
        console.log(`      Flavor: ${result.scores.flavor}/10`);
        console.log(`      Presentation: ${result.scores.presentation}/10`);
        console.log(`      Technique: ${result.scores.technique}/10`);
        console.log(`      Authenticity: ${result.scores.authenticity}/10`);
        console.log(`      Creativity: ${result.scores.creativity}/10`);
        console.log(`      Consistency: ${result.scores.consistency}/10`);
        console.log(`      Value: ${result.scores.value}/10`);
        console.log(`      Overall: ${result.scores.overall}/10 ⬅️  Saved to database`);

        return {
            success: true,
            scores: result.scores,
            imageTags: result.imageTags,
            reviewTags: result.reviewTags,
            duration,
        };
    } catch (error) {
        console.error(`   ❌ Failed to process ${restaurant.name}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Saves individual restaurant analysis to JSON file
 * @param {object} restaurant - Restaurant data
 * @param {object} result - Analysis result
 * @param {string} outputDir - Output directory path
 */
function saveRestaurantAnalysis(restaurant, result, outputDir) {
    try {
        const outputData = {
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                price: restaurant.price,
            },
            analysis: {
                timestamp: new Date().toISOString(),
                scores: result.scores,
                imageTags: result.imageTags,
                reviewTags: result.reviewTags,
            },
        };

        // Generate filename from restaurant name
        const safeFileName = restaurant.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        const outputPath = path.join(outputDir, `${safeFileName}_food_quality_scores.json`);

        // Write to JSON file
        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
    } catch (error) {
        console.warn(`   ⚠️  Failed to save analysis file: ${error.message}`);
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main function to orchestrate the bulk food quality analysis process
 */
async function run() {
    console.log('🚀 Starting bulk restaurant food quality analysis (GPT-4o)\n');
    console.log(`Configuration:
  - Max retries: ${CONFIG.MAX_RETRIES}
  - OpenAI model: ${CONFIG.OPENAI_MODEL}
  - Batch delay: ${CONFIG.BATCH_DELAY_MS}ms
  - Skip existing: ${SKIP_EXISTING ? 'Yes' : 'No'}
  - Limit: ${LIMIT || 'None'}
  - Start from: ${START_FROM || '0'}
\n`);

    const scriptStartTime = Date.now();

    try {
        // Validate environment
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }

        // Create output directory if it doesn't exist
        const outputDir = path.join(process.cwd(), 'src', 'scripts', 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Fetch all restaurants
        console.log(`🔍 Fetching restaurants from database...`);

        let restaurants = await prisma.restaurant.findMany({
            where: {},
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
            orderBy: {
                name: 'asc'
            }
        });

        // Apply start-from and limit filters
        if (START_FROM) {
            const startIndex = parseInt(START_FROM);
            restaurants = restaurants.slice(startIndex);
            console.log(`⏭️  Starting from restaurant #${startIndex}`);
        }

        if (LIMIT) {
            const limit = parseInt(LIMIT);
            restaurants = restaurants.slice(0, limit);
            console.log(`🔢 Limited to ${limit} restaurants`);
        }

        console.log(`✅ Found ${restaurants.length} restaurant(s) to process\n`);

        if (restaurants.length === 0) {
            console.log('ℹ️  No restaurants to process. Exiting.');
            return;
        }

        // Process each restaurant
        const results = {
            total: restaurants.length,
            successful: 0,
            failed: 0,
            skipped: 0,
            errors: [],
            totalDuration: 0,
        };

        console.log(`${'='.repeat(70)}`);

        for (let i = 0; i < restaurants.length; i++) {
            const restaurant = restaurants[i];

            // Process restaurant
            const result = await processRestaurant(restaurant, i, restaurants.length);

            if (result.success) {
                results.successful++;
                results.totalDuration += result.duration;

                // Save individual analysis to file
                saveRestaurantAnalysis(restaurant, result, outputDir);
            } else if (result.skipped) {
                results.skipped++;
            } else {
                results.failed++;
                results.errors.push({
                    restaurant: restaurant.name,
                    error: result.error
                });
            }

            // Add delay between requests to avoid rate limits (except for last one)
            if (i < restaurants.length - 1) {
                await new Promise(resolve => setTimeout(resolve, CONFIG.BATCH_DELAY_MS));
            }
        }

        console.log(`${'='.repeat(70)}\n`);

        // Print summary
        const scriptDuration = Date.now() - scriptStartTime;
        const scriptDurationSec = (scriptDuration / 1000).toFixed(2);
        const avgDuration = results.successful > 0 ? (results.totalDuration / results.successful / 1000).toFixed(2) : 0;

        console.log(`📊 SUMMARY:`);
        console.log(`   Total restaurants: ${results.total}`);
        console.log(`   ✅ Successful: ${results.successful}`);
        console.log(`   ⏭️  Skipped: ${results.skipped}`);
        console.log(`   ❌ Failed: ${results.failed}`);
        console.log(`   ⏱️  Total duration: ${scriptDurationSec}s`);
        console.log(`   ⏱️  Average per restaurant: ${avgDuration}s`);

        if (results.errors.length > 0) {
            console.log(`\n❌ Errors:`);
            results.errors.forEach(({ restaurant, error }) => {
                console.log(`   - ${restaurant}: ${error}`);
            });
        }

        // Save summary to file
        const summaryPath = path.join(outputDir, `_food_quality_summary_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
        fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2), 'utf-8');
        console.log(`\n📁 Summary saved to: ${summaryPath}`);
        console.log(`📁 Individual results saved to: ${outputDir}`);

        console.log(`\n${'='.repeat(70)}\n`);

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

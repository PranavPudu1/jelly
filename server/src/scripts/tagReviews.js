/**
 * Review Tagging Script
 *
 * This script processes restaurant reviews using OpenAI GPT-4o to:
 * - Extract exactly 5 descriptive keywords from each review
 * - Categorize each keyword as either "cuisine" or "ambiance"
 * - Create/find corresponding tags in the database
 * - Connect tags to the review
 *
 * Features:
 * - Batch processing for efficiency
 * - Exponential backoff retry logic
 * - Comprehensive error handling
 * - Progress tracking and logging
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

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    BATCH_SIZE: 20, // Number of reviews to process concurrently
    MAX_RETRIES: 3, // Maximum retry attempts for failed API calls
    RETRY_DELAY_MS: 1000, // Initial retry delay (exponential backoff)
    OPENAI_MODEL: 'gpt-4o', // OpenAI model to use
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
 * Validates the OpenAI response
 * @param {object} result - The parsed JSON result
 * @returns {boolean} True if valid
 */
function validateTaggingResult(result) {
    if (!result || typeof result !== 'object') {
        return false;
    }

    if (!Array.isArray(result.keywords) || result.keywords.length !== 5) {
        console.warn(`⚠️  Expected 5 keywords, got ${result.keywords?.length || 0}`);
        return false;
    }

    // Validate each keyword
    for (const keyword of result.keywords) {
        if (!keyword.word || typeof keyword.word !== 'string') {
            console.warn(`⚠️  Invalid keyword word: ${JSON.stringify(keyword)}`);
            return false;
        }

        if (!keyword.category || !['cuisine', 'ambiance'].includes(keyword.category)) {
            console.warn(`⚠️  Invalid category "${keyword.category}" for word "${keyword.word}"`);
            return false;
        }
    }

    return true;
}

// ============================================================================
// CORE PROCESSING FUNCTIONS
// ============================================================================

/**
 * Extracts keywords from a review using OpenAI GPT-4o
 * @param {string} reviewText - The review text to analyze
 * @returns {Promise<object>} Extraction result { keywords: [{word, category}] }
 */
async function extractKeywordsFromReview(reviewText) {
    const systemPrompt = `You are analyzing restaurant reviews to extract descriptive keywords.

Return JSON only:
{
  "keywords": [
    {"word": "keyword1", "category": "cuisine" | "ambiance"},
    {"word": "keyword2", "category": "cuisine" | "ambiance"},
    {"word": "keyword3", "category": "cuisine" | "ambiance"},
    {"word": "keyword4", "category": "cuisine" | "ambiance"},
    {"word": "keyword5", "category": "cuisine" | "ambiance"}
  ]
}

Rules:
- Extract EXACTLY 5 descriptive keywords from the review.
- Each keyword MUST be a single word (no phrases).
- Categorize each keyword as either "cuisine" (food-related) or "ambiance" (atmosphere/environment-related).
- Choose the most meaningful and distinctive words that capture the essence of the review.
- Words should be adjectives or nouns that describe the food or atmosphere.
- Convert all words to lowercase.`;

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
                    content: `Extract 5 keywords from this review:\n\n${reviewText}`,
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

        if (!validateTaggingResult(result)) {
            throw new Error(`Invalid tagging result: ${JSON.stringify(result)}`);
        }

        return result;
    } catch (error) {
        throw new Error(`Keyword extraction failed: ${error.message}`);
    }
}

/**
 * Processes a single review with retry logic and saves to database
 * @param {object} review - Review object from database
 * @returns {Promise<boolean>} True if successful
 */
async function processReview(review) {
    const startTime = Date.now();

    try {
        console.log(`📝 Processing review ID ${review.id}`);
        console.log(`   Preview: "${review.review.substring(0, 100)}..."`);

        // Extract keywords with retry logic
        const taggingResult = await retry(
            () => extractKeywordsFromReview(review.review),
            CONFIG.MAX_RETRIES,
            `review ${review.id}`
        );

        // Save tags to database and connect to review
        await saveReviewTags(review.id, taggingResult.keywords);

        const duration = Date.now() - startTime;
        const keywords = taggingResult.keywords.map((k) => k.word).join(', ');
        console.log(`✅ Review ${review.id} tagged with: ${keywords} in ${duration}ms`);

        return true;
    } catch (error) {
        console.error(`❌ Failed to process review ${review.id}: ${error.message}`);
        return false;
    }
}

/**
 * Processes a batch of reviews concurrently
 * @param {Array<object>} reviews - Array of review objects
 * @returns {Promise<object>} Processing statistics
 */
async function processBatch(reviews) {
    console.log(`\n🔄 Processing batch of ${reviews.length} reviews...\n`);

    const results = await Promise.allSettled(reviews.map((review) => processReview(review)));

    const stats = {
        total: results.length,
        successful: results.filter((r) => r.status === 'fulfilled' && r.value === true).length,
        failed: results.filter((r) => r.status === 'rejected' || r.value === false).length,
    };

    console.log(
        `\n📊 Batch complete: ${stats.successful}/${stats.total} successful, ${stats.failed} failed\n`
    );

    return stats;
}

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

/**
 * Retrieves unprocessed reviews from database
 * @param {number} batchSize - Number of reviews to fetch
 * @returns {Promise<Array<object>>} Array of review objects
 */
async function getUnprocessedReviews(batchSize) {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                tags: {
                    none: {}, // Reviews with no tags are unprocessed
                },
            },
            take: batchSize,
            orderBy: {
                dateAdded: 'asc', // Process oldest first
            },
        });

        return reviews;
    } catch (error) {
        throw new Error(`Failed to fetch unprocessed reviews: ${error.message}`);
    }
}

/**
 * Gets or creates a TagType by value
 * @param {string} value - The tag type value (e.g., "cuisine", "ambiance")
 * @returns {Promise<object>} The TagType object
 */
async function getOrCreateTagType(value) {
    try {
        let tagType = await prisma.tagType.findUnique({
            where: { value },
        });

        if (!tagType) {
            tagType = await prisma.tagType.create({
                data: { value },
            });
            console.log(`  📝 Created new TagType: "${value}"`);
        }

        return tagType;
    } catch (error) {
        throw new Error(`Failed to get or create TagType "${value}": ${error.message}`);
    }
}

/**
 * Gets or creates a Tag by value and tagTypeId
 * @param {string} value - The tag value
 * @param {string} tagTypeId - The tag type ID
 * @returns {Promise<object>} The Tag object
 */
async function getOrCreateTag(value, tagTypeId) {
    try {
        // Try to find existing tag with this value and type
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
                    source: 'openai-gpt4o',
                },
            });
            console.log(`  🏷️  Created new Tag: "${value}" (${tagTypeId})`);
        }

        return tag;
    } catch (error) {
        throw new Error(`Failed to get or create Tag "${value}": ${error.message}`);
    }
}

/**
 * Saves review tags to database
 * @param {string} reviewId - The review ID
 * @param {Array<object>} keywords - Array of {word, category} objects
 * @returns {Promise<void>}
 */
async function saveReviewTags(reviewId, keywords) {
    try {
        // Get or create tag types for cuisine and ambiance
        const tagTypes = {};
        for (const keyword of keywords) {
            if (!tagTypes[keyword.category]) {
                tagTypes[keyword.category] = await getOrCreateTagType(keyword.category);
            }
        }

        // Get or create tags for each keyword
        const tags = await Promise.all(
            keywords.map((keyword) =>
                getOrCreateTag(keyword.word, tagTypes[keyword.category].id)
            )
        );

        console.log(`  🔗 Connecting ${tags.length} tags to review ${reviewId}`);

        // Connect tags to the review
        await prisma.review.update({
            where: { id: reviewId },
            data: {
                tags: {
                    connect: tags.map((tag) => ({ id: tag.id })),
                },
            },
        });

        console.log(`  💾 Saved ${tags.length} tags for review ${reviewId}`);
    } catch (error) {
        throw new Error(`Failed to save tags for review ${reviewId}: ${error.message}`);
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main function to orchestrate the review tagging process
 */
async function run() {
    console.log('🚀 Starting review tagging script\n');
    console.log(`Configuration:
  - Batch size: ${CONFIG.BATCH_SIZE}
  - Max retries: ${CONFIG.MAX_RETRIES}
  - OpenAI model: ${CONFIG.OPENAI_MODEL}
\n`);

    const startTime = Date.now();
    const globalStats = {
        totalProcessed: 0,
        totalSuccessful: 0,
        totalFailed: 0,
    };

    try {
        // Validate environment
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }

        let batchNumber = 0;
        let hasMoreReviews = true;

        while (hasMoreReviews) {
            batchNumber++;
            console.log(`\n${'='.repeat(60)}`);
            console.log(`BATCH #${batchNumber}`);
            console.log(`${'='.repeat(60)}`);

            // Fetch next batch of unprocessed reviews
            const reviews = await getUnprocessedReviews(CONFIG.BATCH_SIZE);

            if (reviews.length === 0) {
                console.log('\n✨ No more unprocessed reviews found. Processing complete!');
                hasMoreReviews = false;
                break;
            }

            console.log(`Found ${reviews.length} unprocessed reviews`);

            // Process the batch
            const batchStats = await processBatch(reviews);

            // Update global statistics
            globalStats.totalProcessed += batchStats.total;
            globalStats.totalSuccessful += batchStats.successful;
            globalStats.totalFailed += batchStats.failed;

            // If we got fewer reviews than batch size, we're done
            if (reviews.length < CONFIG.BATCH_SIZE) {
                console.log('\n✨ Processed final batch. All reviews complete!');
                hasMoreReviews = false;
            }
        }

        // Final summary
        const duration = Date.now() - startTime;
        const durationSec = (duration / 1000).toFixed(2);

        console.log(`\n${'='.repeat(60)}`);
        console.log('FINAL SUMMARY');
        console.log(`${'='.repeat(60)}`);
        console.log(`Total reviews processed: ${globalStats.totalProcessed}`);
        console.log(`✅ Successful: ${globalStats.totalSuccessful}`);
        console.log(`❌ Failed: ${globalStats.totalFailed}`);
        console.log(`⏱️  Total duration: ${durationSec}s`);
        if (globalStats.totalProcessed > 0) {
            console.log(
                `📈 Average time per review: ${(duration / globalStats.totalProcessed).toFixed(0)}ms`
            );
        }
        console.log(`${'='.repeat(60)}\n`);
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

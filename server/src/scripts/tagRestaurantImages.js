/**
 * Restaurant Image Classification Script
 *
 * This script processes restaurant images using OpenAI Vision API (GPT-4o) to:
 * - Categorize images as "ambiance", "food", or "other"
 * - Generate exactly 5 multi-word, contextual descriptive tags (2-4 words each)
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
    BATCH_SIZE: 10, // Number of images to process concurrently
    MAX_RETRIES: 3, // Maximum retry attempts for failed API calls
    RETRY_DELAY_MS: 1000, // Initial retry delay (exponential backoff)
    REQUEST_TIMEOUT_MS: 30000, // Timeout for image fetch requests
    OPENAI_MODEL: 'gpt-4o', // OpenAI model to use
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Converts an image URL to base64 format
 * @param {string} url - The image URL
 * @returns {Promise<string>} Base64 encoded image with data URI prefix
 */
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
 * Validates the OpenAI Vision API response
 * @param {object} result - The parsed JSON result
 * @returns {boolean} True if valid
 */
function validateClassificationResult(result) {
    const validCategories = ['ambiance', 'food', 'other'];

    if (!result || typeof result !== 'object') {
        return false;
    }

    if (!validCategories.includes(result.category)) {
        return false;
    }

    if (!Array.isArray(result.tags)) {
        return false;
    }

    if (result.tags.length !== 5) {
        console.warn(
            `⚠️  Tags array has ${result.tags.length} items instead of 5`
        );
        return false;
    }

    // Validate that all tags are non-empty strings with 2-4 words
    for (const tag of result.tags) {
        if (typeof tag !== 'string' || !tag.trim()) {
            return false;
        }
        const wordCount = tag.trim().split(/\s+/).length;
        if (wordCount < 2 || wordCount > 4) {
            console.warn(
                `⚠️  Tag "${tag}" has ${wordCount} words (expected 2-4)`
            );
        }
    }

    return true;
}

// ============================================================================
// CORE PROCESSING FUNCTIONS
// ============================================================================

/**
 * Classifies a single restaurant image using OpenAI Vision API
 * @param {string} imageUrl - The URL of the image to classify
 * @returns {Promise<object>} Classification result { category, tags }
 */
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
        // Convert URL to base64 for OpenAI API
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

        if (!validateClassificationResult(result)) {
            throw new Error(`Invalid classification result: ${JSON.stringify(result)}`);
        }

        return {
            category: result.category,
            tags: result.tags,
        };
    } catch (error) {
        throw new Error(`Image classification failed: ${error.message}`);
    }
}

/**
 * Processes a single image with retry logic and saves to database
 * @param {object} image - Restaurant image object from database
 * @returns {Promise<boolean>} True if successful
 */
async function processImage(image) {
    const startTime = Date.now();

    try {
        console.log(`📸 Processing image ID ${image.id} from ${image.url}`);

        // Classify the image with retry logic
        const classification = await retry(
            () => classifyImage(image.url),
            CONFIG.MAX_RETRIES,
            `image ${image.id}`
        );

        // Clear existing tags before adding new ones
        await prisma.restaurantImage.update({
            where: { id: image.id },
            data: {
                tags: {
                    set: [], // Clear all existing tags
                },
            },
        });

        // Save classification to database
        await saveImageClassification(image.id, classification);

        const duration = Date.now() - startTime;
        console.log(
            `✅ Image ${image.id} classified as "${classification.category}" in ${duration}ms`
        );

        return true;
    } catch (error) {
        console.error(`❌ Failed to process image ${image.id}: ${error.message}`);

        // Log failure to database for tracking
        await logImageProcessingError(image.id, error.message);

        return false;
    }
}

/**
 * Processes a batch of images concurrently
 * @param {Array<object>} images - Array of restaurant image objects
 * @returns {Promise<object>} Processing statistics
 */
async function processBatch(images) {
    console.log(`\n🔄 Processing batch of ${images.length} images...\n`);

    const results = await Promise.allSettled(images.map((image) => processImage(image)));

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
 * Retrieves restaurant images from database
 * @param {number} batchSize - Number of images to fetch
 * @param {number} skip - Number of images to skip for pagination
 * @returns {Promise<Array<object>>} Array of restaurant image objects
 */
async function getRestaurantImages(batchSize, skip = 0) {
    try {
        const images = await prisma.restaurantImage.findMany({
            skip,
            take: batchSize,
            orderBy: {
                dateAdded: 'asc', // Process oldest first
            },
        });

        return images;
    } catch (error) {
        throw new Error(`Failed to fetch images: ${error.message}`);
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
                    source: 'openai-vision',
                },
            });
            console.log(`  🏷️  Created new Tag: "${value}"`);
        }

        return tag;
    } catch (error) {
        throw new Error(`Failed to get or create Tag "${value}": ${error.message}`);
    }
}

/**
 * Saves image classification results to database
 * @param {string} imageId - The restaurant image ID
 * @param {object} data - Classification data { category, tags }
 * @returns {Promise<void>}
 */
async function saveImageClassification(imageId, data) {
    try {
        // Determine tag type based on category
        const tagTypeValue = data.category === 'food' ? 'cuisine' : 'ambiance';

        // Get or create the appropriate TagType
        const tagType = await getOrCreateTagType(tagTypeValue);

        // Get or create tags for each multi-word tag
        const tags = await Promise.all(
            data.tags.map(tagValue => getOrCreateTag(tagValue.trim(), tagType.id))
        );

        console.log(`  🔗 Connecting ${tags.length} tags to image ${imageId}`);
        console.log(`  🏷️  Tags: ${data.tags.join(', ')}`);

        // Update the image: connect tags
        await prisma.restaurantImage.update({
            where: { id: imageId },
            data: {
                tags: {
                    connect: tags.map(tag => ({ id: tag.id })),
                },
            },
        });

        console.log(`  💾 Saved ${tags.length} tags for image ${imageId}`);
    } catch (error) {
        throw new Error(`Failed to save classification for image ${imageId}: ${error.message}`);
    }
}

/**
 * Logs image processing errors to database for tracking
 * @param {string} imageId - The restaurant image ID
 * @param {string} errorMessage - The error message
 * @returns {Promise<void>}
 */
async function logImageProcessingError(imageId, errorMessage) {
    // For now, just log to console
    // If you want to persist errors, add error tracking fields to your schema
    console.error(`  ⚠️  Error logged for image ${imageId}: ${errorMessage}`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main function to orchestrate the image classification process
 */
async function run() {
    console.log('🚀 Starting restaurant image classification script\n');
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
        let skip = 0;
        let hasMoreImages = true;

        while (hasMoreImages) {
            batchNumber++;
            console.log(`\n${'='.repeat(60)}`);
            console.log(`BATCH #${batchNumber}`);
            console.log(`${'='.repeat(60)}`);

            // Fetch next batch of images
            const images = await getRestaurantImages(CONFIG.BATCH_SIZE, skip);

            if (images.length === 0) {
                console.log('\n✨ No more images found. Processing complete!');
                hasMoreImages = false;
                break;
            }

            console.log(`Found ${images.length} images (skipped ${skip})`);

            // Process the batch
            const batchStats = await processBatch(images);

            // Update global statistics
            globalStats.totalProcessed += batchStats.total;
            globalStats.totalSuccessful += batchStats.successful;
            globalStats.totalFailed += batchStats.failed;

            // Move to next batch
            skip += CONFIG.BATCH_SIZE;

            // If we got fewer images than batch size, we're done
            if (images.length < CONFIG.BATCH_SIZE) {
                console.log('\n✨ Processed final batch. All images complete!');
                hasMoreImages = false;
            }
        }

        // Final summary
        const duration = Date.now() - startTime;
        const durationSec = (duration / 1000).toFixed(2);

        console.log(`\n${'='.repeat(60)}`);
        console.log('FINAL SUMMARY');
        console.log(`${'='.repeat(60)}`);
        console.log(`Total images processed: ${globalStats.totalProcessed}`);
        console.log(`✅ Successful: ${globalStats.totalSuccessful}`);
        console.log(`❌ Failed: ${globalStats.totalFailed}`);
        console.log(`⏱️  Total duration: ${durationSec}s`);
        console.log(
            `📈 Average time per image: ${(duration / globalStats.totalProcessed).toFixed(0)}ms`
        );
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

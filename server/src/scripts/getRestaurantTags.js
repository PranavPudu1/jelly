/**
 * Restaurant Tags Aggregation Script
 *
 * This script retrieves two specific restaurants and collects all associated tags from:
 * - Direct restaurant tags
 * - Tags from RestaurantImages (connected to the restaurant)
 * - Tags from Reviews (connected to the restaurant)
 *
 * Features:
 * - Fetches restaurants by name
 * - Aggregates tags from multiple sources
 * - Removes duplicates
 * - Provides detailed breakdown
 * - Saves comma-separated tag lists to text files (one per restaurant)
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// ============================================================================
// CONFIGURATION - Set your restaurant names here
// ============================================================================

const RESTAURANT_NAMES = {
    FIRST: 'Tikka House Express',  // Replace with actual restaurant name
    SECOND: 'Zanzibar', // Replace with actual restaurant name
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Fetches a restaurant by name with all related tags
 * @param {string} restaurantName - The name of the restaurant
 * @returns {Promise<object|null>} Restaurant object with all tags or null if not found
 */
async function getRestaurantWithAllTags(restaurantName) {
    try {
        console.log(`\n🔍 Searching for restaurant: "${restaurantName}"`);

        const restaurant = await prisma.restaurant.findFirst({
            where: {
                name: {
                    equals: restaurantName,
                    mode: 'insensitive', // Case-insensitive search
                },
            },
            include: {
                // Direct tags on the restaurant
                tags: {
                    include: {
                        tagType: true,
                    },
                },
                // Restaurant images with their tags
                images: {
                    include: {
                        tags: {
                            include: {
                                tagType: true,
                            },
                        },
                    },
                },
                // Reviews with their tags
                reviews: {
                    include: {
                        tags: {
                            include: {
                                tagType: true,
                            },
                        },
                    },
                },
            },
        });

        if (!restaurant) {
            console.log(`  ❌ Restaurant "${restaurantName}" not found`);
            return null;
        }

        console.log(`  ✅ Found restaurant: ${restaurant.name} (ID: ${restaurant.id})`);
        return restaurant;
    } catch (error) {
        throw new Error(`Failed to fetch restaurant "${restaurantName}": ${error.message}`);
    }
}

/**
 * Aggregates all tags from a restaurant and its related entities
 * @param {object} restaurant - Restaurant object with included relations
 * @returns {object} Aggregated tags with breakdown by source
 */
function aggregateRestaurantTags(restaurant) {
    if (!restaurant) {
        return {
            allTags: [],
            breakdown: {
                directTags: [],
                imageTags: [],
                reviewTags: [],
            },
            uniqueTagCount: 0,
        };
    }

    // Direct tags on the restaurant
    const directTags = restaurant.tags.map(tag => ({
        id: tag.id,
        value: tag.value,
        tagType: tag.tagType.value,
        source: tag.source,
        dateAdded: tag.dateAdded,
    }));

    // Tags from restaurant images
    const imageTags = [];
    restaurant.images.forEach(image => {
        image.tags.forEach(tag => {
            imageTags.push({
                id: tag.id,
                value: tag.value,
                tagType: tag.tagType.value,
                source: tag.source,
                dateAdded: tag.dateAdded,
                imageId: image.id,
            });
        });
    });

    // Tags from reviews
    const reviewTags = [];
    restaurant.reviews.forEach(review => {
        review.tags.forEach(tag => {
            reviewTags.push({
                id: tag.id,
                value: tag.value,
                tagType: tag.tagType.value,
                source: tag.source,
                dateAdded: tag.dateAdded,
                reviewId: review.id,
            });
        });
    });

    // Combine all tags
    const allTags = [...directTags, ...imageTags, ...reviewTags];

    // Remove duplicates by tag ID
    const uniqueTagsMap = new Map();
    allTags.forEach(tag => {
        if (!uniqueTagsMap.has(tag.id)) {
            uniqueTagsMap.set(tag.id, tag);
        }
    });
    const uniqueTags = Array.from(uniqueTagsMap.values());

    return {
        allTags: uniqueTags,
        breakdown: {
            directTags,
            imageTags,
            reviewTags,
        },
        stats: {
            totalUniqueTags: uniqueTags.length,
            directTagCount: directTags.length,
            imageTagCount: imageTags.length,
            reviewTagCount: reviewTags.length,
            totalTagsBeforeDedup: allTags.length,
            imageCount: restaurant.images.length,
            reviewCount: restaurant.reviews.length,
        },
    };
}

/**
 * Saves tags to a text file as comma-separated values
 * @param {string} restaurantName - Name of the restaurant
 * @param {object} tagData - Aggregated tag data
 * @returns {Promise<string>} Path to the created file
 */
async function saveTagsToFile(restaurantName, tagData) {
    try {
        // Create a safe filename from restaurant name
        const safeFileName = restaurantName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');

        const fileName = `${safeFileName}_tags.txt`;
        const filePath = path.join(process.cwd(), 'src', 'scripts', 'output', fileName);

        // Ensure output directory exists
        const outputDir = path.dirname(filePath);
        await fs.mkdir(outputDir, { recursive: true });

        // Extract just the tag values and create comma-separated list
        const tagValues = tagData.allTags.map(tag => tag.value);
        const commaSeparatedTags = tagValues.join(', ');

        // Write to file
        await fs.writeFile(filePath, commaSeparatedTags, 'utf-8');

        console.log(`  💾 Saved tags to: ${filePath}`);
        console.log(`  📝 Total tags written: ${tagValues.length}`);

        return filePath;
    } catch (error) {
        throw new Error(`Failed to save tags to file for "${restaurantName}": ${error.message}`);
    }
}

/**
 * Displays tags in a formatted, readable way
 * @param {string} restaurantName - Name of the restaurant
 * @param {object} tagData - Aggregated tag data
 */
function displayRestaurantTags(restaurantName, tagData) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`TAGS FOR: ${restaurantName}`);
    console.log(`${'='.repeat(70)}`);

    // Display statistics
    console.log(`\n📊 Statistics:`);
    console.log(`  - Total unique tags: ${tagData.stats.totalUniqueTags}`);
    console.log(`  - Direct restaurant tags: ${tagData.stats.directTagCount}`);
    console.log(`  - Tags from images (${tagData.stats.imageCount} images): ${tagData.stats.imageTagCount}`);
    console.log(`  - Tags from reviews (${tagData.stats.reviewCount} reviews): ${tagData.stats.reviewTagCount}`);
    console.log(`  - Total tags before deduplication: ${tagData.stats.totalTagsBeforeDedup}`);

    // Display all unique tags grouped by tag type
    console.log(`\n🏷️  All Unique Tags:`);
    const tagsByType = {};
    tagData.allTags.forEach(tag => {
        if (!tagsByType[tag.tagType]) {
            tagsByType[tag.tagType] = [];
        }
        tagsByType[tag.tagType].push(tag);
    });

    Object.entries(tagsByType).forEach(([tagType, tags]) => {
        console.log(`\n  ${tagType.toUpperCase()}:`);
        tags.forEach(tag => {
            console.log(`    • ${tag.value} (source: ${tag.source || 'unknown'})`);
        });
    });

    // Display breakdown by source
    console.log(`\n📋 Breakdown by Source:`);

    console.log(`\n  Direct Restaurant Tags (${tagData.breakdown.directTags.length}):`);
    if (tagData.breakdown.directTags.length === 0) {
        console.log(`    (none)`);
    } else {
        tagData.breakdown.directTags.forEach(tag => {
            console.log(`    • ${tag.value} [${tag.tagType}]`);
        });
    }

    console.log(`\n  Tags from Images (${tagData.breakdown.imageTags.length}):`);
    if (tagData.breakdown.imageTags.length === 0) {
        console.log(`    (none)`);
    } else {
        tagData.breakdown.imageTags.forEach(tag => {
            console.log(`    • ${tag.value} [${tag.tagType}] (image: ${tag.imageId.substring(0, 8)}...)`);
        });
    }

    console.log(`\n  Tags from Reviews (${tagData.breakdown.reviewTags.length}):`);
    if (tagData.breakdown.reviewTags.length === 0) {
        console.log(`    (none)`);
    } else {
        tagData.breakdown.reviewTags.forEach(tag => {
            console.log(`    • ${tag.value} [${tag.tagType}] (review: ${tag.reviewId.substring(0, 8)}...)`);
        });
    }

    console.log(`\n${'='.repeat(70)}\n`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main function to orchestrate the tag retrieval process
 */
async function run() {
    console.log('🚀 Starting restaurant tags aggregation script\n');
    console.log(`Target restaurants:
  1. ${RESTAURANT_NAMES.FIRST}
  2. ${RESTAURANT_NAMES.SECOND}
\n`);

    const startTime = Date.now();
    const results = {};
    const savedFiles = [];

    try {
        // Fetch both restaurants
        const [restaurant1, restaurant2] = await Promise.all([
            getRestaurantWithAllTags(RESTAURANT_NAMES.FIRST),
            getRestaurantWithAllTags(RESTAURANT_NAMES.SECOND),
        ]);

        // Aggregate tags for restaurant 1
        if (restaurant1) {
            const tags1 = aggregateRestaurantTags(restaurant1);
            results[RESTAURANT_NAMES.FIRST] = tags1;
            displayRestaurantTags(restaurant1.name, tags1);

            // Save tags to file
            const filePath1 = await saveTagsToFile(restaurant1.name, tags1);
            savedFiles.push({ restaurant: restaurant1.name, path: filePath1 });
        }

        // Aggregate tags for restaurant 2
        if (restaurant2) {
            const tags2 = aggregateRestaurantTags(restaurant2);
            results[RESTAURANT_NAMES.SECOND] = tags2;
            displayRestaurantTags(restaurant2.name, tags2);

            // Save tags to file
            const filePath2 = await saveTagsToFile(restaurant2.name, tags2);
            savedFiles.push({ restaurant: restaurant2.name, path: filePath2 });
        }

        // Summary
        const duration = Date.now() - startTime;
        console.log(`\n${'='.repeat(70)}`);
        console.log('SUMMARY');
        console.log(`${'='.repeat(70)}`);

        const restaurant1Tags = results[RESTAURANT_NAMES.FIRST];
        const restaurant2Tags = results[RESTAURANT_NAMES.SECOND];

        if (restaurant1Tags) {
            console.log(`\n${RESTAURANT_NAMES.FIRST}:`);
            console.log(`  ✅ ${restaurant1Tags.stats.totalUniqueTags} unique tags found`);
        } else {
            console.log(`\n${RESTAURANT_NAMES.FIRST}:`);
            console.log(`  ❌ Restaurant not found`);
        }

        if (restaurant2Tags) {
            console.log(`\n${RESTAURANT_NAMES.SECOND}:`);
            console.log(`  ✅ ${restaurant2Tags.stats.totalUniqueTags} unique tags found`);
        } else {
            console.log(`\n${RESTAURANT_NAMES.SECOND}:`);
            console.log(`  ❌ Restaurant not found`);
        }

        console.log(`\n⏱️  Total execution time: ${duration}ms`);

        // Display saved files
        if (savedFiles.length > 0) {
            console.log(`\n📁 Saved Files:`);
            savedFiles.forEach(({ restaurant, path }) => {
                console.log(`  ✅ ${restaurant}: ${path}`);
            });
        }

        console.log(`${'='.repeat(70)}\n`);

        // Return results for programmatic use
        return results;
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
    .then((results) => {
        console.log('✅ Script completed successfully');

        // You can also export results as JSON if needed
        // console.log('\n📤 JSON Output:');
        // console.log(JSON.stringify(results, null, 2));

        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });

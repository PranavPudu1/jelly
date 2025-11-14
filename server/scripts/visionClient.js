/**
 * Google Vision API Client
 * Classifies restaurant photos into FOOD, MENU, or AMBIANCE
 */

const axios = require('axios');

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

/**
 * Classify a photo using Google Vision API
 * @param {string} imageUrl - Public URL of the image
 * @param {string} apiKey - Google API key
 * @returns {Promise<string>} Image type: 'MENU', 'FOOD', or 'AMBIANCE'
 */
async function classifyPhoto(imageUrl, apiKey) {
    try {
        const response = await axios.post(
            `${VISION_API_URL}?key=${apiKey}`,
            {
                requests: [
                    {
                        image: {
                            source: {
                                imageUri: imageUrl,
                            },
                        },
                        features: [
                            {
                                type: 'LABEL_DETECTION',
                                maxResults: 10,
                            },
                            {
                                type: 'TEXT_DETECTION',
                                maxResults: 1,
                            },
                        ],
                    },
                ],
            }
        );

        const result = response.data.responses[0];

        // Extract labels
        const labels = (result.labelAnnotations || [])
            .map((annotation) => ({
                description: annotation.description.toLowerCase(),
                score: annotation.score,
            }));

        // Check if text was detected (indicates menu)
        const hasText = result.textAnnotations && result.textAnnotations.length > 0;
        const textLength = hasText ? result.textAnnotations[0].description.length : 0;

        // Classification logic
        const classification = determineImageType(labels, hasText, textLength);

        return classification;
    } catch (error) {
        console.error('  ⚠️  Vision API error:', error.message);
        // Fallback to AMBIANCE on error
        return 'AMBIANCE';
    }
}

/**
 * Determine image type based on labels and text detection
 * @param {Array} labels - Array of label objects with description and score
 * @param {boolean} hasText - Whether text was detected
 * @param {number} textLength - Length of detected text
 * @returns {string} Image type
 */
function determineImageType(labels, hasText, textLength) {
    // Extract label descriptions for easier checking
    const labelDescriptions = labels.map((l) => l.description);

    // MENU Detection - Improved sensitivity
    // Check for explicit "menu" label first
    if (labelDescriptions.includes('menu')) {
        return 'MENU';
    }

    // Menus typically have substantial text with formatting labels
    if (hasText && textLength > 50) {
        // Check for menu-related labels
        const menuIndicators = ['font', 'publication', 'paper', 'document', 'text', 'recipe', 'list'];
        const hasMenuIndicator = labelDescriptions.some(label =>
            menuIndicators.some(indicator => label.includes(indicator))
        );

        if (hasMenuIndicator) {
            return 'MENU';
        }
    }

    // Even if shorter text, if it has "menu" or "restaurant" + text, likely a menu
    if (hasText && textLength > 20 &&
        (labelDescriptions.includes('restaurant') ||
         labelDescriptions.includes('signage'))) {
        return 'MENU';
    }

    // FOOD Detection
    // Look for food-related labels with high confidence
    const foodLabels = [
        'food',
        'dish',
        'meal',
        'cuisine',
        'ingredient',
        'plate',
        'bowl',
        'serving',
        'tableware',
        'recipe',
        'fast food',
        'junk food',
        'comfort food',
        'staple food',
        'side dish',
        'produce',
        'vegetable',
        'fruit',
        'meat',
        'seafood',
        'dessert',
        'baked goods',
        'breakfast',
        'lunch',
        'dinner',
        'snack',
    ];

    const hasFoodLabel = labelDescriptions.some((label) =>
        foodLabels.some((foodLabel) => label.includes(foodLabel))
    );

    if (hasFoodLabel) {
        return 'FOOD';
    }

    // AMBIANCE Detection (default)
    // Interior, exterior, building, furniture, etc.
    const ambianceLabels = [
        'interior design',
        'building',
        'room',
        'restaurant',
        'table',
        'furniture',
        'architecture',
        'ceiling',
        'floor',
        'wall',
        'window',
        'lighting',
        'outdoor',
        'property',
        'real estate',
        'wood',
        'textile',
    ];

    const hasAmbianceLabel = labelDescriptions.some((label) =>
        ambianceLabels.some((ambianceLabel) => label.includes(ambianceLabel))
    );

    // Default to AMBIANCE if we detect interior/exterior labels
    // or if we're not confident it's food
    return hasAmbianceLabel ? 'AMBIANCE' : 'AMBIANCE';
}

/**
 * Batch classify multiple photos
 * @param {Array<string>} imageUrls - Array of image URLs
 * @param {string} apiKey - Google API key
 * @returns {Promise<Array<string>>} Array of image types
 */
async function classifyPhotos(imageUrls, apiKey) {
    const classifications = [];

    for (const imageUrl of imageUrls) {
        const classification = await classifyPhoto(imageUrl, apiKey);
        classifications.push(classification);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return classifications;
}

/**
 * Get cuisine type from Google Places types array
 * @param {Array<string>} types - Google Places types
 * @returns {string} Cuisine name
 */
function getCuisineFromTypes(types = []) {
    const cuisineMap = {
        italian_restaurant: 'Italian',
        mexican_restaurant: 'Mexican',
        chinese_restaurant: 'Chinese',
        japanese_restaurant: 'Japanese',
        thai_restaurant: 'Thai',
        indian_restaurant: 'Indian',
        french_restaurant: 'French',
        mediterranean_restaurant: 'Mediterranean',
        greek_restaurant: 'Greek',
        spanish_restaurant: 'Spanish',
        korean_restaurant: 'Korean',
        vietnamese_restaurant: 'Vietnamese',
        american_restaurant: 'American',
        steakhouse: 'Steakhouse',
        seafood_restaurant: 'Seafood',
        barbecue_restaurant: 'BBQ',
        pizza_restaurant: 'Pizza',
        sandwich_shop: 'Sandwiches',
        hamburger_restaurant: 'Burgers',
        breakfast_restaurant: 'Breakfast',
        brunch_restaurant: 'Brunch',
        bar_and_grill: 'Bar & Grill',
        cafe: 'Cafe',
        coffee_shop: 'Coffee Shop',
        bakery: 'Bakery',
        fast_food_restaurant: 'Fast Food',
        vegan_restaurant: 'Vegan',
        vegetarian_restaurant: 'Vegetarian',
        sushi_restaurant: 'Sushi',
        ramen_restaurant: 'Ramen',
        tapas_restaurant: 'Tapas',
        diner: 'Diner',
        pub: 'Pub',
        gastropub: 'Gastropub',
        wine_bar: 'Wine Bar',
    };

    // Find first matching cuisine type
    for (const type of types) {
        if (cuisineMap[type]) {
            return cuisineMap[type];
        }
    }

    // Default to American if no specific cuisine found
    return 'American';
}

module.exports = {
    classifyPhoto,
    classifyPhotos,
    getCuisineFromTypes,
};

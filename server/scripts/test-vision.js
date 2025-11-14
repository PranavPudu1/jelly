/**
 * Test Google Vision API photo classification
 */

require('dotenv').config();
const { classifyPhoto } = require('./visionClient');

async function testVision() {
    console.log('🔬 Testing Google Vision API Classification...\n');

    // Test images (publicly accessible)
    const testImages = [
        {
            url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
            expected: 'FOOD',
            description: 'Food dish photo'
        },
        {
            url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
            expected: 'AMBIANCE',
            description: 'Restaurant interior'
        },
        {
            url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772',
            expected: 'MENU',
            description: 'Menu board with text'
        }
    ];

    console.log(`Testing ${testImages.length} sample images...\n`);

    for (const testImage of testImages) {
        console.log(`📸 Testing: ${testImage.description}`);
        console.log(`   URL: ${testImage.url}`);
        console.log(`   Expected: ${testImage.expected}`);

        try {
            const result = await classifyPhoto(testImage.url, process.env.GOOGLE_PLACES_API_KEY);
            console.log(`   ✅ Result: ${result}`);
            console.log(`   ${result === testImage.expected ? '✅ MATCH' : '⚠️  Different classification'}\n`);
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}\n`);
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Vision API test complete!\n');
    console.log('💡 Note: Classifications may differ from expected due to image content.');
    console.log('   The AI looks at actual visual content, not just file names.');
}

testVision().catch(console.error);

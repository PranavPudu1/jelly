/**
 * Check photo classifications for Austin restaurants
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPhotoClassifications() {
    console.log('📸 Checking Photo Classifications\n');
    console.log('═'.repeat(80));

    // Get Austin restaurants
    const { data: restaurants, error: restError } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('city', 'Austin')
        .eq('state', 'TX')
        .order('name');

    if (restError) {
        console.error('Error fetching restaurants:', restError);
        return;
    }

    let totalPhotos = 0;
    let totalMenu = 0;
    let totalFood = 0;
    let totalAmbiance = 0;
    let totalCover = 0;

    for (const restaurant of restaurants) {
        console.log(`\n${restaurant.name}`);
        console.log('─'.repeat(80));

        // Get photos for this restaurant
        const { data: photos, error: photoError } = await supabase
            .from('restaurant_image')
            .select('image_type, display_order')
            .eq('restaurant_id', restaurant.id)
            .order('display_order');

        if (photoError) {
            console.error('  Error:', photoError.message);
            continue;
        }

        if (!photos || photos.length === 0) {
            console.log('  No photos found');
            continue;
        }

        // Count by type
        const cover = photos.filter(p => p.image_type === 'COVER').length;
        const food = photos.filter(p => p.image_type === 'FOOD').length;
        const menu = photos.filter(p => p.image_type === 'MENU').length;
        const ambiance = photos.filter(p => p.image_type === 'AMBIANCE').length;

        console.log(`  Photos: ${photos.length} total`);
        console.log(`    🖼️  COVER: ${cover}`);
        console.log(`    🍕 FOOD: ${food}`);
        console.log(`    📋 MENU: ${menu}`);
        console.log(`    🏠 AMBIANCE: ${ambiance}`);

        totalPhotos += photos.length;
        totalCover += cover;
        totalFood += food;
        totalMenu += menu;
        totalAmbiance += ambiance;
    }

    console.log('\n' + '═'.repeat(80));
    console.log('SUMMARY');
    console.log('═'.repeat(80));
    console.log(`Total Restaurants: ${restaurants.length}`);
    console.log(`Total Photos: ${totalPhotos}`);
    console.log(`  🖼️  COVER: ${totalCover} (${((totalCover/totalPhotos)*100).toFixed(1)}%)`);
    console.log(`  🍕 FOOD: ${totalFood} (${((totalFood/totalPhotos)*100).toFixed(1)}%)`);
    console.log(`  📋 MENU: ${totalMenu} (${((totalMenu/totalPhotos)*100).toFixed(1)}%)`);
    console.log(`  🏠 AMBIANCE: ${totalAmbiance} (${((totalAmbiance/totalPhotos)*100).toFixed(1)}%)`);
    console.log('═'.repeat(80));
}

checkPhotoClassifications();

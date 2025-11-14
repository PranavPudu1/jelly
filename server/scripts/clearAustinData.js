/**
 * Clear Austin restaurants and their associated data before re-ingestion
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAustinData() {
    console.log('🗑️  Clearing Austin restaurant data...\n');

    try {
        // Get all Austin restaurants
        const { data: restaurants, error: fetchError } = await supabase
            .from('restaurants')
            .select('id, name')
            .eq('city', 'Austin')
            .eq('state', 'TX');

        if (fetchError) {
            console.error('❌ Error fetching restaurants:', fetchError);
            return;
        }

        if (!restaurants || restaurants.length === 0) {
            console.log('ℹ️  No Austin restaurants found');
            return;
        }

        console.log(`Found ${restaurants.length} Austin restaurants to delete\n`);

        const restaurantIds = restaurants.map(r => r.id);

        // Delete associated data first (foreign key constraints)

        // 1. Delete restaurant images
        console.log('Deleting restaurant_image records...');
        const { error: imagesError } = await supabase
            .from('restaurant_image')
            .delete()
            .in('restaurant_id', restaurantIds);

        if (imagesError) {
            console.error('⚠️  Error deleting images:', imagesError.message);
        } else {
            console.log('✅ Deleted restaurant_image records');
        }

        // 2. Delete reviews
        console.log('Deleting review records...');
        const { error: reviewsError } = await supabase
            .from('reviews')
            .delete()
            .in('restaurant_id', restaurantIds);

        if (reviewsError) {
            console.error('⚠️  Error deleting reviews:', reviewsError.message);
        } else {
            console.log('✅ Deleted review records');
        }

        // 3. Delete restaurants
        console.log('Deleting restaurant records...');
        const { error: restaurantsError } = await supabase
            .from('restaurants')
            .delete()
            .in('id', restaurantIds);

        if (restaurantsError) {
            console.error('❌ Error deleting restaurants:', restaurantsError);
            return;
        }

        console.log('✅ Deleted restaurant records\n');
        console.log(`🎉 Successfully cleared ${restaurants.length} Austin restaurants and their data!\n`);

        // List deleted restaurants
        console.log('Deleted restaurants:');
        restaurants.forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.name}`);
        });

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

clearAustinData();

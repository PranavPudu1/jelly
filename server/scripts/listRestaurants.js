#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.SUPABASE_URL?.trim(),
        process.env.SUPABASE_SERVICE_KEY?.trim()
    );

    const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, source, source_id, city, rating, price, image_url')
        .order('date_added', { ascending: false });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`\n📊 Total Restaurants: ${data.length}\n`);

    data.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name}`);
        console.log(`   Source: ${r.source} (${r.source_id})`);
        console.log(`   City: ${r.city} | Rating: ${r.rating} | Price: ${r.price}`);
        console.log(`   Image: ${r.image_url.substring(0, 60)}...`);
        console.log();
    });
}

main();

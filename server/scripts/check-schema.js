#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkSchema() {
    console.log('Checking schema for auxiliary tables...\n');

    // Check restaurant_image table
    console.log('=== restaurant_image table ===');
    const { data: imageData, error: imageError } = await supabase
        .from('restaurant_image')
        .select('*')
        .limit(1);

    if (imageError) {
        console.log('Error:', imageError.message);
    } else {
        console.log('Sample columns:', imageData[0] ? Object.keys(imageData[0]) : 'No data');
    }

    // Check reviews table
    console.log('\n=== reviews table ===');
    const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .limit(1);

    if (reviewError) {
        console.log('Error:', reviewError.message);
    } else {
        console.log('Sample columns:', reviewData[0] ? Object.keys(reviewData[0]) : 'No data');
        if (reviewData[0]) {
            console.log('Sample data:', reviewData[0]);
        }
    }

    // Check hours table
    console.log('\n=== hours table ===');
    const { data: hoursData, error: hoursError } = await supabase
        .from('hours')
        .select('*')
        .limit(1);

    if (hoursError) {
        console.log('Error:', hoursError.message);
    } else {
        console.log('Sample columns:', hoursData[0] ? Object.keys(hoursData[0]) : 'No data');
    }
}

checkSchema();

#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.SUPABASE_URL?.trim(),
        process.env.SUPABASE_SERVICE_KEY?.trim()
    );

    console.log('Checking restaurants table schema...\n');

    // Try to get one restaurant to see what columns exist
    const { data, error } = await supabase.from('restaurants').select('*').limit(1).single();

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('Existing columns in restaurants table:');
    console.log(Object.keys(data));
    console.log('\nSample data:');
    console.log(JSON.stringify(data, null, 2));
}

main();

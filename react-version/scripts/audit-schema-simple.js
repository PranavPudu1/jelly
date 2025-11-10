#!/usr/bin/env node

/**
 * Simple Database Audit Script using Supabase Client
 * Uses REST API instead of direct PostgreSQL connection
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Required tables for the Jelly app
const REQUIRED_TABLES = [
    'restaurants',
    'restaurant_stats',
    'restaurant_image',
    'restaurant_cuisine',
    'cuisine',
    'restaurant_tag',
    'tag',
    'reviews',
    'hours',
    'users',
    'user_swipe',
    'saved_restaurant',
    'user_preferences',
    'place_source',
    'restaurant_alias'
];

async function main() {
    console.log('\n════════════════════════════════════════════════════════');
    console.log('   Supabase Database Schema Audit (Simple)');
    console.log('════════════════════════════════════════════════════════\n');

    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY?.trim();

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env\n');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Checking which tables exist...\n');

    const results = {
        existing: [],
        missing: [],
        hasData: {}
    };

    // Try to query each required table
    for (const tableName of REQUIRED_TABLES) {
        try {
            const { count, error } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });

            if (error) {
                if (error.code === '42P01' || error.message.includes('does not exist')) {
                    console.log(`  ❌ ${tableName} - MISSING`);
                    results.missing.push(tableName);
                } else if (error.code === 'PGRST301') {
                    // Table exists but no RLS policy / permission issue
                    console.log(`  ⚠️  ${tableName} - EXISTS (permission issue)`);
                    results.existing.push(tableName);
                } else {
                    console.log(`  ⚠️  ${tableName} - EXISTS (error: ${error.message})`);
                    results.existing.push(tableName);
                }
            } else {
                console.log(`  ✅ ${tableName} - EXISTS (${count || 0} rows)`);
                results.existing.push(tableName);
                results.hasData[tableName] = count || 0;
            }
        } catch (err) {
            console.log(`  ❌ ${tableName} - ERROR: ${err.message}`);
            results.missing.push(tableName);
        }
    }

    // Summary
    console.log('\n════════════════════════════════════════════════════════');
    console.log('   Summary');
    console.log('════════════════════════════════════════════════════════\n');

    console.log(`✅ Tables that exist: ${results.existing.length}/${REQUIRED_TABLES.length}`);
    if (results.existing.length > 0) {
        console.log(`   ${results.existing.join(', ')}\n`);
    }

    console.log(`❌ Tables missing: ${results.missing.length}/${REQUIRED_TABLES.length}`);
    if (results.missing.length > 0) {
        console.log(`   ${results.missing.join(', ')}\n`);
    }

    // Check which tables have data
    const tablesWithData = Object.entries(results.hasData).filter(([_, count]) => count > 0);
    if (tablesWithData.length > 0) {
        console.log('📊 Tables with data:');
        for (const [table, count] of tablesWithData) {
            console.log(`   - ${table}: ${count} rows`);
        }
        console.log();
    }

    // Recommendation
    console.log('💡 Next Steps:\n');

    if (results.missing.length === 0) {
        console.log('✅ All required tables exist!');
        console.log('   You can now run: node scripts/ingest-google-places.js\n');
    } else {
        console.log('⚠️  Some tables are missing. You have two options:');
        console.log('   1. Create the missing tables using SQL migrations');
        console.log('   2. Run the ingestion script - it will show which tables need to be created\n');
    }

    console.log('════════════════════════════════════════════════════════\n');
}

main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
});

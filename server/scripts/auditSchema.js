#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Required tables for the Jelly app
const REQUIRED_SCHEMA = {
    restaurants: {
        description: 'Core restaurant data with PostGIS geo location',
        requiredColumns: [
            'id',
            'name',
            'location', // PostGIS geography point
            'address',
            'city',
            'state',
            'zip',
            'phone',
            'website',
            'price_level',
            'hero_image_url',
            'created_at',
            'updated_at',
        ],
    },
    restaurant_stats: {
        description: 'Aggregated statistics for restaurants',
        requiredColumns: [
            'restaurant_id',
            'total_reviews',
            'avg_rating',
            'total_swipes',
            'total_saves',
            'updated_at',
        ],
    },
    restaurant_image: {
        description: 'Images for restaurants (food, ambiance, etc.)',
        requiredColumns: [
            'id',
            'restaurant_id',
            'image_url',
            'image_type', // 'food', 'ambiance', 'hero'
            'caption',
            'created_at',
        ],
    },
    restaurant_cuisine: {
        description: 'Junction table for restaurant-cuisine many-to-many',
        requiredColumns: ['restaurant_id', 'cuisine_id'],
    },
    cuisine: {
        description: 'Cuisine types (Italian, Mexican, etc.)',
        requiredColumns: ['id', 'name', 'icon'],
    },
    restaurant_tag: {
        description: 'Junction table for restaurant-tag many-to-many',
        requiredColumns: ['restaurant_id', 'tag_id'],
    },
    tag: {
        description: 'Tags for restaurants (romantic, family-friendly, etc.)',
        requiredColumns: ['id', 'name', 'category'],
    },
    reviews: {
        description: 'User reviews for restaurants',
        requiredColumns: [
            'id',
            'restaurant_id',
            'user_id',
            'rating',
            'review_text',
            'source', // 'google', 'yelp', 'internal'
            'source_id',
            'created_at',
        ],
    },
    hours: {
        description: 'Operating hours for restaurants',
        requiredColumns: [
            'restaurant_id',
            'day_of_week', // 0-6 (Sunday-Saturday)
            'open_time',
            'close_time',
            'is_closed',
        ],
    },
    users: {
        description: 'User accounts',
        requiredColumns: ['id', 'email', 'display_name', 'avatar_url', 'created_at', 'updated_at'],
    },
    user_swipe: {
        description: 'Track user swipes (left/right)',
        requiredColumns: [
            'id',
            'user_id',
            'restaurant_id',
            'direction', // 'left' or 'right'
            'swiped_at',
        ],
    },
    saved_restaurant: {
        description: 'User saved/favorited restaurants',
        requiredColumns: ['user_id', 'restaurant_id', 'saved_at'],
    },
    user_preferences: {
        description: 'User preferences for recommendations',
        requiredColumns: [
            'user_id',
            'preferred_cuisines', // array
            'preferred_price_levels', // array
            'max_distance_miles',
            'dietary_restrictions', // array
            'updated_at',
        ],
    },
    place_source: {
        description: 'Track source of restaurant data (for API ingestion)',
        requiredColumns: [
            'restaurant_id',
            'source_name', // 'google', 'yelp', etc.
            'source_place_id',
            'last_synced_at',
        ],
    },
    restaurant_alias: {
        description: 'Handle duplicate restaurants (deduplication)',
        requiredColumns: [
            'id',
            'canonical_restaurant_id',
            'alias_name',
            'alias_address',
            'created_at',
        ],
    },
};

async function auditSchema() {
    let connectionString = process.env.DATABASE_URL?.trim();

    if (!connectionString) {
        console.log('⚠️  DATABASE_URL not found, attempting to construct from SUPABASE_URL...\n');

        const supabaseUrl = process.env.SUPABASE_URL?.trim();

        if (!supabaseUrl) {
            console.error(
                '\n❌ Error: Missing DATABASE_URL or SUPABASE_URL environment variable\n'
            );
            console.error('Please add DATABASE_URL to your .env file.');
            console.error(
                'Get it from: Supabase Dashboard → Project Settings → Database → Connection Pooling\n'
            );
            process.exit(1);
        }

        // Extract project ref from Supabase URL
        // Format: https://ituiifzbivdpssfxtgmq.supabase.co
        const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

        // Try to construct connection string (may not work without database password)
        connectionString = `postgresql://postgres.${projectRef}:${process.env.SUPABASE_SERVICE_KEY?.trim()}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

        console.log(`Project: ${projectRef}\n`);
        console.log('⚠️  Note: This may fail. Please use DATABASE_URL for reliable connection.\n');
    }

    console.log('🔍 Connecting to Supabase database...\n');

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });

    try {
        // Test connection
        await pool.query('SELECT NOW()');
        console.log('✅ Connected successfully!\n');

        await auditWithDirectQueries(pool);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('\nTroubleshooting tips:');
        console.error('1. Verify your SUPABASE_URL is correct');
        console.error('2. Verify your SUPABASE_SERVICE_KEY is correct (should start with "eyJ")');
        console.error('3. Check if your Supabase project is active');
        console.error('4. Ensure your IP is not blocked by Supabase');
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

async function auditWithDirectQueries(pool) {
    let report = '# Supabase Database Schema Audit Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += '---\n\n';

    const existingTables = new Set();
    const schemaDetails = {};

    try {
        // Get all tables using information_schema
        console.log('📊 Querying database tables...\n');

        const tablesResult = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        const tables = tablesResult.rows;

        console.log(`Found ${tables.length} tables in database\n`);

        report += '## 📋 Executive Summary\n\n';
        report += `**Total Tables Found:** ${tables.length}\n\n`;

        // Get details for each table
        for (const table of tables) {
            const tableName = table.table_name;
            existingTables.add(tableName);

            console.log(`📦 Analyzing table: ${tableName}`);

            // Get columns
            const columnsResult = await pool.query(
                `
                SELECT
                    column_name,
                    data_type,
                    is_nullable,
                    column_default,
                    character_maximum_length,
                    udt_name
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = $1
                ORDER BY ordinal_position
            `,
                [tableName]
            );

            const columns = columnsResult.rows;

            // Get indexes
            const indexesResult = await pool.query(
                `
                SELECT
                    indexname,
                    indexdef
                FROM pg_indexes
                WHERE schemaname = 'public'
                AND tablename = $1
            `,
                [tableName]
            );

            const indexes = indexesResult.rows;

            // Get foreign keys
            const fksResult = await pool.query(
                `
                SELECT
                    tc.constraint_name,
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
                AND tc.table_name = $1
            `,
                [tableName]
            );

            const foreignKeys = fksResult.rows;

            // Get row count
            const countResult = await pool.query(`
                SELECT COUNT(*) as count FROM "${tableName}"
            `);
            const rowCount = parseInt(countResult.rows[0].count);

            schemaDetails[tableName] = {
                columns,
                indexes,
                foreignKeys,
                rowCount,
            };

            console.log(
                `  ✓ ${columns.length} columns, ${indexes.length} indexes, ${foreignKeys.length} foreign keys, ${rowCount} rows\n`
            );
        }

        // Build the report
        report += '\n## 🎯 Schema Comparison\n\n';
        report += '### Required Tables vs Existing Tables\n\n';

        const requiredTables = Object.keys(REQUIRED_SCHEMA);
        const missingTables = requiredTables.filter((t) => !existingTables.has(t));
        const extraTables = Array.from(existingTables).filter((t) => !requiredTables.includes(t));
        const presentTables = requiredTables.filter((t) => existingTables.has(t));

        report += `| Status | Count | Tables |\n`;
        report += `|--------|-------|--------|\n`;
        report += `| ✅ Present | ${presentTables.length} | ${presentTables.join(', ') || 'None'} |\n`;
        report += `| ❌ Missing | ${missingTables.length} | ${missingTables.join(', ') || 'None'} |\n`;
        report += `| ℹ️ Extra | ${extraTables.length} | ${extraTables.join(', ') || 'None'} |\n`;

        report += '\n---\n\n';

        // Detailed table information
        report += '## 📊 Existing Tables (Detailed)\n\n';

        for (const tableName of Array.from(existingTables).sort()) {
            const details = schemaDetails[tableName];
            const required = REQUIRED_SCHEMA[tableName];

            report += `### \`${tableName}\`\n\n`;

            if (required) {
                report += `**Purpose:** ${required.description}\n\n`;
                report += `**Status:** ✅ Required table exists\n\n`;
            } else {
                report += `**Status:** ℹ️ Extra table (not in required schema)\n\n`;
            }

            report += `**Row Count:** ${details.rowCount.toLocaleString()}\n\n`;

            // Columns
            report += '#### Columns\n\n';
            report += '| Column Name | Data Type | Nullable | Default | Required? |\n';
            report += '|-------------|-----------|----------|---------|----------|\n';

            for (const col of details.columns) {
                const isRequired = required && required.requiredColumns.includes(col.column_name);
                const requiredMark = isRequired ? '✅' : '';
                const dataType = col.character_maximum_length
                    ? `${col.data_type}(${col.character_maximum_length})`
                    : col.udt_name;
                report += `| \`${col.column_name}\` | ${dataType} | ${col.is_nullable} | ${col.column_default || '-'} | ${requiredMark} |\n`;
            }

            // Check for missing required columns
            if (required) {
                const existingColumns = details.columns.map((c) => c.column_name);
                const missingColumns = required.requiredColumns.filter(
                    (c) => !existingColumns.includes(c)
                );

                if (missingColumns.length > 0) {
                    report += `\n**⚠️ Missing Required Columns:** ${missingColumns.join(', ')}\n`;
                }
            }

            report += '\n';

            // Indexes
            if (details.indexes.length > 0) {
                report += '#### Indexes\n\n';
                for (const idx of details.indexes) {
                    report += `- \`${idx.indexname}\`\n`;
                    report += `  \`\`\`sql\n  ${idx.indexdef}\n  \`\`\`\n`;
                }
                report += '\n';
            }

            // Foreign Keys
            if (details.foreignKeys.length > 0) {
                report += '#### Foreign Keys\n\n';
                report += '| Constraint | Column | References |\n';
                report += '|------------|--------|------------|\n';
                for (const fk of details.foreignKeys) {
                    report += `| \`${fk.constraint_name}\` | \`${fk.column_name}\` | \`${fk.foreign_table_name}.${fk.foreign_column_name}\` |\n`;
                }
                report += '\n';
            }

            report += '---\n\n';
        }

        // Missing tables section
        if (missingTables.length > 0) {
            report += '## ❌ Missing Required Tables\n\n';
            report +=
                'These tables are required for the Jelly app but do not exist in the database:\n\n';

            for (const tableName of missingTables) {
                const spec = REQUIRED_SCHEMA[tableName];
                report += `### \`${tableName}\`\n\n`;
                report += `**Purpose:** ${spec.description}\n\n`;
                report += '**Required Columns:**\n';
                for (const col of spec.requiredColumns) {
                    report += `- \`${col}\`\n`;
                }
                report += '\n---\n\n';
            }
        }

        // Recommendations
        report += '## 💡 Recommendations\n\n';

        if (missingTables.length === 0) {
            report += '✅ **All required tables are present!**\n\n';

            // Check for missing columns in existing tables
            let hasMissingColumns = false;
            for (const tableName of presentTables) {
                const details = schemaDetails[tableName];
                const required = REQUIRED_SCHEMA[tableName];
                const existingColumns = details.columns.map((c) => c.column_name);
                const missingColumns = required.requiredColumns.filter(
                    (c) => !existingColumns.includes(c)
                );

                if (missingColumns.length > 0) {
                    hasMissingColumns = true;
                    report += `⚠️ **Table \`${tableName}\` is missing columns:** ${missingColumns.join(', ')}\n\n`;
                }
            }

            if (!hasMissingColumns) {
                report += '✅ **All required columns are present!**\n\n';
            }
        } else {
            report += `**Action Required:** ${missingTables.length} table(s) need to be created\n\n`;
        }

        if (extraTables.length > 0) {
            report += `**Review:** ${extraTables.length} extra table(s) exist that are not in the required schema:\n`;
            for (const t of extraTables) {
                report += `- \`${t}\` (${schemaDetails[t].rowCount} rows)\n`;
            }
            report += '\n';
        }

        report += '\n### Next Steps\n\n';
        if (missingTables.length > 0) {
            report += '1. Create SQL migration scripts for missing tables\n';
            report +=
                '2. Set up proper indexes for performance (especially on foreign keys and geo columns)\n';
            report += '3. Configure Row Level Security (RLS) policies\n';
            report += '4. Add proper foreign key constraints\n';
        } else {
            report += '1. Review data in existing tables\n';
            report += '2. Verify indexes are optimized for your queries\n';
            report += '3. Check Row Level Security (RLS) policies are properly configured\n';
            report += '4. Test foreign key constraints are working correctly\n';
            report += '5. Set up data ingestion scripts for restaurant data\n';
        }

        await saveReport(report);

        console.log('\n✅ Audit complete!');
        console.log(`📄 Report saved to: scripts/schema-audit-report.md\n`);

        // Print summary
        console.log('📈 Summary:');
        console.log(`  ✅ Present: ${presentTables.length} tables`);
        console.log(`  ❌ Missing: ${missingTables.length} tables`);
        console.log(`  ℹ️  Extra: ${extraTables.length} tables\n`);
    } catch (error) {
        console.error('❌ Error during audit:', error.message);
        console.error(error);
        report += `\n## ❌ Error During Audit\n\n${error.message}\n`;
        await saveReport(report);
    }
}

async function saveReport(report) {
    const reportPath = path.join(__dirname, 'schema-audit-report.md');
    fs.writeFileSync(reportPath, report);
}

// Run the audit
auditSchema().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

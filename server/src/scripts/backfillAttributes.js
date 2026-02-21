#!/usr/bin/env node
/**
 * Backfill structured attributes for all restaurants from Google Places API (New).
 *
 * Fetches boolean venue attributes — outdoor seating, good for groups, kid-friendly,
 * reservable, meal periods, alcohol, live music, etc. — and stores them in the
 * `attributes` JSON column on each restaurant row.
 *
 * These attributes are used as hard-constraint signals when context-aware ranking
 * is applied (e.g. "outdoor seating" → filter/penalise restaurants without it).
 *
 * Usage:
 *   node src/scripts/backfillAttributes.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const GOOGLE_API_KEY   = process.env.GOOGLE_PLACES_API_KEY?.replace(/["']/g, '').trim();
const GOOGLE_API_BASE  = 'https://places.googleapis.com/v1';
const DELAY_MS         = 300;   // stay under 5 req/s quota
const MAX_RETRIES      = 3;
const RETRY_DELAY_MS   = 1000;

// All boolean attribute fields available from the New Places API
const ATTRIBUTE_FIELDS = [
    'outdoorSeating',
    'goodForGroups',
    'goodForChildren',
    'reservable',
    'servesCocktails',
    'servesWine',
    'servesBeer',
    'servesVegetarianFood',
    'servesDessert',
    'servesCoffee',
    'servesLunch',
    'servesDinner',
    'servesBreakfast',
    'servesBrunch',
    'liveMusic',
    'menuForChildren',
    'delivery',
    'dineIn',
    'takeout',
    'curbsidePickup',
];

const prisma = new PrismaClient();

// ─── helpers ────────────────────────────────────────────────────────────────

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function retryWithBackoff(fn, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === retries - 1) throw err;
            const delay = RETRY_DELAY_MS * Math.pow(2, i);
            console.log(`    Retry ${i + 1}/${retries} after ${delay}ms — ${err.message}`);
            await sleep(delay);
        }
    }
}

// ─── core fetch ─────────────────────────────────────────────────────────────

async function fetchAttributes(googlePlaceId) {
    const url = `${GOOGLE_API_BASE}/places/${googlePlaceId}`;
    const fieldMask = ATTRIBUTE_FIELDS.join(',');

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_API_KEY,
            'X-Goog-FieldMask': fieldMask,
        },
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status}: ${body.slice(0, 200)}`);
    }

    const data = await response.json();

    // Extract only the fields we asked for (Google may return unknown fields too)
    const attributes = {};
    for (const field of ATTRIBUTE_FIELDS) {
        if (data[field] !== undefined) {
            attributes[field] = data[field];
        }
    }

    return attributes;
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main() {
    if (!GOOGLE_API_KEY) {
        console.error('Missing GOOGLE_PLACES_API_KEY in .env');
        process.exit(1);
    }

    console.log('\n====================================================');
    console.log('   Backfill Structured Attributes from Google Places');
    console.log('====================================================\n');

    // Fetch all restaurants that have a Google source ID
    const restaurants = await prisma.restaurant.findMany({
        where: {
            source: 'GOOGLE',
            sourceId: { not: null },
        },
        select: { id: true, name: true, sourceId: true },
    });

    console.log(`Found ${restaurants.length} restaurants with Google source IDs.\n`);

    const stats = { succeeded: 0, failed: 0, skipped: 0 };

    for (let i = 0; i < restaurants.length; i++) {
        const { id, name, sourceId } = restaurants[i];
        console.log(`[${i + 1}/${restaurants.length}] ${name}`);

        try {
            const attributes = await retryWithBackoff(() => fetchAttributes(sourceId));

            if (Object.keys(attributes).length === 0) {
                console.log('  No attribute data returned — skipping update.');
                stats.skipped++;
            } else {
                await prisma.restaurant.update({
                    where: { id },
                    data: { attributes },
                });

                // Log what we got
                const present = Object.entries(attributes)
                    .filter(([, v]) => v === true)
                    .map(([k]) => k);
                console.log(`  Saved ${Object.keys(attributes).length} fields.`);
                if (present.length > 0) {
                    console.log(`  True: ${present.join(', ')}`);
                }

                stats.succeeded++;
            }
        } catch (err) {
            console.error(`  FAILED: ${err.message}`);
            stats.failed++;
        }

        await sleep(DELAY_MS);
    }

    console.log('\n====================================================');
    console.log('   Backfill Complete');
    console.log('====================================================');
    console.log(`Succeeded : ${stats.succeeded}`);
    console.log(`Skipped   : ${stats.skipped}`);
    console.log(`Failed    : ${stats.failed}`);
    console.log('====================================================\n');

    await prisma.$disconnect();
}

main().catch((err) => {
    console.error('Fatal:', err);
    prisma.$disconnect();
    process.exit(1);
});

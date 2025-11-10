# Foursquare Places API Seeding Guide

This guide explains how to use the Foursquare seeding script to populate your database with 150 real restaurants from Austin, TX.

## Setup

### 1. Get a Foursquare API Key

1. Go to [https://location.foursquare.com/developer/](https://location.foursquare.com/developer/)
2. Sign up or log in to your Foursquare account
3. Create a new project in the Foursquare Developer Console
4. Copy your API key (it will look like: `fsq3xxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 2. Add API Key to Environment Variables

Open your `.env` file and replace `your_foursquare_api_key_here` with your actual Foursquare API key:

```bash
FOURSQUARE_API_KEY=fsq3xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Running the Script

Run the following command to fetch and seed 150 restaurants from Austin:

```bash
npm run seed:foursquare
```

## What the Script Does

1. **Fetches basic place data**: Makes multiple requests to get 150 restaurants in Austin, TX
   - Uses 50 places per request (Foursquare's max limit)
   - Searches within 20km radius of Austin city center
   - Filters for Food & Dining category (ID: 13000)
   - Sorts by popularity

2. **Fetches detailed information**: For each place, makes an additional API call to get:
   - Photos (up to 5 additional images)
   - Ratings and reviews
   - Price level
   - Contact information (phone, email, website)
   - Social media handles
   - Hours of operation
   - Detailed descriptions

3. **Transforms data**: Converts Foursquare place data to match your database schema
   - Converts Foursquare's 0-10 rating scale to 0-5 scale
   - Converts price level (1-4) to $ signs ($, $$, $$$, $$$$)
   - Extracts and formats location data

4. **Inserts restaurants**: Populates the `restaurants` table with complete information

5. **Creates tags**: Extracts unique categories from Foursquare and creates tags in the `tags` table

6. **Links tags to restaurants**: Creates relationships in the `restaurant_tags` join table

7. **Inserts additional images**: Saves up to 5 additional photos per restaurant
   - Stores in `restaurant_images` table
   - Links to restaurants via `restaurant_image_links` table

## Script Features

- Uses native JavaScript `fetch` (no axios dependency)
- Fully typed with TypeScript
- Comprehensive error handling
- Progress logging throughout the process
- Respects API rate limits with delays (100ms between detail requests)
- Fetches detailed information for each restaurant
- Handles missing data gracefully
- Follows your existing database schema and patterns

## Output

The script will output detailed progress information and a final summary.

Example output:
```
Starting Foursquare Austin restaurant seeding...

Fetching places from Foursquare API (offset: 0)...
✓ Fetched 50 places from Foursquare
Fetching places from Foursquare API (offset: 50)...
✓ Fetched 50 places from Foursquare
Fetching places from Foursquare API (offset: 100)...
✓ Fetched 50 places from Foursquare

✓ Total places fetched: 150

Fetching detailed information for each place...
  Progress: 10/150 places
  Progress: 20/150 places
  ...
  Progress: 150/150 places
✓ Fetched details for 150 places

Inserting restaurants into database...
✓ Inserted 150 restaurants

Extracting and inserting tags...
✓ Inserted 38 tags

Linking tags to restaurants...
✓ Created 287 restaurant-tag links

Inserting additional restaurant images...
✓ Inserted 623 restaurant images
✓ Linked 623 images to restaurants

========================================
✅ Foursquare Austin seeding completed successfully!
========================================
Restaurants inserted: 150
Tags inserted: 38
Restaurant-tag links created: 287
Additional images inserted: 623
========================================
```

## Data Quality Notes

### Foursquare vs Yelp Differences

- **Ratings**: Foursquare uses a 0-10 scale (converted to 0-5 for consistency)
- **Photos**: Foursquare typically has more photos per venue
- **Categories**: Foursquare has a hierarchical category system
- **Reviews**: Review counts may be lower than Yelp
- **Price**: Uses 1-4 scale (converted to $-$$$$)

### What Gets Populated

- ✓ Restaurant name, address, coordinates
- ✓ Ratings and review counts
- ✓ Categories/tags
- ✓ Photos (main image + up to 5 additional)
- ✓ Contact info (phone, website)
- ✓ Social media (Instagram if available)
- ✓ Price level
- ✗ Transactions (not available in Foursquare API)
- ✗ TikTok (not available in Foursquare API)

## API Rate Limits

The Foursquare Places API has rate limits:
- Free tier: 50 requests per day, 1 request per second
- Personal tier: 10,000 requests per day
- Premium tier: Custom limits

**Important**: This script makes **151+ API calls** (1 search + 150 detail requests). Make sure your API tier supports this:
- With free tier: You'll need to run the script over 4 days or reduce the number of restaurants
- With personal tier: You can run this script multiple times per day

The script includes 100ms delays between detail requests to avoid hitting rate limits.

## Notes

- All restaurants will have `source: 'FOURSQUARE'` in the database
- Tags are created with `type: 'FOOD'` since Foursquare categories are primarily food-related
- The script will exit with an error if:
  - FOURSQUARE_API_KEY is not set
  - Supabase credentials are missing
  - API requests fail
  - Database operations fail

## Troubleshooting

### "Missing FOURSQUARE_API_KEY environment variable"
Make sure you've added your Foursquare API key to the `.env` file.

### "Foursquare API request failed: 401"
Your API key is invalid or hasn't been activated. Check that you copied it correctly from the Foursquare Developer Console.

### "Foursquare API request failed: 429"
You've hit the rate limit. If on free tier, you'll need to:
- Wait until tomorrow
- Upgrade to a paid tier
- Reduce TOTAL_RESTAURANTS constant in the script

### Slower execution
The script fetches detailed information for each restaurant, which takes time. For 150 restaurants with 100ms delays:
- Estimated time: ~15-20 seconds for search requests
- Estimated time: ~15 seconds for detail requests (150 × 100ms)
- Total: ~30-35 seconds

### Database errors
Make sure your Supabase database is set up with the correct schema and that the `source` enum includes 'FOURSQUARE'.

## Customization

You can customize the search parameters in the script:

```typescript
// Change location
const AUSTIN_COORDINATES = { lat: 30.2672, lng: -97.7431 };

// Change search radius (in meters)
url.searchParams.append('radius', '20000'); // 20km

// Change total restaurants
const TOTAL_RESTAURANTS = 150;

// Change category (13000 = Food & Dining)
url.searchParams.append('categories', '13000');
```

## Combining with Other Sources

You can run both Yelp and Foursquare seeding scripts to get restaurants from multiple sources:

```bash
npm run seed:yelp
npm run seed:foursquare
```

This will give you 300 total restaurants (150 from each source) in your database, allowing you to provide users with comprehensive restaurant coverage.

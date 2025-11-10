# Yelp API Seeding Guide

This guide explains how to use the Yelp seeding script to populate your database with 150 real restaurants from Austin, TX.

## Setup

### 1. Get a Yelp API Key

1. Go to [https://www.yelp.com/developers](https://www.yelp.com/developers)
2. Sign up or log in to your Yelp account
3. Create a new app in the Yelp Developers portal
4. Copy your API key

### 2. Add API Key to Environment Variables

Open your `.env` file and replace `your_yelp_api_key_here` with your actual Yelp API key:

```bash
YELP_API_KEY=your_actual_api_key_here
```

## Running the Script

Run the following command to fetch and seed 150 restaurants from Austin:

```bash
npm run seed:yelp
```

## What the Script Does

1. **Fetches restaurants**: Makes multiple requests to the Yelp API to fetch 150 restaurants in Austin, TX
   - Uses 50 restaurants per request (Yelp's max limit)
   - Includes a 500ms delay between requests to respect rate limits

2. **Transforms data**: Converts Yelp business data to match your database schema

3. **Inserts restaurants**: Populates the `restaurants` table with:
   - Basic info (name, rating, review count, etc.)
   - Location data (address, coordinates, city, state, zip)
   - Contact info (phone, URL)
   - Additional metadata (price, transactions, images)

4. **Creates tags**: Extracts unique categories from Yelp and creates tags in the `tags` table

5. **Links tags to restaurants**: Creates relationships in the `restaurant_tags` join table

## Script Features

- Uses native JavaScript `fetch` (no axios dependency)
- Properly typed with TypeScript
- Error handling for API failures
- Progress logging throughout the process
- Respects Yelp API rate limits with delays
- Follows your existing database schema and patterns

## Output

The script will output:
- Number of restaurants inserted
- Number of unique tags created
- Number of restaurant-tag links created

Example output:
```
Starting Yelp Austin restaurant seeding...

Fetching restaurants from Yelp API (offset: 0)...
✓ Fetched 50 restaurants from Yelp
Fetching restaurants from Yelp API (offset: 50)...
✓ Fetched 50 restaurants from Yelp
Fetching restaurants from Yelp API (offset: 100)...
✓ Fetched 50 restaurants from Yelp

✓ Total restaurants fetched: 150

Inserting restaurants into database...
✓ Inserted 150 restaurants

Extracting and inserting tags...
✓ Inserted 45 tags

Linking tags to restaurants...
✓ Created 312 restaurant-tag links

========================================
✅ Yelp Austin seeding completed successfully!
========================================
Restaurants inserted: 150
Tags inserted: 45
Restaurant-tag links created: 312
========================================
```

## Notes

- The script fetches restaurants with `best_match` sorting from Yelp
- All restaurants will have `source: 'YELP'` in the database
- Tags are created with `type: 'FOOD'` since Yelp categories are primarily food-related
- The script will exit with an error if:
  - YELP_API_KEY is not set
  - Supabase credentials are missing
  - API requests fail
  - Database operations fail

## Troubleshooting

### "Missing YELP_API_KEY environment variable"
Make sure you've added your Yelp API key to the `.env` file.

### "Yelp API request failed: 401"
Your API key is invalid. Check that you copied it correctly from the Yelp Developers portal.

### "Yelp API request failed: 429"
You've hit the rate limit. Wait a few minutes and try again.

### Database errors
Make sure your Supabase database is set up with the correct schema and tables.

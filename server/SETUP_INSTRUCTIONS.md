# 🚀 Setup Instructions - Enable Multi-Photo & Reviews

Follow these steps to enable proper data ingestion with multiple photos and reviews.

---

## Step 1: Run SQL Migration in Supabase

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard/project/ituiifzbivdpssfxtgmq/sql/new

2. **Copy & Paste the SQL**
   - Open: `server/migrations/01_fix_schema_and_enable_rls.sql`
   - Copy the entire file
   - Paste into the SQL Editor

3. **Run the Migration**
   - Click "Run" button
   - Wait for "✅ Migration completed successfully!" message

This migration will:
- ✅ Fix reviews table (add restaurant_id, review_text, author_name columns)
- ✅ Create/fix restaurant_image table
- ✅ Enable RLS policies on all tables
- ✅ Add proper indexes for performance
- ✅ Allow REST API access to all tables

---

## Step 2: Verify Migration Worked

Run this in Supabase SQL Editor:

```sql
-- Test that tables are accessible
SELECT COUNT(*) FROM restaurant_image;
SELECT COUNT(*) FROM reviews;

-- Check reviews columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'reviews' AND table_schema = 'public'
ORDER BY ordinal_position;
```

Expected output:
```
restaurant_id ✅
review_text ✅
author_name ✅
rating ✅
created_at ✅
```

---

## Step 3: Re-run Ingestion Script

Once the SQL migration is done, run:

```bash
cd /Users/pranavpudu/Desktop/jelly/my_first_app/server
node scripts/ingestGooglePlaces.js
```

This will:
- ✅ Download 8 photos per restaurant from Google
- ✅ Save to restaurant_image table (not just 1 hero image)
- ✅ Classify photos (hero, food, ambiance)
- ✅ Save 5 reviews per restaurant
- ✅ Save operating hours
- ✅ Save cuisine tags

---

## Step 4: Update App (I'll do this automatically)

I'll update:
- ✅ Transformer to fetch from restaurant_image table
- ✅ Transformer to fetch from reviews table
- ✅ Service to join photos and reviews

---

## What You'll Get

After running these steps, each restaurant will have:

### Photos:
- 1 hero/cover image
- 4 food dish images
- 3 ambiance images
- **Total: 8 real photos from Google Places**

### Reviews:
- Up to 5 real Google reviews with:
  - Author names
  - Full review text
  - Star ratings
  - Publish dates

### Other Data:
- Operating hours (open/close times per day)
- Cuisine tags (Italian, BBQ, etc.)
- Raw Google Places data for future use

---

## Current Status

- ❌ SQL Migration: **NOT RUN YET** (waiting for you)
- ⏸️ Ingestion Script: Ready to run after SQL
- ⏸️ App Updates: Will do after SQL migration

---

## Ready?

**Tell me when you've run the SQL migration**, and I'll:
1. ✅ Update the ingestion script (if needed)
2. ✅ Update the app transformer to fetch photos & reviews
3. ✅ Re-run ingestion for 10-50 restaurants
4. ✅ Test in the app

Then your cards will show:
- 🖼️ Multiple real photos (not repeated)
- 💬 Real review quotes
- ⭐ Better hero images
- 🍽️ Food dish photos
- 🏠 Ambiance photos

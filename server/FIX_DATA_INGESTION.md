# How to Fix Data Ingestion - Get Multiple Photos & Reviews

## The Problem

Your ingestion script **tried** to save:
- ✅ 8 photos per restaurant → **FAILED** (RLS policies)
- ✅ 5 reviews per restaurant → **FAILED** (schema mismatch)
- ✅ Operating hours → **FAILED** (RLS policies)
- ✅ Cuisine tags → **FAILED** (RLS policies)

So you only have **1 photo per restaurant** right now.

---

## 🚀 QUICKEST FIX (Recommended - 5 minutes)

### Step 1: Run SQL Migration

Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) and run:

```sql
-- Add photos array to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- Add review details array
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS review_data JSONB DEFAULT '[]'::jsonb;
```

### Step 2: Update Ingestion Script

I'll create an updated script that:
- Saves multiple photos to `photos` JSON column
- Classifies photos: 1st = hero, next 4 = food, rest = ambiance
- Saves reviews to `review_data` JSON column

### Step 3: Update App Transformer

Update the transformer to read from `photos` and `review_data` columns.

### Step 4: Re-run Ingestion

Re-run for 10-50 restaurants with working multi-photo support!

---

## 🔧 BETTER FIX (10 minutes, more structured)

### Run Both SQL Files:

1. **`add_photos_column.sql`** - Adds JSON columns
2. **`enable_rls_policies.sql`** - Enables proper table access

This allows:
- ✅ Multiple photos in separate `restaurant_image` table
- ✅ Reviews in proper `reviews` table (with schema fix)
- ✅ Operating hours in `hours` table
- ✅ Cuisine tags in `cuisine` tables

---

## 📊 What Data You'll Get

### With Either Fix:
- **Multiple Photos** (up to 8 per restaurant)
  - 1 hero image
  - 4 food photos
  - 3 ambiance photos

- **Real Reviews** (up to 5 per restaurant)
  - Author names
  - Full review text
  - Star ratings

- **Better UI**
  - Scrollable ambiance gallery
  - Multiple food items with real photos
  - Actual review quotes

---

## 🎯 Recommendation

**Go with Option 1** (Quick Fix) for now:

1. It's fastest (just add 2 columns)
2. Works immediately
3. No schema changes needed
4. Can migrate to proper tables later

**Use Option 2** if you want:
- More structured data
- Separate tables for better querying
- Production-ready architecture

---

## ⚡ Ready to Fix?

Tell me which option you want, and I'll:
1. ✅ Update the ingestion script
2. ✅ Update the app transformer
3. ✅ Re-run ingestion for 10-50 restaurants
4. ✅ Show you the results!

Then your cards will have:
- **Real ambiance photos** (not repeated)
- **Real food dish photos**
- **Real review text** from Google
- **Better hero images**

# Photo Classification & Data Enhancement Solution

## The Problem

### Google Places API Limitations:
- ❌ No photo type tags (food vs ambiance vs menu)
- ❌ Just provides generic "photos" array
- ❌ No way to know what each photo shows
- ❌ Limited review data

### Current Naive Approach:
```javascript
// Just guessing by index
Photo 0 = COVER
Photos 1-4 = FOOD  // ❌ Wrong! Could be anything
Photos 5-7 = AMBIANCE  // ❌ Wrong! Could be food or exterior
```

**Result**: Menu photos showing as food, food showing as ambiance, etc.

---

## The Solution: Hybrid Google + Yelp

### Why Yelp?
✅ Yelp provides explicit photo categories:
- `food` photos
- `inside` photos (ambiance)
- `outside` photos (exterior)
- `menu` photos (separate!)
- `drink` photos

✅ Yelp has better review data with full text

✅ Yelp matches by business name + location

---

## Implementation Strategy

### Phase 1: Add Yelp API Integration

1. **Yelp Business Search** - Match restaurant by name + coordinates
2. **Yelp Business Details** - Get photos with categories
3. **Yelp Reviews** - Get additional reviews

### Phase 2: Data Merging Logic

```
For each restaurant:
  1. Get data from Google Places (primary)
     - Basic info, ratings, address
     - All photos (unclassified)

  2. Get data from Yelp (supplemental)
     - Photos with proper categories
     - More reviews
     - Menu photos

  3. Merge intelligently:
     - Use Google's basic data (more accurate)
     - Use Yelp's photo classifications
     - Combine reviews from both sources
     - Prioritize Yelp menu photos
```

### Phase 3: Photo Classification

```javascript
// From Google Places
heroImage = photos[0]  // First photo is usually best

// From Yelp
foodPhotos = yelp.photos.filter(p => p.category === 'food')
ambiancePhotos = yelp.photos.filter(p => ['inside', 'outside'].includes(p.category))
menuPhotos = yelp.photos.filter(p => p.category === 'menu')

// Combine
allFoodPhotos = [...foodPhotos, ...googlePhotos[1-4]]  // Yelp first, then Google guesses
```

---

## Data Structure

### restaurant_image table (updated):
```sql
{
  id: UUID
  restaurant_id: UUID
  image_url: TEXT
  image_type: 'COVER' | 'FOOD' | 'AMBIANCE' | 'MENU'
  source: 'GOOGLE' | 'YELP'  -- Track which API
  is_primary: BOOLEAN
  display_order: INTEGER
  created_at: TIMESTAMP
}
```

### reviews table (already supports both):
```sql
{
  id: UUID
  restaurant_id: UUID
  source: 'GOOGLE' | 'YELP'
  rating: INTEGER
  review_text: TEXT
  author_name: TEXT
  ...
}
```

---

## Benefits

### Better Photo Classification:
- ✅ Menu photos in menu section
- ✅ Food photos in food section
- ✅ Ambiance photos in ambiance section
- ✅ 2x more photos (Google + Yelp)

### More Data:
- ✅ More reviews (Google + Yelp combined)
- ✅ Better review text
- ✅ Yelp ratings for comparison
- ✅ Multiple data sources = more complete

### Fallback Strategy:
- If Yelp match not found, use Google only
- If Yelp has no menu photos, use none
- Gracefully degrade

---

## API Costs

### Yelp API:
- **Free Tier**: 500 calls/day
- **Per Restaurant**:
  - 1 search call (find business)
  - 1 details call (get photos)
  - = 2 calls per restaurant

### Combined Cost (Google + Yelp):
- **10 restaurants**: $0.80 (Google) + Free (Yelp) = $0.80
- **50 restaurants**: $4 (Google) + Free (Yelp) = $4
- **100 restaurants**: $8 (Google) + Free (Yelp) = $8

---

## Implementation Plan

### Step 1: Get Yelp API Key ✅
- Sign up at https://www.yelp.com/developers
- Get API key
- Add to `.env`

### Step 2: Create Yelp Integration Module
- `yelpClient.js` - API wrapper
- `searchBusiness()` - Find restaurant
- `getBusinessDetails()` - Get photos
- `getReviews()` - Get reviews

### Step 3: Update Ingestion Script
- After Google Places fetch, also fetch from Yelp
- Merge photo data with proper classifications
- Insert both into database

### Step 4: Re-ingest Data
- Clear old photos
- Re-run with hybrid approach
- Verify correct classifications

---

## Next Steps

1. **Do you have a Yelp API key?** If not, we can get one in 2 minutes
2. **I'll create the Yelp integration module**
3. **I'll update the ingestion script** to use both APIs
4. **Re-run ingestion** with proper classifications

Ready to proceed?

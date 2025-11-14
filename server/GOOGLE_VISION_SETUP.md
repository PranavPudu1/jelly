# Google Vision API Setup for Photo Classification

## What Google Vision Does

Google Vision API can analyze images and detect:
- ✅ **Labels** - "food", "dish", "meal", "restaurant interior", "menu", etc.
- ✅ **Text** - Detects if photo is a menu (has text)
- ✅ **Confidence scores** - How sure it is

## Cost

**Vision API Pricing:**
- Label Detection: **$1.50 per 1,000 images**
- Text Detection: **$1.50 per 1,000 images**

**Per Restaurant (8 photos):**
- 8 photos × $0.0015 = **$0.012 per restaurant**
- 10 restaurants = **$0.12**
- 50 restaurants = **$0.60**
- 100 restaurants = **$1.20**

**Total with Google Places:**
- 10 restaurants: $0.80 (Places) + $0.12 (Vision) = **$0.92**
- 50 restaurants: $4.00 (Places) + $0.60 (Vision) = **$4.60**

Very affordable!

---

## Setup Steps

### Step 1: Enable Google Vision API

1. Go to: https://console.cloud.google.com/apis/library/vision.googleapis.com
2. Click "Enable" (same project as Places API)
3. That's it! Uses same API key

**Good news**: You can use the **same Google API key** you're already using for Places!

### Step 2: Install Vision Client (if needed)

We can use the REST API directly with axios (already installed), so no new dependencies needed!

---

## How It Works

### Classification Logic:

```javascript
async function classifyPhoto(imageUrl) {
  // Call Vision API
  const response = await callVisionAPI(imageUrl);

  // Check labels
  const labels = response.labels.map(l => l.description.toLowerCase());

  // Classify based on labels
  if (labels.includes('menu') || hasText) {
    return 'MENU';
  } else if (labels.some(l => ['food', 'dish', 'meal', 'cuisine'].includes(l))) {
    return 'FOOD';
  } else if (labels.some(l => ['interior', 'room', 'furniture'].includes(l))) {
    return 'AMBIANCE';
  } else {
    return 'AMBIANCE'; // Default
  }
}
```

### Classification Categories:

**MENU** - If photo has:
- Label "menu" OR
- Lots of detected text OR
- Labels like "font", "publication"

**FOOD** - If photo has:
- Labels: "food", "dish", "meal", "cuisine", "ingredient"
- Labels: "plate", "bowl", "serving"

**AMBIANCE** - If photo has:
- Labels: "interior design", "restaurant", "room"
- Labels: "building", "architecture", "furniture"
- Labels: "outdoor", "exterior"

**COVER** - First photo (best quality/most representative)

---

## Implementation

I'll update the ingestion script to:

1. Download photo
2. Upload to Supabase Storage (already doing this)
3. **NEW**: Call Vision API to classify
4. Save to restaurant_image with correct type

---

## API Call Example

```javascript
const response = await axios.post(
  `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
  {
    requests: [{
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 10 },
        { type: 'TEXT_DETECTION' }
      ]
    }]
  }
);
```

---

## Benefits

### Before (Current):
```
Photo 0: COVER ✅
Photo 1: FOOD ❌ (guessing - could be anything)
Photo 2: FOOD ❌ (guessing - could be menu)
Photo 3: FOOD ❌ (guessing - could be ambiance)
Photo 4: FOOD ❌ (guessing)
Photo 5: AMBIANCE ❌ (guessing)
Photo 6: AMBIANCE ❌ (guessing - could be food)
Photo 7: AMBIANCE ❌ (guessing - could be menu)
```

### After (With Vision):
```
Photo 0: COVER ✅
Photo 1: FOOD ✅ (Vision detected: "dish", "meal")
Photo 2: MENU ✅ (Vision detected: "menu", "text")
Photo 3: FOOD ✅ (Vision detected: "food", "plate")
Photo 4: AMBIANCE ✅ (Vision detected: "interior design")
Photo 5: FOOD ✅ (Vision detected: "cuisine")
Photo 6: AMBIANCE ✅ (Vision detected: "restaurant", "room")
Photo 7: AMBIANCE ✅ (Vision detected: "outdoor", "building")
```

---

## Rate Limiting

Vision API has high limits:
- 1,800 requests per minute
- We're doing 8 per restaurant
- Can process 225 restaurants per minute

Our rate limit: 5 requests/sec for Places
So Vision won't be the bottleneck!

---

## Ready to Implement?

Just need you to **run the SQL migration** in Supabase:

1. Open: https://supabase.com/dashboard/project/ituiifzbivdpssfxtgmq/sql/new
2. Copy/paste: `server/migrations/02_add_cuisine_column.sql`
3. Run it
4. Tell me "done"

Then I'll implement Vision API classification and re-ingest!

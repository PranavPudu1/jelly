# Database Schema Migration Summary

## Overview

This document summarizes the migration from the old complex database schema to the new simplified schema based on [db.ts](src/types/db.ts).

## What Was Changed

### 1. Type System ([src/types/](src/types/))

#### New Files Created:
- **enums.ts**: Defines `Source` (YELP, GOOGLE) and `TagType` (FOOD, AMBIANCE) enums
- **database.types.ts**: Core database entity interfaces matching the new schema
- **dto.types.ts**: Data Transfer Objects for API requests/responses
- **supabase.types.ts**: Auto-generated Supabase type definitions
- **index.ts**: Central export point for all types

#### Key Changes:
- Simplified from complex multi-table schema to a more straightforward design
- Removed: PriceTier, Status, SwipeDecision enums, RestaurantStats, Cuisine, Hours, Menu complex structures
- Added: Source and TagType enums, simplified Restaurant, Tag, Review, RestaurantImage, RestaurantItem interfaces
- Unified user interactions under UserSwipe and UserSave

### 2. Database Schema ([migrations/001_schema.sql](migrations/001_schema.sql))

#### Core Tables:
- **restaurants**: Main restaurant data with geospatial support (PostGIS)
- **tags**: Categorization tags with source tracking
- **restaurant_tags**: Many-to-many relationship between restaurants and tags
- **reviews**: Restaurant reviews from various sources
- **restaurant_reviews**: Links reviews to restaurants
- **restaurant_images**: Image URLs with source tracking
- **restaurant_image_links**: Links images to restaurants
- **restaurant_image_tags**: Tags for images
- **restaurant_items**: Menu items
- **restaurant_item_links**: Links items to restaurants with `is_popular` flag
- **restaurant_item_images**: Images for menu items
- **restaurant_item_tags**: Tags for menu items
- **users**: User accounts with location data
- **sessions**: User sessions for tracking
- **user_swipes**: User swipe actions (like/pass)
- **user_saves**: Saved/liked restaurants
- **user_preferences**: User preferences

#### Key Features:
- PostGIS integration for geospatial queries
- Automatic geo column updates via triggers
- `restaurants_within_distance` function for proximity searches
- Proper foreign key relationships with CASCADE deletes

### 3. Supabase Configuration ([src/config/supabase.config.ts](src/config/supabase.config.ts))

#### Changes:
- Added Database type parameter to `SupabaseClient<Database>`
- Updated `TABLES` constant to match new schema:
  - Removed: RESTAURANT_STATS, CUISINES, RESTAURANT_CUISINES, REVIEW_IMAGES, HOURS, PLACE_SOURCES, RESTAURANT_ALIASES, MENUS, MENU_SECTIONS, MENU_ITEMS
  - Added: RESTAURANT_REVIEWS, RESTAURANT_IMAGE_LINKS, RESTAURANT_IMAGE_TAGS, RESTAURANT_ITEMS, RESTAURANT_ITEM_LINKS, RESTAURANT_ITEM_IMAGES, RESTAURANT_ITEM_TAGS, SESSIONS, USER_SAVES

### 4. Restaurant Service ([src/services/restaurant.service.ts](src/services/restaurant.service.ts))

#### Major Changes:
- Completely rewritten to work with new schema
- Uses string literals for table names (`'restaurants'` instead of `TABLES.RESTAURANTS`) for better TypeScript compatibility
- Simplified query structure without complex joins
- New methods:
  - `getRestaurantById()` returns `RestaurantPopulated` with all relationships
  - Private helpers for fetching related data: `getRestaurantTags()`, `getRestaurantReviews()`, `getRestaurantImages()`, `getRestaurantMenuItems()`
- Maintains same public API for backwards compatibility

#### Key Functionality:
- Geospatial filtering using PostGIS `restaurants_within_distance` function
- Tag-based filtering
- User swipe tracking with automatic save creation on "like"
- Pagination support

### 5. Validators ([src/middleware/validators.ts](src/middleware/validators.ts))

#### Changes:
- Updated `createRestaurantValidator` to match new Restaurant fields:
  - Added: `source`, `sourceId`, `image_url`, `is_closed`, `lat`, `long`, `zipCode`, `instagram`, `tiktok`, `tag_ids`
  - Removed: `tagline`, `popularItems` array validation, `ambianceTags`, `reservationInfo`, `cuisine` as string
- Updated `getRestaurantsValidator` to support new query parameters:
  - Added: `latitude`, `longitude`, `maxDistanceMeters`, `tags` array, `minRating`
  - Removed: `cuisine`, `priceRange`
- Updated `saveSwipeValidator`:
  - Changed from `userId`/`restaurantId`/`action` to `user_id`/`restaurant_id`/`decided`
  - `decided` is now a boolean (true = like, false = pass)

### 6. Models ([src/models/restaurant.model.ts](src/models/restaurant.model.ts))

#### Changes:
- Updated re-exports to match new type system
- Now exports: Source, TagType enums and all new interfaces
- Removed exports of old types that no longer exist

### 7. Seed Script ([src/scripts/seedDatabase.ts](src/scripts/seedDatabase.ts))

#### Changes:
- Completely rewritten to match new schema
- Seeds sample data for:
  - 2 sample restaurants (one from each source)
  - 4 sample tags (food and ambiance types)
  - Restaurant-tag associations
  - 2 sample reviews
  - Restaurant-review associations

## Migration Steps

To migrate your Supabase database:

1. **Run the migration SQL**:
   ```bash
   # Connect to your Supabase database and run:
   psql -h your-db-host -U postgres -d postgres -f migrations/001_schema.sql
   ```

2. **Seed the database** (optional, for testing):
   ```bash
   npm run seed
   ```

3. **Update environment variables** (if needed):
   - Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

## API Changes

### Routes

The route definitions remain the same, but request/response formats have changed:

#### POST /api/restaurants
**Old Format**:
```json
{
  "name": "Restaurant Name",
  "tagline": "Great food",
  "location": "123 Main St",
  "cuisine": "Italian",
  "priceRange": "$$"
}
```

**New Format**:
```json
{
  "source": "YELP",
  "name": "Restaurant Name",
  "image_url": "https://...",
  "url": "https://...",
  "rating": 4.5,
  "lat": 37.7749,
  "long": -122.4194,
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "country": "USA",
  "zipCode": 94102,
  "tag_ids": ["uuid1", "uuid2"]
}
```

#### POST /api/restaurants/swipe
**Old Format**:
```json
{
  "userId": "user-id",
  "restaurantId": "restaurant-id",
  "action": "like"
}
```

**New Format**:
```json
{
  "user_id": "user-id",
  "restaurant_id": "restaurant-id",
  "decided": true,
  "session_id": "session-id"
}
```

## Known Issues

### TypeScript Type Inference

Due to how Supabase generates types, there may be TypeScript errors where table types are inferred as `never`. The current workaround is using `as any` type assertions in specific places. This doesn't affect runtime behavior.

**Example**:
```typescript
const { data } = await supabase
  .from('restaurant_tags')
  .select('restaurant_id')
  .in('tag_id', tags) as any; // Type assertion needed
```

### Potential Improvements

1. **Type Safety**: Generate better Supabase types or use a type-safe query builder
2. **Migrations**: Add up/down migration scripts for version control
3. **Testing**: Add integration tests for the new schema
4. **Documentation**: Add API documentation using Swagger/OpenAPI

## Files Reference

### Created:
- `/src/types/enums.ts`
- `/src/types/database.types.ts`
- `/src/types/dto.types.ts`
- `/src/types/supabase.types.ts`
- `/src/types/index.ts`
- `/migrations/001_schema.sql`
- `/MIGRATION_SUMMARY.md` (this file)

### Modified:
- `/src/config/supabase.config.ts`
- `/src/services/restaurant.service.ts`
- `/src/middleware/validators.ts`
- `/src/models/restaurant.model.ts`
- `/src/scripts/seedDatabase.ts`

### Removed (backed up):
- Old type definition files were removed from `/src/types/`

## Next Steps

1. ✅ Types updated
2. ✅ Migration SQL created
3. ✅ Service layer updated
4. ✅ Validators updated
5. ⏳ Run migration on Supabase
6. ⏳ Test endpoints
7. ⏳ Update frontend to use new API format
8. ⏳ Deploy changes

---

*Generated on 2025-11-09*

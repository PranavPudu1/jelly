# Type System Documentation

This directory contains the centralized, professional type system for the Jelly restaurant discovery application.

## Directory Structure

```
types/
├── README.md                 # This file
├── index.ts                  # Central export point for all types
├── enums.ts                  # Database enum types
├── database.types.ts         # Database entity types
├── database.schema.ts        # Supabase-generated schema types
├── supabase.types.ts         # Supabase helper types
└── dto.types.ts             # Data Transfer Objects (DTOs)
```

## File Descriptions

### `index.ts`
Central export point. Import all types from here for convenience:
```typescript
import { Restaurant, PriceTier, CreateRestaurantRequest } from '../types';
```

### `enums.ts`
TypeScript enums that correspond to PostgreSQL enum types in the database:
- `PriceTier` - Restaurant price levels (FREE, CHEAP, MODERATE, EXPENSIVE, LUXURY)
- `Status` - Restaurant status (ACTIVE, INACTIVE, CLOSED)
- `SwipeDecision` - User swipe choices (LIKE, PASS, SUPERLIKE)
- `ImageRole` - Image types (COVER, FOOD, AMBIENCE, MENU_PAGE, LOGO)
- `ReviewSource` - Where reviews come from (GOOGLE, YELP, MANUAL, ZOMATO, OTHER)
- `ModerationStatus` - Content moderation states (PENDING, APPROVED, REJECTED)
- `Provider` - External service providers (GOOGLE, YELP, TRIPADVISOR, OPENTABLE)
- `MenuStatus` - Menu publication status (DRAFT, PUBLISHED, ARCHIVED)

### `database.types.ts`
Type-safe representations of database tables. These types map directly to the PostgreSQL schema:

**Core Entities:**
- `Restaurant` - Main restaurant entity
- `RestaurantStats` - Aggregated statistics
- `Cuisine` - Cuisine types (hierarchical)
- `Tag` - Tags for filtering (ambiance, dietary, etc.)
- `Hours` - Operating hours

**User Entities:**
- `User` - User account
- `UserPreferences` - User preferences for recommendations
- `UserSwipe` - User's like/pass decisions
- `SavedRestaurant` - Favorited restaurants

**Media Entities:**
- `RestaurantImage` - Restaurant photos
- `Review` - User reviews
- `ReviewImage` - Photos attached to reviews

**Menu Entities:**
- `Menu` - Restaurant menu
- `MenuSection` - Menu sections (appetizers, mains, etc.)
- `MenuItem` - Individual menu items

**Junction Tables:**
- `RestaurantCuisine` - Restaurant-to-Cuisine many-to-many
- `RestaurantTag` - Restaurant-to-Tag many-to-many

### `dto.types.ts`
Data Transfer Objects for API requests and responses:

**Response Types:**
- `PaginatedResponse<T>` - Generic pagination wrapper
- `RestaurantWithStats` - Restaurant with aggregated stats
- `RestaurantPopulated` - Restaurant with related data
- `ApiErrorResponse` - Standard error format

**Request Types:**
- `GetRestaurantsQuery` - Query parameters for listing restaurants
- `CreateRestaurantRequest` - Create restaurant payload
- `UpdateRestaurantRequest` - Update restaurant payload (partial)
- `SaveSwipeRequest` - Save user swipe decision
- `CreateReviewRequest` - Create review payload
- `SaveRestaurantRequest` - Save/favorite a restaurant

### `database.schema.ts`
Auto-generated Supabase schema types. Provides type safety for Supabase queries.

**Generate/Update:**
```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.schema.ts
```

### `supabase.types.ts`
Helper types for working with Supabase:
- `Tables<T>` - Get row type for a table
- `TablesInsert<T>` - Get insert type for a table
- `TablesUpdate<T>` - Get update type for a table
- `Enums<T>` - Get enum type
- `Views<T>` - Get view type
- `Functions<T>` - Get function type

## Usage Examples

### Import Types

```typescript
// Recommended: Import from centralized types
import { Restaurant, PriceTier, CreateRestaurantRequest } from '../types';

// Also works: Import from specific files
import { PriceTier } from '../types/enums';
import type { Restaurant } from '../types/database.types';
```

### Using Database Types

```typescript
import type { Restaurant, RestaurantStats } from '../types';
import { Status, PriceTier } from '../types';

const restaurant: Restaurant = {
    id: '123',
    name: 'The Great Restaurant',
    geo: { type: 'Point', coordinates: [-122.4194, 37.7749] },
    price_tier: PriceTier.MODERATE,
    status: Status.ACTIVE,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};
```

### Using DTOs

```typescript
import type { GetRestaurantsQuery, PaginatedResponse, RestaurantWithStats } from '../types';
import { PriceTier } from '../types';

// API Request
const query: GetRestaurantsQuery = {
    page: 1,
    limit: 20,
    cuisines: ['italian', 'japanese'],
    priceMin: PriceTier.CHEAP,
    priceMax: PriceTier.EXPENSIVE,
    latitude: 37.7749,
    longitude: -122.4194,
    maxDistanceMeters: 5000,
};

// API Response
const response: PaginatedResponse<RestaurantWithStats> = {
    data: [...],
    pagination: {
        page: 1,
        limit: 20,
        total: 150,
        hasMore: true,
    },
};
```

### Using Supabase Types

```typescript
import { getSupabase } from '../config/supabase.config';
import type { Tables, TablesInsert } from '../types';

const supabase = getSupabase();

// Type-safe query
const { data } = await supabase
    .from('restaurants')
    .select('*')
    .single();

const restaurant: Tables<'restaurants'> = data;

// Type-safe insert
const newRestaurant: TablesInsert<'restaurants'> = {
    name: 'New Restaurant',
    geo: 'POINT(-122.4194 37.7749)',
    price_tier: 'MODERATE',
    // ... other fields
};
```

## Best Practices

### 1. **Use Type Imports**
Use `import type` for type-only imports to avoid runtime overhead:
```typescript
// Good
import type { Restaurant } from '../types';
import { PriceTier } from '../types'; // Enum needed at runtime

// Avoid (unless you need the value at runtime)
import { Restaurant } from '../types';
```

### 2. **Centralized Imports**
Always import from the central `types` directory:
```typescript
// Good
import { Restaurant, PriceTier } from '../types';

// Avoid
import { Restaurant } from '../types/database.types';
```

### 3. **DTOs for API Boundaries**
Use DTO types for API requests and responses, not database types directly:
```typescript
// Good - Using DTO
function getRestaurants(query: GetRestaurantsQuery): Promise<PaginatedResponse<RestaurantWithStats>>

// Avoid - Using database types directly
function getRestaurants(query: any): Promise<Restaurant[]>
```

### 4. **Enums for Constants**
Use enums for type-safe constants:
```typescript
// Good
import { PriceTier } from '../types';
if (restaurant.price_tier === PriceTier.EXPENSIVE) { ... }

// Avoid
if (restaurant.price_tier === 'EXPENSIVE') { ... }
```

### 5. **Readonly Where Appropriate**
For immutable data, consider using `Readonly<T>`:
```typescript
const config: Readonly<AppConfig> = { ... };
```

## Migration Guide

If you're updating old code that imports from `../models/restaurant.model.ts` or `../databaseDesign.ts`:

**Before:**
```typescript
import { Restaurant, PriceTier } from '../models/restaurant.model';
import { GeoPoint } from '../databaseDesign';
```

**After:**
```typescript
import type { Restaurant, GeoPoint } from '../types';
import { PriceTier } from '../types';
```

The old files are kept for backward compatibility but are deprecated.

## Type Safety Benefits

1. **Compile-time Safety** - Catch errors before runtime
2. **IntelliSense** - Better autocomplete in your IDE
3. **Refactoring** - Rename/modify types safely across the codebase
4. **Documentation** - Types serve as inline documentation
5. **Maintainability** - Clear contracts between layers

## Updating Types

When the database schema changes:

1. Update the SQL migration in `migrations/`
2. Update `database.types.ts` to match new schema
3. Regenerate `database.schema.ts` using Supabase CLI
4. Update DTOs in `dto.types.ts` if API contracts change
5. Run `npm run build` to verify type safety

## Questions?

For questions or suggestions about the type system, please contact the development team or open an issue.

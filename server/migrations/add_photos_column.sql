-- Add photos array to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- Example structure:
-- [
--   {"url": "https://...", "type": "hero"},
--   {"url": "https://...", "type": "food"},
--   {"url": "https://...", "type": "ambiance"}
-- ]

-- Add reviews JSON column for storing review details
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS review_data JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN restaurants.photos IS 'Array of photo objects with URL and type (hero/food/ambiance)';
COMMENT ON COLUMN restaurants.review_data IS 'Array of review objects from Google Places';

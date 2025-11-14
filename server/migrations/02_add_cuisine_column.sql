-- Add cuisine column to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS cuisine_type TEXT;

-- Add index for filtering by cuisine
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine_type);

COMMENT ON COLUMN restaurants.cuisine_type IS 'Primary cuisine type (e.g., Italian, Mexican, American, etc.)';

-- Verify
SELECT '✅ Cuisine column added to restaurants table!' as status;

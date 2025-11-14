-- ============================================================================
-- STEP 1: Fix Reviews Table Schema
-- ============================================================================

-- Add missing columns to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS review_text TEXT;

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS author_name TEXT;

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Update review_text from existing review column if empty
UPDATE reviews SET review_text = review WHERE review_text IS NULL AND review IS NOT NULL;

-- Update created_at from date_created if empty
UPDATE reviews SET created_at = date_created WHERE created_at IS NULL AND date_created IS NOT NULL;

-- Update author_name from reviewed_by if empty
UPDATE reviews SET author_name = reviewed_by WHERE author_name IS NULL AND reviewed_by IS NOT NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

COMMENT ON COLUMN reviews.restaurant_id IS 'Foreign key to restaurants table';
COMMENT ON COLUMN reviews.review_text IS 'Full review text content';
COMMENT ON COLUMN reviews.author_name IS 'Name of the review author';

-- ============================================================================
-- STEP 2: Create/Fix Restaurant Image Table
-- ============================================================================

-- Create restaurant_image table if it doesn't exist
CREATE TABLE IF NOT EXISTS restaurant_image (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT CHECK (image_type IN ('COVER', 'FOOD', 'AMBIANCE', 'MENU')) DEFAULT 'AMBIANCE',
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    source TEXT DEFAULT 'GOOGLE',
    source_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_image_restaurant_id ON restaurant_image(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_image_type ON restaurant_image(image_type);
CREATE INDEX IF NOT EXISTS idx_restaurant_image_primary ON restaurant_image(is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_restaurant_image_order ON restaurant_image(restaurant_id, display_order);

COMMENT ON TABLE restaurant_image IS 'Stores multiple images per restaurant';
COMMENT ON COLUMN restaurant_image.image_type IS 'Type of image: COVER (hero), FOOD (dishes), AMBIANCE (interior/exterior), MENU';
COMMENT ON COLUMN restaurant_image.is_primary IS 'Whether this is the primary/hero image';
COMMENT ON COLUMN restaurant_image.display_order IS 'Order to display images (0 = first)';

-- ============================================================================
-- STEP 3: Enable RLS on Reviews Table
-- ============================================================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access on reviews" ON reviews;
DROP POLICY IF EXISTS "Public read access on reviews" ON reviews;

-- Allow service role to do everything
CREATE POLICY "Service role full access on reviews"
ON reviews FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow public to read reviews
CREATE POLICY "Public read access on reviews"
ON reviews FOR SELECT
TO anon, authenticated
USING (true);

-- ============================================================================
-- STEP 4: Enable RLS on Restaurant Image Table
-- ============================================================================

ALTER TABLE restaurant_image ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access on restaurant_image" ON restaurant_image;
DROP POLICY IF EXISTS "Public read access on restaurant_image" ON restaurant_image;

-- Allow service role to do everything
CREATE POLICY "Service role full access on restaurant_image"
ON restaurant_image FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow public to read images
CREATE POLICY "Public read access on restaurant_image"
ON restaurant_image FOR SELECT
TO anon, authenticated
USING (true);

-- ============================================================================
-- STEP 5: Enable RLS on Hours Table (if exists)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hours') THEN
        ALTER TABLE hours ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Service role full access on hours" ON hours;
        DROP POLICY IF EXISTS "Public read access on hours" ON hours;

        CREATE POLICY "Service role full access on hours"
        ON hours FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);

        CREATE POLICY "Public read access on hours"
        ON hours FOR SELECT
        TO anon, authenticated
        USING (true);

        CREATE INDEX IF NOT EXISTS idx_hours_restaurant_id ON hours(restaurant_id);
    END IF;
END $$;

-- ============================================================================
-- STEP 6: Enable RLS on Cuisine Tables (if exist)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cuisine') THEN
        ALTER TABLE cuisine ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Service role full access on cuisine" ON cuisine;
        DROP POLICY IF EXISTS "Public read access on cuisine" ON cuisine;

        CREATE POLICY "Service role full access on cuisine"
        ON cuisine FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);

        CREATE POLICY "Public read access on cuisine"
        ON cuisine FOR SELECT
        TO anon, authenticated
        USING (true);
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'restaurant_cuisine') THEN
        ALTER TABLE restaurant_cuisine ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Service role full access on restaurant_cuisine" ON restaurant_cuisine;
        DROP POLICY IF EXISTS "Public read access on restaurant_cuisine" ON restaurant_cuisine;

        CREATE POLICY "Service role full access on restaurant_cuisine"
        ON restaurant_cuisine FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);

        CREATE POLICY "Public read access on restaurant_cuisine"
        ON restaurant_cuisine FOR SELECT
        TO anon, authenticated
        USING (true);
    END IF;
END $$;

-- ============================================================================
-- STEP 7: Create place_source table if it doesn't exist
-- ============================================================================

CREATE TABLE IF NOT EXISTS place_source (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'GOOGLE',
    source_place_id TEXT NOT NULL,
    raw_response JSONB,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, source)
);

CREATE INDEX IF NOT EXISTS idx_place_source_restaurant_id ON place_source(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_place_source_place_id ON place_source(source_place_id);

ALTER TABLE place_source ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on place_source" ON place_source;
DROP POLICY IF EXISTS "Public read access on place_source" ON place_source;

CREATE POLICY "Service role full access on place_source"
ON place_source FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Public read access on place_source"
ON place_source FOR SELECT
TO anon, authenticated
USING (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show table info
SELECT
    'reviews' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'reviews'
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT
    'restaurant_image' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'restaurant_image'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show enabled policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('reviews', 'restaurant_image', 'hours', 'cuisine', 'restaurant_cuisine', 'place_source')
ORDER BY tablename, policyname;

SELECT '✅ Migration completed successfully!' as status;

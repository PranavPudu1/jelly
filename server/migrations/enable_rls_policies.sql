-- Enable RLS on restaurant_image table (if it exists)
ALTER TABLE IF EXISTS restaurant_image ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert/update
CREATE POLICY IF NOT EXISTS "Service role full access on restaurant_image"
ON restaurant_image FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow public read access
CREATE POLICY IF NOT EXISTS "Public read access on restaurant_image"
ON restaurant_image FOR SELECT
TO anon, authenticated
USING (true);

-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert/update reviews
CREATE POLICY IF NOT EXISTS "Service role full access on reviews"
ON reviews FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow public read access to reviews
CREATE POLICY IF NOT EXISTS "Public read access on reviews"
ON reviews FOR SELECT
TO anon, authenticated
USING (true);

-- Enable RLS on hours table (if it exists)
ALTER TABLE IF EXISTS hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role full access on hours"
ON hours FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Public read access on hours"
ON hours FOR SELECT
TO anon, authenticated
USING (true);

-- Enable RLS on cuisine tables (if they exist)
ALTER TABLE IF EXISTS cuisine ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS restaurant_cuisine ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public read cuisine"
ON cuisine FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY IF NOT EXISTS "Service role full access cuisine"
ON cuisine FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Public read restaurant_cuisine"
ON restaurant_cuisine FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY IF NOT EXISTS "Service role full access restaurant_cuisine"
ON restaurant_cuisine FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

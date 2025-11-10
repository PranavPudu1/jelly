-- Geospatial helper functions for restaurant queries

/**
 * Function to find restaurants within a certain distance from a point
 * Uses PostGIS ST_DWithin for efficient spatial queries
 */
CREATE OR REPLACE FUNCTION restaurants_within_distance(
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    distance_meters INTEGER
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.name,
        ST_Distance(
            r.geo::geography,
            ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
        ) as distance_meters
    FROM restaurants r
    WHERE ST_DWithin(
        r.geo::geography,
        ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
        distance_meters
    )
    AND r.is_active = true
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql STABLE;

/**
 * Function to calculate distance between a point and a restaurant
 */
CREATE OR REPLACE FUNCTION get_restaurant_distance(
    restaurant_id UUID,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    distance DOUBLE PRECISION;
BEGIN
    SELECT ST_Distance(
        r.geo::geography,
        ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
    ) INTO distance
    FROM restaurants r
    WHERE r.id = restaurant_id;

    RETURN distance;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create an index to speed up geospatial queries
CREATE INDEX IF NOT EXISTS idx_restaurants_geo_gist ON restaurants USING GIST(geo);

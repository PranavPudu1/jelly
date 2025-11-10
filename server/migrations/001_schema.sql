-- Migration: Initial Schema
-- Description: Creates tables for restaurants, users, tags, reviews, and their relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE source_type AS ENUM ('YELP', 'GOOGLE');
CREATE TYPE tag_type AS ENUM ('FOOD', 'AMBIANCE');

-- =====================================================
-- RESTAURANTS
-- =====================================================

CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(255),
    source source_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    url TEXT NOT NULL,
    review_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    lat DECIMAL(10, 8) NOT NULL,
    long DECIMAL(11, 8) NOT NULL,
    geo GEOGRAPHY(POINT, 4326), -- PostGIS geography column for efficient spatial queries
    transactions TEXT[] DEFAULT '{}',
    price VARCHAR(10),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code INTEGER NOT NULL,
    phone VARCHAR(20),
    instagram VARCHAR(255),
    tiktok VARCHAR(255),
    date_added TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT restaurants_rating_check CHECK (rating >= 0 AND rating <= 5)
);

-- Indexes for restaurants
CREATE INDEX idx_restaurants_source ON restaurants(source);
CREATE INDEX idx_restaurants_city ON restaurants(city);
CREATE INDEX idx_restaurants_rating ON restaurants(rating DESC);
CREATE INDEX idx_restaurants_date_added ON restaurants(date_added DESC);
CREATE INDEX idx_restaurants_geo ON restaurants USING GIST(geo);

-- =====================================================
-- TAGS
-- =====================================================

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source source_type NOT NULL,
    value VARCHAR(100) NOT NULL,
    type tag_type NOT NULL,
    source_alias VARCHAR(100),

    CONSTRAINT tags_unique UNIQUE(source, value, type)
);

CREATE INDEX idx_tags_type ON tags(type);
CREATE INDEX idx_tags_value ON tags(value);

-- =====================================================
-- RESTAURANT_TAGS (Many-to-Many)
-- =====================================================

CREATE TABLE restaurant_tags (
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,

    PRIMARY KEY (restaurant_id, tag_id)
);

CREATE INDEX idx_restaurant_tags_restaurant ON restaurant_tags(restaurant_id);
CREATE INDEX idx_restaurant_tags_tag ON restaurant_tags(tag_id);

-- =====================================================
-- REVIEWS
-- =====================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(255),
    source source_type NOT NULL,
    source_url TEXT,
    review TEXT NOT NULL,
    rating DECIMAL(3, 2) NOT NULL,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by VARCHAR(255),

    CONSTRAINT reviews_rating_check CHECK (rating >= 0 AND rating <= 5)
);

CREATE INDEX idx_reviews_source ON reviews(source);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX idx_reviews_date_created ON reviews(date_created DESC);

-- =====================================================
-- RESTAURANT_REVIEWS (Many-to-Many)
-- =====================================================

CREATE TABLE restaurant_reviews (
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,

    PRIMARY KEY (restaurant_id, review_id)
);

CREATE INDEX idx_restaurant_reviews_restaurant ON restaurant_reviews(restaurant_id);
CREATE INDEX idx_restaurant_reviews_review ON restaurant_reviews(review_id);

-- =====================================================
-- RESTAURANT_IMAGES
-- =====================================================

CREATE TABLE restaurant_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(255),
    source source_type NOT NULL,
    url TEXT NOT NULL,
    date_added TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurant_images_source ON restaurant_images(source);

-- =====================================================
-- RESTAURANT_IMAGE_LINKS (Many-to-Many)
-- =====================================================

CREATE TABLE restaurant_image_links (
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    image_id UUID REFERENCES restaurant_images(id) ON DELETE CASCADE,

    PRIMARY KEY (restaurant_id, image_id)
);

CREATE INDEX idx_restaurant_image_links_restaurant ON restaurant_image_links(restaurant_id);
CREATE INDEX idx_restaurant_image_links_image ON restaurant_image_links(image_id);

-- =====================================================
-- RESTAURANT_IMAGE_TAGS (Many-to-Many)
-- =====================================================

CREATE TABLE restaurant_image_tags (
    image_id UUID REFERENCES restaurant_images(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,

    PRIMARY KEY (image_id, tag_id)
);

CREATE INDEX idx_restaurant_image_tags_image ON restaurant_image_tags(image_id);
CREATE INDEX idx_restaurant_image_tags_tag ON restaurant_image_tags(tag_id);

-- =====================================================
-- RESTAURANT_ITEMS (Menu items)
-- =====================================================

CREATE TABLE restaurant_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(255),
    source source_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date_added TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurant_items_source ON restaurant_items(source);
CREATE INDEX idx_restaurant_items_name ON restaurant_items(name);

-- =====================================================
-- RESTAURANT_ITEM_LINKS (Many-to-Many with popularity flag)
-- =====================================================

CREATE TABLE restaurant_item_links (
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    item_id UUID REFERENCES restaurant_items(id) ON DELETE CASCADE,
    is_popular BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (restaurant_id, item_id)
);

CREATE INDEX idx_restaurant_item_links_restaurant ON restaurant_item_links(restaurant_id);
CREATE INDEX idx_restaurant_item_links_item ON restaurant_item_links(item_id);
CREATE INDEX idx_restaurant_item_links_popular ON restaurant_item_links(is_popular) WHERE is_popular = TRUE;

-- =====================================================
-- RESTAURANT_ITEM_IMAGES (Many-to-Many)
-- =====================================================

CREATE TABLE restaurant_item_images (
    item_id UUID REFERENCES restaurant_items(id) ON DELETE CASCADE,
    image_id UUID REFERENCES restaurant_images(id) ON DELETE CASCADE,

    PRIMARY KEY (item_id, image_id)
);

CREATE INDEX idx_restaurant_item_images_item ON restaurant_item_images(item_id);
CREATE INDEX idx_restaurant_item_images_image ON restaurant_item_images(image_id);

-- =====================================================
-- RESTAURANT_ITEM_TAGS (Many-to-Many)
-- =====================================================

CREATE TABLE restaurant_item_tags (
    item_id UUID REFERENCES restaurant_items(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,

    PRIMARY KEY (item_id, tag_id)
);

CREATE INDEX idx_restaurant_item_tags_item ON restaurant_item_tags(item_id);
CREATE INDEX idx_restaurant_item_tags_tag ON restaurant_item_tags(tag_id);

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    last_login TIMESTAMPTZ DEFAULT NOW(),
    lat DECIMAL(10, 8) NOT NULL,
    long DECIMAL(11, 8) NOT NULL,
    geo GEOGRAPHY(POINT, 4326)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_geo ON users USING GIST(geo);

-- =====================================================
-- SESSIONS
-- =====================================================

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_started TIMESTAMPTZ DEFAULT NOW(),
    date_ended TIMESTAMPTZ
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_date_started ON sessions(date_started DESC);

-- =====================================================
-- USER_SWIPES
-- =====================================================

CREATE TABLE user_swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    decided BOOLEAN NOT NULL,
    date_swiped TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT user_swipes_unique UNIQUE(user_id, restaurant_id)
);

CREATE INDEX idx_user_swipes_user ON user_swipes(user_id);
CREATE INDEX idx_user_swipes_restaurant ON user_swipes(restaurant_id);
CREATE INDEX idx_user_swipes_session ON user_swipes(session_id);
CREATE INDEX idx_user_swipes_decided ON user_swipes(decided);

-- =====================================================
-- USER_SAVES (Liked restaurants)
-- =====================================================

CREATE TABLE user_saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    swipe_id UUID REFERENCES user_swipes(id) ON DELETE SET NULL,
    date_saved TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT user_saves_unique UNIQUE(user_id, restaurant_id)
);

CREATE INDEX idx_user_saves_user ON user_saves(user_id);
CREATE INDEX idx_user_saves_restaurant ON user_saves(restaurant_id);
CREATE INDEX idx_user_saves_session ON user_saves(session_id);

-- =====================================================
-- USER_PREFERENCES
-- =====================================================

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    date_changed TIMESTAMPTZ DEFAULT NOW()
    -- Add specific preference columns as needed
);

CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update geo column from lat/long
CREATE OR REPLACE FUNCTION update_geo_from_coordinates()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_TABLE_NAME = 'restaurants') THEN
        NEW.geo := ST_SetSRID(ST_MakePoint(NEW.long, NEW.lat), 4326)::geography;
    ELSIF (TG_TABLE_NAME = 'users') THEN
        NEW.geo := ST_SetSRID(ST_MakePoint(NEW.long, NEW.lat), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update geo column
CREATE TRIGGER restaurants_update_geo
    BEFORE INSERT OR UPDATE OF lat, long ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_geo_from_coordinates();

CREATE TRIGGER users_update_geo
    BEFORE INSERT OR UPDATE OF lat, long ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_geo_from_coordinates();

-- Function to find restaurants within distance
CREATE OR REPLACE FUNCTION restaurants_within_distance(
    lat DECIMAL,
    lon DECIMAL,
    max_distance_meters INTEGER
)
RETURNS TABLE (
    id UUID,
    distance DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        ST_Distance(
            r.geo,
            ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
        )::DOUBLE PRECISION AS distance
    FROM restaurants r
    WHERE ST_DWithin(
        r.geo,
        ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
        max_distance_meters
    )
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql;


-- Jelly Restaurant Discovery - Supabase Database Schema
-- This migration creates the comprehensive database schema based on databaseDesign.ts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE price_tier AS ENUM ('FREE', 'CHEAP', 'MODERATE', 'EXPENSIVE', 'LUXURY');
CREATE TYPE status AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED');
CREATE TYPE swipe_decision AS ENUM ('LIKE', 'PASS', 'SUPERLIKE');
CREATE TYPE image_role AS ENUM ('COVER', 'FOOD', 'AMBIENCE', 'MENU_PAGE', 'LOGO');
CREATE TYPE review_source AS ENUM ('GOOGLE', 'YELP', 'MANUAL', 'ZOMATO', 'OTHER');
CREATE TYPE moderation_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE provider AS ENUM ('GOOGLE', 'YELP', 'TRIPADVISOR', 'OPENTABLE');
CREATE TYPE menu_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Hours table (referenced by restaurants)
CREATE TABLE hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mon JSONB,
    tue JSONB,
    wed JSONB,
    thu JSONB,
    fri JSONB,
    sat JSONB,
    sun JSONB,
    special_days JSONB
);

-- Restaurants table
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    formatted_address TEXT,
    street TEXT,
    city_id UUID,
    region TEXT,
    postal_code TEXT,
    country_code CHAR(2),
    geo GEOGRAPHY(POINT, 4326) NOT NULL,
    price_tier price_tier NOT NULL,
    status status DEFAULT 'ACTIVE',
    phone TEXT,
    website TEXT,
    is_active BOOLEAN DEFAULT true,
    hours_id UUID REFERENCES hours(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spatial index for geo queries
CREATE INDEX idx_restaurants_geo ON restaurants USING GIST(geo);
CREATE INDEX idx_restaurants_price_tier ON restaurants(price_tier);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_is_active ON restaurants(is_active);

-- Restaurant stats table
CREATE TABLE restaurant_stats (
    restaurant_id UUID PRIMARY KEY REFERENCES restaurants(id) ON DELETE CASCADE,
    rating_avg NUMERIC(3, 2),
    rating_count INTEGER DEFAULT 0,
    photo_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    last_review_at TIMESTAMPTZ
);

-- Cuisines table
CREATE TABLE cuisines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES cuisines(id) ON DELETE SET NULL
);

-- Restaurant-Cuisine junction table
CREATE TABLE restaurant_cuisines (
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    cuisine_id UUID REFERENCES cuisines(id) ON DELETE CASCADE,
    PRIMARY KEY (restaurant_id, cuisine_id)
);

CREATE INDEX idx_restaurant_cuisines_restaurant ON restaurant_cuisines(restaurant_id);
CREATE INDEX idx_restaurant_cuisines_cuisine ON restaurant_cuisines(cuisine_id);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL
);

-- Restaurant-Tag junction table
CREATE TABLE restaurant_tags (
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (restaurant_id, tag_id)
);

CREATE INDEX idx_restaurant_tags_restaurant ON restaurant_tags(restaurant_id);
CREATE INDEX idx_restaurant_tags_tag ON restaurant_tags(tag_id);

-- ============================================================
-- USER TABLES
-- ============================================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_e164 TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    password_algo TEXT NOT NULL,
    name TEXT,
    last_geo GEOGRAPHY(POINT, 4326),
    last_loc_updated_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone_e164);
CREATE INDEX idx_users_email ON users(email);

-- User preferences table
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    max_distance_m INTEGER,
    price_min price_tier,
    price_max price_tier,
    cuisines JSONB,
    dietary_tags JSONB,
    open_now_only BOOLEAN DEFAULT false
);

-- User swipes table
CREATE TABLE user_swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    decision swipe_decision NOT NULL,
    decided_at TIMESTAMPTZ DEFAULT NOW(),
    session_id UUID,
    UNIQUE (user_id, restaurant_id)
);

CREATE INDEX idx_user_swipes_user ON user_swipes(user_id);
CREATE INDEX idx_user_swipes_restaurant ON user_swipes(restaurant_id);
CREATE INDEX idx_user_swipes_decision ON user_swipes(decision);
CREATE INDEX idx_user_swipes_decided_at ON user_swipes(decided_at);

-- Saved restaurants table
CREATE TABLE saved_restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, restaurant_id)
);

CREATE INDEX idx_saved_restaurants_user ON saved_restaurants(user_id);
CREATE INDEX idx_saved_restaurants_restaurant ON saved_restaurants(restaurant_id);

-- ============================================================
-- MEDIA TABLES
-- ============================================================

-- Restaurant images table
CREATE TABLE restaurant_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    uploaded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    role image_role NOT NULL,
    storage_provider TEXT,
    storage_key TEXT,
    url TEXT,
    width INTEGER,
    height INTEGER,
    bytes INTEGER,
    content_type TEXT,
    blurhash TEXT,
    attribution TEXT,
    is_primary BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurant_images_restaurant ON restaurant_images(restaurant_id);
CREATE INDEX idx_restaurant_images_role ON restaurant_images(role);
CREATE INDEX idx_restaurant_images_is_primary ON restaurant_images(is_primary);

-- ============================================================
-- REVIEW TABLES
-- ============================================================

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    source review_source NOT NULL,
    source_review_id TEXT,
    rating NUMERIC(2, 1) CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    body TEXT NOT NULL,
    language TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    moderation_status moderation_status DEFAULT 'PENDING',
    helpful_count INTEGER DEFAULT 0,
    visited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_author ON reviews(author_user_id);
CREATE INDEX idx_reviews_source ON reviews(source);
CREATE INDEX idx_reviews_moderation_status ON reviews(moderation_status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);

-- Review images junction table
CREATE TABLE review_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES restaurant_images(id) ON DELETE CASCADE,
    UNIQUE (review_id, image_id)
);

CREATE INDEX idx_review_images_review ON review_images(review_id);
CREATE INDEX idx_review_images_image ON review_images(image_id);

-- ============================================================
-- EXTERNAL DATA TABLES
-- ============================================================

-- Place sources table (external API data)
CREATE TABLE place_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider provider NOT NULL,
    provider_place_id TEXT NOT NULL,
    raw_json JSONB NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (provider, provider_place_id)
);

CREATE INDEX idx_place_sources_provider ON place_sources(provider);

-- Restaurant aliases table (links to external sources)
CREATE TABLE restaurant_aliases (
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    provider provider NOT NULL,
    provider_place_id TEXT NOT NULL,
    confidence NUMERIC(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
    is_primary_source BOOLEAN DEFAULT false,
    PRIMARY KEY (restaurant_id, provider)
);

CREATE INDEX idx_restaurant_aliases_restaurant ON restaurant_aliases(restaurant_id);
CREATE INDEX idx_restaurant_aliases_provider ON restaurant_aliases(provider);

-- ============================================================
-- MENU TABLES
-- ============================================================

-- Menus table
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    currency CHAR(3) NOT NULL,
    source provider NOT NULL,
    status menu_status DEFAULT 'DRAFT',
    effective_from TIMESTAMPTZ,
    effective_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menus_restaurant ON menus(restaurant_id);
CREATE INDEX idx_menus_status ON menus(status);

-- Menu sections table
CREATE TABLE menu_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position INTEGER NOT NULL
);

CREATE INDEX idx_menu_sections_menu ON menu_sections(menu_id);

-- Menu items table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES menu_sections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_decimal NUMERIC(10, 2),
    flags JSONB,
    image_id UUID REFERENCES restaurant_images(id) ON DELETE SET NULL,
    position INTEGER
);

CREATE INDEX idx_menu_items_section ON menu_items(section_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update restaurant stats on like/swipe
CREATE OR REPLACE FUNCTION update_restaurant_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.decision = 'LIKE' THEN
        INSERT INTO restaurant_stats (restaurant_id, like_count)
        VALUES (NEW.restaurant_id, 1)
        ON CONFLICT (restaurant_id)
        DO UPDATE SET like_count = restaurant_stats.like_count + 1;
    ELSIF TG_OP = 'UPDATE' AND OLD.decision != 'LIKE' AND NEW.decision = 'LIKE' THEN
        UPDATE restaurant_stats
        SET like_count = like_count + 1
        WHERE restaurant_id = NEW.restaurant_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.decision = 'LIKE' AND NEW.decision != 'LIKE' THEN
        UPDATE restaurant_stats
        SET like_count = GREATEST(0, like_count - 1)
        WHERE restaurant_id = NEW.restaurant_id;
    ELSIF TG_OP = 'DELETE' AND OLD.decision = 'LIKE' THEN
        UPDATE restaurant_stats
        SET like_count = GREATEST(0, like_count - 1)
        WHERE restaurant_id = OLD.restaurant_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_like_count
AFTER INSERT OR UPDATE OR DELETE ON user_swipes
FOR EACH ROW EXECUTE FUNCTION update_restaurant_like_count();

-- Function to update save count
CREATE OR REPLACE FUNCTION update_restaurant_save_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO restaurant_stats (restaurant_id, save_count)
        VALUES (NEW.restaurant_id, 1)
        ON CONFLICT (restaurant_id)
        DO UPDATE SET save_count = restaurant_stats.save_count + 1;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE restaurant_stats
        SET save_count = GREATEST(0, save_count - 1)
        WHERE restaurant_id = OLD.restaurant_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_save_count
AFTER INSERT OR DELETE ON saved_restaurants
FOR EACH ROW EXECUTE FUNCTION update_restaurant_save_count();

-- Function to update photo count
CREATE OR REPLACE FUNCTION update_restaurant_photo_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO restaurant_stats (restaurant_id, photo_count)
        VALUES (NEW.restaurant_id, 1)
        ON CONFLICT (restaurant_id)
        DO UPDATE SET photo_count = restaurant_stats.photo_count + 1;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE restaurant_stats
        SET photo_count = GREATEST(0, photo_count - 1)
        WHERE restaurant_id = OLD.restaurant_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_photo_count
AFTER INSERT OR DELETE ON restaurant_images
FOR EACH ROW EXECUTE FUNCTION update_restaurant_photo_count();

-- Function to update review stats
CREATE OR REPLACE FUNCTION update_restaurant_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO restaurant_stats (restaurant_id, rating_count, rating_avg, last_review_at)
        VALUES (
            NEW.restaurant_id,
            1,
            NEW.rating,
            NEW.created_at
        )
        ON CONFLICT (restaurant_id)
        DO UPDATE SET
            rating_count = restaurant_stats.rating_count + 1,
            rating_avg = (restaurant_stats.rating_avg * restaurant_stats.rating_count + NEW.rating) / (restaurant_stats.rating_count + 1),
            last_review_at = NEW.created_at;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE restaurant_stats
        SET
            rating_count = GREATEST(0, rating_count - 1),
            rating_avg = CASE
                WHEN rating_count <= 1 THEN NULL
                ELSE (rating_avg * rating_count - OLD.rating) / (rating_count - 1)
            END
        WHERE restaurant_id = OLD.restaurant_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_review_stats
AFTER INSERT OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_restaurant_review_stats();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_restaurants ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for backend API)
-- User policies would be added when implementing authentication

-- ============================================================
-- HELPFUL VIEWS
-- ============================================================

-- View for restaurants with their stats
CREATE VIEW restaurants_with_stats AS
SELECT
    r.*,
    COALESCE(rs.rating_avg, 0) as rating_avg,
    COALESCE(rs.rating_count, 0) as rating_count,
    COALESCE(rs.photo_count, 0) as photo_count,
    COALESCE(rs.save_count, 0) as save_count,
    COALESCE(rs.like_count, 0) as like_count,
    rs.last_review_at
FROM restaurants r
LEFT JOIN restaurant_stats rs ON r.id = rs.restaurant_id;

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Compound indexes for common queries
CREATE INDEX idx_user_swipes_user_decided ON user_swipes(user_id, decided_at DESC);
CREATE INDEX idx_reviews_restaurant_created ON reviews(restaurant_id, created_at DESC);

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE restaurants IS 'Core restaurant information';
COMMENT ON TABLE restaurant_stats IS 'Aggregated statistics for restaurants, updated via triggers';
COMMENT ON TABLE user_swipes IS 'User swipe history (like, pass, superlike)';
COMMENT ON TABLE saved_restaurants IS 'User saved/bookmarked restaurants';
COMMENT ON COLUMN restaurants.geo IS 'PostGIS geography point for geospatial queries';

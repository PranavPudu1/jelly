/**
 * Data Transfer Object types for API requests and responses
 */

import { Restaurant, Tag, Review, RestaurantImage, RestaurantItem } from './database.types';
import { Source, TagType } from './enums';

// Pagination
export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}

// Restaurant with populated relationships
export interface RestaurantPopulated extends Restaurant {
    tags: Tag[];
    reviews: Review[];
    images: RestaurantImage[];
    menu: RestaurantItem[];
    popularItems: RestaurantItem[];
}

// API Query types
export interface GetRestaurantsQuery {
    userId?: string;
    page?: number;
    limit?: number;
    location?: string;
    latitude?: number;
    longitude?: number;
    maxDistanceMeters?: number;
    tags?: string[];
    minRating?: number;
}

// Request types
export interface CreateRestaurantRequest {
    sourceId?: string;
    source: Source;
    name: string;
    image_url: string;
    is_closed: boolean;
    url: string;
    review_count: number;
    rating: number;
    lat: number;
    long: number;
    transactions: string[];
    price?: string;
    address: string;
    city: string;
    country: string;
    state: string;
    zipCode: number;
    phone: string;
    instagram?: string;
    tiktok?: string;
    tag_ids?: string[];
}

export interface UpdateRestaurantRequest {
    sourceId?: string;
    name?: string;
    image_url?: string;
    is_closed?: boolean;
    url?: string;
    review_count?: number;
    rating?: number;
    lat?: number;
    long?: number;
    transactions?: string[];
    price?: string;
    address?: string;
    city?: string;
    country?: string;
    state?: string;
    zipCode?: number;
    phone?: string;
    instagram?: string;
    tiktok?: string;
}

export interface SaveSwipeRequest {
    user_id: string;
    restaurant_id: string;
    decided: boolean;
    session_id?: string;
}

export interface CreateReviewRequest {
    restaurant_id: string;
    sourceId?: string;
    source: Source;
    sourceUrl?: string;
    review: string;
    rating: number;
    reviewedBy?: string;
}

export interface SaveRestaurantRequest {
    user_id: string;
    restaurant_id: string;
    session_id?: string;
    swipe_id?: string;
}

export interface CreateTagRequest {
    source: Source;
    value: string;
    type: TagType;
    sourceAlias?: string;
}

// Response types
export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: any[];
}

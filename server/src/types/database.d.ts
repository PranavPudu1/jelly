/**
 * Database entity types based on db.ts schema
 */

import { Source, TagType } from './enums';

// Base timestamp interface for entities
export interface TimestampedEntity {
    dateAdded?: Date;
    dateCreated?: Date;
    dateChanged?: Date;
}

// Restaurant types
export interface Restaurant extends TimestampedEntity {
    id: string;
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
    dateAdded: Date;
}

export interface Tag {
    id: string;
    source: Source;
    value: string;
    type: TagType;
    sourceAlias?: string;
}

export interface Review {
    id: string;
    sourceId?: string;
    source: Source;
    sourceUrl?: string;
    review: string;
    rating: number;
    dateCreated: Date;
    reviewedBy?: string;
}

export interface RestaurantImage {
    id: string;
    sourceId?: string;
    source: Source;
    url: string;
    dateAdded: Date;
}

export interface RestaurantItem {
    id: string;
    sourceId?: string;
    source: Source;
    name: string;
    description?: string;
    dateAdded: Date;
}

// User types
export interface User {
    id: string;
    email?: string;
    name: string;
    lastLogin: Date;
    lat: number;
    long: number;
}

export interface UserSwipe {
    id: string;
    user_id: string;
    restaurant_id: string;
    decided: boolean;
    dateSwiped: Date;
    session_id?: string;
}

export interface UserSave {
    id: string;
    user_id: string;
    restaurant_id: string;
    session_id?: string;
    swipe_id?: string;
}

export interface Session {
    id: string;
    user_id: string;
    dateStarted: Date;
    dateEnded?: Date;
}

export interface UserPreferences {
    id: string;
    user_id: string;
    dateChanged: Date;
}

// Join table types for many-to-many relationships
export interface RestaurantTag {
    restaurant_id: string;
    tag_id: string;
}

export interface RestaurantReview {
    restaurant_id: string;
    review_id: string;
}

export interface RestaurantImageLink {
    restaurant_id: string;
    image_id: string;
}

export interface RestaurantItemLink {
    restaurant_id: string;
    item_id: string;
    is_popular: boolean;
}

export interface RestaurantItemImage {
    item_id: string;
    image_id: string;
}

export interface RestaurantItemTag {
    item_id: string;
    tag_id: string;
}

export interface RestaurantImageTag {
    image_id: string;
    tag_id: string;
}

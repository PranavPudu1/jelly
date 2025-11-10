/**
 * Database Enums
 * Corresponds to PostgreSQL enum types in the database schema
 */

export enum PriceTier {
    FREE = 'FREE',
    CHEAP = 'CHEAP',
    MODERATE = 'MODERATE',
    EXPENSIVE = 'EXPENSIVE',
    LUXURY = 'LUXURY',
}

export enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    CLOSED = 'CLOSED',
}

export enum SwipeDecision {
    LIKE = 'LIKE',
    PASS = 'PASS',
    SUPERLIKE = 'SUPERLIKE',
}

export enum ImageRole {
    COVER = 'COVER',
    FOOD = 'FOOD',
    AMBIENCE = 'AMBIENCE',
    MENU_PAGE = 'MENU_PAGE',
    LOGO = 'LOGO',
}

export enum ReviewSource {
    GOOGLE = 'GOOGLE',
    YELP = 'YELP',
    MANUAL = 'MANUAL',
    ZOMATO = 'ZOMATO',
    OTHER = 'OTHER',
}

export enum ModerationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum Provider {
    GOOGLE = 'GOOGLE',
    YELP = 'YELP',
    TRIPADVISOR = 'TRIPADVISOR',
    OPENTABLE = 'OPENTABLE',
}

export enum MenuStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

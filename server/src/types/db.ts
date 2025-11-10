enum Source {
    YELP = 'YELP',
    GOOGLE = 'GOOGLE'
}

enum TagType {
    FOOD = 'FOOD',
    AMBIANCE = 'AMBIANCE',
}

export interface Restaurant {
    id: string;

    sourceId?: string;
    source: Source;

    name: string;
    image_url: string;
    is_closed: boolean;
    url: string;
    review_count: number;

    tags: Tag[];

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

    reviews: Review[];
    images: RestaurantImage[];

    menu: RestaurantItem[];
    popularItems: RestaurantItem[];

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
    tags: Tag[];

    dateAdded: Date;
}

export interface RestaurantItem {
    id: string;

    sourceId?: string;
    source: Source;
    
    name: string;
    
    description?: string;

    images: RestaurantImage[];

    tags: Tag[];

    dateAdded: Date;
}


// Users

export interface User {
    id: string;
    email?: string 
    name: string;
    lastLogin: Date;

    lat: number;
    long: number;

    preferences: UserPreferences;

    saved: UserSave[];
    swiped: UserSwipe[];
}

export interface UserSwipe {
    id: string;
    decided: boolean;
    dateSwiped: Date;
    
    session: Session;
}

export interface UserSave {
    id: string;
    restaurant: Restaurant;
    session: Session;
    swipe: UserSwipe;
}

export interface Session {
    id: string;
    dateStarted: Date;
    dateEnded: Date;
}

export interface UserPreferences {
    id: string;

    dateChanged: Date;
}
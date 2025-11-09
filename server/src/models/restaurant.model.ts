/**
 * Restaurant Data Models
 * Matches the Flutter app's data structure for seamless integration
 */

export interface MenuItem {
  name: string;
  price: string;
  emoji: string;
  imageUrl: string;
}

export interface Review {
  text: string;
  author: string;
}

export interface Restaurant {
  id?: string; // Firestore document ID
  name: string;
  tagline: string;
  location: string;
  imageUrl: string;
  additionalPhotos: string[];
  popularItems: MenuItem[];
  reviews: Review[];
  ambianceTags: string[];
  reservationInfo: string;
  priceRange: string; // '$', '$$', '$$$', '$$$$'
  cuisine: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSwipe {
  id?: string;
  userId: string;
  restaurantId: string;
  action: 'like' | 'dislike';
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Request/Response DTOs
export interface GetRestaurantsQuery {
  userId?: string;
  page?: number;
  limit?: number;
  cuisine?: string;
  priceRange?: string;
  location?: string;
}

export interface SaveSwipeRequest {
  userId: string;
  restaurantId: string;
  action: 'like' | 'dislike';
}

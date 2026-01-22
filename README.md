<div align="center">
  <img src="./app/assets/Logo.png" alt="Jelly Logo" width="200"/>

  # Jelly

  ### Swipe. Discover. Dine.

  A modern restaurant discovery app that lets you swipe through personalized restaurant recommendations like never before.

  <img src="./app/assets/loadingjelly.gif" alt="Loading Animation" width="150"/>

  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

---

## The Story

We were sitting in our apartment after spending 30 minutes trying to decide where to eat. Again. My roommate and I had been through this same frustrating cycle countless times - scrolling through endless Yelp listings, getting overwhelmed by too many choices, second-guessing reviews, and eventually just defaulting to the same few places we already knew.

That's when it clicked. The problem wasn't a lack of options. It was decision fatigue from too many options presented in the wrong way. We wanted something simple, visual, and quick. Like swiping through a dating app, but for restaurants.

We started building Jelly that night. The first technical challenge was figuring out how to actually personalize recommendations. We couldn't just sort by rating or distance - that's what every other app does. We needed to understand what makes a restaurant appealing beyond just the food.

After pulling all-nighters and whiteboarding sessions, we landed on a tag-based classification system. Every restaurant gets tagged with attributes extracted from reviews - things like "romantic ambiance," "loud and energetic," "comfort food," "innovative dishes." We built scrapers for Yelp and Foursquare APIs to pull in restaurant data, reviews, and images. Then we used OpenAI's API to analyze reviews and automatically extract these tags.

But tags alone weren't enough. We needed to weight them based on user preferences. That's where the questionnaire came in. We ask users to tell us what matters more to them: the ambiance or the food quality. These weights (stored as percentages that sum to 100) become the user's preference vector.

Here's where it gets interesting. Each restaurant has scores for ambiance and food quality derived from review sentiment analysis. When a user requests recommendations, we compute a weighted score using their preference vector. Someone who values ambiance at 70% and food at 30% will see a completely different ordering than someone with the opposite preferences.

We also experimented with cosine similarity for the tag system. User swipe behavior builds their preference profile - if you keep swiping right on Italian restaurants tagged with "cozy" and "romantic," the algorithm picks up on that. We represent both the user's preferences and each restaurant's attributes as vectors in the same tag space, then use cosine similarity to find the best matches. Higher similarity means the restaurant is more aligned with what you've historically liked.

The result is a feed that actually feels personalized. Not just "restaurants near you," but "restaurants near you that match your vibe."

## Overview

Jelly is a Tinder-style restaurant discovery application built with React Native and Expo. It provides personalized restaurant recommendations based on user preferences, location, and dining habits through an intuitive swiping interface.

## Features

### Core Functionality

- **Swipe-Based Discovery**: Intuitive Tinder-like interface for discovering restaurants
  - Swipe right to save restaurants you like
  - Swipe left to pass on restaurants
  - Smooth card animations and transitions

- **Location-Based Recommendations**: Find restaurants near you
  - Real-time location tracking
  - Distance filters (< 1 mi, < 3 mi, < 5 mi)
  - View restaurant locations on maps

- **Rich Restaurant Cards**: Beautiful, information-rich restaurant presentations
  - High-quality hero images
  - Ambiance photos with customer reviews
  - Popular dish photos
  - Star ratings and price levels
  - Contact information and directions

- **Advanced Filtering**: Customize your search
  - Price range filters ($, $$, $$$)
  - Distance-based filtering
  - Rating filters (4.0+, 4.5+)
  - Cuisine type filtering

- **Save Favorites**: Build your personal restaurant collection
  - Save restaurants with your current preferences
  - View all saved restaurants with dynamic distance updates
  - Organize restaurants by preference weights

- **Personalized Experience**:
  - User questionnaire for preference gathering
  - Custom restaurant sorting based on preferences
  - Ambiance vs. food quality preference weighting

### User Interface

- **Beautiful UI/UX**:
  - Custom theme system with consistent design language
  - Smooth animations using React Native Reanimated
  - Interactive modals for menus and photo reels
  - Loading states with custom animations
  - Error handling with user-friendly messages

- **Interactive Media**:
  - Full-screen photo reel viewer
  - Swipeable image galleries
  - Video backgrounds on splash screen
  - Instagram and TikTok social media integration

- **Navigation**:
  - Bottom tab navigation (Discover, Saved, Profile)
  - Stack navigation for onboarding flow
  - Deep linking support

## Tech Stack

### Frontend (Mobile App)

- **Framework**: React Native 0.81.5
- **Development**: Expo 54.x
- **Language**: TypeScript 5.3
- **Navigation**: React Navigation 6.x
- **State Management**:
  - React Context API for global state
  - TanStack Query (React Query) for server state
  - AsyncStorage for local persistence
- **Animations**: React Native Reanimated & React Native Gesture Handler
- **UI Components**: Custom components with Expo Vector Icons
- **Location**: Expo Location
- **Fonts**: Custom fonts (Poppins, Varela Round)

### Backend (API Server)

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.3
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS
- **External APIs**:
  - Yelp API for restaurant data
  - Foursquare API for restaurant data
  - OpenAI API for preference analysis

### Development Tools

- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Version Control**: Git
- **Package Manager**: npm/yarn

## Architecture

### Project Structure

```
jelly/
├── app/                          # React Native mobile application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── RestaurantCard.tsx
│   │   │   ├── SavedRestaurantCard.tsx
│   │   │   ├── MenuModal.tsx
│   │   │   ├── ReelModal.tsx
│   │   │   ├── AnimatedButton.tsx
│   │   │   └── ...
│   │   ├── screens/             # Screen components
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── AuthScreen.tsx
│   │   │   ├── QuestionnaireScreen.tsx
│   │   │   ├── SwipeScreen.tsx
│   │   │   ├── SavedRestaurantsScreen.tsx
│   │   │   └── UserProfileScreen.tsx
│   │   ├── contexts/            # React Context providers
│   │   │   ├── ThemeContext.tsx
│   │   │   ├── UserContext.tsx
│   │   │   ├── LocationContext.tsx
│   │   │   └── SavedRestaurantsContext.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Utility functions
│   │   ├── types/               # TypeScript type definitions
│   │   └── theme/               # Theme configuration
│   ├── assets/                  # Static assets (images, fonts, videos)
│   ├── App.tsx                  # Root component
│   ├── app.json                 # Expo configuration
│   └── package.json
│
└── server/                       # Express.js backend server
    ├── src/
    │   ├── controllers/         # Route controllers
    │   │   ├── restaurant/
    │   │   └── user/
    │   ├── routes/              # API route definitions
    │   ├── middleware/          # Express middleware
    │   │   ├── auth.ts
    │   │   ├── rbac.ts
    │   │   └── error.ts
    │   ├── config/              # Configuration files
    │   │   ├── database.ts
    │   │   └── env.ts
    │   ├── scripts/             # Database seeding scripts
    │   │   ├── seedDatabase.ts
    │   │   ├── seedYelpAustin.ts
    │   │   └── seedFoursquareAustin.ts
    │   ├── app.ts               # Express app setup
    │   └── index.ts             # Server entry point
    ├── prisma/
    │   └── schema.prisma        # Database schema
    └── package.json
```

### Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **Restaurant**: Core restaurant data (name, rating, location, contact info)
- **RestaurantImage**: Photo gallery for restaurants
- **Review**: Customer reviews and ratings
- **MenuItem**: Restaurant menu items
- **Tag**: Categorization system (cuisine, ambiance, etc.)
- **SocialPost**: Instagram/TikTok social media links
- **User**: User accounts and preferences

### Data Flow

1. **User Authentication**:
   - Device-based temporary users or email/password registration
   - JWT tokens for session management

2. **Restaurant Discovery**:
   - Client requests restaurants based on location and filters
   - Server queries database with location-based sorting
   - Results include preference-weighted scoring
   - Infinite scroll with pagination (10 restaurants per page)

3. **Saved Restaurants**:
   - Saved to AsyncStorage with preference weights
   - Dynamic distance calculation based on current location
   - Synced across app sessions

## Technical Architecture Deep Dive

### Tag System & Classification

The core of Jelly's personalization lies in its tag-based classification system. We designed a flexible schema in PostgreSQL:

- **TagType** model: Defines categories like "cuisine," "ambiance," "dish_type," "atmosphere"
- **Tag** model: Specific tags within each type (e.g., "Italian" under cuisine, "romantic" under ambiance)
- **Many-to-many relationships**: Tags can be associated with restaurants, images, reviews, menu items, and social posts

This allows us to build rich attribute vectors for each restaurant. For example, a restaurant might have:
- Cuisine tags: ["Italian", "Mediterranean"]
- Ambiance tags: ["romantic", "dim lighting", "quiet"]
- Dish tags: ["pasta", "seafood", "wine selection"]

### Review Analysis & Sentiment Scoring

When seeding the database with Yelp/Foursquare data, we don't just store raw reviews. We process them:

1. **Sentiment Analysis**: Reviews are analyzed using OpenAI's API to extract sentiment scores for specific aspects
2. **Ambiance Score**: Aggregated from review mentions of atmosphere, decor, vibe, noise level
3. **Food Quality Score**: Aggregated from review mentions of taste, presentation, freshness, creativity

These scores are stored as floats (0-100) in the Restaurant model and become the basis for preference weighting.

### Preference Weighting Algorithm

User preferences are collected via the questionnaire as two values:
- `ambianceWeight` (0-100)
- `foodQualityWeight` (0-100)

These must sum to 100, creating a normalized preference vector. When generating recommendations:

```
restaurantScore = (restaurant.ambianceScore * user.ambianceWeight / 100)
                + (restaurant.foodQualityScore * user.foodQualityWeight / 100)
```

This weighted score is computed server-side and used to order restaurants beyond just distance or rating.

### Cosine Similarity for Tag Matching

For advanced personalization, we implemented cosine similarity matching:

1. **User Vector**: Built from swipe history (right swipes) by aggregating tags from liked restaurants
2. **Restaurant Vector**: Each restaurant's tag distribution across all tag types
3. **Similarity Calculation**: Cosine similarity between vectors measures alignment

```
similarity = (userVector · restaurantVector) / (||userVector|| * ||restaurantVector||)
```

Higher similarity (closer to 1) means the restaurant closely matches the user's demonstrated preferences. This works because cosine similarity is invariant to vector magnitude - it measures the angle between preference spaces, not just overlap.

### Location-Based Querying

Restaurant queries use PostgreSQL's built-in geospatial functions:

1. Haversine formula for distance calculation from user's lat/long
2. Radius filtering (converted from miles to meters)
3. Indexed queries on lat/long columns for performance
4. Results ordered by computed score, then distance as tiebreaker

### Infinite Scroll & Pagination

The mobile app uses React Query for server state management with smart prefetching:

- Default limit: 10 restaurants per page
- Prefetch trigger: When user reaches 70% through current batch
- 300ms debounce to prevent rapid consecutive API calls
- Flat data structure (no nested pages) for easier rendering

This creates the illusion of infinite scroll while maintaining memory efficiency by only rendering visible cards.

## Technical Highlights

### Swipe Screen

The main discovery interface features:
- Infinite scroll that automatically loads more restaurants as you swipe
- Smart prefetching that fetches the next page when 70% through the current batch
- Optimized card rendering for memory management
- Filter persistence that remembers your preferences

### Restaurant Cards

Each card displays:
- Hero image with tap-to-expand functionality
- Restaurant info table (distance, phone, location)
- Ambiance section with customer quotes
- Popular dish photos in alternating layout
- Full menu viewer modal
- Social media handles (Instagram, TikTok)
- Star ratings and price indicators

### Saved Restaurants

- Dynamic distance updates based on current location
- Preference context showing why you saved each restaurant
- Drag to reorder functionality
- Quick actions to call, navigate, or remove restaurants

### Personalization

The questionnaire collects:
- Ambiance preference weight (0-100%)
- Food quality preference weight (0-100%)
- Automatically balances weights to 100%
- Used for custom restaurant sorting

---

## License

This project is private and proprietary. All rights reserved.

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

## Overview

**Jelly** is a Tinder-style restaurant discovery application that helps users find their next dining experience through an intuitive swiping interface. Built with React Native and Expo, Jelly provides personalized restaurant recommendations based on user preferences, location, and dining habits.

## Features

### Core Functionality

- **🎯 Swipe-Based Discovery**: Intuitive Tinder-like interface for discovering restaurants
  - Swipe right to save restaurants you like
  - Swipe left to pass on restaurants
  - Smooth card animations and transitions

- **📍 Location-Based Recommendations**: Find restaurants near you
  - Real-time location tracking
  - Distance filters (< 1 mi, < 3 mi, < 5 mi)
  - View restaurant locations on maps

- **🎨 Rich Restaurant Cards**: Beautiful, information-rich restaurant presentations
  - High-quality hero images
  - Ambiance photos with customer reviews
  - Popular dish photos
  - Star ratings and price levels
  - Contact information and directions

- **🔍 Advanced Filtering**: Customize your search
  - Price range filters ($, $$, $$$)
  - Distance-based filtering
  - Rating filters (4.0+, 4.5+)
  - Cuisine type filtering

- **💾 Save Favorites**: Build your personal restaurant collection
  - Save restaurants with your current preferences
  - View all saved restaurants with dynamic distance updates
  - Organize restaurants by preference weights

- **👤 Personalized Experience**:
  - User questionnaire for preference gathering
  - Custom restaurant sorting based on preferences
  - Ambiance vs. food quality preference weighting

### User Interface Features

- **📱 Beautiful UI/UX**:
  - Custom theme system with consistent design language
  - Smooth animations using React Native Reanimated
  - Interactive modals for menus and photo reels
  - Loading states with custom animations
  - Error handling with user-friendly messages

- **📸 Interactive Media**:
  - Full-screen photo reel viewer
  - Swipeable image galleries
  - Video backgrounds on splash screen
  - Instagram and TikTok social media integration

- **🗺️ Navigation**:
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

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **PostgreSQL** (v13 or higher)
- **Expo CLI** (optional, for easier development)
- **iOS Simulator** (for Mac users) or **Android Studio** (for Android development)
- **Git**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/jelly.git
cd jelly
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd server
npm install
```

#### Environment Configuration

Create a `.env` file in the `server` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/jelly_db?schema=public"

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# External APIs (Optional - for seeding data)
YELP_API_KEY=your-yelp-api-key
FOURSQUARE_API_KEY=your-foursquare-api-key
OPENAI_API_KEY=your-openai-api-key
```

#### Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed the database with sample data
npm run seed

# Or seed with Yelp/Foursquare data (requires API keys)
npm run seed:yelp
npm run seed:foursquare
```

#### Start the Server

```bash
# Development mode with hot reload
npm run dev

# Or build and run production
npm run build
npm start
```

The server will start on `http://localhost:3000`

### 3. Mobile App Setup

#### Install Dependencies

```bash
cd ../app
npm install
```

#### Environment Configuration

Create a `.env` file in the `app` directory:

```env
# API Configuration
API_URL=http://localhost:3000/api
```

**Note**: For iOS simulator, use `http://localhost:3000/api`. For Android emulator, use `http://10.0.2.2:3000/api`.

#### Start the App

```bash
# Start Expo development server
npm start

# Or run directly on platforms
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

## Running the Project

### Development Workflow

1. **Start the Backend Server**:
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:3000`

2. **Start the Mobile App**:
   ```bash
   cd app
   npm start
   ```
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

3. **Access the App**:
   - Complete the onboarding flow (splash → auth → questionnaire)
   - Start swiping through restaurants!

### Building for Production

#### Backend

```bash
cd server
npm run build
npm start
```

#### Mobile App

```bash
cd app

# iOS
npm run ios

# Android
npm run android
```

For app store deployment, refer to [Expo's deployment documentation](https://docs.expo.dev/distribution/introduction/).

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/temporary` - Create temporary device-based user

### Users
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)
- `PUT /api/users/password` - Change password (requires auth)

### Restaurants
- `GET /api/restaurants` - Get nearby restaurants with filters
  - Query params: `lat`, `long`, `radius`, `price`, `rating`, `limit`, `offset`
- `GET /api/restaurants/:id` - Get restaurant by ID

## Features Deep Dive

### Swipe Screen

The main discovery interface features:
- **Infinite scroll**: Automatically loads more restaurants as you swipe
- **Smart prefetching**: Fetches next page when 70% through current batch
- **Memory management**: Optimized card rendering
- **Filter persistence**: Remembers your filter preferences

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

- **Dynamic distance**: Updates distance based on current location
- **Preference context**: Shows why you saved each restaurant
- **Drag to reorder**: Organize your saved list
- **Quick actions**: Call, navigate, or remove restaurants

### Personalization

The questionnaire collects:
- Ambiance preference weight (0-100%)
- Food quality preference weight (0-100%)
- Automatically balances weights to 100%
- Used for custom restaurant sorting

## Troubleshooting

### Backend Issues

**Database Connection Error**:
```bash
# Check PostgreSQL is running
psql --version

# Verify DATABASE_URL in .env
# Reset database if needed
npm run prisma:reset
```

**Port Already in Use**:
```bash
# Change PORT in server/.env
PORT=3001
```

### Mobile App Issues

**Metro Bundler Cache Issues**:
```bash
# Clear Expo cache
npm start -- --clear
```

**Cannot Connect to Server**:
- iOS Simulator: Use `http://localhost:3000`
- Android Emulator: Use `http://10.0.2.2:3000`
- Physical Device: Use your computer's local IP (e.g., `http://192.168.1.x:3000`)

**Location Permission Issues**:
- iOS: Check Settings → Privacy → Location Services
- Android: Check App Settings → Permissions → Location

## Development Scripts

### Server

```bash
npm run dev              # Start development server with hot reload
npm run build            # Compile TypeScript to JavaScript
npm start                # Run compiled production server
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run seed             # Seed database with sample data
npm run seed:yelp        # Seed with Yelp API data
npm run seed:foursquare  # Seed with Foursquare API data
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:reset     # Reset database
```

### App

```bash
npm start           # Start Expo development server
npm run ios         # Run on iOS simulator
npm run android     # Run on Android emulator
npm run web         # Run on web browser
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Run `npm run lint` before committing
- Use TypeScript for type safety
- Write meaningful commit messages

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Restaurant data provided by Yelp and Foursquare APIs
- Icons from Expo Vector Icons
- Fonts: Poppins and Varela Round
- Built with love using React Native and Expo

---

<div align="center">

  **Made with ❤️ for food lovers everywhere**

  [Report Bug](https://github.com/yourusername/jelly/issues) · [Request Feature](https://github.com/yourusername/jelly/issues)

</div>

# Jelly Server - Restaurant Discovery Backend API

A production-ready Express + TypeScript backend for a Tinder-like restaurant discovery application. Built with Firebase/Firestore for scalable, real-time data management.

## Features

- **Paginated Restaurant Fetching**: Get restaurants with smart pagination and filtering
- **User Swipe Tracking**: Excludes restaurants users have already swiped on
- **Save/Like System**: Track user preferences and retrieve saved restaurants
- **Filter Support**: Filter by cuisine, price range, and location
- **Type-Safe**: Full TypeScript implementation with strict typing
- **Modular Architecture**: Clean separation of concerns (routes, controllers, services, models)
- **Production-Ready**: Error handling, validation, CORS, compression, security headers
- **Extensible**: Easy to add AI features and additional functionality

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Language**: TypeScript 5
- **Database**: Firebase Firestore
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Development**: Nodemon, ts-node, ESLint, Prettier

## Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   │   ├── env.config.ts       # Environment variables
│   │   └── firebase.config.ts  # Firebase initialization
│   ├── controllers/      # Request handlers
│   │   └── restaurant.controller.ts
│   ├── models/          # TypeScript interfaces
│   │   └── restaurant.model.ts
│   ├── services/        # Business logic
│   │   └── restaurant.service.ts
│   ├── routes/          # API routes
│   │   ├── index.ts
│   │   └── restaurant.routes.ts
│   ├── middleware/      # Custom middleware
│   │   ├── errorHandler.ts
│   │   └── validators.ts
│   ├── scripts/         # Utility scripts
│   │   └── seedDatabase.ts
│   ├── app.ts          # Express app setup
│   └── index.ts        # Server entry point
├── dist/               # Compiled JavaScript (generated)
├── .env.example        # Example environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Firebase project with Firestore enabled

### Installation

1. **Navigate to the server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Firestore Database
   - Generate a service account key:
     - Go to Project Settings > Service Accounts
     - Click "Generate New Private Key"
     - Save the JSON file as `serviceAccountKey.json` in the server root
     - **Important**: Add this file to `.gitignore` (already included)

4. **Configure environment variables**

   Copy the example file and configure it:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   CORS_ORIGIN=*
   DEFAULT_PAGE_SIZE=10
   MAX_PAGE_SIZE=50
   ```

5. **Seed the database (optional)**

   Populate Firestore with sample restaurant data:
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000`

## API Endpoints

### Health Check

```http
GET /api/health
```

### Restaurants

#### Get Restaurants (Paginated)
```http
GET /api/restaurants?userId=user123&page=1&limit=10&cuisine=Japanese&priceRange=$$$
```

**Query Parameters:**
- `userId` (optional): Exclude restaurants this user has swiped on
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10, max: 50): Items per page
- `cuisine` (optional): Filter by cuisine type
- `priceRange` (optional): Filter by price range ($, $$, $$$, $$$$)
- `location` (optional): Filter by location

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "restaurant123",
      "name": "Sushi Garden",
      "tagline": "Experience authentic Japanese sushi artistry",
      "location": "East Village, NYC",
      "imageUrl": "https://...",
      "additionalPhotos": ["https://..."],
      "popularItems": [
        { "name": "Dragon Roll", "price": "$18", "emoji": "🐉" }
      ],
      "reviews": [
        { "text": "Best sushi in NYC!", "author": "Sarah M." }
      ],
      "ambianceTags": ["Intimate", "Authentic", "Date Night"],
      "reservationInfo": "Walk-ins welcome",
      "priceRange": "$$$",
      "cuisine": "Japanese"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "hasMore": true
  }
}
```

#### Get Restaurant by ID
```http
GET /api/restaurants/:id
```

#### Create Restaurant (Admin)
```http
POST /api/restaurants
Content-Type: application/json

{
  "name": "New Restaurant",
  "tagline": "Amazing food",
  "location": "NYC",
  "imageUrl": "https://...",
  "additionalPhotos": [],
  "popularItems": [],
  "reviews": [],
  "ambianceTags": ["Cozy"],
  "reservationInfo": "Book online",
  "priceRange": "$$",
  "cuisine": "Italian"
}
```

#### Update Restaurant (Admin)
```http
PUT /api/restaurants/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "priceRange": "$$$"
}
```

#### Delete Restaurant (Admin)
```http
DELETE /api/restaurants/:id
```

### User Swipes

#### Save Swipe (Like/Dislike)
```http
POST /api/restaurants/swipe
Content-Type: application/json

{
  "userId": "user123",
  "restaurantId": "restaurant456",
  "action": "like"
}
```

#### Get User's Saved Restaurants
```http
GET /api/restaurants/saved/:userId
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

## Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test

# Seed database
npm run seed
```

## Firebase Firestore Collections

### `restaurants`
```typescript
{
  name: string
  tagline: string
  location: string
  imageUrl: string
  additionalPhotos: string[]
  popularItems: { name: string, price: string, emoji: string }[]
  reviews: { text: string, author: string }[]
  ambianceTags: string[]
  reservationInfo: string
  priceRange: '$' | '$$' | '$$$' | '$$$$'
  cuisine: string
  createdAt: Date
  updatedAt: Date
}
```

### `userSwipes`
```typescript
{
  userId: string
  restaurantId: string
  action: 'like' | 'dislike'
  timestamp: Date
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `3000` | Server port |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Yes* | - | Path to Firebase service account JSON |
| `FIREBASE_PROJECT_ID` | Yes* | - | Firebase project ID (alternative to file) |
| `FIREBASE_CLIENT_EMAIL` | Yes* | - | Firebase client email (alternative to file) |
| `FIREBASE_PRIVATE_KEY` | Yes* | - | Firebase private key (alternative to file) |
| `CORS_ORIGIN` | No | `*` | CORS allowed origins |
| `DEFAULT_PAGE_SIZE` | No | `10` | Default pagination size |
| `MAX_PAGE_SIZE` | No | `50` | Maximum pagination size |

*Either use `FIREBASE_SERVICE_ACCOUNT_PATH` OR the individual Firebase credentials

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...],
  "stack": "..." // Only in development
}
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Validation**: Input validation with express-validator
- **Rate Limiting**: Ready to add (recommended for production)
- **Authentication**: Ready to integrate (Firebase Auth recommended)

## Future Enhancements

### Phase 1: User Management
- [ ] Firebase Authentication integration
- [ ] User profiles and preferences
- [ ] JWT-based API authentication

### Phase 2: Advanced Features
- [ ] AI-powered restaurant recommendations
- [ ] Location-based search with geospatial queries
- [ ] Real-time availability updates
- [ ] Integration with reservation systems

### Phase 3: Analytics & Optimization
- [ ] User behavior analytics
- [ ] Restaurant popularity tracking
- [ ] Performance monitoring
- [ ] Caching layer (Redis)

### Phase 4: Admin Dashboard
- [ ] Restaurant management interface
- [ ] User activity monitoring
- [ ] Content moderation tools

## Integration with Flutter App

The backend is designed to work seamlessly with the Flutter app in the parent directory. To connect:

1. Start the server: `npm run dev`
2. Update Flutter app's API configuration to point to `http://localhost:3000/api`
3. Ensure CORS is properly configured if testing on mobile devices

## Development Tips

### Hot Reload
The development server uses nodemon for automatic restarts on file changes.

### TypeScript Compilation
TypeScript is compiled on-the-fly in development. For production, build first with `npm run build`.

### Database Seeding
Run `npm run seed` to populate Firestore with sample data matching the Flutter app's mock data.

### Testing API Endpoints
Use tools like Postman, Insomnia, or curl to test endpoints:

```bash
# Health check
curl http://localhost:3000/api/health

# Get restaurants
curl "http://localhost:3000/api/restaurants?userId=test&limit=5"

# Save a swipe
curl -X POST http://localhost:3000/api/restaurants/swipe \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","restaurantId":"rest1","action":"like"}'
```

## Troubleshooting

### Firebase Connection Issues
- Verify `serviceAccountKey.json` is in the correct location
- Ensure Firestore is enabled in Firebase Console
- Check Firebase credentials in `.env`

### Port Already in Use
Change the `PORT` in `.env` or kill the process using port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill
```

### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf dist/
npm run build
```

## Contributing

1. Follow the existing code style
2. Run linting before committing: `npm run lint`
3. Format code: `npm run format`
4. Add tests for new features
5. Update documentation

## License

MIT

---

Built with care for food lovers everywhere

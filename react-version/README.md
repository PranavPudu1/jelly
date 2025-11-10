# Jelly Restaurant Finder

A beautiful restaurant discovery app built with React Native, Expo, and TypeScript. This is a complete rewrite of the original Flutter application, maintaining all the original design, animations, and functionality.

## Features

- **Splash Screen** - Animated logo entry with smooth slide and fade transitions
- **Personalized Questionnaire** - Three-step onboarding to understand user preferences (food type, ambiance, budget)
- **Swipeable Restaurant Cards** - Tinder-like interface for discovering restaurants
- **Detailed Restaurant Cards** with:
  - Hero image and basic info (rating, price, cuisine)
  - Restaurant information table (location, bar, live music, kid-friendly)
  - Ambience photo gallery with user reviews
  - Food item reviews with images
  - Social media handles (Instagram, TikTok)
  - Menu images and popular dish photos
- **Bottom Navigation** - Quick access to saved places and settings
- **Dark Theme** - Beautiful dark mode design with pink accent colors

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build tooling
- **TypeScript** - Type-safe development
- **React Navigation** - Screen navigation
- **react-native-deck-swiper** - Tinder-like card swiping
- **Expo Linear Gradient** - Gradient overlays
- **Expo Vector Icons** - Icon library

## Design System

### Color Palette
- **Primary:** #FEE0DE (Light pink)
- **Background:** #212121 (Dark)
- **Surface:** #2E2E2E (Card backgrounds)
- **Text:** #FAFAF7 (Off-white)
- **Accent:** #584D52 (Warm gray)

### Typography
- **Display Font:** Poppins (Bold, SemiBold)
- **Body Font:** Inter (Regular, Medium, SemiBold, Bold)

## Project Structure

```
react-version/
├── App.tsx                     # Main app entry point with navigation
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
├── babel.config.js             # Babel configuration
├── src/
│   ├── screens/
│   │   ├── SplashScreen.tsx           # Animated splash screen
│   │   ├── QuestionnaireScreen.tsx    # Onboarding questionnaire
│   │   └── SwipeScreen.tsx            # Main swipe interface
│   ├── components/
│   │   └── RestaurantCard.tsx         # Detailed restaurant card component
│   ├── theme/
│   │   ├── colors.ts                  # Color palette
│   │   ├── typography.ts              # Text styles and fonts
│   │   ├── spacing.ts                 # Spacing constants
│   │   └── index.ts                   # Theme exports
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces
│   └── data/
│       ├── questions.ts               # Questionnaire data
│       └── mockRestaurants.ts         # Sample restaurant data
└── assets/
    ├── Logo.png                       # App logo (200x200)
    ├── icon.png                       # App icon (1024x1024)
    ├── adaptive-icon.png              # Android adaptive icon
    ├── splash.png                     # Splash screen image
    └── fonts/                         # Custom fonts
        ├── Poppins-Regular.ttf
        ├── Poppins-SemiBold.ttf
        ├── Poppins-Bold.ttf
        ├── Inter-Regular.ttf
        ├── Inter-Medium.ttf
        ├── Inter-SemiBold.ttf
        └── Inter-Bold.ttf
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up assets:**
   - Create the `assets/` and `assets/fonts/` directories:
     ```bash
     mkdir -p assets/fonts
     ```

   - **Copy Logo.png** from the Flutter project:
     ```bash
     # Adjust the path to your Flutter project
     cp ../flutter-project/Logo.png assets/Logo.png
     ```

   - **Download fonts** from Google Fonts:
     - [Poppins](https://fonts.google.com/specimen/Poppins) - Download Regular, SemiBold, and Bold
     - [Inter](https://fonts.google.com/specimen/Inter) - Download Regular, Medium, SemiBold, and Bold
     - Place all font `.ttf` files in `assets/fonts/`

   - **Create app icons** (or use Logo.png as placeholder):
     - `assets/icon.png` (1024x1024)
     - `assets/adaptive-icon.png` (1024x1024)
     - `assets/favicon.png` (48x48)
     - `assets/splash.png` (1284x2778)

   See [ASSETS_SETUP.md](ASSETS_SETUP.md) for detailed asset requirements.

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on a device:**
   - Press `i` for iOS simulator (Mac only)
   - Press `a` for Android emulator
   - Scan the QR code with Expo Go app on your physical device

## Running the App

### Development Mode
```bash
npm start           # Start Expo dev server
npm run ios         # Run on iOS simulator
npm run android     # Run on Android emulator
npm run web         # Run in web browser
```

### Building for Production

#### iOS (requires Mac)
```bash
expo build:ios
```

#### Android
```bash
expo build:android
```

For more build options, see [Expo's documentation](https://docs.expo.dev/build/introduction/).

## Key Components

### SplashScreen
- Displays animated logo with slide-up and fade-in effects
- Auto-navigates to Questionnaire after 1.25 seconds
- Uses React Native's Animated API

### QuestionnaireScreen
- Three customizable questions about food preferences
- Multi-select radio-button style options
- Validates all questions are answered before enabling "Start Discovering" button
- Smooth transitions with answer highlighting

### SwipeScreen
- Implements Tinder-like card swiping with `react-native-deck-swiper`
- Shows "LIKE" (green) and "PASS" (red) overlay labels
- Bottom navigation bar for Saved Places and Settings
- "All done" screen with restart functionality when all cards viewed

### RestaurantCard
- Comprehensive scrollable card with multiple sections:
  - **Hero section** with restaurant name, rating, price, cuisine, and info table
  - **Ambience section** with fullscreen photo gallery modal
  - **Reviews section** with social media handles and food item reviews
  - **Menu section** with horizontally scrollable menu and dish photos
- Modal with draggable reviews section for fullscreen photo viewing
- Dynamic avatar colors for review authors
- Star ratings with Ionicons

## Features from Flutter App

All features from the original Flutter application have been recreated:

✅ Animated splash screen with logo
✅ Three-question personalized questionnaire
✅ Swipeable restaurant cards with overlay indicators
✅ Comprehensive restaurant detail cards
✅ Multiple card sections (hero, ambience, reviews, menu)
✅ Fullscreen photo gallery modal
✅ Draggable reviews section
✅ Social media handle buttons
✅ Horizontal scrolling for menu/dish images
✅ Star ratings display
✅ Bottom navigation bar
✅ Dark theme with pink accent
✅ Custom typography (Poppins + Inter)
✅ Responsive layouts

## Customization

### Adding New Restaurants
Edit `src/data/mockRestaurants.ts` and add new restaurant objects following the `Restaurant` interface defined in `src/types/index.ts`.

### Modifying Questions
Edit `src/data/questions.ts` to add, remove, or modify questionnaire questions.

### Changing Theme Colors
Edit `src/theme/colors.ts` to customize the color palette.

### Adjusting Typography
Edit `src/theme/typography.ts` to modify font styles and sizes.

## Known Issues & TODO

- [ ] Implement "Saved Places" functionality
- [ ] Implement "Settings" screen
- [ ] Add persistence for liked restaurants (AsyncStorage/SQLite)
- [ ] Connect to real restaurant API instead of mock data
- [ ] Implement restaurant filtering based on questionnaire answers
- [ ] Add loading states for images
- [ ] Improve error handling for network requests
- [ ] Add unit tests
- [ ] Add integration tests

## Differences from Flutter Version

While the app maintains visual and functional parity with the Flutter version, there are some technical differences:

1. **Navigation:** Uses React Navigation instead of Flutter's Navigator
2. **Animations:** Uses React Native Animated API instead of Flutter's AnimationController
3. **Card Swiping:** Uses `react-native-deck-swiper` library instead of Flutter's `swipable_stack`
4. **State Management:** Uses React hooks (useState) instead of StatefulWidget
5. **Font Loading:** Fonts are loaded asynchronously via expo-font
6. **Modal Implementation:** Uses React Native Modal with custom styling

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Acknowledgments

- Original Flutter design and concept
- [Expo](https://expo.dev/) for the amazing development experience
- [React Navigation](https://reactnavigation.org/) for navigation
- [react-native-deck-swiper](https://github.com/alexbrillant/react-native-deck-swiper) for card swiping
- Google Fonts for Poppins and Inter fonts

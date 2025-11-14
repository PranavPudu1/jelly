export const Microcopy = {
    /**
     * Success messages
     */
    success: {
        general: ['Yay!', 'You did it!', 'Amazing!', 'Perfect!', 'Woohoo!'],
        saved: [
            'Saved to your favorites!',
            'Added to your list!',
            'We\'ll remember this one!',
        ],
        completed: [
            'All done!',
            'Task complete!',
            'Nailed it!',
            'You\'re awesome!',
        ],
        match: ['It\'s a match!', 'Great choice!', 'We love this one too!'],
    },

    /**
     * Encouragement messages
     */
    encouragement: {
        general: [
            'Let\'s go!',
            'You\'ve got this!',
            'Keep going!',
            'Almost there!',
        ],
        exploring: ['Nice exploring!', 'Looking good!', 'Great taste!'],
        loading: [
            'Just a moment...',
            'Getting things ready...',
            'Almost there...',
            'Loading your favorites...',
        ],
    },

    /**
     * Welcome messages
     */
    welcome: {
        firstTime: [
            'Welcome! Let\'s find your perfect spot!',
            'Hi there! Ready to explore?',
            'Hello! Let\'s discover together!',
        ],
        returning: [
            'Welcome back!',
            'Good to see you!',
            'Hey there!',
            'Ready for more?',
        ],
        timeOfDay: {
            morning: ['Good morning!', 'Rise and shine!', 'Morning!'],
            afternoon: ['Good afternoon!', 'Hey there!', 'Afternoon!'],
            evening: ['Good evening!', 'Evening!', 'Ready for dinner?'],
            night: ['Good night!', 'Late night cravings?', 'Still hungry?'],
        },
    },

    /**
     * Empty state messages
     */
    emptyState: {
        noSaved: [
            'No favorites yet!',
            'Start exploring to save your spots!',
            'Your list is waiting for you!',
        ],
        noResults: [
            'Hmm, nothing here...',
            'Let\'s try something else!',
            'No matches found.',
        ],
        noMatches: [
            'All caught up!',
            'You\'ve seen everything!',
            'Time to explore new areas?',
        ],
    },

    /**
     * Error messages (still friendly!)
     */
    error: {
        general: [
            'Oops! Something went wrong.',
            'Uh oh, we hit a snag.',
            'Hmm, that didn\'t work.',
        ],
        retry: [
            'Let\'s try that again!',
            'Want to give it another shot?',
            'Retry?',
        ],
        network: [
            'Connection trouble...',
            'Check your internet?',
            'Can\'t reach the server.',
        ],
    },

    /**
     * Action prompts
     */
    actions: {
        swipe: ['Swipe to discover!', 'Keep exploring!', 'What do you think?'],
        tap: ['Tap to see more!', 'Take a peek!', 'Check it out!'],
        hold: ['Hold to preview!', 'Press and hold!'],
        pull: ['Pull to refresh!', 'Swipe down to reload!'],
    },

    /**
     * Onboarding
     */
    onboarding: {
        steps: [
            'Let\'s get to know you!',
            'Tell us what you love!',
            'Almost ready!',
            'Perfect! Let\'s go!',
        ],
        tips: [
            'Swipe right if you like it!',
            'Swipe left to pass!',
            'Tap the card to learn more!',
            'Save your favorites for later!',
        ],
    },

    /**
     * Seasonal variations
     */
    seasonal: {
        spring: [
            'Spring vibes!',
            'Cherry blossoms are blooming!',
            'Fresh start!',
        ],
        summer: ['Summer fun!', 'Sunny days ahead!', 'Beach time!'],
        autumn: ['Cozy autumn!', 'Fall favorites!', 'Pumpkin spice season!'],
        winter: ['Winter wonderland!', 'Cozy up!', 'Holiday vibes!'],
    },
};

/**
 * Mascot system configuration
 * Define your consistent character (fox, bunny, star sprite, etc.)
 */
export const MascotSystem = {
    /**
     * Mascot character name
     */
    name: 'Jelly',

    /**
     * Mascot type/species
     */
    type: 'Friendly Fox Spirit',

    /**
     * Mascot states and expressions
     */
    states: {
        idle: 'default',
        happy: 'celebrating',
        excited: 'bouncing',
        thinking: 'pondering',
        sleeping: 'resting',
        waving: 'greeting',
        pointing: 'directing',
        heart: 'loving',
    },

    /**
     * Mascot dialogue based on context
     */
    dialogue: {
        greeting: [
            'Hi! I\'m Jelly, your food guide!',
            'Ready to find something delicious?',
            'Let\'s explore together!',
        ],
        found: [
            'I think you\'ll love this one!',
            'This looks amazing!',
            'Ooh, this is a great spot!',
        ],
        saved: [
            'Added to your collection!',
            'Great choice!',
            'I love that one too!',
        ],
        thinking: [
            'Hmm, let me think...',
            'Finding the perfect match...',
            'Looking for something special...',
        ],
        celebration: ['You found a gem!', 'Perfect match!', 'This is it!'],
        goodbye: ['See you soon!', 'Happy eating!', 'Catch you later!'],
    },

    /**
     * Mascot appearance timing
     */
    timing: {
        greetingDelay: 500,
        idleAnimationInterval: 8000,
        blinkInterval: 3000,
        randomActionInterval: 15000,
    },

    /**
     * Mascot positions on screen
     */
    positions: {
        bottomRight: { bottom: 20, right: 20 },
        bottomLeft: { bottom: 20, left: 20 },
        topRight: { top: 60, right: 20 },
        center: { alignSelf: 'center' },
        floatingCorner: { bottom: 100, right: 20 },
    },
} as const;

/**
 * Sound design system
 * Define gentle chimes and bubble sounds for emotional feedback
 */
export const SoundDesign = {
    /**
     * Sound effect types
     */
    effects: {
        // Positive interactions
        chimeGentle: 'chime_gentle.mp3',
        chimeHappy: 'chime_happy.mp3',
        chimeCelebrate: 'chime_celebrate.mp3',

        // Bubble sounds
        bubblePop: 'bubble_pop.mp3',
        bubbleFloat: 'bubble_float.mp3',

        // UI interactions
        tapSoft: 'tap_soft.mp3',
        swipeWhoosh: 'swipe_whoosh.mp3',
        buttonPress: 'button_press.mp3',

        // Special moments
        sparkle: 'sparkle.mp3',
        success: 'success.mp3',
        match: 'match.mp3',

        // Ambient
        ambientGlow: 'ambient_glow.mp3',
    },

    /**
     * Sound triggers
     */
    triggers: {
        onSwipeRight: 'chimeHappy',
        onSwipeLeft: 'swipeWhoosh',
        onSave: 'chimeCelebrate',
        onMatch: 'match',
        onButtonPress: 'buttonPress',
        onTabChange: 'tapSoft',
        onSuccess: 'success',
        onSparkle: 'sparkle',
        onBubble: 'bubblePop',
    },

    /**
     * Volume levels (0-1)
     */
    volumes: {
        master: 0.7,
        ui: 0.5,
        ambient: 0.3,
        celebration: 0.8,
    },

    /**
     * Haptic feedback configurations
     */
    haptics: {
        light: { type: 'light', intensity: 0.5 },
        medium: { type: 'medium', intensity: 0.7 },
        success: { type: 'success', intensity: 0.8 },
        warning: { type: 'warning', intensity: 0.6 },
        selection: { type: 'selection', intensity: 0.4 },
    },
} as const;

/**
 * Seasonal theming system
 * Visual tweaks for different seasons to make the world feel alive
 */
export const SeasonalThemes = {
    /**
     * Spring theme (March-May)
     */
    spring: {
        name: 'Cherry Blossom',
        colors: {
            accent: '#FFB7C5',
            background: '#FFF5F7',
            particle: '#FFC0CB',
        },
        particles: {
            type: 'cherry-blossom-petals',
            density: 'medium',
            speed: 'slow',
        },
        mascotAccessory: 'flower-crown',
        greeting: 'Spring is here!',
    },

    /**
     * Summer theme (June-August)
     */
    summer: {
        name: 'Sunny Days',
        colors: {
            accent: '#FFD700',
            background: '#FFFACD',
            particle: '#FFA500',
        },
        particles: {
            type: 'sunshine-sparkles',
            density: 'high',
            speed: 'fast',
        },
        mascotAccessory: 'sunglasses',
        greeting: 'Summer fun!',
    },

    /**
     * Autumn theme (September-November)
     */
    autumn: {
        name: 'Falling Leaves',
        colors: {
            accent: '#D2691E',
            background: '#FFF8DC',
            particle: '#CD853F',
        },
        particles: {
            type: 'autumn-leaves',
            density: 'medium',
            speed: 'medium',
        },
        mascotAccessory: 'scarf',
        greeting: 'Cozy autumn vibes!',
    },

    /**
     * Winter theme (December-February)
     */
    winter: {
        name: 'Winter Wonderland',
        colors: {
            accent: '#B0E0E6',
            background: '#F0F8FF',
            particle: '#FFFFFF',
        },
        particles: {
            type: 'snowflakes',
            density: 'low',
            speed: 'slow',
        },
        mascotAccessory: 'winter-hat',
        greeting: 'Winter magic!',
    },

    /**
     * Special occasions
     */
    special: {
        valentines: {
            name: 'Valentine\'s Day',
            colors: { accent: '#FF1493', particle: '#FF69B4' },
            particles: { type: 'hearts', density: 'high', speed: 'slow' },
            duration: { start: '02-10', end: '02-14' },
        },
        halloween: {
            name: 'Halloween',
            colors: { accent: '#FF6347', particle: '#FFA500' },
            particles: { type: 'bats', density: 'medium', speed: 'fast' },
            duration: { start: '10-25', end: '10-31' },
        },
        newYear: {
            name: 'New Year',
            colors: { accent: '#FFD700', particle: '#FFFF00' },
            particles: {
                type: 'confetti',
                density: 'very-high',
                speed: 'fast',
            },
            duration: { start: '12-31', end: '01-02' },
        },
    },
} as const;

/**
 * Helper function to get current season
 */
export function getCurrentSeason(): keyof typeof SeasonalThemes {
    const month = new Date().getMonth() + 1; // 1-12

    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
}

/**
 * Helper function to get random microcopy from a category
 */
export function getRandomMicrocopy(category: string[]): string {
    return category[Math.floor(Math.random() * category.length)];
}

/**
 * Helper function to get time-of-day greeting
 */
export function getTimeOfDayGreeting(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return getRandomMicrocopy(Microcopy.welcome.timeOfDay.morning);
    }
    else if (hour >= 12 && hour < 17) {
        return getRandomMicrocopy(Microcopy.welcome.timeOfDay.afternoon);
    }
    else if (hour >= 17 && hour < 21) {
        return getRandomMicrocopy(Microcopy.welcome.timeOfDay.evening);
    }
    else {
        return getRandomMicrocopy(Microcopy.welcome.timeOfDay.night);
    }
}

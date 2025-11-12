/**
 * 🍰 Texture & Depth System
 *
 * Soft, diffused shadows and layering for warmth and dimensionality.
 * Gradient overlays for dreamy anime-like depth.
 */

import { ViewStyle } from 'react-native';
import { AppColors } from './colors';

/**
 * Soft, diffused shadow presets for warmth
 * Uses 8-16px blur with low opacity as specified
 */
export const Shadows = {
    /**
     * Subtle elevation - for slightly raised elements
     */
    subtle: {
        shadowColor: AppColors.textDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    } as ViewStyle,

    /**
     * Soft elevation - for cards and buttons
     */
    soft: {
        shadowColor: AppColors.textDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
    } as ViewStyle,

    /**
     * Medium elevation - for modals and overlays
     */
    medium: {
        shadowColor: AppColors.textDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    } as ViewStyle,

    /**
     * Warm elevation - for primary interactive elements
     */
    warm: {
        shadowColor: AppColors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    } as ViewStyle,

    /**
     * Glow effect - for highlighted or special elements
     */
    glow: {
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    } as ViewStyle,

    /**
     * Dreamy elevation - for floating elements
     */
    dreamy: {
        shadowColor: AppColors.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 8,
    } as ViewStyle,
} as const;

/**
 * Layer depth system for overlapping translucent elements
 */
export const LayerDepth = {
    /**
     * Background layer (z-index: 0)
     */
    background: {
        zIndex: 0,
        elevation: 0,
    },

    /**
     * Base content layer (z-index: 1)
     */
    base: {
        zIndex: 1,
        elevation: 1,
    },

    /**
     * Raised content layer (z-index: 2)
     */
    raised: {
        zIndex: 2,
        elevation: 2,
    },

    /**
     * Card layer (z-index: 3)
     */
    card: {
        zIndex: 3,
        elevation: 3,
    },

    /**
     * Floating panel layer (z-index: 4)
     */
    floating: {
        zIndex: 4,
        elevation: 4,
    },

    /**
     * Overlay layer (z-index: 5)
     */
    overlay: {
        zIndex: 5,
        elevation: 5,
    },

    /**
     * Modal layer (z-index: 10)
     */
    modal: {
        zIndex: 10,
        elevation: 10,
    },

    /**
     * Tooltip/popover layer (z-index: 15)
     */
    tooltip: {
        zIndex: 15,
        elevation: 15,
    },

    /**
     * Top layer (z-index: 20)
     */
    top: {
        zIndex: 20,
        elevation: 20,
    },
} as const;

/**
 * Light pastel gradients for dreamy anime-like depth
 */
export const Gradients = {
    /**
     * Warm dreamy gradient (pink to peach)
     */
    warmDreamy: {
        colors: [AppColors.primary, '#FFE5E0', '#FFF0E0'],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    },

    /**
     * Soft accent gradient (accent tones)
     */
    softAccent: {
        colors: [AppColors.accent, '#A68A94', '#B8A4AC'],
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
    },

    /**
     * Gentle radial gradient (center to edge)
     */
    gentleRadial: {
        colors: ['rgba(254, 224, 222, 0.8)', 'rgba(254, 224, 222, 0.2)', 'rgba(254, 224, 222, 0)'],
        start: { x: 0.5, y: 0.5 },
        end: { x: 1, y: 1 },
    },

    /**
     * Translucent overlay (for depth on images/content)
     */
    translucentOverlay: {
        colors: ['rgba(140, 106, 119, 0.15)', 'rgba(140, 106, 119, 0.05)'],
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
    },

    /**
     * Shimmer gradient (for loading states)
     */
    shimmer: {
        colors: [
            'rgba(255, 255, 255, 0.0)',
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 0.0)',
        ],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
    },

    /**
     * Sunset gradient (warm tones for special moments)
     */
    sunset: {
        colors: ['#FFE5E0', '#FFD4CC', '#FFC4B8'],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    },

    /**
     * Morning mist gradient (soft and ethereal)
     */
    morningMist: {
        colors: ['rgba(254, 240, 238, 0.6)', 'rgba(254, 240, 238, 0.2)', 'rgba(254, 240, 238, 0)'],
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
    },

    /**
     * Button gradient (subtle depth for buttons)
     */
    button: {
        colors: [AppColors.primary, '#FED8D5'],
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
    },

    /**
     * Card gradient (translucent for floating cards)
     */
    card: {
        colors: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)'],
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
    },
} as const;

/**
 * Backdrop blur configurations for translucent overlays
 */
export const BackdropBlur = {
    /**
     * Subtle blur for light overlays
     */
    subtle: {
        blurRadius: 4,
        opacity: 0.6,
    },

    /**
     * Medium blur for modals
     */
    medium: {
        blurRadius: 8,
        opacity: 0.7,
    },

    /**
     * Strong blur for important overlays
     */
    strong: {
        blurRadius: 16,
        opacity: 0.8,
    },

    /**
     * Dreamy blur for special effects
     */
    dreamy: {
        blurRadius: 24,
        opacity: 0.85,
    },
} as const;

/**
 * Glass morphism effect configurations
 */
export const GlassMorphism = {
    /**
     * Light glass effect
     */
    light: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        ...Shadows.subtle,
    } as ViewStyle,

    /**
     * Medium glass effect
     */
    medium: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        ...Shadows.soft,
    } as ViewStyle,

    /**
     * Dark glass effect
     */
    dark: {
        backgroundColor: 'rgba(24, 24, 24, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...Shadows.medium,
    } as ViewStyle,

    /**
     * Warm glass effect (with primary color tint)
     */
    warm: {
        backgroundColor: 'rgba(254, 224, 222, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(254, 224, 222, 0.4)',
        ...Shadows.warm,
    } as ViewStyle,
} as const;

/**
 * Overlay configurations for different states
 */
export const Overlays = {
    /**
     * Dim overlay for modals
     */
    dim: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    } as ViewStyle,

    /**
     * Light overlay for subtle backgrounds
     */
    light: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    } as ViewStyle,

    /**
     * Warm overlay for cozy moments
     */
    warm: {
        backgroundColor: 'rgba(140, 106, 119, 0.3)',
    } as ViewStyle,

    /**
     * Dreamy overlay for special states
     */
    dreamy: {
        backgroundColor: 'rgba(254, 224, 222, 0.4)',
    } as ViewStyle,
} as const;

/**
 * 💫 Animation & Motion Design System
 *
 * Gentle, responsive motion with easeOutBack and spring damping to mimic softness.
 * All animations follow dreamy, delightful principles.
 */

import { Animated, Easing } from 'react-native';

/**
 * Custom easing curves for soft, gentle motion
 */
export const AnimationEasing = {
    // Gentle bounce-back for interactive elements
    easeOutBack: Easing.bezier(0.34, 1.56, 0.64, 1),

    // Smooth deceleration for state transitions
    easeOutQuart: Easing.bezier(0.25, 1, 0.5, 1),

    // Soft acceleration for micro-animations
    easeInOutSine: Easing.bezier(0.37, 0, 0.63, 1),

    // Dreamy elastic motion
    easeOutElastic: Easing.elastic(1.2),

    // Standard smooth easing
    smooth: Easing.bezier(0.4, 0.0, 0.2, 1),
} as const;

/**
 * Spring configurations for natural, bouncy motion
 */
export const SpringConfig = {
    // Gentle bounce for buttons and interactive elements
    gentle: {
        tension: 50,
        friction: 8,
        useNativeDriver: true,
    },

    // Soft spring for modals and overlays
    soft: {
        tension: 40,
        friction: 10,
        useNativeDriver: true,
    },

    // Playful bounce for micro-interactions
    playful: {
        tension: 80,
        friction: 6,
        useNativeDriver: true,
    },

    // Smooth transition for view changes
    smooth: {
        tension: 35,
        friction: 12,
        useNativeDriver: true,
    },

    // Dreamy float for floating elements
    dreamy: {
        tension: 20,
        friction: 15,
        useNativeDriver: true,
    },
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const AnimationDuration = {
    // Quick micro-interactions (sparkles, blinks)
    micro: 150,

    // Fast interactions (button presses, icon changes)
    fast: 250,

    // Standard transitions
    normal: 400,

    // Moderate state changes
    moderate: 600,

    // Slow, dreamy transitions
    dreamy: 800,

    // Long, cinematic transitions
    cinematic: 1200,
} as const;

/**
 * Scale values for interactive squish/bounce effects
 */
export const AnimationScale = {
    // Subtle press effect
    press: 0.96,

    // Gentle squish
    squish: 0.92,

    // Pop up effect
    pop: 1.08,

    // Bounce peak
    bounce: 1.12,
} as const;

/**
 * Opacity values for fade transitions
 */
export const AnimationOpacity = {
    hidden: 0,
    faint: 0.3,
    translucent: 0.6,
    visible: 1,
} as const;

/**
 * Blur radius values for dreamy state transitions
 */
export const AnimationBlur = {
    none: 0,
    subtle: 4,
    medium: 8,
    dreamy: 16,
    intense: 24,
} as const;

/**
 * Pre-configured animation helpers
 */
export const AnimationPresets = {
    /**
     * Button press animation - gentle squish with bounce back
     */
    buttonPress: (animatedValue: Animated.Value) => {
        return Animated.sequence([
            Animated.spring(animatedValue, {
                toValue: AnimationScale.press,
                ...SpringConfig.gentle,
            }),
            Animated.spring(animatedValue, {
                toValue: 1,
                ...SpringConfig.playful,
            }),
        ]);
    },

    /**
     * Icon glow/pulse animation
     */
    iconGlow: (animatedValue: Animated.Value) => {
        return Animated.sequence([
            Animated.timing(animatedValue, {
                toValue: AnimationScale.pop,
                duration: AnimationDuration.fast,
                easing: AnimationEasing.easeOutBack,
                useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: AnimationDuration.fast,
                easing: AnimationEasing.smooth,
                useNativeDriver: true,
            }),
        ]);
    },

    /**
     * Fade in with dreamy timing
     */
    dreamyFadeIn: (animatedValue: Animated.Value) => {
        return Animated.timing(animatedValue, {
            toValue: AnimationOpacity.visible,
            duration: AnimationDuration.dreamy,
            easing: AnimationEasing.easeOutQuart,
            useNativeDriver: true,
        });
    },

    /**
     * Fade out with dreamy timing
     */
    dreamyFadeOut: (animatedValue: Animated.Value) => {
        return Animated.timing(animatedValue, {
            toValue: AnimationOpacity.hidden,
            duration: AnimationDuration.moderate,
            easing: AnimationEasing.smooth,
            useNativeDriver: true,
        });
    },

    /**
     * Floating element animation (continuous loop)
     */
    float: (animatedValue: Animated.Value) => {
        return Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: -10,
                    duration: AnimationDuration.cinematic,
                    easing: AnimationEasing.easeInOutSine,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: AnimationDuration.cinematic,
                    easing: AnimationEasing.easeInOutSine,
                    useNativeDriver: true,
                }),
            ])
        );
    },

    /**
     * Sparkle/twinkle animation
     */
    sparkle: (opacityValue: Animated.Value, scaleValue: Animated.Value) => {
        return Animated.parallel([
            Animated.sequence([
                Animated.timing(opacityValue, {
                    toValue: AnimationOpacity.visible,
                    duration: AnimationDuration.micro,
                    easing: AnimationEasing.smooth,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityValue, {
                    toValue: AnimationOpacity.hidden,
                    duration: AnimationDuration.fast,
                    easing: AnimationEasing.smooth,
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.timing(scaleValue, {
                    toValue: AnimationScale.bounce,
                    duration: AnimationDuration.micro,
                    easing: AnimationEasing.easeOutBack,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleValue, {
                    toValue: 0,
                    duration: AnimationDuration.fast,
                    easing: AnimationEasing.smooth,
                    useNativeDriver: true,
                }),
            ]),
        ]);
    },

    /**
     * Card entrance animation - slide up and fade in
     */
    cardEntrance: (translateY: Animated.Value, opacity: Animated.Value) => {
        return Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                ...SpringConfig.soft,
            }),
            Animated.timing(opacity, {
                toValue: AnimationOpacity.visible,
                duration: AnimationDuration.moderate,
                easing: AnimationEasing.easeOutQuart,
                useNativeDriver: true,
            }),
        ]);
    },

    /**
     * Modal appearance - scale and fade in with gentle bounce
     */
    modalAppear: (scale: Animated.Value, opacity: Animated.Value) => {
        return Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                ...SpringConfig.gentle,
            }),
            Animated.timing(opacity, {
                toValue: AnimationOpacity.visible,
                duration: AnimationDuration.normal,
                easing: AnimationEasing.easeOutQuart,
                useNativeDriver: true,
            }),
        ]);
    },
} as const;

/**
 * Micro-animation triggers
 */
export const MicroAnimations = {
    /**
     * Character blink interval (for mascot)
     */
    blinkInterval: 3000,

    /**
     * Bubble float speed multiplier
     */
    bubbleSpeed: 1.5,

    /**
     * Sparkle frequency (how often sparkles appear)
     */
    sparkleFrequency: 2000,

    /**
     * Idle animation delay
     */
    idleDelay: 5000,
} as const;

/**
 * State transition configurations
 */
export const StateTransitions = {
    /**
     * View enter transition
     */
    viewEnter: {
        duration: AnimationDuration.moderate,
        easing: AnimationEasing.easeOutQuart,
        opacity: { from: AnimationOpacity.hidden, to: AnimationOpacity.visible },
        scale: { from: 0.95, to: 1 },
        blur: { from: AnimationBlur.medium, to: AnimationBlur.none },
    },

    /**
     * View exit transition
     */
    viewExit: {
        duration: AnimationDuration.normal,
        easing: AnimationEasing.smooth,
        opacity: { from: AnimationOpacity.visible, to: AnimationOpacity.hidden },
        scale: { from: 1, to: 0.95 },
        blur: { from: AnimationBlur.none, to: AnimationBlur.medium },
    },

    /**
     * Loading state transition
     */
    loading: {
        duration: AnimationDuration.dreamy,
        easing: AnimationEasing.easeInOutSine,
        opacity: { from: AnimationOpacity.translucent, to: AnimationOpacity.visible },
    },
} as const;

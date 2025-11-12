# Design System Quick Reference

A quick cheat sheet for implementing the Jelly design system.

## Import Everything You Need

```typescript
import {
    // Animations
    AnimationEasing,
    SpringConfig,
    AnimationDuration,
    AnimationScale,
    AnimationOpacity,
    AnimationPresets,

    // Depth & Texture
    Shadows,
    Gradients,
    LayerDepth,
    GlassMorphism,

    // Emotion & Personality
    Microcopy,
    MascotSystem,
    SoundDesign,
    getRandomMicrocopy,
    getTimeOfDayGreeting,

    // Existing theme
    AppColors,
    Typography,
    Spacing,
    BorderRadius,
} from '../theme';
```

## Common Patterns

### 1. Animated Button

```typescript
const scale = useRef(new Animated.Value(1)).current;

const handlePress = () => {
    AnimationPresets.buttonPress(scale).start();
    // Your action here
};

<Animated.View style={{ transform: [{ scale }] }}>
    <TouchableOpacity onPress={handlePress} style={[styles.button, Shadows.soft]}>
        <Text>{getRandomMicrocopy(Microcopy.success.general)}</Text>
    </TouchableOpacity>
</Animated.View>
```

### 2. Dreamy View Transition

```typescript
const opacity = useRef(new Animated.Value(0)).current;

useEffect(() => {
    AnimationPresets.dreamyFadeIn(opacity).start();
}, []);

<Animated.View style={{ opacity }}>
    {/* Your content */}
</Animated.View>
```

### 3. Card with Shadow & Gradient

```typescript
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
    colors={Gradients.warmDreamy.colors}
    style={[styles.card, Shadows.soft, { borderRadius: BorderRadius.lg }]}
>
    <Text>{content}</Text>
</LinearGradient>
```

### 4. Friendly Microcopy

```typescript
// Success message
<Text>{getRandomMicrocopy(Microcopy.success.general)}</Text>
// → "Yay!", "You did it!", "Amazing!"

// Time-based greeting
<Text>{getTimeOfDayGreeting()}</Text>
// → "Good morning!", "Evening!", etc.

// Encouragement
<Text>{getRandomMicrocopy(Microcopy.encouragement.general)}</Text>
// → "Let's go!", "You've got this!"
```

### 5. Spring Animation

```typescript
Animated.spring(animatedValue, {
    toValue: 1,
    ...SpringConfig.gentle,
}).start();
```

### 6. Glass Morphism Effect

```typescript
<View style={[styles.panel, GlassMorphism.light, { borderRadius: BorderRadius.md }]}>
    <Text>Translucent panel</Text>
</View>
```

## Common Durations

```typescript
AnimationDuration.micro      // 150ms - sparkles, blinks
AnimationDuration.fast       // 250ms - button presses
AnimationDuration.normal     // 400ms - standard transitions
AnimationDuration.moderate   // 600ms - state changes
AnimationDuration.dreamy     // 800ms - dreamy transitions
AnimationDuration.cinematic  // 1200ms - long transitions
```

## Common Shadows

```typescript
Shadows.subtle   // Light elevation
Shadows.soft     // Cards, buttons
Shadows.medium   // Modals
Shadows.warm     // Primary elements (with accent color)
Shadows.glow     // Highlighted elements
Shadows.dreamy   // Floating elements
```

## Common Springs

```typescript
SpringConfig.gentle   // Buttons, interactive elements
SpringConfig.soft     // Modals, overlays
SpringConfig.playful  // Micro-interactions
SpringConfig.smooth   // View transitions
SpringConfig.dreamy   // Floating elements
```

## Common Gradients

```typescript
Gradients.warmDreamy         // Pink to peach
Gradients.softAccent         // Accent tones
Gradients.button             // Subtle button depth
Gradients.card               // Translucent cards
Gradients.shimmer            // Loading states
```

## Common Easing

```typescript
AnimationEasing.easeOutBack      // Gentle bounce
AnimationEasing.easeOutQuart     // Smooth deceleration
AnimationEasing.easeInOutSine    // Soft acceleration
AnimationEasing.easeOutElastic   // Dreamy elastic
AnimationEasing.smooth           // Standard smooth
```

## Style Combinations

### Elevated Card
```typescript
{
    ...Shadows.soft,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: AppColors.primary,
}
```

### Floating Panel
```typescript
{
    ...Shadows.dreamy,
    ...LayerDepth.floating,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
}
```

### Interactive Button
```typescript
{
    ...Shadows.soft,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
}
```

## Animation Presets

```typescript
// Button press
AnimationPresets.buttonPress(scale)

// Icon glow
AnimationPresets.iconGlow(scale)

// Dreamy fade in
AnimationPresets.dreamyFadeIn(opacity)

// Sparkle effect
AnimationPresets.sparkle(opacity, scale)

// Floating animation (loop)
AnimationPresets.float(translateY)

// Card entrance
AnimationPresets.cardEntrance(translateY, opacity)

// Modal appearance
AnimationPresets.modalAppear(scale, opacity)
```

## Microcopy Categories

```typescript
Microcopy.success.general        // "Yay!", "You did it!"
Microcopy.success.saved          // "Saved to your favorites!"
Microcopy.success.completed      // "All done!", "Nailed it!"
Microcopy.encouragement.general  // "Let's go!", "You've got this!"
Microcopy.welcome.firstTime      // "Welcome! Let's find your perfect spot!"
Microcopy.welcome.returning      // "Welcome back!", "Good to see you!"
Microcopy.emptyState.noSaved     // "No favorites yet!"
Microcopy.error.general          // "Oops! Something went wrong."
Microcopy.actions.swipe          // "Swipe to discover!"
```

## Sound & Haptics (When Implemented)

```typescript
// Sound effects
SoundDesign.effects.chimeHappy
SoundDesign.effects.bubblePop
SoundDesign.effects.sparkle
SoundDesign.effects.success

// Haptic feedback
SoundDesign.haptics.light
SoundDesign.haptics.medium
SoundDesign.haptics.success
SoundDesign.haptics.selection
```

## Tips

1. **Always use springs for interactive elements** - They feel more natural
2. **Combine shadow + gradient + border radius** for depth
3. **Use AnimationPresets** instead of writing animations from scratch
4. **Randomize microcopy** to keep the experience fresh
5. **Add haptic feedback** to important interactions
6. **Use dreamy durations** for view transitions (600-800ms)
7. **Layer with depth values** to create hierarchy
8. **Test with reduced motion** settings

## Example Component Template

```typescript
import React, { useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import {
    AnimationPresets,
    Shadows,
    BorderRadius,
    Spacing,
    getRandomMicrocopy,
    Microcopy,
} from '../theme';

const MyComponent = () => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        AnimationPresets.buttonPress(scale).start();
        // TODO: Add sound/haptic
    };

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                onPress={handlePress}
                style={[styles.container, Shadows.soft]}
            >
                <Text>{getRandomMicrocopy(Microcopy.success.general)}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
});
```

---

For complete documentation, see [DESIGN_SPEC.md](./DESIGN_SPEC.md)

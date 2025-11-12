# Jelly Design Specification

## Overview

This design system creates a gentle, dreamy, and delightful user experience inspired by soft anime aesthetics and cozy digital spaces. Every interaction should feel warm, responsive, and emotionally engaging.

---

## 💫 Animation & Motion Design

### Philosophy

Motion should feel **gentle, responsive, and alive**. We use soft physics-based animations and easing curves that mimic natural, organic movement rather than mechanical transitions.

### Easing Curves

```typescript
import { AnimationEasing } from './src/theme';

// Gentle bounce-back for interactive elements
AnimationEasing.easeOutBack

// Smooth deceleration for state transitions
AnimationEasing.easeOutQuart

// Soft acceleration for micro-animations
AnimationEasing.easeInOutSine

// Dreamy elastic motion
AnimationEasing.easeOutElastic
```

### Spring Configurations

Use spring physics for natural, bouncy motion:

```typescript
import { SpringConfig } from './src/theme';

// Button presses and interactive elements
SpringConfig.gentle  // tension: 50, friction: 8

// Modals and overlays
SpringConfig.soft    // tension: 40, friction: 10

// Playful micro-interactions
SpringConfig.playful // tension: 80, friction: 6

// Smooth view transitions
SpringConfig.smooth  // tension: 35, friction: 12

// Floating elements
SpringConfig.dreamy  // tension: 20, friction: 15
```

### Animation Durations

```typescript
import { AnimationDuration } from './src/theme';

AnimationDuration.micro      // 150ms - sparkles, blinks
AnimationDuration.fast       // 250ms - button presses
AnimationDuration.normal     // 400ms - standard transitions
AnimationDuration.moderate   // 600ms - state changes
AnimationDuration.dreamy     // 800ms - dreamy transitions
AnimationDuration.cinematic  // 1200ms - long transitions
```

### Micro-Animations

Add liveliness with subtle animations:

- **Bubbles**: Floating background elements
- **Sparkles**: Success celebrations
- **Character blinks**: Mascot idle animations (every 3 seconds)
- **Floating elements**: Gentle vertical oscillation

```typescript
import { AnimationPresets } from './src/theme';

// Button squish on press
AnimationPresets.buttonPress(animatedValue);

// Icon glow effect
AnimationPresets.iconGlow(animatedValue);

// Sparkle animation
AnimationPresets.sparkle(opacityValue, scaleValue);

// Continuous floating
AnimationPresets.float(animatedValue);
```

### State Transitions

Animate **opacity**, **scale**, and **blur** when changing views:

```typescript
import { StateTransitions } from './src/theme';

// View enter
StateTransitions.viewEnter
// - Opacity: 0 → 1
// - Scale: 0.95 → 1
// - Blur: 8px → 0px
// - Duration: 600ms

// View exit
StateTransitions.viewExit
// - Opacity: 1 → 0
// - Scale: 1 → 0.95
// - Blur: 0px → 8px
// - Duration: 400ms
```

### Interactive Delight

Reward touches with gentle feedback:

- Buttons gently **squish** (scale to 0.96) on press
- Icons **glow** (scale to 1.08) on interaction
- Cards **lift** (add shadow) on press
- Success actions trigger **sparkles**

---

## 🍰 Texture & Depth

### Philosophy

Create **warmth and dimensionality** through soft shadows, layered translucent elements, and dreamy gradients.

### Soft Shadows

Use diffused shadows (8-16px blur, low opacity) for warmth:

```typescript
import { Shadows } from './src/theme';

// Slightly raised elements
Shadows.subtle    // 8px blur, 0.08 opacity

// Cards and buttons
Shadows.soft      // 12px blur, 0.12 opacity

// Modals and overlays
Shadows.medium    // 16px blur, 0.15 opacity

// Primary interactive elements
Shadows.warm      // Uses accent color, 0.2 opacity

// Highlighted elements
Shadows.glow      // 16px blur, 0.4 opacity, no offset

// Floating elements
Shadows.dreamy    // 20px blur, 0.18 opacity
```

### Layer Depth

Use overlapping translucent cards and floating panels:

```typescript
import { LayerDepth } from './src/theme';

LayerDepth.background  // z-index: 0
LayerDepth.base        // z-index: 1
LayerDepth.raised      // z-index: 2
LayerDepth.card        // z-index: 3
LayerDepth.floating    // z-index: 4
LayerDepth.overlay     // z-index: 5
LayerDepth.modal       // z-index: 10
LayerDepth.tooltip     // z-index: 15
LayerDepth.top         // z-index: 20
```

### Gradient Overlays

Light pastel gradients add dreamy anime-like depth:

```typescript
import { Gradients } from './src/theme';

Gradients.warmDreamy         // Pink to peach
Gradients.softAccent         // Accent tones
Gradients.gentleRadial       // Center to edge
Gradients.translucentOverlay // For depth on images
Gradients.shimmer            // Loading states
Gradients.sunset             // Warm special moments
Gradients.morningMist        // Soft ethereal
Gradients.button             // Subtle button depth
Gradients.card               // Translucent cards
```

### Glass Morphism

Create translucent, frosted glass effects:

```typescript
import { GlassMorphism } from './src/theme';

GlassMorphism.light  // Light glass (70% opacity)
GlassMorphism.medium // Medium glass (50% opacity)
GlassMorphism.dark   // Dark glass (60% opacity)
GlassMorphism.warm   // Warm pink-tinted glass
```

---

## 💖 Emotion & Personality

### Philosophy

Every interaction should feel **friendly, delightful, and human**. We use conversational microcopy, a consistent mascot, and gentle sounds to create emotional connections.

### Tone of Copywriting

**Friendly and conversational** — Use exclamations, encouragement, and personality:

```typescript
import { Microcopy, getRandomMicrocopy } from './src/theme';

// Success
getRandomMicrocopy(Microcopy.success.general)
// → "Yay!", "You did it!", "Amazing!"

// Encouragement
getRandomMicrocopy(Microcopy.encouragement.general)
// → "Let's go!", "You've got this!"

// Welcome
getRandomMicrocopy(Microcopy.welcome.firstTime)
// → "Welcome! Let's find your perfect spot!"

// Empty states
getRandomMicrocopy(Microcopy.emptyState.noSaved)
// → "No favorites yet!", "Start exploring!"

// Errors (still friendly!)
getRandomMicrocopy(Microcopy.error.general)
// → "Oops! Something went wrong.", "Uh oh, we hit a snag."
```

### Time-of-Day Greetings

Personalize greetings based on time:

```typescript
import { getTimeOfDayGreeting } from './src/theme';

getTimeOfDayGreeting()
// Morning: "Good morning!", "Rise and shine!"
// Afternoon: "Good afternoon!", "Hey there!"
// Evening: "Good evening!", "Ready for dinner?"
// Night: "Good night!", "Late night cravings?"
```

### Mascot System

**Jelly the Friendly Fox Spirit** anchors brand warmth:

```typescript
import { MascotSystem } from './src/theme';

MascotSystem.name  // "Jelly"
MascotSystem.type  // "Friendly Fox Spirit"

// States
MascotSystem.states.idle      // Default
MascotSystem.states.happy     // Celebrating
MascotSystem.states.excited   // Bouncing
MascotSystem.states.thinking  // Pondering
MascotSystem.states.waving    // Greeting
MascotSystem.states.heart     // Loving

// Dialogue
MascotSystem.dialogue.greeting
// → "Hi! I'm Jelly, your food guide!"

MascotSystem.dialogue.found
// → "I think you'll love this one!"

MascotSystem.dialogue.celebration
// → "You found a gem!"
```

**Timing:**
- Appears 500ms after screen load
- Idle animation every 8 seconds
- Blinks every 3 seconds
- Random action every 15 seconds

### Sound Design

Gentle chimes and bubble sounds enhance emotional feedback:

```typescript
import { SoundDesign } from './src/theme';

// Sounds
SoundDesign.effects.chimeGentle    // Gentle chime
SoundDesign.effects.bubblePop      // Bubble pop
SoundDesign.effects.sparkle        // Sparkle sound
SoundDesign.effects.success        // Success celebration
SoundDesign.effects.match          // Match found

// Triggers
SoundDesign.triggers.onSwipeRight  // 'chimeHappy'
SoundDesign.triggers.onSave        // 'chimeCelebrate'
SoundDesign.triggers.onMatch       // 'match'

// Volumes
SoundDesign.volumes.master         // 0.7
SoundDesign.volumes.ui             // 0.5
SoundDesign.volumes.celebration    // 0.8
```

**Haptic Feedback:**

```typescript
SoundDesign.haptics.light      // Light tap
SoundDesign.haptics.medium     // Medium feedback
SoundDesign.haptics.success    // Success vibration
SoundDesign.haptics.selection  // Selection tick
```

### Seasonal Theming

Visual tweaks make the world feel alive:

```typescript
import { SeasonalThemes, getCurrentSeason } from './src/theme';

const season = getCurrentSeason();

// Spring (March-May)
SeasonalThemes.spring.particles.type  // 'cherry-blossom-petals'
SeasonalThemes.spring.mascotAccessory // 'flower-crown'

// Summer (June-August)
SeasonalThemes.summer.particles.type  // 'sunshine-sparkles'
SeasonalThemes.summer.mascotAccessory // 'sunglasses'

// Autumn (September-November)
SeasonalThemes.autumn.particles.type  // 'autumn-leaves'
SeasonalThemes.autumn.mascotAccessory // 'scarf'

// Winter (December-February)
SeasonalThemes.winter.particles.type  // 'snowflakes'
SeasonalThemes.winter.mascotAccessory // 'winter-hat'
```

**Special Occasions:**
- Valentine's Day (Feb 10-14): Floating hearts
- Halloween (Oct 25-31): Bats and pumpkins
- New Year (Dec 31 - Jan 2): Confetti

---

## Implementation Examples

### Example 1: Animated Button with Sound

```typescript
import { Animated } from 'react-native';
import { AnimationPresets, SoundDesign, Shadows } from './src/theme';

const scale = useRef(new Animated.Value(1)).current;

const handlePress = () => {
  // Visual feedback
  AnimationPresets.buttonPress(scale).start();

  // Sound feedback
  playSound(SoundDesign.effects.buttonPress);

  // Haptic feedback
  triggerHaptic(SoundDesign.haptics.light);
};

<Animated.View style={[styles.button, Shadows.soft, { transform: [{ scale }] }]}>
  <TouchableOpacity onPress={handlePress}>
    <Text>Press me!</Text>
  </TouchableOpacity>
</Animated.View>
```

### Example 2: Dreamy View Transition

```typescript
import { Animated } from 'react-native';
import { StateTransitions, AnimationEasing } from './src/theme';

const opacity = useRef(new Animated.Value(0)).current;
const scale = useRef(new Animated.Value(0.95)).current;

useEffect(() => {
  Animated.parallel([
    Animated.timing(opacity, {
      toValue: StateTransitions.viewEnter.opacity.to,
      duration: StateTransitions.viewEnter.duration,
      easing: AnimationEasing.easeOutQuart,
      useNativeDriver: true,
    }),
    Animated.timing(scale, {
      toValue: StateTransitions.viewEnter.scale.to,
      duration: StateTransitions.viewEnter.duration,
      easing: AnimationEasing.easeOutQuart,
      useNativeDriver: true,
    }),
  ]).start();
}, []);
```

### Example 3: Card with Gradient and Shadow

```typescript
import { LinearGradient } from 'expo-linear-gradient';
import { Shadows, Gradients, BorderRadius } from './src/theme';

<LinearGradient
  colors={Gradients.warmDreamy.colors}
  start={Gradients.warmDreamy.start}
  end={Gradients.warmDreamy.end}
  style={[styles.card, Shadows.soft, { borderRadius: BorderRadius.lg }]}
>
  <Text>Card content</Text>
</LinearGradient>
```

### Example 4: Contextual Microcopy

```typescript
import { Microcopy, getRandomMicrocopy, getTimeOfDayGreeting } from './src/theme';

// Welcome screen
const greeting = getTimeOfDayGreeting();

// Success message
const successMessage = getRandomMicrocopy(Microcopy.success.saved);

// Empty state
const emptyMessage = getRandomMicrocopy(Microcopy.emptyState.noSaved);

<View>
  <Text>{greeting}</Text>
  <Text>{successMessage}</Text>
</View>
```

### Example 5: Seasonal Particle Effect

```typescript
import { SeasonalThemes, getCurrentSeason } from './src/theme';

const season = getCurrentSeason();
const seasonalTheme = SeasonalThemes[season];

<ParticleSystem
  type={seasonalTheme.particles.type}
  density={seasonalTheme.particles.density}
  speed={seasonalTheme.particles.speed}
  color={seasonalTheme.colors.particle}
/>
```

---

## Best Practices

### Do's

✅ Use spring animations for interactive elements
✅ Add gentle shadows to all elevated components
✅ Include friendly, conversational microcopy
✅ Provide haptic and sound feedback for important actions
✅ Animate opacity, scale, and blur for state transitions
✅ Use gradients to add depth to backgrounds and cards
✅ Show the mascot at key moments (welcome, success, empty states)
✅ Update seasonal theming quarterly

### Don'ts

❌ Use harsh, linear animations
❌ Skip feedback on user interactions
❌ Use technical or cold language
❌ Create abrupt state changes without transitions
❌ Use hard shadows or sharp edges
❌ Overuse the mascot (keep it delightful, not annoying)
❌ Ignore seasonal updates
❌ Make animations too fast (< 250ms for most interactions)

---

## Accessibility Considerations

- Provide `prefers-reduced-motion` support: Disable micro-animations and use instant transitions
- Ensure haptic feedback can be disabled in settings
- Provide option to mute sound effects
- Maintain WCAG AA contrast ratios even with gradients
- Ensure mascot dialogue is available as text for screen readers

---

## Performance Guidelines

- Use `useNativeDriver: true` for all transform and opacity animations
- Limit simultaneous particle effects to 50 elements max
- Lazy load seasonal assets
- Cache sound files
- Debounce rapid animations (max 60fps)
- Use `shouldComponentUpdate` or `React.memo` for animated components

---

## Design System Version

**Version:** 1.0.0
**Last Updated:** 2025-11-12
**Maintained By:** Jelly Team

---

## Resources

- [Animations](./src/theme/animations.ts)
- [Depth & Texture](./src/theme/depth.ts)
- [Emotion & Personality](./src/theme/emotion.ts)
- [Colors](./src/theme/colors.ts)
- [Typography](./src/theme/typography.ts)
- [Spacing](./src/theme/spacing.ts)

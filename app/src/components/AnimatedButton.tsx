/**
 * AnimatedButton - A playful, bouncy button with entrance animations and interactive feedback
 *
 * Features:
 * - Bouncy entrance animation with scale and rotation
 * - Interactive press animations with shadow effects
 * - Two variants: 'primary' (solid) and 'secondary' (outlined with glow)
 * - Customizable delay for staggered entrances
 *
 * @example
 * ```tsx
 * <AnimatedButton
 *   onPress={handleLogin}
 *   variant="primary"
 *   loading={isLoading}
 * >
 *   <Text style={styles.buttonText}>Login</Text>
 * </AnimatedButton>
 * ```
 */
import { useEffect } from 'react';
import {
    Pressable,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withDelay,
    interpolate,
} from 'react-native-reanimated';

import {
    AppColors,
    Spacing,
    BorderRadius,
} from '../theme';

type AnimatedButtonProps = {
    /** Function to call when button is pressed */
    onPress: () => void;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Whether the button is in loading state */
    loading?: boolean;
    /** Visual style variant - 'primary' (solid) or 'secondary' (outlined) */
    variant?: 'primary' | 'secondary';
    /** Content to render inside the button */
    children: React.ReactNode;
    /** Optional custom styles to apply to the button */
    style?: ViewStyle;
    /** Delay in milliseconds before entrance animation starts. Defaults to 300ms for primary, 400ms for secondary */
    delayMs?: number;
};

export default function AnimatedButton({
    onPress,
    disabled = false,
    loading = false,
    variant = 'primary',
    children,
    style,
    delayMs,
}: AnimatedButtonProps) {
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);
    const shadowElevation = useSharedValue(8);

    const isPrimary = variant === 'primary';

    // Entrance animation
    useEffect(() => {
        scale.value = 0;
        rotation.value = -5;

        const delay = delayMs !== undefined ? delayMs : (isPrimary ? 300 : 400);

        scale.value = withDelay(
            delay,
            withSpring(1, {
                damping: 8,
                stiffness: 100,
                mass: 0.5,
            })
        );

        rotation.value = withDelay(
            delay,
            withSpring(0, {
                damping: 12,
                stiffness: 100,
            })
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { rotate: `${rotation.value}deg` },
            ],
            shadowOpacity: interpolate(
                shadowElevation.value,
                [0, 16],
                [0.35, 0.65]
            ),
            shadowRadius: interpolate(
                shadowElevation.value,
                [0, 16],
                [8, 24]
            ),
            elevation: interpolate(
                shadowElevation.value,
                [0, 16],
                [6, 16]
            ),
        };
    });

    const handlePressIn = () => {
        if (disabled || loading) return;

        scale.value = withSpring(0.95, {
            damping: 15,
            stiffness: 400,
        });

        shadowElevation.value = withSpring(3, {
            damping: 15,
            stiffness: 400,
        });
    };

    const handlePressOut = () => {
        if (disabled || loading) return;

        // Bouncy release animation
        scale.value = withSequence(
            withSpring(1.05, {
                damping: 8,
                stiffness: 400,
            }),
            withSpring(1, {
                damping: 10,
                stiffness: 300,
            })
        );

        shadowElevation.value = withSequence(
            withSpring(14, {
                damping: 8,
                stiffness: 400,
            }),
            withSpring(8, {
                damping: 10,
                stiffness: 300,
            })
        );
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            style={styles.buttonWrapper}
        >
            <Animated.View
                style={[
                    styles.button,
                    isPrimary ? styles.primaryButton : styles.secondaryButton,
                    animatedStyle,
                    style,
                ]}
            >
                {children}
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    buttonWrapper: {
        width: '100%',
    },
    button: {
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        backgroundColor: AppColors.primary,
        // Enhanced dramatic shadows
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 20,
        elevation: 12,
    },
    primaryButton: {
        backgroundColor: AppColors.primary,
        // Extra vibrant shadow for primary button
        shadowColor: AppColors.primary,
        shadowOffset: {
            width: 0,
            height: 14,
        },
        shadowRadius: 28,
        elevation: 16,
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2.5,
        borderColor: AppColors.primary,
        // Strong glow effect for secondary button
        shadowColor: AppColors.primary,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowRadius: 20,
        elevation: 10,
    },
});

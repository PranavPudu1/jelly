import { useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    ViewStyle,
} from 'react-native';

import {
    AnimationScale,
    Shadows,
    BorderRadius,
    Spacing,
    Typography,
    AppColors,
} from '../theme';

interface DelightfulButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'accent';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    style?: ViewStyle;
}

export default function DelightfulButton({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    style,
}: DelightfulButtonProps) {
    const scale = useRef(new Animated.Value(1)).current;

    function handlePressIn() {
        if (disabled) return;

        // Gentle squish animation
        Animated.spring(scale, {
            toValue: AnimationScale.press,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }

    function handlePressOut() {
        if (disabled) return;

        // Bounce back with playful spring
        Animated.spring(scale, {
            toValue: 1,
            tension: 80,
            friction: 6,
            useNativeDriver: true,
        }).start();
    }

    function handlePress() {
        if (disabled) return;

        // TODO: Add sound effect
        // playSound(SoundDesign.effects.buttonPress);

        // TODO: Add haptic feedback
        // triggerHaptic(SoundDesign.haptics.light);

        onPress();
    }

    // Get variant styles
    function getVariantStyle(): ViewStyle {
        switch (variant) {
        case 'primary':
            return {
                backgroundColor: AppColors.primary,
                ...Shadows.soft,
            };
        case 'secondary':
            return {
                backgroundColor: AppColors.secondary,
                ...Shadows.subtle,
            };
        case 'accent':
            return {
                backgroundColor: AppColors.accent,
                ...Shadows.warm,
            };
        default:
            return {
                backgroundColor: AppColors.primary,
                ...Shadows.soft,
            };
        }
    }

    // Get size styles
    function getSizeStyle(): ViewStyle {
        switch (size) {
        case 'small':
            return {
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.xs,
                minWidth: 80,
            };
        case 'medium':
            return {
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.sm,
                minWidth: 120,
            };
        case 'large':
            return {
                paddingHorizontal: Spacing.xl,
                paddingVertical: Spacing.md,
                minWidth: 160,
            };
        default:
            return {
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.sm,
                minWidth: 120,
            };
        }
    }

    // Get text color based on variant
    const getTextColor = (): string => {
        switch (variant) {
        case 'primary':
            return AppColors.textDark;
        case 'secondary':
            return AppColors.textLight;
        case 'accent':
            return AppColors.textLight;
        default:
            return AppColors.textDark;
        }
    };

    return (
        <Animated.View
            style={ [
                {
                    transform: [{ scale }],
                },
            ] }
        >
            <TouchableOpacity
                onPressIn={ handlePressIn }
                onPressOut={ handlePressOut }
                onPress={ handlePress }
                disabled={ disabled }
                activeOpacity={ 0.9 }
                style={ [
                    styles.button,
                    getVariantStyle(),
                    getSizeStyle(),
                    disabled && styles.disabled,
                    style,
                ] }
            >
                <Text
                    style={ [
                        styles.text,
                        size === 'small' && Typography.bodyMedium,
                        size === 'medium' && Typography.button,
                        size === 'large' && Typography.titleMedium,
                        { color: getTextColor() },
                        disabled && styles.disabledText,
                    ] }
                >
                    { title }
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
    disabledText: {
        opacity: 0.6,
    },
});

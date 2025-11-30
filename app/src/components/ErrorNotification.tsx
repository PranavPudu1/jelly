import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface ErrorNotificationProps {
    message: string | null;
    duration?: number;
    onDismiss?: () => void;
}

export default function ErrorNotification({
    message,
    duration = 4000,
    onDismiss,
}: ErrorNotificationProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        if (message) {
            // Fade in animation
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-dismiss after specified duration
            const timeout = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateY, {
                        toValue: -20,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    onDismiss?.();
                });
            }, duration);

            return () => clearTimeout(timeout);
        } else {
            // Reset animation values when message is cleared
            opacity.setValue(0);
            translateY.setValue(-20);
        }
    }, [message, duration, opacity, translateY, onDismiss]);

    if (!message) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: Spacing.md,
        right: Spacing.md,
        backgroundColor: 'rgba(255, 83, 74, 0.95)',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        ...Shadows.medium,
        zIndex: 1000,
    },
    text: {
        ...Typography.bodyMedium,
        color: 'white',
        textAlign: 'center',
        fontWeight: '500',
    },
});

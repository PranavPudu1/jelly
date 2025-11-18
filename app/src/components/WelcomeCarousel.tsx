import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AppColors, Typography, Spacing } from '../theme';

type WelcomeCarouselProps = {
    onAutoAdvance?: () => void;
};

export default function WelcomeCarousel({
    onAutoAdvance,
}: WelcomeCarouselProps) {
    const [carouselIndex, setCarouselIndex] = useState(0);
    const carouselFadeAnim = useRef(new Animated.Value(1)).current;
    const carouselWords = ['lunch', 'dinner', 'date spot'];

    useEffect(() => {
        const interval = setInterval(() => {
            setCarouselIndex((prev) => {
                // Stop at the last item, don't wrap around
                if (prev >= carouselWords.length - 1) return prev;

                Animated.sequence([
                    Animated.timing(carouselFadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(carouselFadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();

                return prev + 1;
            });
        }, 800);

        // Auto-advance to first question after 3 seconds
        const autoAdvance = setTimeout(() => {
            onAutoAdvance?.();
        }, 2000);

        return () => {
            clearInterval(interval);
            clearTimeout(autoAdvance);
        };
    }, [carouselFadeAnim, onAutoAdvance, carouselWords.length]);

    return (
        <View style={ styles.welcomeContainer }>
            <View style={ styles.welcomeContent }>
                <Text style={ styles.welcomeText }>Welcome to Jelly!</Text>

                <View style={ styles.carouselContainer }>
                    <Text style={ styles.carouselText } numberOfLines={1}>
                        Let's find your next{ ' ' }
                    </Text>

                    <Animated.Text
                        numberOfLines={1}
                        style={ [
                            styles.carouselWord,
                            { opacity: carouselFadeAnim },
                        ] }
                    >
                        { carouselWords[carouselIndex] }
                    </Animated.Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    welcomeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    welcomeContent: {
        alignItems: 'center',
    },
    welcomeText: {
        ...Typography.displayLarge,
        fontSize: 42,
        fontWeight: '700',
        color: AppColors.textDark,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    carouselContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 60,
        paddingHorizontal: Spacing.md,
        flexWrap: 'wrap',
    },
    carouselText: {
        ...Typography.displaySmall,
        fontSize: 28,
        fontWeight: '600',
        color: AppColors.textDark,
        textAlign: 'center',
        flexShrink: 1,
    },
    carouselWord: {
        ...Typography.displaySmall,
        fontSize: 28,
        fontWeight: '700',
        color: AppColors.primary,
        textAlign: 'center',
        flexShrink: 1,
    },
});

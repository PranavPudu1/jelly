import { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
import { AppColors, SpringConfig, AnimationDuration, AnimationEasing, AnimationOpacity } from '../theme';

type SplashScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const { height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: SplashScreenProps) {
    const slideAnim = useRef(new Animated.Value(height * 0.3)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Delay before starting animation
        const startDelay = setTimeout(() => {
            // Start animations with dreamy easing and spring physics
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    ...SpringConfig.soft,
                }),
                Animated.timing(fadeAnim, {
                    toValue: AnimationOpacity.visible,
                    duration: AnimationDuration.dreamy,
                    easing: AnimationEasing.easeOutQuart,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Navigate to Auth screen after animation completes
                setTimeout(() => {
                    navigation.replace('Auth');
                }, AnimationDuration.normal);
            });
        }, AnimationDuration.normal);

        return () => clearTimeout(startDelay);
    }, [navigation, slideAnim, fadeAnim]);

    return (
        <View style={ styles.container }>
            <Animated.View
                style={ [
                    styles.logoContainer,
                    {
                        transform: [{ translateY: slideAnim }],
                        opacity: fadeAnim,
                    },
                ] }
            >
                <Image
                    source={ require('../../assets/Logo.png') }
                    style={ styles.logo }
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 260,
        height: 260,
    },
});

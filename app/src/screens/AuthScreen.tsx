import { useContext, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VideoView, useVideoPlayer } from 'expo-video';
import * as Application from 'expo-application';

import { RootStackParamList } from '../../App';
import { UserContext } from '../contexts/UserContext';
import { createTemporaryUser } from '../services/userApi';
import ErrorNotification from '../components/ErrorNotification';

import {
    AppColors,
    Typography,
    Spacing,
    BorderRadius,
    Shadows,
} from '../theme';

type AuthScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

const { height } = Dimensions.get('window');

export default function AuthScreen({ navigation }: AuthScreenProps) {
    const { setUser } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // change this to: require('../../assets/videos/restaurant-background.mp4')
    const player = useVideoPlayer(
        'https://www.pexels.com/download/video/5498746/',
        (player) => {
            player.loop = true;
            player.muted = true;
            player.play();
        },
    );

    async function handleContinueAsGuest() {
        setLoading(true);
        setError(null);

        try {
            // Get unique device ID based on platform
            let deviceId: string | undefined;
            if (Platform.OS === 'android') {
                deviceId = Application.getAndroidId();
            }
            else if (Platform.OS === 'ios') {
                deviceId =
                    (await Application.getIosIdForVendorAsync()) || undefined;
            }

            // Create temporary user on server with device ID
            const tempUser = await createTemporaryUser(deviceId);

            // Update user context
            setUser(tempUser);

            // Navigate to questionnaire
            navigation.replace('Questionnaire');
        }
        catch (err) {
            console.error('Error creating temporary user:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create guest account',
            );
        }
        finally {
            setLoading(false);
        }
    }

    async function handleLogin() {
        setLoading(true);
        setError(null);

        try {
            // Get unique device ID based on platform
            let deviceId: string | undefined;
            if (Platform.OS === 'android') {
                deviceId = Application.getAndroidId();
            }
            else if (Platform.OS === 'ios') {
                deviceId =
                    (await Application.getIosIdForVendorAsync()) || undefined;
            }

            // TODO: For now, create a temporary user and navigate to MainTabs
            // In the future, this will open a login/signup flow
            const tempUser = await createTemporaryUser(deviceId);

            // Update user context
            setUser(tempUser);

            // Navigate to main tabs (swipe screen)
            navigation.replace('MainTabs');
        }
        catch (err) {
            console.error('Error logging in:', err);
            setError(err instanceof Error ? err.message : 'Failed to login');
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <View style={ styles.container }>
            { /* Background Video */ }
            <VideoView
                style={ styles.video }
                player={ player }
                contentFit="cover"
                nativeControls={ false }
            />

            { /* Dark overlay for better text visibility */ }
            <View style={ styles.overlay } />

            { /* Error notification at top */ }
            <ErrorNotification message={ error } onDismiss={ () => setError(null) } />

            <SafeAreaView style={ styles.safeArea }>
                <View style={ styles.content }>
                    { /* Logo Section */ }
                    <View style={ styles.logoSection }>
                        <Image
                            source={ require('../../assets/Logo.png') }
                            style={ styles.logo }
                            resizeMode="contain"
                        />

                        <Text style={ styles.title }>Jelly</Text>
                        <Text style={ styles.subtitle }>
                            Discover your next favorite restaurant
                        </Text>
                    </View>

                    { /* Buttons Section - positioned higher like Hinge */ }
                    <View style={ styles.buttonsContainer }>
                        { /* Login/Create Account Button */ }
                        <TouchableOpacity
                            style={ [styles.primaryButton, styles.button] }
                            onPress={ handleLogin }
                            disabled={ loading }
                            activeOpacity={ 0.8 }
                        >
                            { loading ? (
                                <ActivityIndicator color={ AppColors.primary } />
                            ) : (
                                <Text style={ styles.primaryButtonText }>
                                    Login / Create Account
                                </Text>
                            ) }
                        </TouchableOpacity>

                        { /* Continue as Guest Button */ }
                        <TouchableOpacity
                            style={ [styles.button, styles.secondaryButton] }
                            onPress={ handleContinueAsGuest }
                            disabled={ loading }
                            activeOpacity={ 0.8 }
                        >
                            { loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={ styles.secondaryButtonText }>
                                    Continue as Guest
                                </Text>
                            ) }
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
        justifyContent: 'space-between',
        paddingBottom: Spacing.xl,
    },
    logoSection: {
        flex: 0.4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height * 0.05,
    },
    logo: {
        width: 320,
        height: 320,
    },
    title: {
        fontSize: 78,
        fontWeight: '900',
        color: 'white',
        marginBottom: Spacing.sm,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 6,
        letterSpacing: 4,
    },
    subtitle: {
        ...Typography.bodyLarge,
        color: 'white',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    buttonsContainer: {
        width: '100%',
        gap: Spacing.md,
        marginBottom: height * 0.08,
    },
    button: {
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        backgroundColor: AppColors.primary,
    },
    primaryButton: {
        backgroundColor: AppColors.primary,
        ...Shadows.medium,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: AppColors.primary,
    },
    primaryButtonText: {
        ...Typography.button,
        color: '#1a1a1a',
        fontWeight: 'bold'
    },
    secondaryButtonText: {
        ...Typography.button,
        color: 'white',
        fontWeight: 'bold'
    },
});

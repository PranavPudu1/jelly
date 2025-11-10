import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import SplashScreenComponent from './src/screens/SplashScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import SwipeScreen from './src/screens/SwipeScreen';

export type RootStackParamList = {
    Splash: undefined;
    Questionnaire: undefined;
    Swipe: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Load fonts
                await Font.loadAsync({
                    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
                    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
                    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
                    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
                    'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
                    'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
                    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
                });
            }
            catch (e) {
                console.warn(e);
            }
            finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <NavigationContainer onReady={ onLayoutRootView }>
            <Stack.Navigator
                screenOptions={ {
                    headerShown: false,
                    animation: 'fade',
                } }
            >
                <Stack.Screen name="Splash" component={ SplashScreenComponent } />
                <Stack.Screen
                    name="Questionnaire"
                    component={ QuestionnaireScreen }
                />
                <Stack.Screen name="Swipe" component={ SwipeScreen } />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

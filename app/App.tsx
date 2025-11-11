import { useCallback, useEffect, useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import UserContextWrapper from './src/contexts/userContext';

import SplashScreenComponent from './src/screens/SplashScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import SwipeScreen from './src/screens/SwipeScreen';
import SavedRestaurantsScreen from './src/screens/SavedRestaurantsScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';

import { AppColors } from './src/theme';

export type RootStackParamList = {
    Splash: undefined;
    Questionnaire: undefined;
    MainTabs: undefined;
};

export type MainTabParamList = {
    Swipe: undefined;
    Saved: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Swipe') {
                        iconName = focused
                            ? 'restaurant'
                            : 'restaurant-outline';
                    } else if (route.name === 'Saved') {
                        iconName = focused ? 'bookmark' : 'bookmark-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else {
                        iconName = 'help-outline';
                    }

                    return (
                        <Ionicons name={iconName} size={size} color={color} />
                    );
                },
                tabBarActiveTintColor: AppColors.textDark,
                tabBarInactiveTintColor: AppColors.secondary,
                tabBarStyle: {
                    backgroundColor: AppColors.primary,
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 80,
                    paddingBottom: 18,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            })}
        >
            <Tab.Screen
                name="Swipe"
                component={SwipeScreen}
                options={{ tabBarLabel: 'Discover' }}
            />

            <Tab.Screen
                name="Saved"
                component={SavedRestaurantsScreen}
                options={{ tabBarLabel: 'Saved' }}
            />

            <Tab.Screen
                name="Profile"
                component={UserProfileScreen}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

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
            } catch (e) {
                console.warn(e);
            } finally {
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

    if (!appIsReady) return null;

    return (
        <GestureHandlerRootView>
            <UserContextWrapper>
                <NavigationContainer onReady={onLayoutRootView}>
                    <Stack.Navigator
                        screenOptions={{
                            headerShown: false,
                            animation: 'fade',
                        }}
                    >
                        <Stack.Screen
                            name="Splash"
                            component={SplashScreenComponent}
                        />

                        <Stack.Screen
                            name="Questionnaire"
                            component={QuestionnaireScreen}
                        />

                        <Stack.Screen name="MainTabs" component={MainTabs} />
                    </Stack.Navigator>
                </NavigationContainer>
            </UserContextWrapper>
        </GestureHandlerRootView>
    );
}

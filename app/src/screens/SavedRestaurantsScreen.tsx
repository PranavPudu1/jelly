import { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Modal, TouchableOpacity, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

import { AppColors, Typography, Spacing, Shadows } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useSavedRestaurants } from '../contexts/SavedRestaurantsContext';
import { useLocation } from '../contexts/LocationContext';
import SavedRestaurantCard from '../components/SavedRestaurantCard';
import RestaurantCard from '../components/RestaurantCard';
import type { Restaurant, SavedRestaurant } from '../types';

export default function SavedRestaurantsScreen() {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const { savedRestaurants, unsaveRestaurant, clearAllSavedRestaurants, isLoading } = useSavedRestaurants();
    const { userLocation } = useLocation();
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const translateY = useRef(new Animated.Value(0)).current;

    function handleRestaurantPress(restaurant: Restaurant) {
        setSelectedRestaurant(restaurant);
        translateY.setValue(0);
    }

    function handleCloseModal() {
        Animated.timing(translateY, {
            toValue: 1000,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setSelectedRestaurant(null);
            translateY.setValue(0);
        });
    }

    function onGestureEvent(event: any) {
        const { translationY } = event.nativeEvent;

        if (translationY > 0) {
            translateY.setValue(translationY);
        }
    }

    function onHandlerStateChange(event: any) {
        const { translationY, velocityY } = event.nativeEvent;

        if (translationY > 150 || velocityY > 500) {
            handleCloseModal();
        }
        else {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();
        }
    }

    function handleUnsave(restaurantId: string) {
        unsaveRestaurant(restaurantId);
    }

    function handleClearAll() {
        Alert.alert(
            'Clear All Saved Restaurants',
            'Are you sure you want to remove all saved restaurants? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: () => {
                        clearAllSavedRestaurants();
                    },
                },
            ],
        );
    }

    function renderRestaurantCard({ item }: { item: SavedRestaurant }) {
        return (
            <SavedRestaurantCard
                savedRestaurant={ item }
                userLocation={ userLocation }
                onPress={ () => handleRestaurantPress(item.restaurant) }
                onUnsave={ () => handleUnsave(item.restaurant.id) }
            />
        );
    }

    function renderEmptyState() {
        return (
            <View style={ styles.emptyContainer }>
                <View style={ styles.emptyIconContainer }>
                    <Ionicons
                        name="heart-outline"
                        size={ 64 }
                        color={ colors.white }
                    />
                </View>

                <Text style={ styles.emptyTitle }>No Saved Restaurants</Text>

                <Text style={ styles.emptySubtitle }>
                    Restaurants you like will appear here
                </Text>
            </View>
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView style={ styles.container } edges={ ['top'] }>
                <View style={ styles.header }>
                    <Text style={ styles.headerTitle }>Saved Restaurants</Text>
                </View>
                <View style={ styles.loadingContainer }>
                    <ActivityIndicator size="large" color={ AppColors.primary } />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={ styles.container } edges={ ['top'] }>
            <View style={ styles.header }>
                <View style={ styles.headerLeft }>
                    <Text style={ styles.headerTitle }>Saved Restaurants</Text>
                    { savedRestaurants.length > 0 && (
                        <Text style={ styles.count }>{ savedRestaurants.length }</Text>
                    ) }
                </View>
                { savedRestaurants.length > 0 && (
                    <TouchableOpacity
                        onPress={ handleClearAll }
                        style={ styles.clearButton }
                        activeOpacity={ 0.7 }
                    >
                        <Ionicons name="trash-outline" size={ 20 } color={ colors.secondary } />
                    </TouchableOpacity>
                ) }
            </View>

            <FlatList
                data={ savedRestaurants }
                renderItem={ renderRestaurantCard }
                keyExtractor={ (item) => item.restaurant.id }
                ListEmptyComponent={ renderEmptyState }
                contentContainerStyle={
                    savedRestaurants.length === 0
                        ? styles.emptyListContainer
                        : styles.listContainer
                }
                showsVerticalScrollIndicator={ false }
            />

            <Modal
                visible={ selectedRestaurant !== null }
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={ handleCloseModal }
            >
                <GestureHandlerRootView style={ { flex: 1 } }>
                    <SafeAreaView style={ styles.modalContainer } edges={ ['top'] }>
                        <TouchableOpacity
                            style={ styles.closeButton }
                            onPress={ handleCloseModal }
                            activeOpacity={ 0.7 }
                        >
                            <View style={ styles.closeButtonInner }>
                                <Ionicons name="close" size={ 28 } color={ AppColors.textDark } />
                            </View>
                        </TouchableOpacity>

                        <PanGestureHandler
                            onGestureEvent={ onGestureEvent }
                            onHandlerStateChange={ onHandlerStateChange }
                        >
                            <Animated.View
                                style={ [
                                    styles.animatedContainer,
                                    {
                                        transform: [{ translateY }],
                                    },
                                ] }
                            >
                                { selectedRestaurant && (
                                    <RestaurantCard restaurant={ selectedRestaurant } />
                                ) }
                            </Animated.View>
                        </PanGestureHandler>
                    </SafeAreaView>
                </GestureHandlerRootView>
            </Modal>
        </SafeAreaView>
    );
}

const createStyles = (colors: typeof AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.textLight + '20',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    headerTitle: {
        ...Typography.displaySmall,
        fontSize: 24,
        color: colors.textDark,
    },
    count: {
        ...Typography.bodyLarge,
        color: colors.primary,
        fontWeight: '600',
    },
    clearButton: {
        padding: Spacing.sm,
        borderRadius: 8,
        backgroundColor: colors.secondary + '15',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
    },
    emptyListContainer: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    emptyTitle: {
        ...Typography.displayMedium,
        fontSize: 24,
        marginBottom: Spacing.sm,
        textAlign: 'center',
        color: colors.textDark,
    },
    emptySubtitle: {
        ...Typography.bodyLarge,
        color: colors.textLight,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.white,
    },
    animatedContainer: {
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1000,
    },
    closeButtonInner: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: AppColors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.medium,
    },
});

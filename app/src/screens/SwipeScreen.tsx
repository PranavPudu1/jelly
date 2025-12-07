import { useState, useRef, useEffect, useCallback, useMemo, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Swiper, SwiperCardRefType } from 'rn-swiper-list';

import RestaurantCard from '../components/RestaurantCard';

import { AppColors, Typography, Spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import {
    useRestaurantsFlat,
    NearbyRestaurantFilters,
} from '../hooks/useRestaurants';
import { useSavedRestaurants } from '../contexts/SavedRestaurantsContext';
import { useLocation } from '../contexts/LocationContext';
import { UserContext } from '../contexts/UserContext';
import type { Restaurant } from '../types';

const { width, height } = Dimensions.get('window');

type FilterType = {
    price: string[];
    distance: string | null;
    rating: string | null;
};

export default function SwipeScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const swiperRef = useRef<SwiperCardRefType>(null);
    const { userLocation, isLoading: isLoadingLocation } = useLocation();
    const { user } = useContext(UserContext);

    const [currentIndex, setCurrentIndex] = useState(0);
    const { saveRestaurant } = useSavedRestaurants();
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const [filters, setFilters] = useState<FilterType>({
        price: [],
        distance: null,
        rating: null,
    });

    // Convert UI filters to API filters
    const apiFilters: NearbyRestaurantFilters = {
        price: filters.price.length > 0 ? filters.price.join(',') : undefined,
        rating: filters.rating
            ? parseFloat(filters.rating.replace('+', ''))
            : undefined,
    };

    // Convert distance filter to radius in meters
    const radius =
        filters.distance === '< 1 mi'
            ? 1609
            : filters.distance === '< 3 mi'
                ? 4828
                : filters.distance === '< 5 mi'
                    ? 8047
                    : 5000; // Default 5km

    // Fetch restaurants with pagination
    const {
        restaurants,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        totalFetched,
        hasMore,
    } = useRestaurantsFlat({
        lat: userLocation?.latitude || 0,
        long: userLocation?.longitude || 0,
        radius,
        filters: apiFilters,
        preferences: user?.preferences, // Use user's preference weights for custom sorting
        limit: 10,
    });

    // Reset index when filters change (new dataset)
    useEffect(() => {
        setCurrentIndex(0);
    }, [filters.price, filters.distance, filters.rating]);

    // Stabilize the restaurants array reference with useMemo
    // This prevents the Swiper from reconciling all cards on every render
    const stableRestaurants = useMemo(() => restaurants, [restaurants]);

    // Memory management: Periodically trim old swiped cards
    // Keep only cards from currentIndex onwards to prevent memory leak
    useEffect(() => {
        const CLEANUP_THRESHOLD = 50; // Cleanup when we have 50+ swiped cards

        if (currentIndex >= CLEANUP_THRESHOLD) {
            // This would require modifying the underlying data structure
            // For now, we're documenting this as a potential enhancement
            // In production, you might want to implement a custom data store
            // that removes old entries while maintaining the swiper state
        }
    }, [currentIndex]);

    // Fetch more restaurants when user is approaching the end (with debouncing)
    useEffect(() => {
        // Clear any pending fetch timeout
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }

        // When user has swiped through 70% of loaded restaurants, fetch more
        const threshold = Math.floor(restaurants.length * 0.7);

        if (currentIndex >= threshold && hasNextPage && !isFetchingNextPage) {
            // Debounce the fetch to prevent rapid consecutive calls
            fetchTimeoutRef.current = setTimeout(() => {
                fetchNextPage();
            }, 300); // 300ms debounce
        }

        // Cleanup timeout on unmount
        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [
        currentIndex,
        restaurants.length,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    ]);

    const handleSwipedRight = useCallback((index: number) => {
        if (stableRestaurants[index]) {
            console.log('Liked:', stableRestaurants[index].name);
            saveRestaurant(stableRestaurants[index]);
        }
    }, [stableRestaurants, saveRestaurant]);

    const handleSwipedLeft = useCallback((index: number) => {
        if (stableRestaurants[index]) {
            console.log('Passed:', stableRestaurants[index].name);
        }
    }, [stableRestaurants]);

    const handleSwipedAll = useCallback(() => {
        console.log('All cards swiped');
        // Optionally fetch more if available
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleStartOver = useCallback(() => {
        setCurrentIndex(0);
    }, []);

    const handleIndexChange = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    const togglePriceFilter = useCallback((price: string) => {
        setFilters((prev) => ({
            ...prev,
            price: prev.price.includes(price)
                ? prev.price.filter((p) => p !== price)
                : [...prev.price, price],
        }));
    }, []);

    const toggleDistanceFilter = useCallback((distance: string) => {
        setFilters((prev) => ({
            ...prev,
            distance: prev.distance === distance ? null : distance,
        }));
    }, []);

    const toggleRatingFilter = useCallback((rating: string) => {
        setFilters((prev) => ({
            ...prev,
            rating: prev.rating === rating ? null : rating,
        }));
    }, []);

    // Memoize renderCard to prevent unnecessary re-renders
    const renderCard = useCallback((restaurant: Restaurant) => {
        return <RestaurantCard restaurant={ restaurant } />;
    }, []);

    // Memoize overlay components to prevent re-renders
    const OverlayLabelRight = useCallback(() => {
        return (
            <View
                style={ {
                    position: 'absolute',
                    right: 20,
                    top: 20,
                } }
            >
                <View
                    style={ {
                        backgroundColor: colors.background,
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderWidth: 2,
                        borderColor: colors.background,
                    } }
                >
                    <Text
                        style={ {
                            color: colors.white,
                            fontSize: 26,
                            fontWeight: 'bold',
                        } }
                    >
                        PASS
                    </Text>
                </View>
            </View>
        );
    }, [colors]);

    const OverlayLabelLeft = useCallback(() => {
        return (
            <View
                style={ {
                    position: 'absolute',
                    left: 20,
                    top: 20,
                } }
            >
                <View
                    style={ {
                        backgroundColor: colors.primary,
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderWidth: 2,
                        borderColor: colors.primary,
                    } }
                >
                    <Text
                        style={ {
                            color: colors.textDark,
                            fontSize: 26,
                            fontWeight: 'bold',
                        } }
                    >
                        LIKE
                    </Text>
                </View>
            </View>
        );
    }, [colors]);

    function FilterChip({
        label,
        isActive,
        onPress,
    }: {
        label: string;
        isActive: boolean;
        onPress: () => void;
    }) {
        return (
            <TouchableOpacity
                style={ [styles.filterChip, isActive && styles.filterChipActive] }
                onPress={ onPress }
                activeOpacity={ 0.7 }
            >
                <Text
                    style={ [
                        styles.filterChipText,
                        isActive && styles.filterChipTextActive,
                    ] }
                >
                    { label }
                </Text>
            </TouchableOpacity>
        );
    }

    // Loading state
    if (isLoading || isLoadingLocation) {
        return (
            <SafeAreaView style={ styles.container } edges={ ['top'] }>
                <View style={ styles.loadingContainer }>
                    <ActivityIndicator
                        size="large"
                        color={ colors.secondary }
                    />
                    <Text style={ styles.loadingText }>
                        { isLoadingLocation
                            ? 'Getting your location...'
                            : 'Loading restaurants...' }
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // No location available
    if (!userLocation) {
        return (
            <SafeAreaView style={ styles.container } edges={ ['top'] }>
                <View style={ styles.errorContainer }>
                    <Ionicons
                        name="location-outline"
                        size={ 64 }
                        color={ colors.textLight }
                    />
                    <Text style={ styles.errorTitle }>Location Required</Text>
                    <Text style={ styles.errorMessage }>
                        Please enable location services to find nearby
                        restaurants
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (isError) {
        return (
            <SafeAreaView style={ styles.container } edges={ ['top'] }>
                <View style={ styles.errorContainer }>
                    <Ionicons
                        name="alert-circle"
                        size={ 64 }
                        color={ colors.textLight }
                    />
                    <Text style={ styles.errorTitle }>
                        Oops! Something went wrong
                    </Text>
                    <Text style={ styles.errorMessage }>
                        { error?.message || 'Failed to load restaurants' }
                    </Text>
                    <Text style={ styles.errorHint }>
                        Make sure your backend server is running at
                        localhost:3000
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // No restaurants found
    if (!isLoading && restaurants.length === 0) {
        return (
            <SafeAreaView style={ styles.container } edges={ ['top'] }>
                <View style={ styles.endScreenContainer }>
                    <View style={ styles.endIconContainer }>
                        <Ionicons
                            name="restaurant"
                            size={ 64 }
                            color={ colors.textDark }
                        />
                    </View>
                    <Text style={ styles.endTitle }>No restaurants found</Text>
                    <Text style={ styles.endSubtitle }>
                        Try adjusting your filters or check back later
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // TODO: Get rid of this? What do we do when there's no more
    if (currentIndex >= restaurants.length && !hasMore) {
        return (
            <SafeAreaView style={ styles.container } edges={ ['top'] }>
                <View style={ styles.endScreenContainer }>
                    <View style={ styles.endIconContainer }>
                        <Ionicons
                            name="restaurant"
                            size={ 64 }
                            color={ colors.textDark }
                        />
                    </View>

                    <Text style={ styles.endTitle }>All done for now!</Text>

                    <Text style={ styles.endSubtitle }>
                        You've seen all available restaurants
                    </Text>

                    <TouchableOpacity
                        style={ styles.startOverButton }
                        onPress={ handleStartOver }
                        activeOpacity={ 0.8 }
                    >
                        <Text style={ styles.startOverButtonText }>
                            Start Over
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={ styles.container } edges={ ['top'] }>
            <View style={ styles.filterContainer }>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={ false }
                    contentContainerStyle={ styles.filterScrollContent }
                >
                    <FilterChip
                        label="$"
                        isActive={ filters.price.includes('$') }
                        onPress={ () => togglePriceFilter('$') }
                    />

                    <FilterChip
                        label="$$"
                        isActive={ filters.price.includes('$$') }
                        onPress={ () => togglePriceFilter('$$') }
                    />

                    <FilterChip
                        label="$$$"
                        isActive={ filters.price.includes('$$$') }
                        onPress={ () => togglePriceFilter('$$$') }
                    />

                    <FilterChip
                        label="< 1 mi"
                        isActive={ filters.distance === '< 1 mi' }
                        onPress={ () => toggleDistanceFilter('< 1 mi') }
                    />

                    <FilterChip
                        label="< 3 mi"
                        isActive={ filters.distance === '< 3 mi' }
                        onPress={ () => toggleDistanceFilter('< 3 mi') }
                    />

                    <FilterChip
                        label="< 5 mi"
                        isActive={ filters.distance === '< 5 mi' }
                        onPress={ () => toggleDistanceFilter('< 5 mi') }
                    />

                    <FilterChip
                        label="4.0+ ⭐"
                        isActive={ filters.rating === '4.0+' }
                        onPress={ () => toggleRatingFilter('4.0+') }
                    />

                    <FilterChip
                        label="4.5+ ⭐"
                        isActive={ filters.rating === '4.5+' }
                        onPress={ () => toggleRatingFilter('4.5+') }
                    />
                </ScrollView>
            </View>

            <View style={ styles.cardContainer }>
                <Swiper
                    ref={ swiperRef }
                    data={ stableRestaurants }
                    renderCard={ renderCard }
                    onSwipeRight={ handleSwipedRight }
                    onSwipeLeft={ handleSwipedLeft }
                    onSwipedAll={ handleSwipedAll }
                    onIndexChange={ handleIndexChange }
                    cardStyle={ {
                        width: width - 40,
                        height: height * 0.65,
                    } }
                    disableTopSwipe
                    disableBottomSwipe
                    translateXRange={ [-width / 3, 0, width / 3] }
                    inputOverlayLabelRightOpacityRange={ [
                        0,
                        width / 5,
                        width / 3,
                    ] }
                    outputOverlayLabelRightOpacityRange={ [0, 0.5, 1] }
                    inputOverlayLabelLeftOpacityRange={ [
                        -width / 3,
                        -width / 5,
                        0,
                    ] }
                    outputOverlayLabelLeftOpacityRange={ [1, 0.5, 0] }
                    // For some reason these are flipped
                    OverlayLabelLeft={ OverlayLabelRight }
                    OverlayLabelRight={ OverlayLabelLeft }
                    swipeVelocityThreshold={ 800 }
                />

                { /* TODO: Get rid of this. dev mode only */ }
                { /* Loading indicator for next page */ }
                { isFetchingNextPage && (
                    <View style={ styles.fetchingNextContainer }>
                        <ActivityIndicator
                            size="small"
                            color={ AppColors.secondary }
                        />
                        <Text style={ styles.fetchingNextText }>
                            Loading more...
                        </Text>
                    </View>
                ) }
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors: typeof AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    filterContainer: {
        paddingVertical: Spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.textLight + '20',
    },
    filterScrollContent: {
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.textLight + '40',
        marginRight: Spacing.sm,
    },
    filterChipActive: {
        backgroundColor: colors.textDark,
        borderColor: colors.textDark,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textDark,
    },
    filterChipTextActive: {
        color: colors.white,
    },
    cardContainer: {
        flex: 1,
        paddingTop: 0,
    },
    endScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
    },
    endIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    endTitle: {
        ...Typography.displayMedium,
        fontSize: 28,
        marginBottom: Spacing.sm,
        textAlign: 'center',
        color: colors.textDark,
    },
    endSubtitle: {
        ...Typography.bodyLarge,
        color: colors.textLight,
        marginBottom: Spacing.xxl,
        textAlign: 'center',
    },
    startOverButton: {
        backgroundColor: colors.primary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xxxl,
        borderRadius: 30,
    },
    startOverButtonText: {
        ...Typography.button,
        color: colors.textDark,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
    },
    loadingText: {
        ...Typography.bodyLarge,
        color: colors.textLight,
        marginTop: Spacing.lg,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
    },
    errorTitle: {
        ...Typography.displayMedium,
        fontSize: 24,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
        textAlign: 'center',
        color: colors.textDark,
    },
    errorMessage: {
        ...Typography.bodyLarge,
        color: colors.textLight,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    errorHint: {
        ...Typography.bodySmall,
        color: colors.textLight,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    fetchingNextContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        backgroundColor: colors.white + 'E6',
        borderRadius: 20,
        alignSelf: 'center',
    },
    fetchingNextText: {
        ...Typography.bodySmall,
        color: colors.textDark,
        fontWeight: '600',
    },
});

import { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Swiper, SwiperCardRefType } from 'rn-swiper-list';

import RestaurantCard from '../components/RestaurantCard';

import { AppColors, Typography, Spacing } from '../theme';
import { MOCK_RESTAURANTS } from '../data/mockRestaurants';
import type { Restaurant } from '../types';

const { width, height } = Dimensions.get('window');

type FilterType = {
    price: string[];
    distance: string | null;
    cuisine: string[];
    rating: string | null;
};

export default function SwipeScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const swiperRef = useRef<SwiperCardRefType>(null);
    const [filters, setFilters] = useState<FilterType>({
        price: [],
        distance: null,
        cuisine: [],
        rating: null,
    });

    function handleSwipedRight(index: number) {
        console.log('Liked:', MOCK_RESTAURANTS[index].name);
        // TODO: Save liked restaurant
    }

    function handleSwipedLeft(index: number) {
        console.log('Passed:', MOCK_RESTAURANTS[index].name);
    }

    function handleSwipedAll() {
        console.log('All cards swiped');
    }

    function handleStartOver() {
        setCurrentIndex(0);
    }

    function handleIndexChange(index: number) {
        setCurrentIndex(index);
    }

    function togglePriceFilter(price: string) {
        setFilters((prev) => ({
            ...prev,
            price: prev.price.includes(price)
                ? prev.price.filter((p) => p !== price)
                : [...prev.price, price],
        }));
    }

    function toggleDistanceFilter(distance: string) {
        setFilters((prev) => ({
            ...prev,
            distance: prev.distance === distance ? null : distance,
        }));
    }

    function toggleCuisineFilter(cuisine: string) {
        setFilters((prev) => ({
            ...prev,
            cuisine: prev.cuisine.includes(cuisine)
                ? prev.cuisine.filter((c) => c !== cuisine)
                : [...prev.cuisine, cuisine],
        }));
    }

    function toggleRatingFilter(rating: string) {
        setFilters((prev) => ({
            ...prev,
            rating: prev.rating === rating ? null : rating,
        }));
    }

    function renderCard(restaurant: Restaurant) {
        return <RestaurantCard restaurant={restaurant} />;
    }

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
                style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                ]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.filterChipText,
                        isActive && styles.filterChipTextActive,
                    ]}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        );
    }

    if (currentIndex >= MOCK_RESTAURANTS.length) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.endScreenContainer}>
                    <View style={styles.endIconContainer}>
                        <Ionicons
                            name="restaurant"
                            size={64}
                            color={AppColors.textDark}
                        />
                    </View>

                    <Text style={styles.endTitle}>All done for now!</Text>

                    <Text style={styles.endSubtitle}>
                        You've seen all available restaurants
                    </Text>

                    <TouchableOpacity
                        style={styles.startOverButton}
                        onPress={handleStartOver}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.startOverButtonText}>
                            Start Over
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    function OverlayLabelRight() {
        return (
            <View
                style={{
                    position: 'absolute',
                    right: 20,
                    top: 20,
                }}
            >
                <View
                    style={{
                        backgroundColor: AppColors.background,
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderWidth: 2,
                        borderColor: AppColors.background,
                    }}
                >
                    <Text
                        style={{
                            color: AppColors.white,
                            fontSize: 26,
                            fontWeight: 'bold',
                        }}
                    >
                        PASS
                    </Text>
                </View>
            </View>
        );
    }

    function OverlayLabelLeft() {
        return (
            <View
                style={{
                    position: 'absolute',
                    left: 20,
                    top: 20,
                }}
            >
                <View
                    style={{
                        backgroundColor: AppColors.primary,
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderWidth: 2,
                        borderColor: AppColors.primary,
                    }}
                >
                    <Text
                        style={{
                            color: AppColors.textDark,
                            fontSize: 26,
                            fontWeight: 'bold',
                        }}
                    >
                        LIKE
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                >
                    <FilterChip
                        label="$"
                        isActive={filters.price.includes('$')}
                        onPress={() => togglePriceFilter('$')}
                    />

                    <FilterChip
                        label="$$"
                        isActive={filters.price.includes('$$')}
                        onPress={() => togglePriceFilter('$$')}
                    />

                    <FilterChip
                        label="$$$"
                        isActive={filters.price.includes('$$$')}
                        onPress={() => togglePriceFilter('$$$')}
                    />

                    <FilterChip
                        label="< 1 mi"
                        isActive={filters.distance === '< 1 mi'}
                        onPress={() => toggleDistanceFilter('< 1 mi')}
                    />

                    <FilterChip
                        label="< 3 mi"
                        isActive={filters.distance === '< 3 mi'}
                        onPress={() => toggleDistanceFilter('< 3 mi')}
                    />

                    <FilterChip
                        label="< 5 mi"
                        isActive={filters.distance === '< 5 mi'}
                        onPress={() => toggleDistanceFilter('< 5 mi')}
                    />

                    <FilterChip
                        label="4.0+ ⭐"
                        isActive={filters.rating === '4.0+'}
                        onPress={() => toggleRatingFilter('4.0+')}
                    />
                    
                    <FilterChip
                        label="4.5+ ⭐"
                        isActive={filters.rating === '4.5+'}
                        onPress={() => toggleRatingFilter('4.5+')}
                    />
                </ScrollView>
            </View>
            <View style={styles.cardContainer}>
                <Swiper
                    ref={swiperRef}
                    data={MOCK_RESTAURANTS}
                    renderCard={renderCard}
                    onSwipeRight={handleSwipedRight}
                    onSwipeLeft={handleSwipedLeft}
                    onSwipedAll={handleSwipedAll}
                    onIndexChange={handleIndexChange}
                    cardStyle={{
                        width: width - 40,
                        height: height * 0.65,
                    }}
                    disableTopSwipe
                    disableBottomSwipe
                    translateXRange={[-width / 3, 0, width / 3]}
                    inputOverlayLabelRightOpacityRange={[0, width / 5, width / 3]}
                    outputOverlayLabelRightOpacityRange={[0, 0.5, 1]}
                    inputOverlayLabelLeftOpacityRange={[-width / 3, -width / 5, 0]}
                    outputOverlayLabelLeftOpacityRange={[1, 0.5, 0]}
                    // For some reason these are flipped
                    OverlayLabelLeft={OverlayLabelRight}
                    OverlayLabelRight={OverlayLabelLeft}

                    swipeVelocityThreshold={800}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.white,
    },
    filterContainer: {
        paddingVertical: Spacing.md,
        backgroundColor: AppColors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    filterScrollContent: {
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: AppColors.white,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        marginRight: Spacing.sm,
    },
    filterChipActive: {
        backgroundColor: AppColors.textDark,
        borderColor: AppColors.textDark,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.textDark,
    },
    filterChipTextActive: {
        color: AppColors.white,
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
        backgroundColor: AppColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    endTitle: {
        ...Typography.displayMedium,
        fontSize: 28,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    endSubtitle: {
        ...Typography.bodyLarge,
        color: AppColors.textLight,
        marginBottom: Spacing.xxl,
        textAlign: 'center',
    },
    startOverButton: {
        backgroundColor: AppColors.primary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xxxl,
        borderRadius: 30,
    },
    startOverButtonText: {
        ...Typography.button,
        color: AppColors.textDark,
    },
});

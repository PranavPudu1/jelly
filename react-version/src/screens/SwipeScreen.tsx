import { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Swiper, SwiperCardRefType } from 'rn-swiper-list';

import RestaurantCard from '../components/RestaurantCard';

import { AppColors, Typography, Spacing } from '../theme';
import { MOCK_RESTAURANTS } from '../data/mockRestaurants';
import type { Restaurant } from '../types';

const { width, height } = Dimensions.get('window');

export default function SwipeScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const swiperRef = useRef<SwiperCardRefType>(null);

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

    function handleNavTab0() {
        setActiveTab(0);
    }

    function handleNavTab1() {
        setActiveTab(1);
    }

    function renderCard(restaurant: Restaurant) {
        return <RestaurantCard restaurant={restaurant} />;
    }

    if (currentIndex >= MOCK_RESTAURANTS.length) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.endScreenContainer}>
                    <View style={styles.endIconContainer}>
                        <Ionicons
                            name="restaurant"
                            size={64}
                            color={AppColors.text}
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

                <View style={styles.bottomNav}>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={handleNavTab0}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="bookmark"
                            size={24}
                            color={
                                activeTab === 0
                                    ? AppColors.textDark
                                    : AppColors.accent
                            }
                        />
                        <Text
                            style={[
                                styles.navText,
                                activeTab === 0 && styles.navTextActive,
                            ]}
                        >
                            Saved Places
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={handleNavTab1}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="settings"
                            size={24}
                            color={
                                activeTab === 1
                                    ? AppColors.textDark
                                    : AppColors.accent
                            }
                        />
                        <Text
                            style={[
                                styles.navText,
                                activeTab === 1 && styles.navTextActive,
                            ]}
                        >
                            Settings
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    function OverlayLabelLeft() {
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
                        backgroundColor: AppColors.accent,
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderWidth: 2,
                        borderColor: AppColors.surfaceVariant,
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

    function OverlayLabelRight() {
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
                        height: height * 0.7,
                    }}
                    disableTopSwipe
                    disableBottomSwipe
                    translateXRange={[-width / 3, 0, width / 3]}
                    inputOverlayLabelRightOpacityRange={[0, width / 5, width / 3]}
                    outputOverlayLabelRightOpacityRange={[0, 0.5, 1]}
                    inputOverlayLabelLeftOpacityRange={[-width / 3, -width / 5, 0]}
                    outputOverlayLabelLeftOpacityRange={[1, 0.5, 0]}
                    OverlayLabelLeft={OverlayLabelLeft}
                    OverlayLabelRight={OverlayLabelRight}
                    swipeVelocityThreshold={800}
                />
            </View>

            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={handleNavTab0}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="bookmark"
                        size={24}
                        color={
                            activeTab === 0
                                ? AppColors.textDark
                                : AppColors.accent
                        }
                    />
                    <Text
                        style={[
                            styles.navText,
                            activeTab === 0 && styles.navTextActive,
                        ]}
                    >
                        Saved Places
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={handleNavTab1}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="settings"
                        size={24}
                        color={
                            activeTab === 1
                                ? AppColors.textDark
                                : AppColors.accent
                        }
                    />
                    <Text
                        style={[
                            styles.navText,
                            activeTab === 1 && styles.navTextActive,
                        ]}
                    >
                        Settings
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.background,
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
        backgroundColor: AppColors.surface,
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
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: AppColors.primary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        zIndex: 999,
        bottom: 0,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navText: {
        ...Typography.bodySmall,
        color: AppColors.accent,
        marginTop: 4,
        fontSize: 11,
    },
    navTextActive: {
        color: AppColors.textDark,
        fontWeight: '600',
    },
});

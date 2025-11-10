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

import Swiper from 'react-native-deck-swiper';

import RestaurantCard from '../components/RestaurantCard';

import { AppColors, Typography, Spacing } from '../theme';
import { MOCK_RESTAURANTS } from '../data/mockRestaurants';

const { width, height } = Dimensions.get('window');

export default function SwipeScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const swiperRef = useRef<Swiper<any>>(null);

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
                        onPress={() => setActiveTab(0)}
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
                        onPress={() => setActiveTab(1)}
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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.cardContainer}>
                <Swiper
                    ref={swiperRef}
                    cards={MOCK_RESTAURANTS}
                    renderCard={(restaurant) => (
                        <RestaurantCard restaurant={restaurant} />
                    )}
                    onSwipedRight={handleSwipedRight}
                    onSwipedLeft={handleSwipedLeft}
                    onSwipedAll={handleSwipedAll}
                    onSwiped={(cardIndex) => setCurrentIndex(cardIndex + 1)}
                    cardIndex={currentIndex}
                    backgroundColor="transparent"
                    stackSize={2}
                    stackScale={10}
                    stackSeparation={14}
                    animateCardOpacity
                    verticalSwipe={false}
                    useViewOverflow={false}
                    disableBottomSwipe
                    disableTopSwipe
                    swipeBackCard={false}
                    cardVerticalMargin={0}
                    cardHorizontalMargin={0}
                    marginTop={0}
                    marginBottom={0}
                    // ↓↓↓ Make swipe less sensitive ↓↓↓
                    horizontalThreshold={width * 0.35} // larger threshold before triggering a swipe
                    verticalThreshold={height * 0.25} // more buffer vertically
                    swipeAnimationDuration={280} // slower, smoother swipe animation
                    // ↓↓↓ Overlay label smoothing ↓↓↓
                    animateOverlayLabelsOpacity
                    inputOverlayLabelsOpacityRangeX={[
                        -width / 3,
                        -width / 5,
                        0,
                        width / 5,
                        width / 3,
                    ]}
                    outputOverlayLabelsOpacityRangeX={[1, 0.5, 0, 0.5, 1]}
                    overlayLabels={{
                        left: {
                            title: 'PASS',
                            style: {
                                label: {
                                    backgroundColor: AppColors.accent,
                                    color: AppColors.white,
                                    fontSize: 26,
                                    fontWeight: 'bold',
                                    borderRadius: 12,
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderWidth: 2,
                                    borderColor: AppColors.surfaceVariant,
                                    opacity: 0.9, // subtle transparency for smoothness
                                    transform: [{ scale: 1.05 }],
                                },
                                wrapper: {
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    justifyContent: 'flex-start',
                                    marginTop: 20,
                                    marginLeft: -20,
                                },
                            },
                        },
                        right: {
                            title: 'LIKE',
                            style: {
                                label: {
                                    backgroundColor: AppColors.primary,
                                    color: AppColors.textDark,
                                    fontSize: 26,
                                    fontWeight: 'bold',
                                    borderRadius: 12,
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderWidth: 2,
                                    borderColor: AppColors.primary,
                                    opacity: 0.9,
                                    transform: [{ scale: 1.05 }],
                                },
                                wrapper: {
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    marginTop: 20,
                                    marginLeft: 20,
                                },
                            },
                        },
                    }}
                    // ↓↓↓ Define larger scroll-safe middle zone ↓↓↓
                    // Optionally, you can intercept touch gestures in your parent ScrollView or
                    // use gestureHandlerRootHOC to balance between scrolling and swiping.
                    // The higher thresholds above already help reduce unwanted swipes.
                    preventSwipeDirectionThreshold={0.3} // (custom prop simulation)
                    // swipeAnimationDuration={250}
                />
            </View>

            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => setActiveTab(0)}
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
                    onPress={() => setActiveTab(1)}
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

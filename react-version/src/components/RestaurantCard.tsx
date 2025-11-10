import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Restaurant } from '../types';
import { AppColors, Typography, Spacing, BorderRadius } from '../theme';
import ReelModal from './ReelModal';
import MenuModal from './MenuModal';

const { width, height } = Dimensions.get('window');
const NAVIGATION_BAR_HEIGHT = 80; // Approximate height of navigation bar
const CARD_HEIGHT = height - NAVIGATION_BAR_HEIGHT;

interface RestaurantCardProps {
    restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
    const [heroReelVisible, setHeroReelVisible] = useState(false);
    const [foodReelVisible, setFoodReelVisible] = useState(false);
    const [ambianceModalVisible, setAmbianceModalVisible] = useState(false);
    const [menuModalVisible, setMenuModalVisible] = useState(false);
    const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);
    const [currentReelPhotos, setCurrentReelPhotos] = useState<
        Array<{ imageUrl: string; review?: any }>
    >([]);
    const scrollViewRef = React.useRef<ScrollView>(null);

    function renderStars(rating: number) {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name="star"
                    size={14}
                    color={AppColors.primary}
                />,
            );
        }
        if (hasHalfStar) {
            stars.push(
                <Ionicons
                    key="half"
                    name="star-half"
                    size={14}
                    color={AppColors.primary}
                />,
            );
        }

        for (let i = stars.length; i < 5; i++) {
            stars.push(
                <Ionicons
                    key={`empty-${i}`}
                    name="star-outline"
                    size={14}
                    color={AppColors.primary}
                />,
            );
        }
        return stars;
    }

    function getIconName(iconLabel: string): any {
        const iconMap: { [key: string]: any } = {
            location: 'location',
            glass: 'wine',
            'musical-notes': 'musical-notes',
            happy: 'happy',
        };
        return iconMap[iconLabel] || 'information-circle';
    }

    function getInitial(name: string) {
        return name.charAt(0).toUpperCase();
    }

    function getAvatarColor(index: number) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
        return colors[index % colors.length];
    }

    function handleTouchStart(event: GestureResponderEvent) {
        touchStart.x = event.nativeEvent.pageX;
        touchStart.y = event.nativeEvent.pageY;
        touchStart.time = Date.now();
        hasScrolled.current = false;

        // Always ensure scroll is enabled when starting a new touch
        if (!scrollEnabled) {
            setScrollEnabled(true);
        }
    }

    function handleTouchMove(event: GestureResponderEvent) {
        const currentX = event.nativeEvent.pageX;
        const currentY = event.nativeEvent.pageY;

        const deltaX = Math.abs(currentX - touchStart.x);
        const deltaY = Math.abs(currentY - touchStart.y);

        // Extremely sensitive to vertical movement - even 1px locks to scroll
        if (deltaY > 1) {
            hasScrolled.current = true;
            if (!scrollEnabled) {
                setScrollEnabled(true);
            }
            return;
        }

        // Only disable scroll if PURELY horizontal movement
        // Requires 50px horizontal AND absolutely zero vertical movement
        if (!hasScrolled.current && deltaX > 50 && deltaY === 0) {
            if (scrollEnabled) {
                setScrollEnabled(false);
            }
        }
    }

    function handleTouchEnd() {
        // Immediately re-enable scroll when touch ends
        hasScrolled.current = false;
        if (!scrollEnabled) {
            setScrollEnabled(true);
        }
    }

    return (
        <View
            style={styles.card}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                bounces={true}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
                directionalLockEnabled={true}
                scrollEnabled={scrollEnabled}
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.headerInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.restaurantName}>
                                {restaurant.name}
                            </Text>

                            <View style={styles.dotSeparator}>
                                <Text style={styles.separatorDot}>•</Text>
                            </View>

                            <Text style={styles.priceLevel}>
                                {restaurant.priceLevel}
                            </Text>

                            <View style={styles.dotSeparator}>
                                <Text style={styles.separatorDot}>•</Text>
                            </View>

                            <View style={styles.ratingRow}>
                                {renderStars(restaurant.rating)}
                            </View>
                        </View>

                        <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
                    </View>

                    {/* Hero Image Reel Modal */}
                    <ReelModal
                        visible={heroReelVisible}
                        onClose={() => setHeroReelVisible(false)}
                        photos={[{ imageUrl: restaurant.heroImageUrl }]}
                        allReviews={restaurant.reviews}
                        initialPhotoIndex={0}
                        tooltipText="Hero image"
                    />

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                            setHeroReelVisible(true);
                        }}
                    >
                        <Image
                            source={{ uri: restaurant.heroImageUrl }}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>

                    {/* Info Table */}
                    <View style={styles.infoTable}>
                        {restaurant.infoList.map((info, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.infoRow,
                                    index !== restaurant.infoList.length - 1 &&
                                        styles.infoRowBorder,
                                ]}
                            >
                                <View style={styles.infoLeft}>
                                    <Ionicons
                                        name={getIconName(info.icon || '')}
                                        size={16}
                                        color={AppColors.textDark}
                                    />

                                    <Text style={styles.infoLabel}>
                                        {info.label}
                                    </Text>
                                </View>

                                <Text style={styles.infoValue}>
                                    {info.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Ambiance Section */}
                <View style={styles.ambianceContainer}>
                    <Text style={styles.ambianceLabel}>Ambiance</Text>

                    <TouchableOpacity
                        style={styles.ambienceSection}
                        onPress={() => {
                            setAmbianceModalVisible(true);
                        }}
                        activeOpacity={0.9}
                    >
                        <Image
                            source={{ uri: restaurant.ambientImageUrl }}
                            style={styles.ambienceImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.gradient}
                        >
                            <Text style={styles.quoteText}>
                                "{restaurant.reviewQuote}"
                            </Text>
                            <Text style={styles.quoteAuthor}>
                                - {restaurant.reviewAuthor}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Ambiance Reel Modal */}
                <ReelModal
                    visible={ambianceModalVisible}
                    onClose={() => setAmbianceModalVisible(false)}
                    photos={restaurant.ambiencePhotos}
                    allReviews={restaurant.reviews}
                    initialPhotoIndex={0}
                    tooltipText="Scroll for more ambiance pictures"
                />

                {/* Food Reviews Section */}
                <View style={styles.reviewsSection}>
                    <Text style={styles.sectionTitle}>
                        Here's what people are saying online
                    </Text>

                    {/* Social Handles */}
                    <View style={styles.socialHandles}>
                        {restaurant.instagramHandle && (
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons
                                    name="logo-instagram"
                                    size={16}
                                    color={AppColors.instagram}
                                />
                                <Text
                                    style={[
                                        styles.socialText,
                                        { color: AppColors.instagram },
                                    ]}
                                >
                                    {restaurant.instagramHandle}
                                </Text>
                            </TouchableOpacity>
                        )}
                        {restaurant.tiktokHandle && (
                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    styles.tiktokButton,
                                ]}
                            >
                                <Ionicons
                                    name="logo-tiktok"
                                    size={16}
                                    color={AppColors.textDark}
                                />
                                <Text style={styles.socialText}>
                                    {restaurant.tiktokHandle}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Food Items - Show first 3 */}
                    {restaurant.foodItems.slice(0, 3).map((foodItem, index) => {
                        const isEven = index % 2 === 0;
                        return (
                            <View
                                key={index}
                                style={[
                                    styles.foodItemRow,
                                    isEven
                                        ? styles.foodItemRowEven
                                        : styles.foodItemRowOdd,
                                ]}
                            >
                                {isEven && (
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => {
                                            setCurrentReelPhotos(
                                                foodItem.images.map((img, imgIndex) => ({
                                                    imageUrl: img,
                                                    review: foodItem.reviews[imgIndex] || foodItem.reviews[0],
                                                })),
                                            );
                                            setInitialPhotoIndex(0);
                                            setFoodReelVisible(true);
                                        }}
                                    >
                                        <Image
                                            source={{ uri: foodItem.images[0] }}
                                            style={styles.foodImage}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                )}
                                <View style={styles.foodReview}>
                                    {foodItem.reviews[0] && (
                                        <>
                                            <View style={styles.reviewHeader}>
                                                <View
                                                    style={[
                                                        styles.avatar,
                                                        {
                                                            backgroundColor:
                                                                getAvatarColor(
                                                                    index,
                                                                ),
                                                        },
                                                    ]}
                                                >
                                                    <Text
                                                        style={
                                                            styles.avatarText
                                                        }
                                                    >
                                                        {getInitial(
                                                            foodItem.reviews[0]
                                                                .author,
                                                        )}
                                                    </Text>
                                                </View>
                                                <View style={styles.reviewInfo}>
                                                    <Text
                                                        style={
                                                            styles.reviewAuthor
                                                        }
                                                    >
                                                        {
                                                            foodItem.reviews[0]
                                                                .author
                                                        }
                                                    </Text>
                                                    <View
                                                        style={
                                                            styles.reviewStars
                                                        }
                                                    >
                                                        {[
                                                            ...Array(
                                                                Math.floor(
                                                                    foodItem
                                                                        .reviews[0]
                                                                        .rating,
                                                                ),
                                                            ),
                                                        ].map((_, i) => (
                                                            <Ionicons
                                                                key={i}
                                                                name="star"
                                                                size={11}
                                                                color={
                                                                    AppColors.starOrange
                                                                }
                                                            />
                                                        ))}
                                                    </View>
                                                </View>
                                            </View>
                                            <Text
                                                style={styles.reviewQuote}
                                                numberOfLines={4}
                                            >
                                                "{foodItem.reviews[0].quote}"
                                            </Text>
                                        </>
                                    )}
                                </View>
                                {!isEven && (
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => {
                                            setCurrentReelPhotos(
                                                foodItem.images.map((img, imgIndex) => ({
                                                    imageUrl: img,
                                                    review: foodItem.reviews[imgIndex] || foodItem.reviews[0],
                                                })),
                                            );
                                            setInitialPhotoIndex(0);
                                            setFoodReelVisible(true);
                                        }}
                                    >
                                        <Image
                                            source={{ uri: foodItem.images[0] }}
                                            style={styles.foodImage}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}

                    {/* View All Items and Menu Button */}
                    <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={() => setMenuModalVisible(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.viewAllButtonText}>
                            View All Items and Menu
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={AppColors.textDark}
                        />
                    </TouchableOpacity>
                </View>

                {/* Reservation Section */}
                <View style={styles.reservationSection}>
                    <Text style={styles.reservationTitle}>
                        Make your reservation now
                    </Text>
                    <View style={styles.reservationButtons}>
                        <TouchableOpacity
                            style={styles.reservationButton}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="restaurant"
                                size={32}
                                color="#DA3743"
                            />
                            <Text style={styles.reservationButtonText}>
                                OpenTable
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.reservationButton}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="logo-yelp"
                                size={32}
                                color="#D32323"
                            />
                            <Text style={styles.reservationButtonText}>
                                Yelp
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Food Reel Modal */}
                <ReelModal
                    visible={foodReelVisible}
                    onClose={() => setFoodReelVisible(false)}
                    photos={currentReelPhotos}
                    allReviews={restaurant.reviews}
                    initialPhotoIndex={initialPhotoIndex}
                    tooltipText="Scroll for more food pictures"
                />

                {/* Menu Modal */}
                <MenuModal
                    visible={menuModalVisible}
                    onClose={() => setMenuModalVisible(false)}
                    foodItems={restaurant.foodItems}
                    menuImages={restaurant.menuImages}
                    onPhotoPress={(photos, index) => {
                        setCurrentReelPhotos(photos.map((img) => ({ imageUrl: img })));
                        setInitialPhotoIndex(index);
                        setFoodReelVisible(true);
                    }}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: width,
        height: CARD_HEIGHT,
        backgroundColor: AppColors.background,
        borderRadius: 0,
        overflow: 'hidden',
        marginHorizontal: 0,
    },
    scrollView: {
        flex: 1,
    },

    // Hero Section
    heroSection: {
        // backgroundColor: AppColors.primary,
        paddingBottom: Spacing.md,
    },
    headerInfo: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    restaurantName: {
        ...Typography.titleLarge,
        fontSize: 24,
        fontWeight: '700',
        color: AppColors.primary,
        flexShrink: 1,
    },
    dotSeparator: {
        paddingHorizontal: 8,
    },
    separatorDot: {
        fontSize: 16,
        color: AppColors.accent,
        lineHeight: 24,
    },
    priceLevel: {
        ...Typography.bodyMedium,
        fontSize: 16,
        color: AppColors.textLight,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cuisine: {
        ...Typography.bodySmall,
        color: AppColors.accent,
    },
    heroImage: {
        width: '100%',
        height: height * 0.4,
        backgroundColor: AppColors.surface,
    },
    infoTable: {
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        paddingVertical: Spacing.xs,
        backgroundColor: AppColors.primary,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    infoRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoLabel: {
        ...Typography.bodySmall,
        color: AppColors.textDark,
        marginLeft: Spacing.xs,
        fontSize: 11,
    },
    infoValue: {
        ...Typography.bodySmall,
        color: AppColors.textDark,
        fontWeight: '600',
        fontSize: 11,
    },

    // Ambiance Section
    ambianceContainer: {
        marginTop: Spacing.lg,
    },
    ambianceLabel: {
        ...Typography.bodyMedium,
        color: AppColors.textLight,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    ambienceSection: {
        marginHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        height: 400,
    },
    ambienceImage: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.md,
        justifyContent: 'flex-end',
    },
    quoteText: {
        ...Typography.bodyLarge,
        color: AppColors.white,
        fontStyle: 'italic',
        marginBottom: Spacing.xs,
    },
    quoteAuthor: {
        ...Typography.bodyMedium,
        color: AppColors.white,
    },

    // Reviews Section
    reviewsSection: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.xl,
    },
    sectionTitle: {
        ...Typography.bodyMedium,
        color: AppColors.textLight,
        marginBottom: Spacing.md,
    },
    socialHandles: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderRadius: BorderRadius.sm,
        backgroundColor: 'rgba(228, 64, 95, 0.1)',
        gap: 6,
    },
    tiktokButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    socialText: {
        ...Typography.bodySmall,
        fontSize: 11,
        fontWeight: '600',
        color: AppColors.textDark,
    },
    foodItemRow: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
        gap: Spacing.md,
    },
    foodItemRowEven: {
        flexDirection: 'row',
    },
    foodItemRowOdd: {
        flexDirection: 'row-reverse',
    },
    foodImage: {
        width: 160,
        height: 160,
        borderRadius: BorderRadius.sm,
        backgroundColor: AppColors.surface,
    },
    foodReview: {
        flex: 1,
        justifyContent: 'center',
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.xs,
    },
    avatarText: {
        color: AppColors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    reviewInfo: {
        flex: 1,
    },
    reviewAuthor: {
        ...Typography.bodySmall,
        fontSize: 11,
        fontWeight: '600',
        color: AppColors.text,
    },
    reviewStars: {
        flexDirection: 'row',
        marginTop: 2,
    },
    reviewQuote: {
        ...Typography.bodySmall,
        fontSize: 11,
        color: AppColors.textLight,
        lineHeight: 16,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.lg,
        borderWidth: 2,
        borderColor: AppColors.primary,
        borderRadius: BorderRadius.md,
        backgroundColor: AppColors.white,
        gap: Spacing.xs,
    },
    viewAllButtonText: {
        ...Typography.bodyMedium,
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.textDark,
    },

    // Reservation Section
    reservationSection: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xxl,
        alignItems: 'center',
    },
    reservationTitle: {
        ...Typography.titleLarge,
        fontSize: 28,
        fontWeight: '700',
        color: AppColors.textDark,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    reservationButtons: {
        flexDirection: 'row',
        gap: Spacing.lg,
        justifyContent: 'center',
    },
    reservationButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.md,
        backgroundColor: AppColors.surface,
        minWidth: 140,
        gap: Spacing.sm,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reservationButtonText: {
        ...Typography.bodyMedium,
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.textDark,
    },
});

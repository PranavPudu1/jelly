import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Restaurant } from '../types';
import { AppColors, Typography, Spacing, BorderRadius } from '../theme';
import PhotoModal from './PhotoModal';

const { width, height } = Dimensions.get('window');
const NAVIGATION_BAR_HEIGHT = 80; // Approximate height of navigation bar
const CARD_HEIGHT = height - NAVIGATION_BAR_HEIGHT;

interface RestaurantCardProps {
    restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);
    const [currentPhotos, setCurrentPhotos] = useState<
        Array<{ imageUrl: string }>
    >([]);

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

    return (
        <View style={styles.card}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                bounces={true}
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

                    {/* Fullscreen Photo Modal */}
                    <PhotoModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        photos={currentPhotos}
                        reviews={restaurant.reviews}
                        initialPhotoIndex={initialPhotoIndex}
                    />

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                            setCurrentPhotos([
                                { imageUrl: restaurant.heroImageUrl },
                            ]);
                            setInitialPhotoIndex(0);
                            setModalVisible(true);
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

                {/* Ambience Section */}
                <TouchableOpacity
                    style={styles.ambienceSection}
                    onPress={() => {
                        setCurrentPhotos(restaurant.ambiencePhotos);
                        setInitialPhotoIndex(0);
                        setModalVisible(true);
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

                    {/* Food Items */}
                    {restaurant.foodItems.map((foodItem, index) => {
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
                                            setCurrentPhotos(
                                                foodItem.images.map((img) => ({
                                                    imageUrl: img,
                                                })),
                                            );
                                            setInitialPhotoIndex(0);
                                            setModalVisible(true);
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
                                            setCurrentPhotos(
                                                foodItem.images.map((img) => ({
                                                    imageUrl: img,
                                                })),
                                            );
                                            setInitialPhotoIndex(0);
                                            setModalVisible(true);
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
                </View>

                {/* Menu & Popular Dishes Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.menuTitle}>
                        Here's the menu and popular pics
                    </Text>

                    {/* Menu Images */}
                    {restaurant.menuImages.length > 0 && (
                        <>
                            <Text style={styles.subsectionTitle}>Menu</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.horizontalScroll}
                                bounces={true}
                            >
                                {restaurant.menuImages.map((image, index) => (
                                    <Image
                                        key={index}
                                        source={{ uri: image }}
                                        style={styles.menuImage}
                                        resizeMode="cover"
                                    />
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {/* Popular Dishes */}
                    {restaurant.popularDishPhotos.length > 0 && (
                        <>
                            <Text style={styles.subsectionTitle}>
                                Popular Dishes
                            </Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.horizontalScroll}
                                bounces={true}
                            >
                                {restaurant.popularDishPhotos.map(
                                    (photo, index) => (
                                        <Image
                                            key={index}
                                            source={{ uri: photo }}
                                            style={styles.popularDishImage}
                                            resizeMode="cover"
                                        />
                                    ),
                                )}
                            </ScrollView>
                        </>
                    )}
                </View>
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

    // Ambience Section
    ambienceSection: {
        marginTop: Spacing.md,
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

    // Menu Section
    menuSection: {
        paddingVertical: Spacing.xl,
    },
    menuTitle: {
        ...Typography.titleMedium,
        fontWeight: 'bold',
        color: AppColors.text,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    subsectionTitle: {
        ...Typography.bodyMedium,
        fontWeight: '600',
        color: AppColors.textLight,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
        marginTop: Spacing.md,
    },
    horizontalScroll: {
        paddingLeft: Spacing.md,
    },
    menuImage: {
        width: 260,
        height: 360,
        borderRadius: BorderRadius.md,
        marginRight: Spacing.sm,
        backgroundColor: AppColors.surface,
    },
    popularDishImage: {
        width: 320,
        height: 240,
        borderRadius: BorderRadius.md,
        marginRight: Spacing.sm,
        backgroundColor: AppColors.surface,
    },
});

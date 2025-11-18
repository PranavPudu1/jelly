import { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import ReelModal from './ReelModal';
import MenuModal from './MenuModal';
import DelightfulButton from './DelightfulButton';

import {
    AppColors,
    Typography,
    Spacing,
    BorderRadius,
    Shadows,
    Gradients,
    SpringConfig,
    AnimationScale,
} from '../theme';

import { Restaurant } from '../types';
import { useLocation } from '../contexts/LocationContext';
import { calculateDistance, formatDistance, openInMaps } from '../utils/location';

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

    const scrollViewRef = useRef<ScrollView>(null);
    const { userLocation } = useLocation();

    // Calculate distance if both user location and restaurant location are available
    const distance =
        userLocation && restaurant.lat && restaurant.long
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                restaurant.lat,
                restaurant.long,
            )
            : null;

    function handleLocationPress() {
        if (restaurant.lat && restaurant.long) {
            openInMaps(restaurant.lat, restaurant.long, restaurant.name);
        }
    }

    // Animation values for image interactions (DelightfulButton handles button animations)
    const heroImageScale = useRef(new Animated.Value(1)).current;
    const ambianceScale = useRef(new Animated.Value(1)).current;

    // Delightful animation helpers for images
    function animatePressIn(scale: Animated.Value) {
        Animated.spring(scale, {
            toValue: AnimationScale.press,
            ...SpringConfig.gentle,
        }).start();
    }

    function animatePressOut(scale: Animated.Value) {
        Animated.spring(scale, {
            toValue: 1,
            ...SpringConfig.playful,
        }).start();
    }

    function renderStars(rating: number) {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        const starSize = 18;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Ionicons
                    key={ i }
                    name="star"
                    size={ starSize }
                    color={ AppColors.secondary }
                />,
            );
        }

        if (hasHalfStar)
            stars.push(
                <Ionicons
                    key="half"
                    name="star-half"
                    size={ starSize }
                    color={ AppColors.secondary }
                />,
            );

        for (let i = stars.length; i < 5; i++) {
            stars.push(
                <Ionicons
                    key={ `empty-${i}` }
                    name="star-outline"
                    size={ starSize }
                    color={ AppColors.secondary }
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
        <View style={ styles.card }>
            { /* Sticky Header */ }
            <View style={ styles.stickyHeader }>
                <View style={ styles.nameRow }>
                    <View style={ styles.nameContainer }>
                        <Text style={ styles.restaurantName } numberOfLines={ 1 }>
                            { restaurant.name }
                        </Text>

                        <View style={ styles.dotSeparator }>
                            <Text style={ styles.separatorDot }>•</Text>
                        </View>

                        <Text style={ styles.priceLevel }>
                            { restaurant.priceLevel }
                        </Text>
                    </View>

                    <View style={ styles.ratingRow }>
                        { renderStars(restaurant.rating) }
                    </View>
                </View>

                <Text style={ styles.cuisine }>{ restaurant.cuisine }</Text>
            </View>

            <ScrollView
                ref={ scrollViewRef }
                style={ styles.scrollView }
                showsVerticalScrollIndicator={ false }
                bounces={ true }
                scrollEventThrottle={ 16 }
                waitFor={ undefined }
            >
                { /* Hero Section */ }
                <View style={ styles.heroSection }>
                    { /* Hero Image Reel Modal */ }
                    <ReelModal
                        visible={ heroReelVisible }
                        onClose={ () => setHeroReelVisible(false) }
                        photos={ [{ imageUrl: restaurant.heroImageUrl }] }
                        allReviews={ restaurant.reviews }
                        initialPhotoIndex={ 0 }
                        tooltipText="Hero image"
                    />

                    <Animated.View
                        style={ { transform: [{ scale: heroImageScale }] } }
                    >
                        <TouchableOpacity
                            activeOpacity={ 0.9 }
                            onPressIn={ () => animatePressIn(heroImageScale) }
                            onPressOut={ () => animatePressOut(heroImageScale) }
                            onPress={ () => {
                                setHeroReelVisible(true);
                            } }
                        >
                            <Image
                                source={ { uri: restaurant.heroImageUrl } }
                                style={ styles.heroImage }
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    </Animated.View>

                    { /* Info Table */ }
                    <View style={ styles.infoTable }>
                        { restaurant.infoList.map((info, index) => {
                            const isLocation = info.icon === 'location';
                            const displayValue = isLocation && distance
                                ? formatDistance(distance)
                                : info.value;

                            const InfoContent = (
                                <View
                                    style={ [
                                        styles.infoCell,
                                        index >= 2 && styles.infoCellBottomRow,
                                    ] }
                                >
                                    <Ionicons
                                        name={ getIconName(info.icon || '') }
                                        size={ 16 }
                                        color={ isLocation ? AppColors.primary : AppColors.textDark }
                                    />

                                    <Text style={ [
                                        styles.infoValue,
                                        isLocation && styles.locationText,
                                    ] }>
                                        { displayValue }
                                    </Text>
                                </View>
                            );

                            return isLocation ? (
                                <TouchableOpacity
                                    key={ index }
                                    onPress={ handleLocationPress }
                                    activeOpacity={ 0.7 }
                                >
                                    { InfoContent }
                                </TouchableOpacity>
                            ) : (
                                <View key={ index }>{ InfoContent }</View>
                            );
                        }) }
                    </View>
                </View>

                { /* Ambiance Section */ }
                <View style={ styles.ambianceContainer }>
                    <Text style={ styles.ambianceLabel }>Ambiance</Text>

                    <Animated.View
                        style={ { transform: [{ scale: ambianceScale }] } }
                    >
                        <TouchableOpacity
                            style={ styles.ambienceSection }
                            onPressIn={ () => animatePressIn(ambianceScale) }
                            onPressOut={ () => animatePressOut(ambianceScale) }
                            onPress={ () => {
                                setAmbianceModalVisible(true);
                            } }
                            activeOpacity={ 0.9 }
                        >
                            <Image
                                source={ { uri: restaurant.ambientImageUrl } }
                                style={ styles.ambienceImage }
                                resizeMode="cover"
                            />

                            <LinearGradient
                                colors={ Gradients.translucentOverlay.colors }
                                start={ Gradients.translucentOverlay.start }
                                end={ Gradients.translucentOverlay.end }
                                style={ styles.gradient }
                            >
                                <Text style={ styles.quoteText }>
                                    "{ restaurant.reviewQuote }"
                                </Text>

                                <Text style={ styles.quoteAuthor }>
                                    - { restaurant.reviewAuthor }
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                { /* Ambiance Reel Modal */ }
                <ReelModal
                    visible={ ambianceModalVisible }
                    onClose={ () => setAmbianceModalVisible(false) }
                    photos={ restaurant.ambiencePhotos }
                    allReviews={ restaurant.reviews }
                    initialPhotoIndex={ 0 }
                    tooltipText="Scroll for more ambiance pictures"
                />

                { /* Food Reviews Section */ }
                <View style={ styles.reviewsSection }>
                    <Text style={ styles.sectionTitle }>
                        What people are loving!
                    </Text>

                    { /* Social Handles */ }
                    <View style={ styles.socialHandles }>
                        { restaurant.instagramHandle && (
                            <TouchableOpacity style={ styles.socialButton }>
                                <Ionicons
                                    name="logo-instagram"
                                    size={ 16 }
                                    color={ AppColors.instagram }
                                />

                                <Text
                                    style={ [
                                        styles.socialText,
                                        { color: AppColors.instagram },
                                    ] }
                                >
                                    { restaurant.instagramHandle }
                                </Text>
                            </TouchableOpacity>
                        ) }
                        { restaurant.tiktokHandle && (
                            <TouchableOpacity
                                style={ [
                                    styles.socialButton,
                                    styles.tiktokButton,
                                ] }
                            >
                                <Ionicons
                                    name="logo-tiktok"
                                    size={ 16 }
                                    color={ AppColors.textDark }
                                />

                                <Text style={ styles.socialText }>
                                    { restaurant.tiktokHandle }
                                </Text>
                            </TouchableOpacity>
                        ) }
                    </View>

                    { /* Food Items - Show first 3 */ }
                    { restaurant.foodItems.slice(0, 3).map((foodItem, index) => {
                        const isEven = index % 2 === 0;

                        return (
                            <View
                                key={ index }
                                style={ [
                                    styles.foodItemRow,
                                    isEven
                                        ? styles.foodItemRowEven
                                        : styles.foodItemRowOdd,
                                ] }
                            >
                                { isEven && (
                                    <TouchableOpacity
                                        activeOpacity={ 0.9 }
                                        onPress={ () => {
                                            setCurrentReelPhotos(
                                                foodItem.images.map(
                                                    (img, imgIndex) => ({
                                                        imageUrl: img,
                                                        review:
                                                            foodItem.reviews[
                                                                imgIndex
                                                            ] ||
                                                            foodItem.reviews[0],
                                                    }),
                                                ),
                                            );
                                            setInitialPhotoIndex(0);
                                            setFoodReelVisible(true);
                                        } }
                                    >
                                        <Image
                                            source={ { uri: foodItem.images[0] } }
                                            style={ styles.foodImage }
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                ) }
                                <View style={ styles.foodReview }>
                                    { foodItem.reviews[0] && (
                                        <>
                                            <View style={ styles.reviewHeader }>
                                                <View
                                                    style={ [
                                                        styles.avatar,
                                                        {
                                                            backgroundColor:
                                                                getAvatarColor(
                                                                    index,
                                                                ),
                                                        },
                                                    ] }
                                                >
                                                    <Text
                                                        style={
                                                            styles.avatarText
                                                        }
                                                    >
                                                        { getInitial(
                                                            foodItem.reviews[0]
                                                                .author,
                                                        ) }
                                                    </Text>
                                                </View>

                                                <View style={ styles.reviewInfo }>
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
                                                        { [
                                                            ...Array(
                                                                Math.floor(
                                                                    foodItem
                                                                        .reviews[0]
                                                                        .rating,
                                                                ),
                                                            ),
                                                        ].map((_, i) => (
                                                            <Ionicons
                                                                key={ i }
                                                                name="star"
                                                                size={ 11 }
                                                                color={
                                                                    AppColors.starOrange
                                                                }
                                                            />
                                                        )) }
                                                    </View>
                                                </View>
                                            </View>

                                            <Text
                                                style={ styles.reviewQuote }
                                                numberOfLines={ 4 }
                                            >
                                                "{ foodItem.reviews[0].quote }"
                                            </Text>
                                        </>
                                    ) }
                                </View>

                                { !isEven && (
                                    <TouchableOpacity
                                        activeOpacity={ 0.9 }
                                        onPress={ () => {
                                            setCurrentReelPhotos(
                                                foodItem.images.map(
                                                    (img, imgIndex) => ({
                                                        imageUrl: img,
                                                        review:
                                                            foodItem.reviews[
                                                                imgIndex
                                                            ] ||
                                                            foodItem.reviews[0],
                                                    }),
                                                ),
                                            );
                                            setInitialPhotoIndex(0);
                                            setFoodReelVisible(true);
                                        } }
                                    >
                                        <Image
                                            source={ { uri: foodItem.images[0] } }
                                            style={ styles.foodImage }
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                ) }
                            </View>
                        );
                    }) }

                    { /* View All Items and Menu Button */ }
                    <View style={ styles.viewAllButtonContainer }>
                        <DelightfulButton
                            title="View Full Menu & More ›"
                            onPress={ () => setMenuModalVisible(true) }
                            variant="primary"
                            size="large"
                        />
                    </View>
                </View>

                { /* Reservation Section */ }
                <View style={ styles.reservationSection }>
                    <Text style={ styles.reservationTitle }>
                        Ready to go? Book your table!
                    </Text>

                    <View style={ styles.reservationButtons }>
                        <View style={ styles.reservationButtonWrapper }>
                            <Ionicons
                                name="restaurant"
                                size={ 32 }
                                color="#DA3743"
                                style={ styles.reservationIcon }
                            />

                            <DelightfulButton
                                title="OpenTable"
                                onPress={ () => {
                                    // TODO: Open OpenTable reservation
                                } }
                                variant="primary"
                                size="medium"
                            />
                        </View>

                        <View style={ styles.reservationButtonWrapper }>
                            <Ionicons
                                name="star"
                                size={ 32 }
                                color="#D32323"
                                style={ styles.reservationIcon }
                            />

                            <DelightfulButton
                                title="Yelp"
                                onPress={ () => {
                                    // TODO: Open Yelp reservation
                                } }
                                variant="primary"
                                size="medium"
                            />
                        </View>
                    </View>
                </View>

                { /* Food Reel Modal */ }
                <ReelModal
                    visible={ foodReelVisible }
                    onClose={ () => setFoodReelVisible(false) }
                    photos={ currentReelPhotos }
                    allReviews={ restaurant.reviews }
                    initialPhotoIndex={ initialPhotoIndex }
                    tooltipText="Scroll for more food pictures"
                />

                { /* Menu Modal */ }
                <MenuModal
                    visible={ menuModalVisible }
                    onClose={ () => setMenuModalVisible(false) }
                    foodItems={ restaurant.foodItems }
                    menuImages={ restaurant.menuImages }
                    onPhotoPress={ (photos, index) => {
                        setCurrentReelPhotos(
                            photos.map((img) => ({ imageUrl: img })),
                        );
                        setInitialPhotoIndex(index);
                        setMenuModalVisible(false); // Close menu modal first
                        // Small delay to ensure smooth transition
                        setTimeout(() => {
                            setFoodReelVisible(true);
                        }, 300);
                    } }
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: width - 16,
        height: CARD_HEIGHT,
        backgroundColor: AppColors.white,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        marginHorizontal: 8,
        paddingTop: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        ...Shadows.soft,
        zIndex: 9999,
        marginTop: 8,
    },
    stickyHeader: {
        backgroundColor: AppColors.white,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 10,
    },
    scrollView: {
        flex: 1,
    },

    // Hero Section
    heroSection: {},
    headerInfo: {
        paddingBottom: Spacing.sm,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    nameContainer: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
        flex: 1,
    },
    restaurantName: {
        ...Typography.titleLarge,
        fontSize: 24,
        fontWeight: '700',
        color: AppColors.textDark,
        flexShrink: 1,
        maxWidth: '70%',
    },
    dotSeparator: {
        paddingHorizontal: 8,
    },
    separatorDot: {
        fontSize: 16,
        color: AppColors.textLight,
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
        color: AppColors.textLight,
    },
    heroImage: {
        width: '100%',
        height: height * 0.4,
        backgroundColor: '#f0f0f0',
        borderRadius: BorderRadius.md,
    },
    infoTable: {
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        paddingVertical: Spacing.xs,
        backgroundColor: AppColors.white,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    infoCell: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width: '50%',
        paddingVertical: Spacing.sm,
    },
    infoCellBottomRow: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.08)',
    },
    infoValue: {
        ...Typography.bodySmall,
        color: AppColors.textDark,
        fontWeight: '500',
        fontSize: 12,
    },
    locationText: {
        color: AppColors.primary,
        fontWeight: '600',
    },

    // Ambiance Section
    ambianceContainer: {
        marginTop: Spacing.lg,
    },
    ambianceLabel: {
        ...Typography.bodyMedium,
        color: AppColors.textLight,
        paddingHorizontal: Spacing.sm,
        marginBottom: Spacing.md,
    },
    ambienceSection: {
        marginHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        height: 400,
        ...Shadows.subtle,
    },
    ambienceImage: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.md,
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
        paddingHorizontal: Spacing.sm,
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
        borderRadius: BorderRadius.md,
        backgroundColor: AppColors.primary,
        gap: 6,
        ...Shadows.subtle,
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
        borderRadius: BorderRadius.md,
        backgroundColor: '#f0f0f0',
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
        color: AppColors.textDark,
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
    viewAllButtonContainer: {
        marginTop: Spacing.lg,
    },

    // Reservation Section
    reservationSection: {
        paddingHorizontal: Spacing.sm,
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
    reservationButtonWrapper: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    reservationIcon: {
        marginBottom: Spacing.xs,
    },
});

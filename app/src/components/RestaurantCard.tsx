import { useState, useRef, useMemo } from 'react';
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
import AnimatedButton from './AnimatedButton';

import {
    AppColors,
    Typography,
    Spacing,
    BorderRadius,
    Shadows,
    SpringConfig,
    AnimationScale,
} from '../theme';

import { Restaurant } from '../types';
import { openInMaps } from '../utils/location';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

const NAVIGATION_BAR_HEIGHT = 215; // Approximate height of navigation bar + safe area
const CARD_HEIGHT = height - NAVIGATION_BAR_HEIGHT;

interface RestaurantCardProps {
    restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [heroReelVisible, setHeroReelVisible] = useState(false);
    const [foodReelVisible, setFoodReelVisible] = useState(false);
    const [ambianceModalVisible, setAmbianceModalVisible] = useState(false);
    const [menuModalVisible, setMenuModalVisible] = useState(false);
    const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);

    const [currentReelPhotos, setCurrentReelPhotos] = useState<
        Array<{ imageUrl: string; review?: any }>
    >([]);

    const scrollViewRef = useRef<ScrollView>(null);

    function handleLocationPress() {
        if (restaurant.lat && restaurant.long) {
            openInMaps(restaurant.lat, restaurant.long, restaurant.name);
        }
    }

    function formatDistanceFromMeters(meters: number): string {
        // Convert meters to miles
        const miles = meters * 0.000621371;

        if (miles < 0.1) {
            return 'Nearby';
        }
        else if (miles < 1) {
            return `${(miles * 5280).toFixed(0)} ft`;
        }
        else {
            return `${miles.toFixed(1)} mi`;
        }
    }

    function extractCity(address: string): string {
        // Address format: "Street, City, State ZIP"
        // Split by comma and get the second part (index 1) which is the city
        const parts = address.split(',').map(part => part.trim());

        if (parts.length >= 2) {
            // The city is typically the second part (index 1)
            const cityPart = parts[1];

            // If the city part contains state code (e.g., "Austin TX" instead of just "Austin"),
            // extract only the city name before the state code
            const stateMatch = cityPart.match(/^(.+?)\s+[A-Z]{2}(\s|$)/);
            if (stateMatch) {
                return stateMatch[1].trim();
            }

            return cityPart;
        }

        return '';
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
                    color={ colors.secondary }
                />,
            );
        }

        if (hasHalfStar)
            stars.push(
                <Ionicons
                    key="half"
                    name="star-half"
                    size={ starSize }
                    color={ colors.secondary }
                />,
            );

        for (let i = stars.length; i < 5; i++) {
            stars.push(
                <Ionicons
                    key={ `empty-${i}` }
                    name="star-outline"
                    size={ starSize }
                    color={ colors.secondary }
                />,
            );
        }

        return stars;
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
                            { restaurant.price }
                        </Text>
                    </View>

                    <View style={ styles.ratingRow }>
                        { renderStars(restaurant.rating) }
                    </View>
                </View>

                <Text style={ styles.cuisine }>{ restaurant.cuisine.join(', ') }</Text>
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
                        photos={ [{ imageUrl: restaurant.heroImage }] }
                        allReviews={ restaurant.topReview ? [restaurant.topReview] : [] }
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
                                source={ { uri: restaurant.heroImage } }
                                style={ styles.heroImage }
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    </Animated.View>

                    { /* Info Table */ }
                    <View style={ styles.infoTable }>
                        <TouchableOpacity
                            onPress={ handleLocationPress }
                            activeOpacity={ 0.7 }
                        >
                            <View style={ styles.infoCell }>
                                <Ionicons
                                    name="location"
                                    size={ 14 }
                                    color={ colors.textDark }
                                />
                                <Text style={ [styles.infoValue, styles.locationText] } numberOfLines={ 1 }>
                                    { formatDistanceFromMeters(restaurant.distance) }
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View>
                            <View style={ styles.infoCell }>
                                <Ionicons
                                    name="call"
                                    size={ 14 }
                                    color={ colors.textDark }
                                />
                                <Text style={ styles.infoValue } numberOfLines={ 1 }>
                                    { restaurant.phoneNumber }
                                </Text>
                            </View>
                        </View>

                        <View>
                            <View style={ styles.infoCell }>
                                <Ionicons
                                    name="business"
                                    size={ 14 }
                                    color={ colors.textDark }
                                />
                                <Text style={ styles.infoValue } numberOfLines={ 1 }>
                                    { extractCity(restaurant.address) }
                                </Text>
                            </View>
                        </View>
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
                                source={ { uri: restaurant.ambientImages[0] } }
                                style={ styles.ambienceImage }
                                resizeMode="cover"
                            />

                            <LinearGradient
                                colors={ ['transparent', 'rgba(0, 0, 0, 0.6)'] }
                                start={ { x: 0.5, y: 0 } }
                                end={ { x: 0.5, y: 1 } }
                                style={ styles.gradient }
                            >
                                <Text style={ styles.quoteText }>
                                    "{ restaurant.topReview.quote }"
                                </Text>

                                <Text style={ styles.quoteAuthor }>
                                    - { restaurant.topReview.author }
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                { /* Ambiance Reel Modal */ }
                <ReelModal
                    visible={ ambianceModalVisible }
                    onClose={ () => setAmbianceModalVisible(false) }
                    photos={ restaurant.ambientImages.map((img) => ({ imageUrl: img })) }
                    allReviews={ restaurant.topReview ? [restaurant.topReview] : [] }
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
                        { restaurant.socialMedia.instagram && (
                            <TouchableOpacity style={ styles.socialButton }>
                                <Ionicons
                                    name="logo-instagram"
                                    size={ 16 }
                                    color={ colors.instagram }
                                />

                                <Text style={ styles.socialText }>
                                    { restaurant.socialMedia.instagram }
                                </Text>
                            </TouchableOpacity>
                        ) }
                        { restaurant.socialMedia.tiktok && (
                            <TouchableOpacity
                                style={ [
                                    styles.socialButton,
                                    styles.tiktokButton,
                                ] }
                            >
                                <Ionicons
                                    name="logo-tiktok"
                                    size={ 16 }
                                    color={ colors.textDark }
                                />

                                <Text style={ styles.socialText }>
                                    { restaurant.socialMedia.tiktok }
                                </Text>
                            </TouchableOpacity>
                        ) }
                    </View>

                    { /* Popular Dish Photos - Show first 3 */ }
                    { restaurant.popularDishPhotos.slice(0, 3).map((photoUrl, index) => {
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
                                                restaurant.popularDishPhotos.map(
                                                    (img) => ({
                                                        imageUrl: img,
                                                        review: restaurant.topReview,
                                                    }),
                                                ),
                                            );
                                            setInitialPhotoIndex(index);
                                            setFoodReelVisible(true);
                                        } }
                                    >
                                        <Image
                                            source={ { uri: photoUrl } }
                                            style={ styles.foodImage }
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                ) }
                                <View style={ styles.foodReview }>
                                    { restaurant.topReview && (
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
                                                            restaurant.topReview.author,
                                                        ) }
                                                    </Text>
                                                </View>

                                                <View style={ styles.reviewInfo }>
                                                    <Text
                                                        style={
                                                            styles.reviewAuthor
                                                        }
                                                    >
                                                        { restaurant.topReview.author }
                                                    </Text>

                                                    <View
                                                        style={
                                                            styles.reviewStars
                                                        }
                                                    >
                                                        { [
                                                            ...Array(
                                                                Math.floor(
                                                                    restaurant.topReview.rating,
                                                                ),
                                                            ),
                                                        ].map((_, i) => (
                                                            <Ionicons
                                                                key={ i }
                                                                name="star"
                                                                size={ 11 }
                                                                color={
                                                                    colors.starOrange
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
                                                "{ restaurant.topReview.quote }"
                                            </Text>
                                        </>
                                    ) }
                                </View>

                                { !isEven && (
                                    <TouchableOpacity
                                        activeOpacity={ 0.9 }
                                        onPress={ () => {
                                            setCurrentReelPhotos(
                                                restaurant.popularDishPhotos.map(
                                                    (img) => ({
                                                        imageUrl: img,
                                                        review: restaurant.topReview,
                                                    }),
                                                ),
                                            );
                                            setInitialPhotoIndex(index);
                                            setFoodReelVisible(true);
                                        } }
                                    >
                                        <Image
                                            source={ { uri: photoUrl } }
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
                        <AnimatedButton
                            onPress={ () => setMenuModalVisible(true) }
                            variant="primary"
                            delayMs={ 800 }
                        >
                            <Text style={ styles.viewAllButtonText }>
                                View Full Menu & More ›
                            </Text>
                        </AnimatedButton>
                    </View>
                </View>

                { /* Food Reel Modal */ }
                <ReelModal
                    visible={ foodReelVisible }
                    onClose={ () => setFoodReelVisible(false) }
                    photos={ currentReelPhotos }
                    allReviews={ restaurant.topReview ? [restaurant.topReview] : [] }
                    initialPhotoIndex={ initialPhotoIndex }
                    tooltipText="Scroll for more food pictures"
                />

                { /* Menu Modal */ }
                <MenuModal
                    visible={ menuModalVisible }
                    onClose={ () => setMenuModalVisible(false) }
                    foodItems={ restaurant.menu }
                    menuImages={ restaurant.popularDishPhotos }
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

const createStyles = (colors: typeof AppColors) => StyleSheet.create({
    card: {
        width: width - 16,
        height: CARD_HEIGHT,
        backgroundColor: colors.white,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        marginHorizontal: 8,
        paddingBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        ...Shadows.soft,
        zIndex: 9999,
        marginTop: 8,
    },
    stickyHeader: {
        backgroundColor: colors.white,
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
        color: colors.textDark,
        flexShrink: 1,
        maxWidth: '70%',
    },
    dotSeparator: {
        paddingHorizontal: 8,
    },
    separatorDot: {
        fontSize: 16,
        color: colors.textLight,
        lineHeight: 24,
    },
    priceLevel: {
        ...Typography.bodyMedium,
        fontSize: 16,
        color: colors.textLight,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cuisine: {
        ...Typography.bodySmall,
        color: colors.textLight,
    },
    heroImage: {
        width: '100%',
        height: height * 0.4,
        backgroundColor: '#f0f0f0',
        borderRadius: BorderRadius.md,
    },
    infoTable: {
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.xs,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        paddingVertical: Spacing.xs,
        backgroundColor: colors.white,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    infoCell: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        flex: 1,
        paddingVertical: Spacing.sm,
        paddingHorizontal: 2,
    },
    infoCellBottomRow: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.08)',
    },
    infoValue: {
        ...Typography.bodySmall,
        color: colors.textDark,
        fontWeight: '500',
        fontSize: 11,
        flexShrink: 1,
    },
    locationText: {
        color: colors.textDark,
        fontWeight: '600',
    },

    // Ambiance Section
    ambianceContainer: {
        marginTop: Spacing.lg,
    },
    ambianceLabel: {
        ...Typography.bodyMedium,
        color: colors.textLight,
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
        color: '#FFFFFF',
        fontStyle: 'italic',
        marginBottom: Spacing.xs,
    },
    quoteAuthor: {
        ...Typography.bodyMedium,
        color: '#FFFFFF',
    },

    // Reviews Section
    reviewsSection: {
        paddingHorizontal: Spacing.sm,
        paddingTop: Spacing.xl,
    },
    sectionTitle: {
        ...Typography.bodyMedium,
        color: colors.textLight,
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
        backgroundColor: colors.primary,
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
        color: colors.textDark,
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
        color: '#FFFFFF',
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
        color: '#FFFFFF',
    },
    reviewStars: {
        flexDirection: 'row',
        marginTop: 2,
    },
    reviewQuote: {
        ...Typography.bodySmall,
        fontSize: 11,
        color: '#FFFFFF',
        lineHeight: 16,
    },
    viewAllButtonContainer: {
        marginTop: Spacing.lg,
        marginBottom: Spacing.lg
    },
    viewAllButtonText: {
        ...Typography.button,
        color: '#212121',
        fontSize: 17,
        fontWeight: '700',
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
        color: colors.textDark,
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
    reservationButton: {
        minWidth: 140,
    },
    reservationButtonText: {
        ...Typography.button,
        color: colors.textDark,
        fontSize: 16,
        fontWeight: '700',
    },
});

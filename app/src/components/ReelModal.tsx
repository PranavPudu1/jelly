import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Animated,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Review } from '../types';
import { AppColors, Typography, Spacing } from '../theme';

const { width, height } = Dimensions.get('window');

export interface ReelPhoto {
    imageUrl: string;
    review?: Review;
}

interface ReelModalProps {
    visible: boolean;
    onClose: () => void;
    photos: ReelPhoto[];
    allReviews: Review[];
    initialPhotoIndex?: number;
    tooltipText?: string;
}

export default function ReelModal({
    visible,
    onClose,
    photos,
    allReviews,
    initialPhotoIndex = 0,
    tooltipText = 'Scroll for more pictures',
}: ReelModalProps) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(
        initialPhotoIndex,
    );
    const [showTooltip, setShowTooltip] = useState(true);
    const [reviewsExpanded, setReviewsExpanded] = useState(false);

    const tooltipOpacity = useRef(new Animated.Value(1)).current;
    const reviewsPanelHeight = useRef(new Animated.Value(0)).current;
    const mainScrollViewRef = useRef<ScrollView>(null);
    const reviewsScrollViewRef = useRef<ScrollView>(null);
    const lastScrollY = useRef(0);
    const swipeStartX = useRef(0);

    const currentPhoto = photos[currentPhotoIndex];
    const currentReview = currentPhoto?.review || allReviews[0];

    // Hide tooltip after 3 seconds on first open
    useEffect(() => {
        if (visible && showTooltip) {
            const timer = setTimeout(() => {
                Animated.timing(tooltipOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => setShowTooltip(false));
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [visible, showTooltip, tooltipOpacity]);

    // Reset state when modal opens and scroll to initial photo
    useEffect(() => {
        if (visible) {
            setCurrentPhotoIndex(initialPhotoIndex);
            setShowTooltip(true);
            setReviewsExpanded(false);
            tooltipOpacity.setValue(1);
            reviewsPanelHeight.setValue(0);
            lastScrollY.current = initialPhotoIndex * height;

            // Scroll to initial photo index after a short delay
            setTimeout(() => {
                mainScrollViewRef.current?.scrollTo({
                    y: initialPhotoIndex * height,
                    animated: false,
                });
            }, 100);
        }
    }, [visible, initialPhotoIndex, tooltipOpacity, reviewsPanelHeight]);

    const handleMoreReviews = () => {
        setReviewsExpanded(true);
        Animated.spring(reviewsPanelHeight, {
            toValue: height * 0.6,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
        }).start();
    };

    const handleMainScroll = (
        event: NativeSyntheticEvent<NativeScrollEvent>,
    ) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        const index = Math.round(scrollY / height);

        // Check if user is at the first photo and scrolling up (overscroll)
        if (currentPhotoIndex === 0 && scrollY < -50) {
            // User is trying to scroll up past the first photo - close modal
            onClose();
            return;
        }

        if (index !== currentPhotoIndex && index >= 0 && index < photos.length) {
            setCurrentPhotoIndex(index);
            // Collapse reviews when changing photos
            if (reviewsExpanded) {
                setReviewsExpanded(false);
                Animated.spring(reviewsPanelHeight, {
                    toValue: 0,
                    useNativeDriver: false,
                    speed: 20,
                }).start();
            }
        }

        lastScrollY.current = scrollY;
    };

    const getAvatarColor = (index: number) => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
        return colors[index % colors.length];
    };

    const getInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    const handleTouchStart = (event: any) => {
        swipeStartX.current = event.nativeEvent.pageX;
    };

    const handleTouchEnd = (event: any) => {
        const swipeEndX = event.nativeEvent.pageX;
        const deltaX = Math.abs(swipeEndX - swipeStartX.current);

        // If horizontal swipe is more than 100px, close modal
        if (deltaX > 100) {
            // Prevent event from bubbling to parent (swiper)
            event.stopPropagation();
            onClose();
        }
    };

    const handleTouchMove = (event: any) => {
        // Prevent touch events from propagating to swiper underneath
        event.stopPropagation();
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View
                style={styles.container}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={32} color={AppColors.white} />
                </TouchableOpacity>

                {/* Tooltip */}
                {showTooltip && (
                    <Animated.View
                        style={[
                            styles.tooltip,
                            { opacity: tooltipOpacity },
                        ]}
                    >
                        <Text style={styles.tooltipText}>
                            {tooltipText}
                        </Text>
                    </Animated.View>
                )}

                {/* Vertical Photo Navigation Indicators */}
                <View style={styles.photoIndicators}>
                    {photos.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                index === currentPhotoIndex &&
                                    styles.activeIndicator,
                            ]}
                        />
                    ))}
                </View>

                {/* Main Vertical ScrollView with all photos */}
                <ScrollView
                    ref={mainScrollViewRef}
                    pagingEnabled
                    showsVerticalScrollIndicator={false}
                    onScroll={handleMainScroll}
                    scrollEventThrottle={16}
                    snapToInterval={height}
                    decelerationRate="fast"
                    bounces={true}
                >
                    {photos.map((photo, index) => {
                        const review = photo.review || allReviews[0];
                        return (
                            <View key={index} style={styles.photoContainer}>
                                <Image
                                    source={{ uri: photo.imageUrl }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />

                                {/* Bottom Review Overlay - only show for current photo */}
                                {index === currentPhotoIndex && review && (
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.85)']}
                                        style={styles.reviewOverlay}
                                    >
                                        <View style={styles.reviewContent}>
                                            <Text style={styles.reviewQuote}>
                                                "{review.quote}"
                                            </Text>
                                            <Text style={styles.reviewAuthor}>
                                                - {review.author}
                                            </Text>

                                            {/* More Reviews Button */}
                                            {!reviewsExpanded && allReviews.length > 1 && (
                                                <TouchableOpacity
                                                    onPress={handleMoreReviews}
                                                    style={styles.moreReviewsButton}
                                                >
                                                    <Text style={styles.moreReviewsText}>
                                                        More reviews
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </LinearGradient>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Expanded Reviews Panel */}
                {allReviews.length > 1 && (
                    <Animated.View
                        style={[
                            styles.reviewsPanel,
                            { height: reviewsPanelHeight },
                        ]}
                        pointerEvents={reviewsExpanded ? 'auto' : 'none'}
                    >
                        <ScrollView
                            ref={reviewsScrollViewRef}
                            style={styles.reviewsScroll}
                            showsVerticalScrollIndicator={false}
                            scrollEventThrottle={16}
                            bounces={true}
                            scrollEnabled={reviewsExpanded}
                        >
                            <View style={styles.reviewsPanelHeader}>
                                <Text style={styles.reviewsPanelTitle}>
                                    All Reviews
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setReviewsExpanded(false);
                                        Animated.spring(reviewsPanelHeight, {
                                            toValue: 0,
                                            useNativeDriver: false,
                                        }).start();
                                    }}
                                >
                                    <Ionicons
                                        name="chevron-down"
                                        size={24}
                                        color={AppColors.textDark}
                                    />
                                </TouchableOpacity>
                            </View>

                            {allReviews.map((review, index) => (
                                <View key={index} style={styles.reviewItem}>
                                    <View style={styles.reviewHeader}>
                                        <View
                                            style={[
                                                styles.avatar,
                                                {
                                                    backgroundColor:
                                                        getAvatarColor(index),
                                                },
                                            ]}
                                        >
                                            <Text style={styles.avatarText}>
                                                {getInitial(review.author)}
                                            </Text>
                                        </View>
                                        <View style={styles.reviewInfo}>
                                            <Text style={styles.reviewAuthorName}>
                                                {review.author}
                                            </Text>
                                            <View style={styles.reviewStars}>
                                                {[
                                                    ...Array(
                                                        Math.floor(review.rating),
                                                    ),
                                                ].map((_, i) => (
                                                    <Ionicons
                                                        key={i}
                                                        name="star"
                                                        size={12}
                                                        color={AppColors.starOrange}
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                    <Text style={styles.reviewItemQuote}>
                                        "{review.quote}"
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </Animated.View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.background,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 100,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tooltip: {
        position: 'absolute',
        top: 120,
        left: 0,
        right: 0,
        zIndex: 99,
        alignItems: 'center',
    },
    tooltipText: {
        ...Typography.bodyMedium,
        color: AppColors.white,
        backgroundColor: 'rgba(0,0,0,0.75)',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        overflow: 'hidden',
    },
    photoIndicators: {
        position: 'absolute',
        right: 20,
        top: '50%',
        transform: [{ translateY: -50 }],
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        zIndex: 98,
    },
    indicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    activeIndicator: {
        backgroundColor: AppColors.white,
        height: 24,
    },
    photoContainer: {
        width: width,
        height: height,
    },
    image: {
        width: width,
        height: height,
    },
    reviewOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    reviewContent: {
        gap: Spacing.sm,
    },
    reviewQuote: {
        ...Typography.bodyLarge,
        color: AppColors.white,
        fontSize: 16,
        fontStyle: 'italic',
        lineHeight: 24,
    },
    reviewAuthor: {
        ...Typography.bodyMedium,
        color: AppColors.white,
        fontSize: 14,
    },
    moreReviewsButton: {
        marginTop: Spacing.sm,
        alignSelf: 'flex-start',
    },
    moreReviewsText: {
        ...Typography.bodyMedium,
        color: AppColors.white,
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    reviewsPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: AppColors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    reviewsScroll: {
        flex: 1,
    },
    reviewsPanelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    reviewsPanelTitle: {
        ...Typography.titleMedium,
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.textDark,
    },
    reviewItem: {
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    avatarText: {
        color: AppColors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    reviewInfo: {
        flex: 1,
    },
    reviewAuthorName: {
        ...Typography.bodyMedium,
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.textDark,
        marginBottom: 2,
    },
    reviewStars: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewItemQuote: {
        ...Typography.bodySmall,
        fontSize: 13,
        color: AppColors.textLight,
        lineHeight: 20,
    },
});

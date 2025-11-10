import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Modal,
    FlatList,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Typography, Spacing, BorderRadius } from '../theme';
import { Review } from '../types';

const { width, height } = Dimensions.get('window');

interface PhotoModalProps {
    visible: boolean;
    onClose: () => void;
    photos: Array<{ imageUrl: string }>;
    reviews: Review[];
    initialPhotoIndex?: number;
}

export default function PhotoModal({
    visible,
    onClose,
    photos,
    reviews,
    initialPhotoIndex = 0,
}: PhotoModalProps) {
    const [currentPhotoIndex, setCurrentPhotoIndex] =
        useState(initialPhotoIndex);

    function getInitial(name: string) {
        return name.charAt(0).toUpperCase();
    }

    function getAvatarColor(index: number) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
        return colors[index % colors.length];
    }

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons
                        name="close"
                        size={30}
                        color={AppColors.white}
                    />
                </TouchableOpacity>

                <FlatList
                    data={photos}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={initialPhotoIndex}
                    getItemLayout={(data, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                    onMomentumScrollEnd={(event) => {
                        const index = Math.round(
                            event.nativeEvent.contentOffset.x / width,
                        );
                        setCurrentPhotoIndex(index);
                    }}
                    renderItem={({ item }) => (
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.fullscreenImage}
                            resizeMode="cover"
                        />
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />

                {/* Page Indicator */}
                <View style={styles.pageIndicator}>
                    {photos.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentPhotoIndex === index &&
                                    styles.dotActive,
                            ]}
                        />
                    ))}
                </View>

                {/* Draggable Reviews Section */}
                <View style={styles.modalReviewsContainer}>
                    <View style={styles.dragHandle} />
                    <ScrollView style={styles.modalReviewsList}>
                        <Text style={styles.modalReviewsTitle}>Reviews</Text>
                        {reviews.map((review, index) => (
                            <View key={index} style={styles.modalReview}>
                                <View style={styles.modalReviewHeader}>
                                    <View
                                        style={[
                                            styles.modalAvatar,
                                            {
                                                backgroundColor:
                                                    getAvatarColor(index),
                                            },
                                        ]}
                                    >
                                        <Text style={styles.modalAvatarText}>
                                            {getInitial(review.author)}
                                        </Text>
                                    </View>
                                    <View style={styles.modalReviewInfo}>
                                        <Text style={styles.modalReviewAuthor}>
                                            {review.author}
                                        </Text>
                                        <View style={styles.modalReviewStars}>
                                            {[
                                                ...Array(
                                                    Math.floor(review.rating),
                                                ),
                                            ].map((_, i) => (
                                                <Ionicons
                                                    key={i}
                                                    name="star"
                                                    size={12}
                                                    color={
                                                        AppColors.starOrange
                                                    }
                                                />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.modalReviewQuote}>
                                    "{review.quote}"
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: AppColors.background,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    fullscreenImage: {
        width: width,
        height: height * 0.6,
    },
    pageIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: AppColors.textLight,
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: AppColors.primary,
    },
    modalReviewsContainer: {
        backgroundColor: '#1F1F1F',
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingTop: Spacing.sm,
        flex: 1,
    },
    dragHandle: {
        width: 50,
        height: 5,
        backgroundColor: AppColors.textLight,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: Spacing.md,
    },
    modalReviewsList: {
        paddingHorizontal: Spacing.md,
    },
    modalReviewsTitle: {
        ...Typography.titleLarge,
        color: AppColors.white,
        marginBottom: Spacing.md,
    },
    modalReview: {
        marginBottom: Spacing.lg,
    },
    modalReviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    modalAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    modalAvatarText: {
        color: AppColors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalReviewInfo: {
        flex: 1,
    },
    modalReviewAuthor: {
        ...Typography.bodyMedium,
        fontWeight: 'bold',
        color: AppColors.white,
    },
    modalReviewStars: {
        flexDirection: 'row',
        marginTop: 2,
    },
    modalReviewQuote: {
        ...Typography.bodyMedium,
        fontSize: 13,
        color: AppColors.textLight,
        lineHeight: 20,
    },
});

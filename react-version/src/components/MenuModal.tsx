import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FoodItem, Review } from '../types';
import { AppColors, Typography, Spacing, BorderRadius } from '../theme';

const { width } = Dimensions.get('window');

interface MenuModalProps {
    visible: boolean;
    onClose: () => void;
    foodItems: FoodItem[];
    menuImages: string[];
    onPhotoPress: (photos: string[], index: number) => void;
}

export default function MenuModal({
    visible,
    onClose,
    foodItems,
    menuImages,
    onPhotoPress,
}: MenuModalProps) {
    const [activeTab, setActiveTab] = useState<'items' | 'menu'>('items');

    const getAvatarColor = (index: number) => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
        return colors[index % colors.length];
    };

    const getInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
            presentationStyle="pageSheet"
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Menu & Items</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons
                            name="close"
                            size={28}
                            color={AppColors.textDark}
                        />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'items' && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab('items')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'items' && styles.activeTabText,
                            ]}
                        >
                            All Items
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'menu' && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab('menu')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'menu' && styles.activeTabText,
                            ]}
                        >
                            Menu
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {activeTab === 'items' ? (
                        // All Items Tab
                        <View style={styles.itemsList}>
                            {foodItems.map((foodItem, index) => {
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
                                                onPress={() =>
                                                    onPhotoPress(
                                                        foodItem.images,
                                                        0,
                                                    )
                                                }
                                            >
                                                <Image
                                                    source={{
                                                        uri: foodItem.images[0],
                                                    }}
                                                    style={styles.foodImage}
                                                    resizeMode="cover"
                                                />
                                            </TouchableOpacity>
                                        )}
                                        <View style={styles.foodReview}>
                                            <Text style={styles.foodName}>
                                                {foodItem.name}
                                            </Text>
                                            {foodItem.reviews[0] && (
                                                <>
                                                    <View
                                                        style={
                                                            styles.reviewHeader
                                                        }
                                                    >
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
                                                                    foodItem
                                                                        .reviews[0]
                                                                        .author,
                                                                )}
                                                            </Text>
                                                        </View>
                                                        <View
                                                            style={
                                                                styles.reviewInfo
                                                            }
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.reviewAuthor
                                                                }
                                                            >
                                                                {
                                                                    foodItem
                                                                        .reviews[0]
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
                                                                ].map(
                                                                    (_, i) => (
                                                                        <Ionicons
                                                                            key={
                                                                                i
                                                                            }
                                                                            name="star"
                                                                            size={
                                                                                11
                                                                            }
                                                                            color={
                                                                                AppColors.starOrange
                                                                            }
                                                                        />
                                                                    ),
                                                                )}
                                                            </View>
                                                        </View>
                                                    </View>
                                                    <Text
                                                        style={
                                                            styles.reviewQuote
                                                        }
                                                        numberOfLines={4}
                                                    >
                                                        "
                                                        {
                                                            foodItem.reviews[0]
                                                                .quote
                                                        }
                                                        "
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                        {!isEven && (
                                            <TouchableOpacity
                                                activeOpacity={0.9}
                                                onPress={() =>
                                                    onPhotoPress(
                                                        foodItem.images,
                                                        0,
                                                    )
                                                }
                                            >
                                                <Image
                                                    source={{
                                                        uri: foodItem.images[0],
                                                    }}
                                                    style={styles.foodImage}
                                                    resizeMode="cover"
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        // Menu Tab
                        <View style={styles.menuList}>
                            {menuImages.map((image, index) => (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.9}
                                    onPress={() => onPhotoPress(menuImages, index)}
                                    style={styles.menuImageContainer}
                                >
                                    <Image
                                        source={{ uri: image }}
                                        style={styles.menuImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    headerTitle: {
        ...Typography.titleLarge,
        fontSize: 24,
        fontWeight: '700',
        color: AppColors.textDark,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: AppColors.primary,
    },
    tabText: {
        ...Typography.bodyMedium,
        fontSize: 16,
        fontWeight: '600',
        color: AppColors.textLight,
    },
    activeTabText: {
        color: AppColors.primary,
    },
    content: {
        flex: 1,
    },
    itemsList: {
        padding: Spacing.md,
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
    foodName: {
        ...Typography.titleMedium,
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.textDark,
        marginBottom: Spacing.xs,
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
    menuList: {
        padding: Spacing.md,
    },
    menuImageContainer: {
        marginBottom: Spacing.md,
    },
    menuImage: {
        width: '100%',
        height: 400,
        borderRadius: BorderRadius.md,
        backgroundColor: AppColors.surface,
    },
});

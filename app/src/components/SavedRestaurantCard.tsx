import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Restaurant } from '../types';
import { AppColors, Typography, Spacing } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing.lg * 2;

interface SavedRestaurantCardProps {
    restaurant: Restaurant;
    onPress: () => void;
    onUnsave: () => void;
}

export default function SavedRestaurantCard({
    restaurant,
    onPress,
    onUnsave,
}: SavedRestaurantCardProps) {
    return (
        <TouchableOpacity
            style={ styles.card }
            onPress={ onPress }
            activeOpacity={ 0.95 }
        >
            <Image
                source={ { uri: restaurant.heroImageUrl } }
                style={ styles.image }
                resizeMode="cover"
            />

            <TouchableOpacity
                style={ styles.unsaveButton }
                onPress={ onUnsave }
                hitSlop={ { top: 10, bottom: 10, left: 10, right: 10 } }
            >
                <Ionicons name="heart" size={ 24 } color={ AppColors.primary } />
            </TouchableOpacity>

            <View style={ styles.content }>
                <View style={ styles.header }>
                    <Text style={ styles.name } numberOfLines={ 1 }>
                        { restaurant.name }
                    </Text>
                    <View style={ styles.ratingContainer }>
                        <Ionicons name="star" size={ 14 } color={ AppColors.warning } />
                        <Text style={ styles.rating }>{ restaurant.rating.toFixed(1) }</Text>
                    </View>
                </View>

                <View style={ styles.tags }>
                    <View style={ styles.tag }>
                        <Text style={ styles.tagText }>{ restaurant.cuisine }</Text>
                    </View>
                    <View style={ styles.tag }>
                        <Text style={ styles.tagText }>{ restaurant.priceLevel }</Text>
                    </View>
                </View>

                { restaurant.infoList && restaurant.infoList[0] && (
                    <View style={ styles.locationContainer }>
                        <Ionicons
                            name="location-outline"
                            size={ 14 }
                            color={ AppColors.textLight }
                        />
                        <Text style={ styles.location } numberOfLines={ 1 }>
                            { restaurant.infoList[0].text }
                        </Text>
                    </View>
                ) }
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: AppColors.white,
        borderRadius: 16,
        marginBottom: Spacing.lg,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: AppColors.background,
    },
    unsaveButton: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    content: {
        padding: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    name: {
        ...Typography.headingMedium,
        fontSize: 18,
        flex: 1,
        marginRight: Spacing.sm,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        ...Typography.bodyMedium,
        fontWeight: '600',
    },
    tags: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    tag: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        backgroundColor: AppColors.background,
        borderRadius: 12,
    },
    tagText: {
        ...Typography.caption,
        color: AppColors.text,
        fontWeight: '500',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        ...Typography.bodySmall,
        color: AppColors.textLight,
        flex: 1,
    },
});

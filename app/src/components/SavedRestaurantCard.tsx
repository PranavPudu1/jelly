import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SavedRestaurant } from '../types';
import { AppColors, Typography, Spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing.lg * 2;

interface SavedRestaurantCardProps {
    savedRestaurant: SavedRestaurant;
    userLocation: { latitude: number; longitude: number } | null;
    onPress: () => void;
    onUnsave: () => void;
}

export default function SavedRestaurantCard({
    savedRestaurant,
    userLocation,
    onPress,
    onUnsave,
}: SavedRestaurantCardProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { restaurant, preferences } = savedRestaurant;

    // Get top preference if preferences exist
    function getTopPreference() {
        if (!preferences || Object.keys(preferences).length === 0) {
            return null;
        }
        // Find the preference with the highest weight
        const sortedPrefs = Object.entries(preferences).sort((a, b) => b[1] - a[1]);
        return sortedPrefs[0][0]; // Return the key (preference name)
    }

    // Calculate distance from current location using Haversine formula
    function calculateDistance(): number | null {
        if (!userLocation) {
            return null;
        }

        const R = 6371e3; // Earth's radius in meters
        const lat1 = userLocation.latitude * Math.PI / 180;
        const lat2 = restaurant.lat * Math.PI / 180;
        const deltaLat = (restaurant.lat - userLocation.latitude) * Math.PI / 180;
        const deltaLon = (restaurant.long - userLocation.longitude) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    const topPreference = getTopPreference();
    const currentDistance = calculateDistance();

    return (
        <TouchableOpacity
            style={ styles.card }
            onPress={ onPress }
            activeOpacity={ 0.95 }
        >
            <Image
                source={ { uri: restaurant.heroImage } }
                style={ styles.image }
                resizeMode="cover"
            />

            <TouchableOpacity
                style={ styles.unsaveButton }
                onPress={ onUnsave }
                hitSlop={ { top: 10, bottom: 10, left: 10, right: 10 } }
            >
                <Ionicons name="heart" size={ 24 } color={ colors.primary } />
            </TouchableOpacity>

            <View style={ styles.content }>
                <View style={ styles.header }>
                    <Text style={ styles.name } numberOfLines={ 1 }>
                        { restaurant.name }
                    </Text>
                    <View style={ styles.ratingContainer }>
                        <Ionicons name="star" size={ 14 } color={ colors.warning } />
                        <Text style={ styles.rating }>{ restaurant.rating.toFixed(1) }</Text>
                    </View>
                </View>

                <View style={ styles.tags }>
                    { Array.isArray(restaurant.cuisine) && restaurant.cuisine.length > 0 ? (
                        <View style={ styles.tag }>
                            <Text style={ styles.tagText }>{ restaurant.cuisine[0] }</Text>
                        </View>
                    ) : typeof restaurant.cuisine === 'string' ? (
                        <View style={ styles.tag }>
                            <Text style={ styles.tagText }>{ restaurant.cuisine }</Text>
                        </View>
                    ) : null }
                    <View style={ styles.tag }>
                        <Text style={ styles.tagText }>{ restaurant.price }</Text>
                    </View>
                    { topPreference && (
                        <View style={ [styles.tag, styles.preferenceTag] }>
                            <Ionicons name="star" size={ 12 } color={ colors.primary } />
                            <Text style={ styles.preferenceTagText }>{ topPreference }</Text>
                        </View>
                    ) }
                </View>

                { currentDistance !== null && (
                    <View style={ styles.locationContainer }>
                        <Ionicons
                            name="location-outline"
                            size={ 14 }
                            color={ colors.textLight }
                        />
                        <Text style={ styles.location } numberOfLines={ 1 }>
                            { (currentDistance / 1609).toFixed(1) } mi away
                        </Text>
                    </View>
                ) }
            </View>
        </TouchableOpacity>
    );
}

const createStyles = (colors: typeof AppColors) => StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: colors.white,
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
        backgroundColor: colors.background,
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
        backgroundColor: colors.background,
        borderRadius: 12,
    },
    tagText: {
        ...Typography.caption,
        color: colors.text,
        fontWeight: '500',
    },
    preferenceTag: {
        backgroundColor: colors.primary + '20',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    preferenceTagText: {
        ...Typography.caption,
        color: colors.primary,
        fontWeight: '600',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        ...Typography.bodySmall,
        color: colors.textLight,
        flex: 1,
    },
});

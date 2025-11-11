import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppColors, Typography, Spacing } from '../theme';

export default function SavedRestaurantsScreen() {
    // TODO: Replace with actual saved restaurants from context/state
    const savedRestaurants: any[] = [];

    function renderEmptyState() {
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                    <Ionicons
                        name="bookmark-outline"
                        size={64}
                        color={AppColors.textLight}
                    />
                </View>
                <Text style={styles.emptyTitle}>No Saved Restaurants</Text>
                <Text style={styles.emptySubtitle}>
                    Restaurants you like will appear here
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Saved Restaurants</Text>
            </View>

            <FlatList
                data={savedRestaurants}
                renderItem={() => null}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={
                    savedRestaurants.length === 0
                        ? styles.emptyListContainer
                        : styles.listContainer
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.white,
    },
    header: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    headerTitle: {
        ...Typography.displaySmall,
        fontSize: 24,
    },
    listContainer: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
    },
    emptyListContainer: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: AppColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    emptyTitle: {
        ...Typography.displayMedium,
        fontSize: 24,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    emptySubtitle: {
        ...Typography.bodyLarge,
        color: AppColors.textLight,
        textAlign: 'center',
    },
});

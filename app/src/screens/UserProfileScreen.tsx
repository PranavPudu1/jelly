import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppColors, Typography, Spacing } from '../theme';

export default function UserProfileScreen() {
    // TODO: Replace with actual user data from context
    const userName = 'User';

    function handleEditProfile() {
        console.log('Edit profile');
        // TODO: Navigate to edit profile screen
    }

    function handlePreferences() {
        console.log('Edit preferences');
        // TODO: Navigate to preferences screen
    }

    function handleAbout() {
        console.log('About');
        // TODO: Navigate to about screen
    }

    function handleLogout() {
        console.log('Logout');
        // TODO: Implement logout functionality
    }

    return (
        <SafeAreaView style={ styles.container } edges={ ['top'] }>
            <ScrollView>
                <View style={ styles.header }>
                    <View style={ styles.avatarContainer }>
                        <Ionicons
                            name="person"
                            size={ 48 }
                            color={ AppColors.textDark }
                        />
                    </View>
                    <Text style={ styles.userName }>{ userName }</Text>
                </View>

                <View style={ styles.section }>
                    <Text style={ styles.sectionTitle }>Account</Text>

                    <TouchableOpacity
                        style={ styles.menuItem }
                        onPress={ handleEditProfile }
                        activeOpacity={ 0.7 }
                    >
                        <View style={ styles.menuItemLeft }>
                            <Ionicons
                                name="person-outline"
                                size={ 24 }
                                color={ AppColors.textDark }
                            />
                            <Text style={ styles.menuItemText }>
                                Edit Profile
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={ 20 }
                            color={ AppColors.textLight }
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={ styles.menuItem }
                        onPress={ handlePreferences }
                        activeOpacity={ 0.7 }
                    >
                        <View style={ styles.menuItemLeft }>
                            <Ionicons
                                name="settings-outline"
                                size={ 24 }
                                color={ AppColors.textDark }
                            />
                            <Text style={ styles.menuItemText }>Preferences</Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={ 20 }
                            color={ AppColors.textLight }
                        />
                    </TouchableOpacity>
                </View>

                <View style={ styles.section }>
                    <Text style={ styles.sectionTitle }>Support</Text>

                    <TouchableOpacity
                        style={ styles.menuItem }
                        onPress={ handleAbout }
                        activeOpacity={ 0.7 }
                    >
                        <View style={ styles.menuItemLeft }>
                            <Ionicons
                                name="information-circle-outline"
                                size={ 24 }
                                color={ AppColors.textDark }
                            />
                            <Text style={ styles.menuItemText }>About</Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={ 20 }
                            color={ AppColors.textLight }
                        />
                    </TouchableOpacity>
                </View>

                <View style={ styles.section }>
                    <TouchableOpacity
                        style={ [styles.menuItem, styles.logoutButton] }
                        onPress={ handleLogout }
                        activeOpacity={ 0.7 }
                    >
                        <View style={ styles.menuItemLeft }>
                            <Ionicons
                                name="log-out-outline"
                                size={ 24 }
                                color={ AppColors.secondary }
                            />
                            <Text
                                style={ [styles.menuItemText, styles.logoutText] }
                            >
                                Log Out
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.white,
    },
    header: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: AppColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    userName: {
        ...Typography.displaySmall,
        fontSize: 24,
    },
    section: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },
    sectionTitle: {
        ...Typography.titleMedium, // TODO: see if functionally the same
        color: AppColors.textLight,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        marginBottom: Spacing.sm,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        ...Typography.bodyLarge,
        marginLeft: Spacing.md,
    },
    logoutButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: AppColors.secondary,
    },
    logoutText: {
        color: AppColors.secondary,
    },
});

import { useState, useContext, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../App';
import { UserContext } from '../contexts/UserContext';
import AnimatedButton from '../components/AnimatedButton';
import { useTheme } from '../contexts/ThemeContext';

import {
    AppColors,
    Typography,
    Spacing,
    BorderRadius,
    Shadows,
    Gradients,
} from '../theme';

type ContextScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Context'>;
};

const EXAMPLES = [
    'Lunch with parents, outdoor seating.',
    'Dinner with friends, big table, social vibe.',
    'Quick solo lunch, healthy and quiet.',
    'Date night, romantic and intimate.',
    'Business lunch, nice but not too fancy.',
];

export default function ContextScreen({ navigation }: ContextScreenProps) {
    const { user, setUser } = useContext(UserContext);
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [contextText, setContextText] = useState('');

    function handleExampleTap(example: string) {
        setContextText(example);
    }

    function handleStart(context: string) {
        setUser({
            ...user!,
            mealContext: context.trim() || undefined,
        });
        navigation.replace('MainTabs');
    }

    return (
        <SafeAreaView style={ styles.container }>
            <LinearGradient
                colors={ ['#FAFAFA', '#FFF5F7'] }
                style={ StyleSheet.absoluteFillObject }
            />

            <KeyboardAvoidingView
                style={ { flex: 1 } }
                behavior={ Platform.OS === 'ios' ? 'padding' : undefined }
                keyboardVerticalOffset={ Platform.OS === 'ios' ? 20 : 0 }
            >
                <ScrollView
                    contentContainerStyle={ styles.scrollContent }
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={ false }
                >
                    { /* Header */ }
                    <View style={ styles.header }>
                        <Text style={ styles.headline }>What's the vibe{'\n'}or situation?</Text>
                        <Text style={ styles.subheadline }>
                            Describe your meal in a sentence or two. We'll use it to find the best match.
                        </Text>
                    </View>

                    { /* Text Input */ }
                    <View style={ styles.inputWrapper }>
                        <TextInput
                            style={ styles.textInput }
                            placeholder="e.g. Dinner with friends, need a big table..."
                            placeholderTextColor={ colors.textLight }
                            value={ contextText }
                            onChangeText={ setContextText }
                            multiline
                            numberOfLines={ 3 }
                            textAlignVertical="top"
                            autoFocus
                            maxLength={ 200 }
                        />
                        { contextText.length > 0 && (
                            <Text style={ styles.charCount }>{ contextText.length }/200</Text>
                        ) }
                    </View>

                    { /* Example chips */ }
                    <View style={ styles.examplesSection }>
                        <Text style={ styles.examplesLabel }>Try an example</Text>
                        <View style={ styles.examplesWrap }>
                            { EXAMPLES.map((ex) => (
                                <TouchableOpacity
                                    key={ ex }
                                    style={ [
                                        styles.exampleChip,
                                        contextText === ex && styles.exampleChipActive,
                                    ] }
                                    onPress={ () => handleExampleTap(ex) }
                                    activeOpacity={ 0.7 }
                                >
                                    <Text
                                        style={ [
                                            styles.exampleChipText,
                                            contextText === ex && styles.exampleChipTextActive,
                                        ] }
                                    >
                                        { ex }
                                    </Text>
                                </TouchableOpacity>
                            )) }
                        </View>
                    </View>
                </ScrollView>

                { /* Bottom buttons — always visible */ }
                <View style={ styles.bottomButtons }>
                    <AnimatedButton
                        onPress={ () => handleStart(contextText) }
                        variant="primary"
                        disabled={ contextText.trim().length === 0 }
                    >
                        <Text style={ [
                            styles.startButtonText,
                            contextText.trim().length === 0 && styles.startButtonTextDisabled,
                        ] }>
                            Find My Restaurant
                        </Text>
                    </AnimatedButton>

                    <TouchableOpacity
                        style={ styles.skipButton }
                        onPress={ () => handleStart('') }
                        activeOpacity={ 0.6 }
                    >
                        <Text style={ styles.skipText }>Skip for now</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors: typeof AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xxl,
        paddingBottom: Spacing.lg,
        flexGrow: 1,
    },
    header: {
        marginBottom: Spacing.xxl,
    },
    headline: {
        fontSize: 34,
        fontWeight: '800',
        color: colors.textDark,
        lineHeight: 42,
        marginBottom: Spacing.md,
        letterSpacing: -0.5,
    },
    subheadline: {
        ...Typography.bodyLarge,
        color: colors.textLight,
        lineHeight: 22,
    },
    inputWrapper: {
        marginBottom: Spacing.xl,
    },
    textInput: {
        backgroundColor: colors.white,
        borderRadius: BorderRadius.lg,
        borderWidth: 2,
        borderColor: '#F0E8EC',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        fontSize: 16,
        color: colors.textDark,
        minHeight: 90,
        lineHeight: 22,
        ...Shadows.subtle,
    },
    charCount: {
        ...Typography.bodySmall,
        color: colors.textLight,
        textAlign: 'right',
        marginTop: Spacing.xs,
        fontSize: 12,
    },
    examplesSection: {
        marginBottom: Spacing.xl,
    },
    examplesLabel: {
        ...Typography.bodySmall,
        color: colors.textLight,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.md,
        fontSize: 11,
    },
    examplesWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    exampleChip: {
        backgroundColor: colors.white,
        borderRadius: 20,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderWidth: 1.5,
        borderColor: '#F0E8EC',
        ...Shadows.subtle,
    },
    exampleChipActive: {
        borderColor: colors.primary,
        backgroundColor: '#FFF5F7',
    },
    exampleChipText: {
        fontSize: 13,
        color: colors.textLight,
        fontWeight: '500',
    },
    exampleChipTextActive: {
        color: colors.textDark,
        fontWeight: '600',
    },
    bottomButtons: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xl,
        paddingTop: Spacing.md,
        gap: Spacing.sm,
        backgroundColor: 'transparent',
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.textDark,
        letterSpacing: 0.3,
    },
    startButtonTextDisabled: {
        opacity: 0.4,
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    skipText: {
        ...Typography.bodyMedium,
        color: colors.textLight,
        fontWeight: '500',
    },
});

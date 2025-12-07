import { useState, useRef, useContext, useEffect, useMemo } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    PanResponder,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist';

import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../App';
import WelcomeCarousel from '../components/WelcomeCarousel';

import { UserContext } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

import {
    AppColors,
    Typography,
    Spacing,
    BorderRadius,
    AnimationPresets,
    SpringConfig,
    Shadows,
    Gradients,
    Microcopy,
    getRandomMicrocopy,
} from '../theme';

import { QUESTIONS } from '../data/questions';

import { QuestionnaireAnswers } from '../types';

/**
 * Mapping from display names to backend preference keys
 */
const PREFERENCE_KEY_MAPPING: Record<string, string> = {
    'Food Quality': 'foodQuality',
    'Ambiance': 'ambiance',
    'Proximity': 'proximity',
    'Price': 'price',
    'Reviews': 'reviews',
};

/**
 * Convert display name to backend key
 */
function itemToKey(item: string): string {
    return PREFERENCE_KEY_MAPPING[item] || item.toLowerCase();
}

/**
 * Convert rankings array to weighted preferences object using exponential weighting
 * Exponential weights: 1st=5, 2nd=3, 3rd=2, 4th=1, 5th=0.5
 * This makes top choices significantly more influential
 */
function convertRankingsToWeights(rankings: string[]): Record<string, number> {
    const exponentialWeights = [5, 3, 2, 1, 0.5]; // Exponential scale
    const weights: Record<string, number> = {};

    rankings.forEach((item, index) => {
        const key = itemToKey(item);
        weights[key] = exponentialWeights[index] || 0;
    });

    return weights;
}

type QuestionnaireScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Questionnaire'>;
};

export default function QuestionnaireScreen({
    navigation,
}: QuestionnaireScreenProps) {
    const { user, setUser } = useContext(UserContext);
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
        user === null ? -1 : 0,
    );

    const [answers, setAnswers] = useState<QuestionnaireAnswers>({});

    // State for different question types
    const [otherText, setOtherText] = useState('');
    const [rankedItems, setRankedItems] = useState<string[]>([]);
    const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
    const [additionalText, setAdditionalText] = useState('');

    const [fadeAnim] = useState(new Animated.Value(1));
    const [slideAnim] = useState(new Animated.Value(0));
    const [buttonOpacity] = useState(new Animated.Value(0));
    const [buttonTranslateY] = useState(new Animated.Value(20));
    const [buttonScale] = useState(new Animated.Value(1));
    const [optionScales] = useState(
        Array.from({ length: 10 }, () => new Animated.Value(1)),
    );

    const swipePosition = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !isWelcomeScreen,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return !isWelcomeScreen && Math.abs(gestureState.dx) > 10;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx > 0 && currentQuestionIndex > 0) {
                    swipePosition.setValue(gestureState.dx);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > 100 && currentQuestionIndex > 0) {
                    handleBack();
                }
                Animated.spring(swipePosition, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            },
        }),
    ).current;

    const isWelcomeScreen = currentQuestionIndex === -1;

    function handleWelcomeAutoAdvance() {
        setCurrentQuestionIndex(0);
    }

    const currentQuestion = !isWelcomeScreen
        ? QUESTIONS[currentQuestionIndex]
        : null;

    const progress = isWelcomeScreen
        ? 0
        : (currentQuestionIndex + 1) / QUESTIONS.length;
    const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
    const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

    // Initialize ranked items when reaching ranking question
    useEffect(() => {
        if (
            currentQuestion?.type === 'ranking' &&
            currentQuestion.items &&
            rankedItems.length === 0
        ) {
            setRankedItems(currentQuestion.items);
        }
    }, [currentQuestion, rankedItems.length]);

    // Animate the "Start Discovering" button when it appears
    useEffect(() => {
        const hasAnswer =
            isLastQuestion &&
            (currentQuestion?.type === 'checkboxes_text'
                ? selectedCheckboxes.length > 0 || additionalText.trim().length > 0
                : currentQuestion?.type === 'text'
                    ? additionalText.trim().length > 0
                    : false);

        if (hasAnswer) {
            buttonOpacity.setValue(0);
            buttonTranslateY.setValue(20);
            buttonScale.setValue(0.95);
            Animated.parallel([
                AnimationPresets.dreamyFadeIn(buttonOpacity),
                Animated.spring(buttonTranslateY, {
                    toValue: 0,
                    ...SpringConfig.gentle,
                }),
                Animated.spring(buttonScale, {
                    toValue: 1,
                    ...SpringConfig.playful,
                }),
            ]).start();
        }
    }, [
        isLastQuestion,
        currentQuestion?.type,
        selectedCheckboxes,
        additionalText,
        buttonOpacity,
        buttonTranslateY,
        buttonScale,
    ]);

    function handleAnswerSelect(
        questionId: string,
        option: string,
        optionIndex: number,
    ) {
        if (optionScales[optionIndex]) {
            AnimationPresets.buttonPress(optionScales[optionIndex]).start();
        }

        if (option === 'Other') {
            setAnswers((prev) => ({
                ...prev,
                [questionId]: otherText || option,
            }));
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
        else {
            setAnswers((prev) => ({
                ...prev,
                [questionId]: option,
            }));
        }

        if (option !== 'Other') {
            setTimeout(() => {
                if (!isLastQuestion) {
                    handleNext();
                }
            }, 300);
        }
    }

    function handleDragEnd(data: string[]) {
        setRankedItems(data);
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion!.id]: data,
        }));
    }

    function renderRankingItem({
        item,
        drag,
        isActive,
        getIndex,
    }: RenderItemParams<string>) {
        const index = getIndex();

        return (
            <ScaleDecorator>
                <TouchableOpacity
                    onPressIn={ drag }
                    disabled={ isActive }
                    activeOpacity={ 0.7 }
                    style={ [
                        styles.rankingItem,
                        isActive && styles.rankingItemActive,
                    ] }
                >
                    <View style={ styles.rankingNumber }>
                        <Text style={ styles.rankingNumberText }>
                            { (index ?? 0) + 1 }
                        </Text>
                    </View>

                    <Text style={ styles.rankingItemText }>{ item }</Text>
                    <View style={ styles.dragHandle }>
                        <Text style={ styles.dragHandleText }>≡</Text>
                    </View>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    }

    function handleToggleCheckbox(option: string) {
        const newCheckboxes = selectedCheckboxes.includes(option)
            ? selectedCheckboxes.filter((item) => item !== option)
            : [...selectedCheckboxes, option];

        setSelectedCheckboxes(newCheckboxes);
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion!.id]: {
                checkboxes: newCheckboxes,
                text: additionalText,
            },
        }));
    }

    function handleAdditionalTextChange(text: string) {
        setAdditionalText(text);
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion!.id]: {
                checkboxes: selectedCheckboxes,
                text: text,
            },
        }));
    }

    function handleNextFromRanking() {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion!.id]: rankedItems,
        }));

        // If this is the last question, start discovering
        if (isLastQuestion) {
            handleStartDiscovering();
        } else {
            handleNext();
        }
    }

    function animateTransition(callback: () => void) {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -20,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            callback();
            slideAnim.setValue(20);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    }

    function handleNext() {
        animateTransition(() => {
            setCurrentQuestionIndex((prev) =>
                Math.min(prev + 1, QUESTIONS.length - 1),
            );
        });
    }

    function handleBack() {
        if (currentQuestionIndex > 0) {
            animateTransition(() => {
                setCurrentQuestionIndex((prev) => prev - 1);
            });
        }
    }

    function handleStartDiscovering() {
        // Convert preference rankings to weights and save to user context
        const preferencesAnswer = answers['preferences'];
        if (preferencesAnswer && Array.isArray(preferencesAnswer)) {
            const preferenceWeights = convertRankingsToWeights(preferencesAnswer);

            // Update user with preferences
            setUser({
                id: user?.id || 'temp-user',
                name: user?.name || 'User',
                email: user?.email,
                preferences: preferenceWeights,
            });

            console.log('Saved preferences:', preferenceWeights);
        }

        AnimationPresets.buttonPress(buttonScale).start(() => {
            navigation.replace('MainTabs');
        });
    }

    return (
        <SafeAreaView style={ styles.container }>
            { !isWelcomeScreen && (
                <View style={ styles.progressBarContainer }>
                    <LinearGradient
                        colors={ Gradients.button.colors }
                        start={ Gradients.button.start }
                        end={ Gradients.button.end }
                        style={ [
                            styles.progressBarFill,
                            { width: `${progress * 100}%` },
                        ] }
                    />
                </View>
            ) }

            { isWelcomeScreen && (
                <WelcomeCarousel onAutoAdvance={ handleWelcomeAutoAdvance } />
            ) }

            { !isWelcomeScreen && currentQuestion && (
                <KeyboardAvoidingView
                    style={ { flex: 1 } }
                    behavior={ Platform.OS === 'ios' ? 'padding' : undefined }
                    keyboardVerticalOffset={ Platform.OS === 'ios' ? 100 : 0 }
                >
                    <Animated.View
                        style={ [
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim },
                                    { translateX: swipePosition },
                                ],
                            },
                        ] }
                        { ...panResponder.panHandlers }
                    >
                        <View style={ styles.questionContainer }>
                            <Text style={ styles.questionNumber }>
                                Question { currentQuestionIndex + 1 } of{ ' ' }
                                { QUESTIONS.length }{ ' ' }
                                { currentQuestionIndex > 0 && '✨' }
                            </Text>

                            <Text style={ styles.encouragementText }>
                                { currentQuestionIndex === 0
                                    ? getRandomMicrocopy([
                                        ...Microcopy.onboarding.steps,
                                    ])
                                    : getRandomMicrocopy([
                                        ...Microcopy.encouragement.general,
                                    ]) }
                            </Text>

                            <Text style={ styles.questionText }>
                                { currentQuestion.question }
                            </Text>
                        </View>

                        { /* Ranking questions use DraggableFlatList (VirtualizedList) directly */ }
                        { currentQuestion.type === 'ranking' ? (
                            <View style={ styles.rankingContainer }>
                                <Text style={ styles.rankingHint }>
                                    Drag ≡ to reorder
                                </Text>

                                <DraggableFlatList
                                    data={ rankedItems }
                                    onDragEnd={ ({ data }) => handleDragEnd(data) }
                                    keyExtractor={ (item) => item }
                                    renderItem={ renderRankingItem }
                                    containerStyle={ styles.draggableList }
                                    activationDistance={ 0 }
                                    scrollEnabled={ false }
                                    animationConfig={ {
                                        damping: 80,
                                        mass: 0.05,
                                        stiffness: 400,
                                        overshootClamping: false,
                                    } }
                                />

                                <TouchableOpacity
                                    style={ styles.continueButton }
                                    onPress={ handleNextFromRanking }
                                >
                                    <Text style={ styles.continueButtonText }>
                                        Continue →
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ScrollView
                                ref={ scrollViewRef }
                                style={ styles.scrollView }
                                contentContainerStyle={ styles.optionsContainer }
                                showsVerticalScrollIndicator={ false }
                                keyboardShouldPersistTaps="handled"
                                keyboardDismissMode="on-drag"
                            >
                                { /* Single Choice Question */ }
                                { currentQuestion.type === 'single_choice' &&
                                    currentQuestion.options && (
                                    <>
                                        { currentQuestion.options.map(
                                            (option, index) => {
                                                const isSelected =
                                                    currentAnswer === option;
                                                return (
                                                    <Animated.View
                                                        key={ option }
                                                        style={ {
                                                            transform: [
                                                                {
                                                                    scale:
                                                                        optionScales[
                                                                            index
                                                                        ] || 1,
                                                                },
                                                            ],
                                                        } }
                                                    >
                                                        <TouchableOpacity
                                                            style={ [
                                                                styles.optionButton,
                                                                isSelected &&
                                                                    styles.optionButtonSelected,
                                                            ] }
                                                            onPress={ () =>
                                                                handleAnswerSelect(
                                                                    currentQuestion.id,
                                                                    option,
                                                                    index,
                                                                )
                                                            }
                                                            activeOpacity={ 0.7 }
                                                        >
                                                            <View
                                                                style={
                                                                    styles.optionContent
                                                                }
                                                            >
                                                                <View
                                                                    style={ [
                                                                        styles.optionRadio,
                                                                        isSelected &&
                                                                            styles.optionRadioSelected,
                                                                    ] }
                                                                >
                                                                    { isSelected && (
                                                                        <View
                                                                            style={
                                                                                styles.optionRadioInner
                                                                            }
                                                                        />
                                                                    ) }
                                                                </View>

                                                                <Text
                                                                    style={ [
                                                                        styles.optionText,
                                                                        isSelected &&
                                                                            styles.optionTextSelected,
                                                                    ] }
                                                                >
                                                                    { option }
                                                                </Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </Animated.View>
                                                );
                                            },
                                        ) }

                                        { currentQuestion.hasOtherOption && (
                                            <View>
                                                <Animated.View
                                                    style={ {
                                                        transform: [
                                                            {
                                                                scale:
                                                                    optionScales[
                                                                        currentQuestion
                                                                            .options
                                                                            .length
                                                                    ] || 1,
                                                            },
                                                        ],
                                                    } }
                                                >
                                                    <TouchableOpacity
                                                        style={ [
                                                            styles.optionButton,
                                                            currentAnswer ===
                                                                'Other' &&
                                                                styles.optionButtonSelected,
                                                        ] }
                                                        onPress={ () => {
                                                            handleAnswerSelect(
                                                                currentQuestion.id,
                                                                'Other',
                                                                currentQuestion
                                                                    .options!
                                                                    .length,
                                                            );
                                                        } }
                                                        activeOpacity={ 0.7 }
                                                    >
                                                        <View
                                                            style={
                                                                styles.optionContent
                                                            }
                                                        >
                                                            <View
                                                                style={ [
                                                                    styles.optionRadio,
                                                                    currentAnswer ===
                                                                        'Other' &&
                                                                        styles.optionRadioSelected,
                                                                ] }
                                                            >
                                                                { currentAnswer ===
                                                                    'Other' && (
                                                                    <View
                                                                        style={
                                                                            styles.optionRadioInner
                                                                        }
                                                                    />
                                                                ) }
                                                            </View>

                                                            <Text
                                                                style={ [
                                                                    styles.optionText,
                                                                    currentAnswer ===
                                                                        'Other' &&
                                                                        styles.optionTextSelected,
                                                                ] }
                                                            >
                                                                Other
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </Animated.View>

                                                { currentAnswer === 'Other' && (
                                                    <View
                                                        style={
                                                            styles.otherInputContainer
                                                        }
                                                    >
                                                        <TextInput
                                                            style={
                                                                styles.textInput
                                                            }
                                                            placeholder="Please specify..."
                                                            placeholderTextColor={
                                                                colors.textLight
                                                            }
                                                            value={ otherText }
                                                            onChangeText={
                                                                setOtherText
                                                            }
                                                            autoFocus
                                                            returnKeyType="done"
                                                            onSubmitEditing={ () => {
                                                                if (
                                                                    otherText.trim()
                                                                ) {
                                                                    setAnswers(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [currentQuestion.id]:
                                                                                otherText,
                                                                        }),
                                                                    );
                                                                    Keyboard.dismiss();
                                                                    setTimeout(
                                                                        () =>
                                                                            handleNext(),
                                                                        300,
                                                                    );
                                                                }
                                                            } }
                                                        />
                                                    </View>
                                                ) }
                                            </View>
                                        ) }
                                    </>
                                ) }

                                { /* Text Input Question */ }
                                { currentQuestion.type === 'text' && (
                                    <View style={ styles.textQuestionContainer }>
                                        <TextInput
                                            style={ [
                                                styles.textInput,
                                                styles.multilineInput,
                                            ] }
                                            placeholder={
                                                currentQuestion.placeholder ||
                                                'Type your answer here...'
                                            }
                                            placeholderTextColor={
                                                colors.textLight
                                            }
                                            value={ additionalText }
                                            onChangeText={ (text) => {
                                                setAdditionalText(text);
                                                setAnswers((prev) => ({
                                                    ...prev,
                                                    [currentQuestion.id]: text,
                                                }));
                                            } }
                                            multiline
                                            numberOfLines={ 4 }
                                            textAlignVertical="top"
                                        />

                                        <TouchableOpacity
                                            style={ styles.skipButton }
                                            onPress={ handleStartDiscovering }
                                            activeOpacity={ 0.7 }
                                        >
                                            <Text style={ styles.skipButtonText }>
                                                Skip this question →
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) }

                                { /* Checkboxes + Text Question */ }
                                { currentQuestion.type === 'checkboxes_text' &&
                                currentQuestion.checkboxOptions && (
                                    <View style={ styles.checkboxContainer }>
                                        <Text style={ styles.checkboxHint }>
                                            Select any dietary restrictions
                                        </Text>
                                        { currentQuestion.checkboxOptions.map(
                                            (option) => {
                                                const isChecked =
                                                    selectedCheckboxes.includes(
                                                        option,
                                                    );
                                                return (
                                                    <TouchableOpacity
                                                        key={ option }
                                                        style={ [
                                                            styles.checkboxItem,
                                                            isChecked &&
                                                                styles.checkboxItemSelected,
                                                        ] }
                                                        onPress={ () =>
                                                            handleToggleCheckbox(
                                                                option,
                                                            )
                                                        }
                                                        activeOpacity={ 0.7 }
                                                    >
                                                        <View
                                                            style={ [
                                                                styles.checkbox,
                                                                isChecked &&
                                                                    styles.checkboxChecked,
                                                            ] }
                                                        >
                                                            { isChecked && (
                                                                <Text
                                                                    style={
                                                                        styles.checkmark
                                                                    }
                                                                >
                                                                    ✓
                                                                </Text>
                                                            ) }
                                                        </View>

                                                        <Text
                                                            style={ [
                                                                styles.checkboxText,
                                                                isChecked &&
                                                                    styles.checkboxTextSelected,
                                                            ] }
                                                        >
                                                            { option }
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            },
                                        ) }

                                        <TextInput
                                            style={ [
                                                styles.textInput,
                                                styles.multilineInput,
                                            ] }
                                            placeholder="Anything else? (e.g., nut allergy)"
                                            placeholderTextColor={
                                                colors.textLight
                                            }
                                            value={ additionalText }
                                            onChangeText={
                                                handleAdditionalTextChange
                                            }
                                            multiline
                                            numberOfLines={ 2 }
                                            textAlignVertical="top"
                                        />

                                        <TouchableOpacity
                                            style={ styles.skipButton }
                                            onPress={ handleStartDiscovering }
                                            activeOpacity={ 0.7 }
                                        >
                                            <Text style={ styles.skipButtonText }>
                                                Skip this question →
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) }
                            </ScrollView>
                        ) }

                        { isLastQuestion &&
                            ((currentQuestion.type === 'checkboxes_text' &&
                                (selectedCheckboxes.length > 0 ||
                                    additionalText.trim().length > 0)) ||
                                (currentQuestion.type === 'text' &&
                                    additionalText.trim().length > 0)) && (
                            <Animated.View
                                style={ {
                                    opacity: buttonOpacity,
                                    transform: [
                                        { translateY: buttonTranslateY },
                                        { scale: buttonScale },
                                    ],
                                } }
                            >
                                <TouchableOpacity
                                    onPress={ handleStartDiscovering }
                                    activeOpacity={ 0.8 }
                                >
                                    <LinearGradient
                                        colors={ Gradients.button.colors }
                                        start={ Gradients.button.start }
                                        end={ Gradients.button.end }
                                        style={ styles.startButton }
                                    >
                                        <Text
                                            style={ styles.startButtonText }
                                        >
                                            { getRandomMicrocopy([
                                                ...Microcopy.success
                                                    .completed,
                                            ]) }{ ' ' }
                                                🎉
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        ) }
                    </Animated.View>
                </KeyboardAvoidingView>
            ) }
        </SafeAreaView>
    );
}

const createStyles = (colors: typeof AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: colors.background,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: 60,
        justifyContent: 'space-between',
        paddingBottom: Spacing.xxl,
    },
    questionContainer: {
        marginBottom: Spacing.xxl,
    },
    questionNumber: {
        ...Typography.bodySmall,
        color: colors.accent,
        fontWeight: '600',
        marginBottom: Spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    encouragementText: {
        ...Typography.bodyMedium,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: Spacing.md,
        fontSize: 16,
    },
    questionText: {
        ...Typography.displaySmall,
        color: colors.textDark,
        fontSize: 32,
        lineHeight: 40,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    scrollView: {
        flex: 1,
    },
    optionsContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: Spacing.xl,
    },
    rankingScrollContent: {
        justifyContent: 'flex-start',
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.md,
    },
    optionButton: {
        backgroundColor: colors.white,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 2.5,
        borderColor: '#F0E8EC',
        marginBottom: Spacing.sm,
        ...Shadows.subtle,
    },
    optionButtonSelected: {
        borderColor: colors.primary,
        backgroundColor: '#FFF9F8',
        ...Shadows.warm,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionRadio: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2.5,
        borderColor: '#D8C4CC',
        marginRight: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },
    optionRadioSelected: {
        borderColor: colors.primary,
        borderWidth: 3,
    },
    optionRadioInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.primary,
    },
    optionText: {
        ...Typography.bodyLarge,
        color: colors.textDark,
        flex: 1,
        fontSize: 17,
    },
    optionTextSelected: {
        color: colors.textDark,
        fontWeight: '700',
    },
    otherInputContainer: {
        paddingBottom: Spacing.xxl,
    },
    textInput: {
        backgroundColor: colors.white,
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderColor: '#F0E8EC',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        fontSize: 16,
        color: colors.textDark,
        ...Shadows.subtle,
    },
    multilineInput: {
        minHeight: 60,
        marginTop: Spacing.sm,
    },
    rankingContainer: {
        paddingTop: 0,
        paddingBottom: Spacing.md,
    },
    rankingHint: {
        ...Typography.bodySmall,
        color: colors.textLight,
        textAlign: 'center',
        marginBottom: Spacing.sm,
        fontSize: 13,
    },
    draggableList: {
        flex: 0,
    },
    rankingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderColor: '#F0E8EC',
        marginBottom: Spacing.xs,
        ...Shadows.subtle,
    },
    rankingItemActive: {
        borderColor: colors.primary,
        backgroundColor: '#FFF9F8',
        ...Shadows.warm,
        elevation: 8,
    },
    rankingNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    rankingNumberText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '700',
    },
    rankingItemText: {
        flex: 1,
        fontSize: 15,
        color: colors.textDark,
        fontWeight: '600',
    },
    dragHandle: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Spacing.xs,
        backgroundColor: '#FFF9F8',
        borderRadius: BorderRadius.sm,
    },
    dragHandleText: {
        fontSize: 28,
        color: colors.primary,
        fontWeight: '700',
        opacity: 0.8,
    },
    continueButton: {
        backgroundColor: colors.primary,
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.pill,
        alignItems: 'center',
        marginTop: Spacing.md,
        ...Shadows.warm,
    },
    continueButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    textQuestionContainer: {
        gap: Spacing.md,
        paddingBottom: Spacing.md,
    },
    checkboxContainer: {
        gap: Spacing.xs,
        paddingBottom: Spacing.md,
    },
    checkboxHint: {
        ...Typography.bodySmall,
        color: colors.textLight,
        marginBottom: Spacing.xs,
        fontStyle: 'italic',
        fontSize: 12,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderColor: '#F0E8EC',
        marginBottom: Spacing.xs,
        ...Shadows.subtle,
    },
    checkboxItemSelected: {
        borderColor: colors.primary,
        backgroundColor: '#FFF9F8',
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 6,
        borderWidth: 2.5,
        borderColor: '#D8C4CC',
        marginRight: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },
    checkboxChecked: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    checkmark: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    checkboxText: {
        ...Typography.bodyLarge,
        color: colors.textDark,
        flex: 1,
        fontSize: 17,
    },
    checkboxTextSelected: {
        fontWeight: '700',
    },
    startButton: {
        paddingVertical: Spacing.lg + 2,
        paddingHorizontal: Spacing.xxl,
        borderRadius: BorderRadius.pill,
        alignItems: 'center',
        marginTop: Spacing.xl,
        ...Shadows.warm,
    },
    startButtonText: {
        ...Typography.button,
        color: colors.textDark,
        fontSize: 19,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    skipButton: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.lg,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.textLight,
    },
    skipButtonText: {
        color: colors.textLight,
        fontSize: 16,
        fontWeight: '600',
    },
});

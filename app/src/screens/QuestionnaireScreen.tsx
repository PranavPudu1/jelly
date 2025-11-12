import { useState, useRef, useContext, useEffect } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    PanResponder,
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../App';

import {
    AppColors,
    Typography,
    Spacing,
    BorderRadius,
    AnimationPresets,
    AnimationDuration,
    SpringConfig,
    Shadows,
    Gradients,
    Microcopy,
    getRandomMicrocopy,
} from '../theme';
import { QuestionnaireAnswers } from '../types';
import { QUESTIONS } from '../data/questions';
import { UserContext } from '../contexts/userContext';
import WelcomeCarousel from '../components/WelcomeCarousel';
import { LinearGradient } from 'expo-linear-gradient';

type QuestionnaireScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Questionnaire'>;
};

export default function QuestionnaireScreen({
    navigation,
}: QuestionnaireScreenProps) {
    const { user } = useContext(UserContext);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(user === null ? -1 : 0); // -1 = welcome screen

    const [answers, setAnswers] = useState<QuestionnaireAnswers>({});

    const [fadeAnim] = useState(new Animated.Value(1));
    const [slideAnim] = useState(new Animated.Value(0));
    const [buttonOpacity] = useState(new Animated.Value(0));
    const [buttonTranslateY] = useState(new Animated.Value(20));
    const [buttonScale] = useState(new Animated.Value(1));
    const [optionScales] = useState(
        QUESTIONS[0]?.options.map(() => new Animated.Value(1)) || []
    );

    const swipePosition = useRef(new Animated.Value(0)).current;

    // PanResponder for swipe gestures
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !isWelcomeScreen,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only respond to horizontal swipes when not on welcome screen
                return !isWelcomeScreen && Math.abs(gestureState.dx) > 10;
            },
            onPanResponderMove: (_, gestureState) => {
                // Only allow left swipe to go back (positive dx)
                if (gestureState.dx > 0 && currentQuestionIndex > 0) {
                    swipePosition.setValue(gestureState.dx);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                // If swiped left more than 100px, go back
                if (gestureState.dx > 100 && currentQuestionIndex > 0) {
                    handleBack();
                }
                // Reset swipe position
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

    // Animate the "Start Discovering" button when it appears
    useEffect(() => {
        if (isLastQuestion && currentAnswer) {
            // Reset and animate in with dreamy animation
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
    }, [isLastQuestion, currentAnswer, buttonOpacity, buttonTranslateY, buttonScale]);

    function handleAnswerSelect(questionId: string, option: string, optionIndex: number) {
        // Animate the selected option with playful squish
        if (optionScales[optionIndex]) {
            AnimationPresets.buttonPress(optionScales[optionIndex]).start();
        }

        setAnswers((prev) => ({
            ...prev,
            [questionId]: option,
        }));

        // Auto-advance to next question after a short delay
        setTimeout(() => {
            if (!isLastQuestion) {
                handleNext();
            }
        }, 300);
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
        // Animate button press with playful squish
        AnimationPresets.buttonPress(buttonScale).start(() => {
            // TODO: Save preferences for restaurant filtering
            navigation.replace('MainTabs');
        });
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Progress Bar */}
            {!isWelcomeScreen && (
                <View style={styles.progressBarContainer}>
                    <LinearGradient
                        colors={Gradients.button.colors}
                        start={Gradients.button.start}
                        end={Gradients.button.end}
                        style={[
                            styles.progressBarFill,
                            { width: `${progress * 100}%` },
                        ]}
                    />
                </View>
            )}

            {/* Welcome Screen */}
            {isWelcomeScreen && (
                <WelcomeCarousel onAutoAdvance={handleWelcomeAutoAdvance} />
            )}

            {/* Question Content */}
            {!isWelcomeScreen && currentQuestion && (
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { translateY: slideAnim },
                                { translateX: swipePosition },
                            ],
                        },
                    ]}
                    {...panResponder.panHandlers}
                >
                    <View style={styles.questionContainer}>
                        <Text style={styles.questionNumber}>
                            Question {currentQuestionIndex + 1} of{' '}
                            {QUESTIONS.length} {currentQuestionIndex > 0 && '✨'}
                        </Text>
                        <Text style={styles.encouragementText}>
                            {currentQuestionIndex === 0
                                ? getRandomMicrocopy([...Microcopy.onboarding.steps])
                                : getRandomMicrocopy([...Microcopy.encouragement.general])}
                        </Text>
                        <Text style={styles.questionText}>
                            {currentQuestion.question}
                        </Text>
                        {/* Decorative squiggly line */}
                        <View style={styles.squigglyLineContainer}>
                            <View style={styles.squigglyLine}>
                                {[...Array(8)].map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.squiggleDot,
                                            {
                                                transform: [
                                                    {
                                                        translateY:
                                                            Math.sin(
                                                                (i * Math.PI) /
                                                                    2,
                                                            ) * 3,
                                                    },
                                                ],
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.optionsContainer}>
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = currentAnswer === option;
                            return (
                                <Animated.View
                                    key={option}
                                    style={{
                                        transform: [{ scale: optionScales[index] || 1 }],
                                    }}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.optionButton,
                                            isSelected &&
                                                styles.optionButtonSelected,
                                        ]}
                                        onPress={() =>
                                            handleAnswerSelect(
                                                currentQuestion.id,
                                                option,
                                                index,
                                            )
                                        }
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.optionContent}>
                                            <View
                                                style={[
                                                    styles.optionRadio,
                                                    isSelected &&
                                                        styles.optionRadioSelected,
                                                ]}
                                            >
                                                {isSelected && (
                                                    <View
                                                        style={
                                                            styles.optionRadioInner
                                                        }
                                                    />
                                                )}
                                            </View>

                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    isSelected &&
                                                        styles.optionTextSelected,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>

                    {/* Start Discovering Button (only on last question) */}
                    {isLastQuestion && currentAnswer && (
                        <Animated.View
                            style={{
                                opacity: buttonOpacity,
                                transform: [
                                    { translateY: buttonTranslateY },
                                    { scale: buttonScale },
                                ],
                            }}
                        >
                            <TouchableOpacity
                                onPress={handleStartDiscovering}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={Gradients.button.colors}
                                    start={Gradients.button.start}
                                    end={Gradients.button.end}
                                    style={styles.startButton}
                                >
                                    <Text style={styles.startButtonText}>
                                        {getRandomMicrocopy([...Microcopy.success.completed])} 🎉
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9F8',
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: AppColors.background,
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
        color: AppColors.accent,
        fontWeight: '600',
        marginBottom: Spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    encouragementText: {
        ...Typography.bodyMedium,
        color: AppColors.primary,
        fontWeight: '600',
        marginBottom: Spacing.md,
        fontSize: 16,
    },
    questionText: {
        ...Typography.displaySmall,
        color: AppColors.textDark,
        fontSize: 32,
        lineHeight: 40,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    squigglyLineContainer: {
        marginTop: Spacing.md,
        alignItems: 'flex-start',
    },
    squigglyLine: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 8,
    },
    squiggleDot: {
        width: 14,
        height: 3,
        backgroundColor: AppColors.primary,
        marginHorizontal: 1,
        borderRadius: 2,
        opacity: 0.7,
    },
    optionsContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: Spacing.md,
    },
    optionButton: {
        backgroundColor: AppColors.white,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 2.5,
        borderColor: '#F0E8EC',
        marginBottom: Spacing.sm,
        ...Shadows.subtle,
    },
    optionButtonSelected: {
        borderColor: AppColors.primary,
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
        backgroundColor: AppColors.white,
    },
    optionRadioSelected: {
        borderColor: AppColors.primary,
        borderWidth: 3,
    },
    optionRadioInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: AppColors.primary,
    },
    optionText: {
        ...Typography.bodyLarge,
        color: AppColors.textDark,
        flex: 1,
        fontSize: 17,
    },
    optionTextSelected: {
        color: AppColors.textDark,
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
        color: AppColors.textDark,
        fontSize: 19,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});

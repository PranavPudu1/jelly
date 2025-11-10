import { useState, useEffect, useRef } from 'react';

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

import { AppColors, Typography, Spacing, BorderRadius } from '../theme';
import { QuestionnaireAnswers } from '../types';
import { QUESTIONS } from '../data/questions';

type QuestionnaireScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Questionnaire'>;
};

export default function QuestionnaireScreen({
    navigation,
}: QuestionnaireScreenProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 = welcome screen
    const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
    const [carouselIndex, setCarouselIndex] = useState(0);

    const [fadeAnim] = useState(new Animated.Value(1));
    const [slideAnim] = useState(new Animated.Value(0));
    const carouselFadeAnim = useRef(new Animated.Value(1)).current;
    const swipePosition = useRef(new Animated.Value(0)).current;

    const carouselWords = ['lunch', 'brunch', 'dinner', 'date spot'];

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

    // Carousel animation for welcome screen
    useEffect(() => {
        if (currentQuestionIndex === -1) {
            const interval = setInterval(() => {
                Animated.sequence([
                    Animated.timing(carouselFadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(carouselFadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();

                setCarouselIndex((prev) => (prev + 1) % carouselWords.length);
            }, 800);

            // Auto-advance to first question after 3 seconds
            const autoAdvance = setTimeout(() => {
                setCurrentQuestionIndex(0);
            }, 3500);

            return () => {
                clearInterval(interval);
                clearTimeout(autoAdvance);
            };
        }
    }, [currentQuestionIndex, carouselFadeAnim, carouselWords.length]);

    const isWelcomeScreen = currentQuestionIndex === -1;
    const currentQuestion = !isWelcomeScreen
        ? QUESTIONS[currentQuestionIndex]
        : null;

    const progress = isWelcomeScreen
        ? 0
        : (currentQuestionIndex + 1) / QUESTIONS.length;
    const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
    const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

    function handleAnswerSelect(questionId: string, option: string) {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: option,
        }));

        // Auto-advance to next question after a short delay
        setTimeout(() => {
            if (!isLastQuestion) {
                handleNext();
            }
        }, 100);
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
        // TODO: Save preferences for restaurant filtering
        navigation.replace('Swipe');
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Progress Bar */}
            {!isWelcomeScreen && (
                <View style={styles.progressBarContainer}>
                    <Animated.View
                        style={[
                            styles.progressBarFill,
                            { width: `${progress * 100}%` },
                        ]}
                    />
                </View>
            )}

            {/* Welcome Screen */}
            {isWelcomeScreen && (
                <View style={styles.welcomeContainer}>
                    <View style={styles.welcomeContent}>
                        <Text style={styles.welcomeText}>
                            Welcome to Jelly!
                        </Text>
                        <View style={styles.carouselContainer}>
                            <Text style={styles.carouselText}>
                                Let's find your next{' '}
                            </Text>
                            <Animated.Text
                                style={[
                                    styles.carouselWord,
                                    { opacity: carouselFadeAnim },
                                ]}
                            >
                                {carouselWords[carouselIndex]}
                            </Animated.Text>
                        </View>
                    </View>
                </View>
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
                            {QUESTIONS.length}
                        </Text>
                        <Text style={styles.questionText}>
                            {currentQuestion.question}
                        </Text>
                    </View>

                    <View style={styles.optionsContainer}>
                        {currentQuestion.options.map((option) => {
                            const isSelected = currentAnswer === option;
                            return (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.optionButton,
                                        isSelected &&
                                            styles.optionButtonSelected,
                                    ]}
                                    onPress={() =>
                                        handleAnswerSelect(
                                            currentQuestion.id,
                                            option,
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
                            );
                        })}
                    </View>

                    {/* Start Discovering Button (only on last question) */}
                    {isLastQuestion && currentAnswer && (
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={handleStartDiscovering}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.startButtonText}>
                                Start Discovering
                            </Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.white, // TODO
    },
    welcomeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    welcomeContent: {
        alignItems: 'center',
    },
    welcomeText: {
        ...Typography.displayLarge,
        fontSize: 42,
        fontWeight: '700',
        color: AppColors.textDark,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    carouselContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        minHeight: 60,
    },
    carouselText: {
        ...Typography.displaySmall,
        fontSize: 28,
        fontWeight: '600',
        color: AppColors.textDark,
        textAlign: 'center',
    },
    carouselWord: {
        ...Typography.displaySmall,
        fontSize: 28,
        fontWeight: '700',
        color: AppColors.primary,
        textAlign: 'center',
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: AppColors.accent,
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: AppColors.primary,
        borderRadius: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: 80,
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
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    questionText: {
        ...Typography.displaySmall,
        color: AppColors.textDark,
        fontSize: 28,
        lineHeight: 36,
        fontWeight: '700',
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
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderColor: '#E5E5E5',
        marginBottom: Spacing.sm,
    },
    optionButtonSelected: {
        borderColor: AppColors.primary,
        backgroundColor: '#FFF9F8',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionRadio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D0D0D0',
        marginRight: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionRadioSelected: {
        borderColor: AppColors.primary,
    },
    optionRadioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: AppColors.primary,
    },
    optionText: {
        ...Typography.bodyLarge,
        color: AppColors.textDark,
        flex: 1,
    },
    optionTextSelected: {
        color: AppColors.textDark,
        fontWeight: '600',
    },
    startButton: {
        backgroundColor: AppColors.primary,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xxl,
        borderRadius: BorderRadius.pill,
        alignItems: 'center',
        marginTop: Spacing.xl,
        shadowColor: AppColors.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    startButtonText: {
        ...Typography.button,
        color: AppColors.textDark,
        fontSize: 18,
        fontWeight: '700',
    },
});

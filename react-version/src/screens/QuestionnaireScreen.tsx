import { useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

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
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<QuestionnaireAnswers>({});

    const [fadeAnim] = useState(new Animated.Value(1));
    const [slideAnim] = useState(new Animated.Value(0));

    const currentQuestion = QUESTIONS[currentQuestionIndex];

    const progress = (currentQuestionIndex + 1) / QUESTIONS.length;
    const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
    const currentAnswer = answers[currentQuestion.id];

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
        }, 400);
    }

    function animateTransition(callback: () => void) {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -20,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            callback();
            slideAnim.setValue(20);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
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
            <View style={styles.progressBarContainer}>
                <Animated.View
                    style={[
                        styles.progressBarFill,
                        { width: `${progress * 100}%` },
                    ]}
                />
            </View>

            {/* Question Content */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
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
                                    isSelected && styles.optionButtonSelected,
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
                                                style={styles.optionRadioInner}
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

                {/* Back Button */}
                {currentQuestionIndex > 0 && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={28}
                            color={AppColors.primary}
                        />
                    </TouchableOpacity>
                )}

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.white, // TODO
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
    backButton: {
        position: 'absolute',
        bottom: 20,
        left: Spacing.lg,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: AppColors.background,
        alignItems: 'center',
        justifyContent: 'center',
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

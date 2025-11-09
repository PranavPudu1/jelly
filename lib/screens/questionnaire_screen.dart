import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'swipe_screen.dart';

class QuestionnaireScreen extends StatefulWidget {
  const QuestionnaireScreen({super.key});

  @override
  State<QuestionnaireScreen> createState() => _QuestionnaireScreenState();
}

class _QuestionnaireScreenState extends State<QuestionnaireScreen> {
  final Map<String, String?> _answers = {
    'cuisine': null,
    'ambiance': null,
    'price': null,
  };

  final List<Question> _questions = [
    Question(
      id: 'cuisine',
      question: "Food vibe?",
      options: [
        'Something fancy',
        'Sushi & sake night',
        'Tacos & margs',
        'Burgers & fries',
        'I\'ll try anything new',
      ],
    ),
    Question(
      id: 'ambiance',
      question: "What's tonight's vibe?",
      options: [
        'Romantic',
        'Cozy & candlelit',
        'Lively & social',
        'Chill & quiet',
        'Trendy & photogenic',
      ],
    ),
    Question(
      id: 'price',
      question: "How's your wallet feeling today?",
      options: [
        'Keeping it low-key',
        'Mid-range sounds right',
        'Treat-yourself kinda night',
        'Sky\'s the limit',
      ],
    ),
  ];

  bool get _allQuestionsAnswered {
    return _answers.values.every((answer) => answer != null);
  }

  void _selectAnswer(String questionId, String answer) {
    setState(() {
      _answers[questionId] = answer;
    });
  }

  void _continueToSwipe() {
    if (_allQuestionsAnswered) {
      // TODO: Save preferences for restaurant filtering
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const SwipeScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(color: AppColors.primary),
        child: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: CustomScrollView(
                  slivers: [
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(24, 20, 24, 40),
                        child: Text(
                          'Let\'s personalize\nyour experience',
                          style: Theme.of(context).textTheme.displayLarge?.copyWith(
                            color: AppColors.textDark,
                            fontSize: 24,
                            fontWeight: FontWeight.w600,
                            letterSpacing: -1,
                            height: 1.2,
                          ),
                        ),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final question = _questions[index];
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 32.0),
                              child: _QuestionCard(
                                question: question,
                                selectedAnswer: _answers[question.id],
                                onAnswerSelected: (answer) {
                                  _selectAnswer(question.id, answer);
                                },
                              ),
                            );
                          },
                          childCount: _questions.length,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: AnimatedOpacity(
                  opacity: _allQuestionsAnswered ? 1.0 : 0.5,
                  duration: const Duration(milliseconds: 300),
                  child: Container(
                    width: double.infinity,
                    height: 58,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: _allQuestionsAnswered
                          ? [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.3),
                                blurRadius: 20,
                                offset: const Offset(0, 10),
                              ),
                            ]
                          : [],
                    ),
                    child: ElevatedButton(
                      onPressed: _allQuestionsAnswered
                          ? _continueToSwipe
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.background,
                        foregroundColor: AppColors.background,
                        disabledBackgroundColor: AppColors.background,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                        elevation: 0,
                      ),
                      child: Text(
                        'Start Discovering',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(
                              color: AppColors.text,
                              fontWeight: FontWeight.w600,
                              fontSize: 17,
                              letterSpacing: 0.3,
                            ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuestionCard extends StatelessWidget {
  final Question question;
  final String? selectedAnswer;
  final Function(String) onAnswerSelected;

  const _QuestionCard({
    required this.question,
    required this.selectedAnswer,
    required this.onAnswerSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          question.question,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppColors.textDark,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 16),
        ...question.options.map((option) {
          final isSelected = selectedAnswer == option;
          return Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: InkWell(
              onTap: () => onAnswerSelected(option),
              borderRadius: BorderRadius.circular(16),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
                decoration: BoxDecoration(
                  color: Colors.transparent,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? AppColors.accent : AppColors.background,
                    width: 2,
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        option,
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppColors.textDark,
                          fontSize: 16,
                          fontWeight: isSelected
                              ? FontWeight.w600
                              : FontWeight.w500,
                        ),
                      ),
                    ),
                    if (isSelected)
                      Icon(
                        Icons.check_circle,
                        color: AppColors.textDark,
                        size: 24,
                      ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ],
    );
  }
}

class Question {
  final String id;
  final String question;
  final List<String> options;

  Question({required this.id, required this.question, required this.options});
}

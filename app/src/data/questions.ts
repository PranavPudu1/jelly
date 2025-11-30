import { Question } from '../types';

export const QUESTIONS: Question[] = [
    {
        id: 'looking_for',
        question: 'What are you looking for?',
        type: 'single_choice',
        options: [
            'Restaurant',
            'Sweet Treat',
            'Coffee Shop',
        ],
        hasOtherOption: true,
    },
    {
        id: 'preferences',
        question: 'Rank your preferences',
        type: 'ranking',
        items: [
            'Food Quality',
            'Ambiance',
            'Proximity',
            'Price',
            'Reviews',
        ],
    },
    {
        id: 'additional_info',
        question: 'Anything else we should know?',
        type: 'text',
        placeholder: 'Let us know the occasion, dietary needs (vegetarian, gluten-free), or any other preferences...',
    },
];

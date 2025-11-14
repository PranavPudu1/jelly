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
            'Food Variety',
            'Ambiance',
            'Proximity',
            'Nearby Vibe',
            'Price',
            'Reviews',
        ],
    },
    {
        id: 'additional_info',
        question: 'Anything else you want to let us know?',
        type: 'checkboxes_text',
        checkboxOptions: [
            'Vegetarian',
            'Gluten Free',
        ],
    },
];

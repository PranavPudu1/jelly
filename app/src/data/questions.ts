import { Question } from '../types';

export const QUESTIONS: Question[] = [
    {
        id: 'food_vibe',
        question: 'Food vibe?',
        options: [
            'Something fancy',
            'Sushi & sake night',
            'Tacos & margs',
            'Burgers & fries',
            'I\'ll try anything new',
        ],
    },
    {
        id: 'ambiance',
        question: 'What\'s tonight\'s vibe?',
        options: [
            'Romantic',
            'Cozy & candlelit',
            'Lively & social',
            'Chill & quiet',
            'Trendy & photogenic',
        ],
    },
    {
        id: 'budget',
        question: 'How\'s your wallet feeling today?',
        options: [
            'Keeping it low-key',
            'Mid-range sounds right',
            'Treat-yourself kinda night',
            'Sky\'s the limit',
        ],
    },
];

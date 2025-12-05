import { Question } from '../types';

export const QUESTIONS: Question[] = [
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
];

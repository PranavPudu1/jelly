import { Restaurant } from '../types';

export const MOCK_RESTAURANTS: Restaurant[] = [
    {
        id: '1',
        name: 'The Garden Bistro',
        rating: 4.5,
        priceLevel: '$$$',
        cuisine: 'French Contemporary',
        heroImageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        ambientImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        reviewQuote: 'An absolute gem! The ambiance is perfect for a romantic evening.',
        reviewAuthor: 'Sarah M.',
        infoList: [
            { label: 'Location', value: 'Downtown', icon: 'location' },
            { label: 'Bar', value: 'Full Bar', icon: 'glass' },
            { label: 'Live Music', value: 'Weekends', icon: 'musical-notes' },
            { label: 'Kid-Friendly', value: 'Yes', icon: 'happy' },
        ],
        instagramHandle: '@gardenbistro',
        tiktokHandle: '@gardenbistroofficial',
        foodItems: [
            {
                name: 'Beef Wellington',
                images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'],
                reviews: [
                    {
                        author: 'Mike R.',
                        quote: 'The best beef wellington I have ever tasted. Perfectly cooked!',
                        rating: 5,
                    },
                ],
            },
            {
                name: 'Truffle Pasta',
                images: ['https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400'],
                reviews: [
                    {
                        author: 'Emma L.',
                        quote: 'Rich and creamy with just the right amount of truffle.',
                        rating: 4.5,
                    },
                ],
            },
        ],
        ambiencePhotos: [
            { imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' },
            { imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800' },
            { imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800' },
        ],
        reviews: [
            {
                author: 'Sarah M.',
                quote: 'An absolute gem! The ambiance is perfect for a romantic evening.',
                rating: 5,
            },
            {
                author: 'David K.',
                quote: 'Outstanding food and impeccable service. Will definitely return!',
                rating: 4.5,
            },
            {
                author: 'Jessica P.',
                quote: 'The atmosphere is cozy and intimate. Perfect for special occasions.',
                rating: 5,
            },
        ],
        menuImages: [
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
        ],
        popularDishPhotos: [
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
            'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600',
            'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600',
        ],
    },
    {
        id: '2',
        name: 'Sakura Sushi House',
        rating: 4.8,
        priceLevel: '$$$$',
        cuisine: 'Japanese Omakase',
        heroImageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
        ambientImageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        reviewQuote: 'The freshest sushi in town. A true authentic experience!',
        reviewAuthor: 'John T.',
        infoList: [
            { label: 'Location', value: 'Midtown', icon: 'location' },
            { label: 'Bar', value: 'Sake Bar', icon: 'glass' },
            { label: 'Live Music', value: 'No', icon: 'musical-notes' },
            { label: 'Kid-Friendly', value: 'Limited', icon: 'happy' },
        ],
        instagramHandle: '@sakurasushi',
        tiktokHandle: '@sakurasushihouse',
        foodItems: [
            {
                name: 'Omakase Selection',
                images: ['https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400'],
                reviews: [
                    {
                        author: 'Lisa W.',
                        quote: 'Every piece was perfection. The chef knows his craft!',
                        rating: 5,
                    },
                ],
            },
            {
                name: 'Toro Nigiri',
                images: ['https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400'],
                reviews: [
                    {
                        author: 'Chris B.',
                        quote: 'Melts in your mouth. Worth every penny!',
                        rating: 5,
                    },
                ],
            },
        ],
        ambiencePhotos: [
            { imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800' },
            { imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800' },
        ],
        reviews: [
            {
                author: 'John T.',
                quote: 'The freshest sushi in town. A true authentic experience!',
                rating: 5,
            },
            {
                author: 'Amanda R.',
                quote: 'Exceptional quality and presentation. A must-visit for sushi lovers.',
                rating: 4.8,
            },
        ],
        menuImages: [
            'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600',
        ],
        popularDishPhotos: [
            'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600',
            'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600',
        ],
    },
    {
        id: '3',
        name: 'Taco Fiesta',
        rating: 4.3,
        priceLevel: '$$',
        cuisine: 'Mexican Street Food',
        heroImageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
        ambientImageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
        reviewQuote: 'Vibrant atmosphere and authentic flavors. Love the margaritas!',
        reviewAuthor: 'Maria G.',
        infoList: [
            { label: 'Location', value: 'Arts District', icon: 'location' },
            { label: 'Bar', value: 'Tequila Bar', icon: 'glass' },
            { label: 'Live Music', value: 'Daily', icon: 'musical-notes' },
            { label: 'Kid-Friendly', value: 'Yes', icon: 'happy' },
        ],
        instagramHandle: '@tacofiesta',
        tiktokHandle: '@tacofiestamx',
        foodItems: [
            {
                name: 'Street Tacos',
                images: ['https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400'],
                reviews: [
                    {
                        author: 'Carlos M.',
                        quote: 'Just like abuela used to make! Authentic and delicious.',
                        rating: 5,
                    },
                ],
            },
        ],
        ambiencePhotos: [
            { imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800' },
        ],
        reviews: [
            {
                author: 'Maria G.',
                quote: 'Vibrant atmosphere and authentic flavors. Love the margaritas!',
                rating: 4.5,
            },
        ],
        menuImages: [
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600',
        ],
        popularDishPhotos: [
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600',
        ],
    },
];

/**
 * Database Seeding Script
 * Populates Firestore with sample restaurant data
 */

import { initializeFirebase, COLLECTIONS } from '../config/firebase.config';
import { Restaurant } from '../models/restaurant.model';

const sampleRestaurants: Omit<Restaurant, 'id'>[] = [
    {
        name: 'Sushi Garden',
        tagline: 'Experience authentic Japanese sushi artistry',
        location: 'East Village, NYC',
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
        additionalPhotos: [
            'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
            'https://images.unsplash.com/photo-1563612116625-3012372fccce',
            'https://images.unsplash.com/photo-1559058922-7a2c81b17f46',
        ],
        popularItems: [
            { name: 'Dragon Roll', price: '$18', emoji: '🐉', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351' },
            { name: 'Omakase', price: '$85', emoji: '🍱', imageUrl: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a' },
            { name: 'Sake Flight', price: '$24', emoji: '🍶', imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9' },
        ],
        reviews: [
            { text: 'Best sushi in NYC. The omakase was incredible!', author: 'Sarah M.' },
            { text: 'Fresh fish, authentic flavors. Will be back!', author: 'James K.' },
        ],
        ambianceTags: ['Intimate', 'Authentic', 'Date Night'],
        reservationInfo: 'Walk-ins welcome. Reservations recommended for dinner.',
        priceRange: '$$$',
        cuisine: 'Japanese',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Taco Theory',
        tagline: 'Modern Mexican fusion with bold flavors',
        location: 'Mission District, SF',
        imageUrl: 'https://images.unsplash.com/photo-1599974579688-8dbdd335e3d3',
        additionalPhotos: [
            'https://images.unsplash.com/photo-1599974579688-8dbdd335e3d3',
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
            'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85',
        ],
        popularItems: [
            { name: 'Korean BBQ Tacos', price: '$14', emoji: '🌮', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47' },
            { name: 'Spicy Margarita', price: '$12', emoji: '🍹', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b' },
            { name: 'Street Corn', price: '$8', emoji: '🌽', imageUrl: 'https://images.unsplash.com/photo-1551462147-37d3e2990253' },
        ],
        reviews: [
            { text: 'Innovative takes on classic tacos. Love the fusion!', author: 'Alex R.' },
            { text: 'Great vibe, amazing cocktails, creative menu.', author: 'Maria G.' },
        ],
        ambianceTags: ['Trendy', 'Lively', 'Creative'],
        reservationInfo: 'First come, first served. Expect a wait during peak hours.',
        priceRange: '$$',
        cuisine: 'Mexican Fusion',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Pasta Lab',
        tagline: 'Handcrafted pasta made fresh daily',
        location: 'West Loop, Chicago',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
        additionalPhotos: [
            'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
            'https://images.unsplash.com/photo-1612940960267-4549a58fb257',
            'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb',
        ],
        popularItems: [
            { name: 'Truffle Carbonara', price: '$22', emoji: '🍝', imageUrl: 'https://images.unsplash.com/photo-1612940960267-4549a58fb257' },
            { name: 'Burrata', price: '$16', emoji: '🧀', imageUrl: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc' },
            { name: 'Tiramisu', price: '$10', emoji: '🍰', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9' },
        ],
        reviews: [
            { text: 'Pasta perfection! You can taste the quality.', author: 'David L.' },
            {
                text: 'Best Italian outside of Italy. The carbonara is life-changing.',
                author: 'Emma W.',
            },
        ],
        ambianceTags: ['Romantic', 'Elegant', 'Cozy'],
        reservationInfo: 'Reservations required. Book 2 weeks in advance.',
        priceRange: '$$$',
        cuisine: 'Italian Contemporary',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Burger Haus',
        tagline: 'Elevated burgers with a European twist',
        location: 'Brooklyn, NYC',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        additionalPhotos: [
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
            'https://images.unsplash.com/photo-1550547660-d9450f859349',
            'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5',
        ],
        popularItems: [
            { name: 'Truffle Burger', price: '$19', emoji: '🍔', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' },
            { name: 'Loaded Fries', price: '$9', emoji: '🍟', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877' },
            { name: 'Craft Beer', price: '$8', emoji: '🍺', imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9' },
        ],
        reviews: [
            { text: 'These are not your average burgers. Premium quality!', author: 'Mike T.' },
            {
                text: 'Great beer selection and the truffle fries are addictive.',
                author: 'Lisa P.',
            },
        ],
        ambianceTags: ['Casual', 'Hip', 'Fun'],
        reservationInfo: 'No reservations. Counter service.',
        priceRange: '$$',
        cuisine: 'American',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Pho King',
        tagline: 'Authentic Vietnamese soul food',
        location: 'Little Saigon, OC',
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43',
        additionalPhotos: [
            'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43',
            'https://images.unsplash.com/photo-1555126634-323283e090fa',
            'https://images.unsplash.com/photo-1559510981-10719ce4266a',
        ],
        popularItems: [
            { name: 'Pho Bo', price: '$14', emoji: '🍜', imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43' },
            { name: 'Banh Mi', price: '$9', emoji: '🥖', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea' },
            { name: 'Iced Coffee', price: '$5', emoji: '☕', imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7' },
        ],
        reviews: [
            { text: 'Most authentic pho outside of Vietnam. Incredible broth!', author: 'Tran N.' },
            { text: 'Family-run gem. Always fresh, always delicious.', author: 'Kevin H.' },
        ],
        ambianceTags: ['Authentic', 'Casual', 'Family-Friendly'],
        reservationInfo: 'Walk-ins only. Cash preferred.',
        priceRange: '$',
        cuisine: 'Vietnamese',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

/**
 * Seed the database with sample restaurants
 */
const seedDatabase = async (): Promise<void> => {
    try {
        console.log('🌱 Starting database seeding...');

        const db = initializeFirebase();

        for (const restaurant of sampleRestaurants) {
            const docRef = await db.collection(COLLECTIONS.RESTAURANTS).add(restaurant);
            console.log(`✅ Created restaurant: ${restaurant.name} (ID: ${docRef.id})`);
        }

        console.log('🎉 Database seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();

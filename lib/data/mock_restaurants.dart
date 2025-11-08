import '../models/restaurant.dart';

class MockRestaurants {
  static final List<Restaurant> restaurants = [
    const Restaurant(
      name: 'Sushi Garden',
      tagline: 'Fresh rolls and minimalist vibes',
      location: 'East Village, NYC',
      imageUrl: 'https://picsum.photos/600/800?random=1',
      priceRange: '\$\$\$',
      cuisine: 'Japanese',
      additionalPhotos: [
        'https://picsum.photos/600/400?random=11',
        'https://picsum.photos/600/400?random=12',
      ],
      popularItems: [
        MenuItem(name: 'Omakase Platter', price: '\$85', emoji: '🍣'),
        MenuItem(name: 'Toro Nigiri', price: '\$22', emoji: '🐟'),
        MenuItem(name: 'Miso Black Cod', price: '\$38', emoji: '🐠'),
      ],
      reviews: [
        Review(
          text: 'Best sushi outside of Tokyo. The fish melts in your mouth.',
          author: 'Sarah M.',
        ),
        Review(
          text: 'Minimalist decor, maximum flavor. Chef\'s selection was incredible.',
          author: 'James K.',
        ),
      ],
      ambianceTags: ['Intimate', 'Modern', 'Date Night'],
      reservationInfo: 'Reservations recommended • Opens at 5:30 PM',
    ),
    const Restaurant(
      name: 'Taco Theory',
      tagline: 'Street tacos reinvented',
      location: 'Mission District, SF',
      imageUrl: 'https://picsum.photos/600/800?random=2',
      priceRange: '\$\$',
      cuisine: 'Mexican Fusion',
      additionalPhotos: [
        'https://picsum.photos/600/400?random=21',
        'https://picsum.photos/600/400?random=22',
      ],
      popularItems: [
        MenuItem(name: 'Korean BBQ Taco', price: '\$6', emoji: '🌮'),
        MenuItem(name: 'Baja Fish Taco', price: '\$7', emoji: '🐟'),
        MenuItem(name: 'Elote Bowl', price: '\$12', emoji: '🌽'),
      ],
      reviews: [
        Review(
          text: 'Fusion done right. The Korean BBQ taco is life-changing.',
          author: 'Alex P.',
        ),
      ],
      ambianceTags: ['Casual', 'Vibrant', 'Group-Friendly'],
      reservationInfo: 'Walk-ins only • Open till midnight',
    ),
    const Restaurant(
      name: 'Pasta Lab',
      tagline: 'Experimental Italian comfort food',
      location: 'West Loop, Chicago',
      imageUrl: 'https://picsum.photos/600/800?random=3',
      priceRange: '\$\$\$',
      cuisine: 'Italian Contemporary',
      additionalPhotos: [
        'https://picsum.photos/600/400?random=31',
      ],
      popularItems: [
        MenuItem(name: 'Truffle Cacio e Pepe', price: '\$28', emoji: '🍝'),
        MenuItem(name: 'Squid Ink Linguine', price: '\$32', emoji: '🦑'),
        MenuItem(name: 'Burrata Appetizer', price: '\$18', emoji: '🧀'),
      ],
      reviews: [
        Review(
          text: 'Handmade pasta perfection. Every dish is a work of art.',
          author: 'Maria R.',
        ),
        Review(
          text: 'Modern take on classics without losing the soul.',
          author: 'Tom B.',
        ),
      ],
      ambianceTags: ['Romantic', 'Upscale', 'Wine-Focused'],
      reservationInfo: 'Book ahead • Prix fixe available',
    ),
    const Restaurant(
      name: 'Burger Haus',
      tagline: 'Gourmet burgers with attitude',
      location: 'Brooklyn, NYC',
      imageUrl: 'https://picsum.photos/600/800?random=4',
      priceRange: '\$\$',
      cuisine: 'American',
      popularItems: [
        MenuItem(name: 'The Haus Burger', price: '\$16', emoji: '🍔'),
        MenuItem(name: 'Truffle Fries', price: '\$9', emoji: '🍟'),
        MenuItem(name: 'Craft Beer Flight', price: '\$14', emoji: '🍺'),
      ],
      reviews: [
        Review(
          text: 'Juicy, perfectly cooked patties. Best burger in Brooklyn.',
          author: 'Mike D.',
        ),
      ],
      ambianceTags: ['Casual', 'Lively', 'Beer Garden'],
      reservationInfo: 'Walk-ins welcome • Happy hour 4-7 PM',
    ),
    const Restaurant(
      name: 'Pho King',
      tagline: 'Authentic Vietnamese soul food',
      location: 'Little Saigon, OC',
      imageUrl: 'https://picsum.photos/600/800?random=5',
      priceRange: '\$',
      cuisine: 'Vietnamese',
      popularItems: [
        MenuItem(name: 'Pho Tai', price: '\$14', emoji: '🍜'),
        MenuItem(name: 'Banh Mi Combo', price: '\$12', emoji: '🥖'),
        MenuItem(name: 'Spring Rolls', price: '\$8', emoji: '🥗'),
      ],
      reviews: [
        Review(
          text: 'Broth is simmered for 24 hours. You can taste the love.',
          author: 'Linda N.',
        ),
      ],
      ambianceTags: ['Cozy', 'Family-Run', 'Quick Bites'],
      reservationInfo: 'No reservations • Cash only',
    ),
  ];
}

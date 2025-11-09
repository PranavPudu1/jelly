import '../models/restaurant.dart';

class MockRestaurants {
  static final List<Restaurant> restaurants = [
    const Restaurant(
      name: 'Sushi Garden',
      rating: 4.8,
      location: 'East Village, NYC',
      heroImageUrl: 'https://picsum.photos/600/800?random=1',
      ambientImageUrl: 'https://picsum.photos/600/400?random=11',
      reviewQuote: 'Best sushi outside of Tokyo. The fish melts in your mouth and the presentation is stunning.',
      reviewAuthor: 'Sarah M.',
      foodPhotos: [
        'https://picsum.photos/400/400?random=12',
        'https://picsum.photos/400/400?random=13',
        'https://picsum.photos/400/400?random=14',
        'https://picsum.photos/400/400?random=15',
      ],
      instagramHandle: '@sushigarden',
      tiktokHandle: '@sushigardennyc',
      menuImages: [
        'https://picsum.photos/300/400?random=16',
        'https://picsum.photos/300/400?random=17',
      ],
      popularDishPhotos: [
        'https://picsum.photos/400/300?random=18',
        'https://picsum.photos/400/300?random=19',
        'https://picsum.photos/400/300?random=20',
      ],
      infoList: [
        RestaurantInfo(label: 'Location', value: 'East Village, NYC'),
        RestaurantInfo(label: 'Bar', value: 'Full Sake Bar'),
        RestaurantInfo(label: 'Reservations', value: 'Recommended'),
        RestaurantInfo(label: 'Price Range', value: '\$\$\$'),
        RestaurantInfo(label: 'Cuisine', value: 'Japanese'),
        RestaurantInfo(label: 'Ambiance', value: 'Intimate & Modern'),
      ],
      ambiencePhotos: [
        AmbiencePhoto(imageUrl: 'https://picsum.photos/600/400?random=11'),
        AmbiencePhoto(imageUrl: 'https://picsum.photos/600/400?random=101'),
        AmbiencePhoto(imageUrl: 'https://picsum.photos/600/400?random=102'),
      ],
      reviews: [
        Review(
          author: 'Sarah M.',
          quote: 'Best sushi outside of Tokyo. The fish melts in your mouth and the presentation is stunning.',
          rating: 5.0,
        ),
        Review(
          author: 'James K.',
          quote: 'Intimate atmosphere perfect for date night. The omakase experience was unforgettable!',
          rating: 5.0,
        ),
        Review(
          author: 'Emily R.',
          quote: 'Fresh ingredients and authentic flavors. The sake pairing was exceptional.',
          rating: 4.5,
        ),
      ],
      foodItems: [
        FoodItem(
          name: 'Omakase Platter',
          images: [
            'https://picsum.photos/400/400?random=201',
            'https://picsum.photos/400/400?random=202',
            'https://picsum.photos/400/400?random=203',
            'https://picsum.photos/400/400?random=204',
            'https://picsum.photos/400/400?random=205',
          ],
          reviews: [
            Review(
              author: 'Sarah M.',
              quote: 'Best sushi outside of Tokyo. The fish melts in your mouth and the presentation is stunning.',
              rating: 5.0,
            ),
            Review(
              author: 'David L.',
              quote: 'The omakase was absolutely incredible. Each piece was perfectly prepared.',
              rating: 5.0,
            ),
            Review(
              author: 'Rachel K.',
              quote: 'Fresh, delicate, and beautifully presented. Worth every penny!',
              rating: 5.0,
            ),
            Review(
              author: 'Tom H.',
              quote: 'The chef\'s selection never disappoints. Always impeccably fresh.',
              rating: 4.5,
            ),
            Review(
              author: 'Lisa W.',
              quote: 'Best omakase experience in NYC. The toro was unforgettable!',
              rating: 5.0,
            ),
            Review(
              author: 'John P.',
              quote: 'Every single piece was a work of art. The presentation alone is worth the visit.',
              rating: 5.0,
            ),
            Review(
              author: 'Amanda T.',
              quote: 'Melt-in-your-mouth fish, creative combinations, and stunning plating.',
              rating: 5.0,
            ),
            Review(
              author: 'Michael S.',
              quote: 'The quality of the fish is unmatched. You can taste the difference.',
              rating: 4.5,
            ),
          ],
        ),
        FoodItem(
          name: 'Spicy Tuna Roll',
          images: [
            'https://picsum.photos/400/400?random=211',
            'https://picsum.photos/400/400?random=212',
            'https://picsum.photos/400/400?random=213',
            'https://picsum.photos/400/400?random=214',
          ],
          reviews: [
            Review(
              author: 'James K.',
              quote: 'The spicy tuna roll has the perfect kick. Not too spicy, just right!',
              rating: 5.0,
            ),
            Review(
              author: 'Nicole B.',
              quote: 'Best spicy tuna I\'ve ever had. The tuna is incredibly fresh.',
              rating: 5.0,
            ),
            Review(
              author: 'Chris D.',
              quote: 'Love the balance of heat and flavor. The tuna quality is top-notch.',
              rating: 4.5,
            ),
            Review(
              author: 'Jennifer M.',
              quote: 'Perfectly spicy with generous portions of fresh tuna. My go-to order!',
              rating: 5.0,
            ),
            Review(
              author: 'Mark R.',
              quote: 'The crunch and spice combo is addictive. I order this every time.',
              rating: 5.0,
            ),
            Review(
              author: 'Kelly F.',
              quote: 'Fresh tuna, perfect spice level, and great texture. Highly recommend!',
              rating: 4.5,
            ),
          ],
        ),
        FoodItem(
          name: 'Salmon Nigiri',
          images: [
            'https://picsum.photos/400/400?random=221',
            'https://picsum.photos/400/400?random=222',
            'https://picsum.photos/400/400?random=223',
          ],
          reviews: [
            Review(
              author: 'Emily R.',
              quote: 'The salmon nigiri is buttery smooth and melts in your mouth.',
              rating: 5.0,
            ),
            Review(
              author: 'Ryan T.',
              quote: 'Simple perfection. The quality of the salmon speaks for itself.',
              rating: 5.0,
            ),
            Review(
              author: 'Sophie L.',
              quote: 'Best salmon nigiri in the city. Always fresh, always delicious.',
              rating: 5.0,
            ),
            Review(
              author: 'Daniel K.',
              quote: 'The salmon is so fresh it practically melts. Incredible!',
              rating: 4.5,
            ),
            Review(
              author: 'Ashley P.',
              quote: 'Buttery, rich, and perfectly portioned. My favorite item on the menu.',
              rating: 5.0,
            ),
            Review(
              author: 'Brian W.',
              quote: 'The rice-to-fish ratio is perfect, and the salmon quality is unbeatable.',
              rating: 5.0,
            ),
            Review(
              author: 'Jessica H.',
              quote: 'Silky smooth texture with incredible flavor. A must-order!',
              rating: 4.5,
            ),
          ],
        ),
      ],
    ),
    const Restaurant(
      name: 'Taco Theory',
      rating: 4.6,
      location: 'Mission District, SF',
      heroImageUrl: 'https://picsum.photos/600/800?random=2',
      ambientImageUrl: 'https://picsum.photos/600/400?random=21',
      reviewQuote: 'Fusion done right. The Korean BBQ taco is absolutely life-changing!',
      reviewAuthor: 'Alex P.',
      foodPhotos: [
        'https://picsum.photos/400/400?random=22',
        'https://picsum.photos/400/400?random=23',
        'https://picsum.photos/400/400?random=24',
        'https://picsum.photos/400/400?random=25',
      ],
      instagramHandle: '@tacotheory',
      tiktokHandle: '@tacotheorysf',
      menuImages: [
        'https://picsum.photos/300/400?random=26',
        'https://picsum.photos/300/400?random=27',
      ],
      popularDishPhotos: [
        'https://picsum.photos/400/300?random=28',
        'https://picsum.photos/400/300?random=29',
        'https://picsum.photos/400/300?random=30',
      ],
      infoList: [
        RestaurantInfo(label: 'Location', value: 'Mission District, SF'),
        RestaurantInfo(label: 'Bar', value: 'Craft Cocktails'),
        RestaurantInfo(label: 'Live Music', value: 'Weekends'),
        RestaurantInfo(label: 'Price Range', value: '\$\$'),
        RestaurantInfo(label: 'Cuisine', value: 'Mexican Fusion'),
        RestaurantInfo(label: 'Ambiance', value: 'Vibrant & Casual'),
      ],
    ),
    const Restaurant(
      name: 'Pasta Lab',
      rating: 4.9,
      location: 'West Loop, Chicago',
      heroImageUrl: 'https://picsum.photos/600/800?random=3',
      ambientImageUrl: 'https://picsum.photos/600/400?random=31',
      reviewQuote: 'Handmade pasta perfection. Every dish is a work of culinary art.',
      reviewAuthor: 'Maria R.',
      foodPhotos: [
        'https://picsum.photos/400/400?random=32',
        'https://picsum.photos/400/400?random=33',
        'https://picsum.photos/400/400?random=34',
        'https://picsum.photos/400/400?random=35',
      ],
      instagramHandle: '@pastalab',
      tiktokHandle: '@pastalabchi',
      menuImages: [
        'https://picsum.photos/300/400?random=36',
        'https://picsum.photos/300/400?random=37',
      ],
      popularDishPhotos: [
        'https://picsum.photos/400/300?random=38',
        'https://picsum.photos/400/300?random=39',
        'https://picsum.photos/400/300?random=40',
      ],
      infoList: [
        RestaurantInfo(label: 'Location', value: 'West Loop, Chicago'),
        RestaurantInfo(label: 'Bar', value: 'Wine-Focused'),
        RestaurantInfo(label: 'Reservations', value: 'Required'),
        RestaurantInfo(label: 'Price Range', value: '\$\$\$'),
        RestaurantInfo(label: 'Cuisine', value: 'Italian Contemporary'),
        RestaurantInfo(label: 'Kid-Friendly', value: 'Yes'),
      ],
    ),
    const Restaurant(
      name: 'Burger Haus',
      rating: 4.5,
      location: 'Brooklyn, NYC',
      heroImageUrl: 'https://picsum.photos/600/800?random=4',
      ambientImageUrl: 'https://picsum.photos/600/400?random=41',
      reviewQuote: 'Juicy, perfectly cooked patties. Best burger in Brooklyn, hands down.',
      reviewAuthor: 'Mike D.',
      foodPhotos: [
        'https://picsum.photos/400/400?random=42',
        'https://picsum.photos/400/400?random=43',
        'https://picsum.photos/400/400?random=44',
        'https://picsum.photos/400/400?random=45',
      ],
      instagramHandle: '@burgerhaus',
      tiktokHandle: '@burgerhausnyc',
      menuImages: [
        'https://picsum.photos/300/400?random=46',
        'https://picsum.photos/300/400?random=47',
      ],
      popularDishPhotos: [
        'https://picsum.photos/400/300?random=48',
        'https://picsum.photos/400/300?random=49',
        'https://picsum.photos/400/300?random=50',
      ],
      infoList: [
        RestaurantInfo(label: 'Location', value: 'Brooklyn, NYC'),
        RestaurantInfo(label: 'Bar', value: 'Craft Beer Selection'),
        RestaurantInfo(label: 'Live Music', value: 'Fridays'),
        RestaurantInfo(label: 'Price Range', value: '\$\$'),
        RestaurantInfo(label: 'Cuisine', value: 'American'),
        RestaurantInfo(label: 'Kid-Friendly', value: 'Yes'),
      ],
    ),
    const Restaurant(
      name: 'Sammies',
      rating: 4.7,
      location: 'South Congress, Austin',
      heroImageUrl: 'https://picsum.photos/600/800?random=5',
      ambientImageUrl: 'https://picsum.photos/600/400?random=51',
      reviewQuote: 'Creative Italian sandwiches with a Texas twist. The mortadella is to die for!',
      reviewAuthor: 'Austin K.',
      foodPhotos: [
        'https://picsum.photos/400/400?random=52',
        'https://picsum.photos/400/400?random=53',
        'https://picsum.photos/400/400?random=54',
        'https://picsum.photos/400/400?random=55',
      ],
      instagramHandle: '@sammiesitalian',
      tiktokHandle: '@sammiesatx',
      menuImages: [
        'https://picsum.photos/300/400?random=56',
        'https://picsum.photos/300/400?random=57',
      ],
      popularDishPhotos: [
        'https://picsum.photos/400/300?random=58',
        'https://picsum.photos/400/300?random=59',
        'https://picsum.photos/400/300?random=60',
      ],
      infoList: [
        RestaurantInfo(label: 'Location', value: 'South Congress, Austin'),
        RestaurantInfo(label: 'Bar', value: 'Italian Wine & Aperitifs'),
        RestaurantInfo(label: 'Outdoor Seating', value: 'Available'),
        RestaurantInfo(label: 'Price Range', value: '\$\$'),
        RestaurantInfo(label: 'Cuisine', value: 'Italian Sandwiches'),
        RestaurantInfo(label: 'Ambiance', value: 'Casual & Trendy'),
      ],
      ambiencePhotos: [
        AmbiencePhoto(imageUrl: 'https://picsum.photos/600/400?random=51'),
        AmbiencePhoto(imageUrl: 'https://picsum.photos/600/400?random=501'),
        AmbiencePhoto(imageUrl: 'https://picsum.photos/600/400?random=502'),
      ],
      reviews: [
        Review(
          author: 'Austin K.',
          quote: 'Creative Italian sandwiches with a Texas twist. The mortadella is to die for!',
          rating: 5.0,
        ),
        Review(
          author: 'Maria G.',
          quote: 'Best sandwiches in Austin! Fresh ingredients and incredible flavor combinations.',
          rating: 5.0,
        ),
        Review(
          author: 'Jake T.',
          quote: 'The outdoor patio is perfect for a casual lunch. Loved the Italian vibes!',
          rating: 4.5,
        ),
      ],
      foodItems: [
        FoodItem(
          name: 'Mortadella Sandwich',
          images: [
            'https://picsum.photos/400/400?random=301',
            'https://picsum.photos/400/400?random=302',
            'https://picsum.photos/400/400?random=303',
            'https://picsum.photos/400/400?random=304',
            'https://picsum.photos/400/400?random=305',
          ],
          reviews: [
            Review(
              author: 'Austin K.',
              quote: 'The mortadella is silky smooth with perfect seasoning. Best sandwich on the menu!',
              rating: 5.0,
            ),
            Review(
              author: 'Sarah L.',
              quote: 'Incredibly flavorful! The mortadella melts in your mouth with the pistachio spread.',
              rating: 5.0,
            ),
            Review(
              author: 'Mike R.',
              quote: 'This sandwich changed my life. Generous portions and amazing quality.',
              rating: 5.0,
            ),
            Review(
              author: 'Jessica P.',
              quote: 'The bread is perfectly crispy on the outside, soft inside. Mortadella is divine!',
              rating: 5.0,
            ),
            Review(
              author: 'David H.',
              quote: 'Never had mortadella this good. The pistachio spread is genius!',
              rating: 4.5,
            ),
            Review(
              author: 'Emma W.',
              quote: 'Perfectly balanced flavors. This is what a quality Italian sandwich should be!',
              rating: 5.0,
            ),
            Review(
              author: 'Carlos M.',
              quote: 'Rich, savory, and absolutely delicious. Worth every penny!',
              rating: 5.0,
            ),
            Review(
              author: 'Rachel B.',
              quote: 'The quality of the mortadella is unmatched. You can taste the difference!',
              rating: 4.5,
            ),
          ],
        ),
        FoodItem(
          name: 'Caprese Sandwich',
          images: [
            'https://picsum.photos/400/400?random=311',
            'https://picsum.photos/400/400?random=312',
            'https://picsum.photos/400/400?random=313',
            'https://picsum.photos/400/400?random=314',
          ],
          reviews: [
            Review(
              author: 'Maria G.',
              quote: 'Fresh mozzarella and heirloom tomatoes make this a perfect summer sandwich!',
              rating: 5.0,
            ),
            Review(
              author: 'Tony S.',
              quote: 'Simple but absolutely delicious. The basil is so fresh and fragrant.',
              rating: 5.0,
            ),
            Review(
              author: 'Lisa K.',
              quote: 'Best caprese I\'ve had in Austin. The balsamic glaze ties it all together!',
              rating: 4.5,
            ),
            Review(
              author: 'John D.',
              quote: 'Light, fresh, and bursting with flavor. Perfect for a hot Texas day.',
              rating: 5.0,
            ),
            Review(
              author: 'Amy T.',
              quote: 'The mozzarella is so creamy! Love how they don\'t skimp on ingredients.',
              rating: 5.0,
            ),
            Review(
              author: 'Chris L.',
              quote: 'Fresh tomatoes, quality mozzarella, and perfect bread. What more do you need?',
              rating: 4.5,
            ),
          ],
        ),
        FoodItem(
          name: 'Prosciutto & Fig',
          images: [
            'https://picsum.photos/400/400?random=321',
            'https://picsum.photos/400/400?random=322',
            'https://picsum.photos/400/400?random=323',
          ],
          reviews: [
            Review(
              author: 'Jake T.',
              quote: 'The sweet and savory combo is incredible. Prosciutto is perfectly thin!',
              rating: 5.0,
            ),
            Review(
              author: 'Sophie M.',
              quote: 'Fig jam with prosciutto is a match made in heaven. So sophisticated!',
              rating: 5.0,
            ),
            Review(
              author: 'Mark W.',
              quote: 'Never thought to combine these flavors. Absolutely amazing!',
              rating: 5.0,
            ),
            Review(
              author: 'Nicole R.',
              quote: 'The arugula adds a nice peppery kick. This sandwich is perfection!',
              rating: 4.5,
            ),
            Review(
              author: 'Brian K.',
              quote: 'Prosciutto quality is top-notch. Fig jam is the perfect sweetness.',
              rating: 5.0,
            ),
            Review(
              author: 'Amanda H.',
              quote: 'Elegant yet casual. Love the flavor balance in this sandwich!',
              rating: 5.0,
            ),
            Review(
              author: 'Tyler J.',
              quote: 'Fresh ingredients, creative combination. This is my new favorite!',
              rating: 4.5,
            ),
          ],
        ),
      ],
    ),
  ];
}

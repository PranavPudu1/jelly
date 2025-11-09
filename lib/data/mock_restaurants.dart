import '../models/restaurant.dart';

class MockRestaurants {
  static final List<Restaurant> restaurants = [
    const Restaurant(
      name: 'Sushi Garden',
      rating: 4.8,
      location: 'East Village, NYC',
      heroImageUrl: 'https://picsum.photos/600/800?random=1',
      ambientImageUrl: 'https://picsum.photos/600/400?random=11',
      reviewQuote:
          'Best sushi outside of Tokyo. The fish melts in your mouth and the presentation is stunning.',
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
        RestaurantInfo(label: 'Live Music', value: 'Jazz Nights'),
      ],
    ),

    const Restaurant(
      name: 'Taco Theory',
      rating: 4.6,
      location: 'Mission District, SF',
      heroImageUrl: 'https://picsum.photos/600/800?random=2',
      ambientImageUrl: 'https://picsum.photos/600/400?random=21',
      reviewQuote:
          'Fusion done right. The Korean BBQ taco is absolutely life-changing!',
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
      ],
    ),

    const Restaurant(
      name: 'Pasta Lab',
      rating: 4.9,
      location: 'West Loop, Chicago',
      heroImageUrl: 'https://picsum.photos/600/800?random=3',
      ambientImageUrl: 'https://picsum.photos/600/400?random=31',
      reviewQuote:
          'Handmade pasta perfection. Every dish is a work of culinary art.',
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
        RestaurantInfo(label: 'Live Music', value: 'Acoustic Thursdays'),
      ],
    ),

    const Restaurant(
      name: 'Burger Haus',
      rating: 4.5,
      location: 'Brooklyn, NYC',
      heroImageUrl: 'https://picsum.photos/600/800?random=4',
      ambientImageUrl: 'https://picsum.photos/600/400?random=41',
      reviewQuote:
          'Juicy, perfectly cooked patties. Best burger in Brooklyn, hands down.',
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
      ],
    ),

    const Restaurant(
      name: 'Sammies',
      rating: 4.7,
      location: 'South Congress, Austin',
      heroImageUrl: 'https://picsum.photos/600/800?random=5',
      ambientImageUrl: 'https://picsum.photos/600/400?random=51',
      reviewQuote:
          'Creative Italian sandwiches with a Texas twist. The mortadella is to die for!',
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
        RestaurantInfo(label: 'Live Music', value: 'Sundays'),
      ],
    ),
  ];
}

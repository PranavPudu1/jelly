class Restaurant {
  final String name;
  final double rating;
  final String location;
  final String heroImageUrl;
  final String ambientImageUrl;
  final String reviewQuote;
  final String reviewAuthor;
  final List<String> foodPhotos;
  final String instagramHandle;
  final String tiktokHandle;
  final List<String> menuImages;
  final List<String> popularDishPhotos;
  final List<RestaurantInfo> infoList;
  final List<AmbiencePhoto> ambiencePhotos;
  final List<Review> reviews;
  final List<FoodItem> foodItems;

  const Restaurant({
    required this.name,
    required this.rating,
    required this.location,
    required this.heroImageUrl,
    required this.ambientImageUrl,
    required this.reviewQuote,
    required this.reviewAuthor,
    this.foodPhotos = const [],
    this.instagramHandle = '',
    this.tiktokHandle = '',
    this.menuImages = const [],
    this.popularDishPhotos = const [],
    this.infoList = const [],
    this.ambiencePhotos = const [],
    this.reviews = const [],
    this.foodItems = const [],
  });
}

class RestaurantInfo {
  final String label;
  final String value;

  const RestaurantInfo({
    required this.label,
    required this.value,
  });
}

class AmbiencePhoto {
  final String imageUrl;

  const AmbiencePhoto({
    required this.imageUrl,
  });
}

class Review {
  final String author;
  final String quote;
  final double rating;

  const Review({
    required this.author,
    required this.quote,
    this.rating = 5.0,
  });
}

class FoodItem {
  final String name;
  final List<String> images;
  final List<Review> reviews;

  const FoodItem({
    required this.name,
    required this.images,
    required this.reviews,
  });
}

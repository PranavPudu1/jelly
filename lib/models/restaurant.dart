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

class MenuItem {
  final String name;
  final String price;
  final String emoji;

  const MenuItem({
    required this.name,
    required this.price,
    required this.emoji,
  });
}

class Review {
  final String text;
  final String author;

  const Review({
    required this.text,
    required this.author,
  });
}

class Restaurant {
  final String name;
  final String tagline;
  final String location;
  final String imageUrl;
  final List<String> additionalPhotos;
  final List<MenuItem> popularItems;
  final List<Review> reviews;
  final List<String> ambianceTags;
  final String reservationInfo;
  final String priceRange;
  final String cuisine;

  const Restaurant({
    required this.name,
    required this.tagline,
    required this.location,
    required this.imageUrl,
    this.additionalPhotos = const [],
    this.popularItems = const [],
    this.reviews = const [],
    this.ambianceTags = const [],
    this.reservationInfo = 'Walk-ins welcome',
    this.priceRange = '\$\$',
    this.cuisine = 'Contemporary',
  });

  factory Restaurant.fromJson(Map<String, dynamic> json) {
    return Restaurant(
      name: json['name'] as String,
      tagline: json['tagline'] as String,
      location: json['location'] as String? ?? 'Downtown',
      imageUrl: json['image'] as String,
      priceRange: json['priceRange'] as String? ?? '\$\$',
      cuisine: json['cuisine'] as String? ?? 'Contemporary',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'tagline': tagline,
      'location': location,
      'image': imageUrl,
      'priceRange': priceRange,
      'cuisine': cuisine,
    };
  }
}

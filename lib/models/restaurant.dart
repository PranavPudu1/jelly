class Restaurant {
  final String name;
  final String tagline;
  final String imageUrl;

  const Restaurant({
    required this.name,
    required this.tagline,
    required this.imageUrl,
  });

  factory Restaurant.fromJson(Map<String, dynamic> json) {
    return Restaurant(
      name: json['name'] as String,
      tagline: json['tagline'] as String,
      imageUrl: json['image'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'tagline': tagline,
      'image': imageUrl,
    };
  }
}

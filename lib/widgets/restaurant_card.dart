import 'package:flutter/material.dart';
import '../models/restaurant.dart';

class RestaurantCard extends StatelessWidget {
  final Restaurant restaurant;

  const RestaurantCard({
    super.key,
    required this.restaurant,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: Colors.white,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Screen 1: Hero section with info table
              _buildScreen1(),

              // Ambience section with expandable view
              _buildAmbienceSection(context),

              // Food reviews section with expandable view
              _buildFoodReviewsSection(context),

              // Screen 3: Menu and popular pics
              _buildScreen3(),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  // Screen 1: Header, hero image, location, info table
  Widget _buildScreen1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header: Name, $$$ and Stars on same line, Cuisine below
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Name, $$$ and Stars on same horizontal line
              Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Flexible(
                          child: Text(
                            restaurant.name,
                            style: const TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w700,
                              color: Colors.black,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Price indicator in orange
                        Text(
                          '\$\$\$',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Colors.orange,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Star rating (outlined stars) on far right
                  Row(
                    children: List.generate(5, (index) {
                      return Icon(
                        index < restaurant.rating.floor()
                            ? Icons.star
                            : Icons.star_border,
                        color: Colors.orange,
                        size: 18,
                      );
                    }),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              // Cuisine type below
              Text(
                'Italian Contemporary',
                style: const TextStyle(
                  fontSize: 15,
                  color: Colors.grey,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          ),
        ),

        // Hero food image
        ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Image.network(
              restaurant.heroImageUrl,
              height: 350,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  height: 350,
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.restaurant, size: 80, color: Colors.grey),
                );
              },
            ),
          ),
        ),

        // Location with pin and distance
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
          child: Row(
            children: [
              const Icon(Icons.location_on, size: 18, color: Colors.grey),
              const SizedBox(width: 6),
              Text(
                restaurant.location,
                style: const TextStyle(
                  fontSize: 15,
                  color: Colors.grey,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '• 2.3 miles',
                style: const TextStyle(
                  fontSize: 15,
                  color: Colors.grey,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          ),
        ),

        // Restaurant info table (Hinge-style)
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
          child: Column(
            children: restaurant.infoList.map((info) {
              IconData icon;
              // Map labels to icons
              switch (info.label) {
                case 'Location':
                  icon = Icons.location_on;
                  break;
                case 'Bar':
                  icon = Icons.local_bar;
                  break;
                case 'Live Music':
                  icon = Icons.music_note;
                  break;
                case 'Kid-Friendly':
                  icon = Icons.emoji_emotions;
                  break;
                case 'Reservations':
                  icon = Icons.event_available;
                  break;
                default:
                  icon = Icons.info;
              }

              return Container(
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: Colors.grey[200]!,
                      width: 1,
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      icon,
                      size: 22,
                      color: Colors.grey[600],
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            info.label,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            info.value,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.black,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  // Screen 2: Food photos grid + Social media section
  Widget _buildScreen2(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Food photos grid (2x2)
          if (restaurant.foodPhotos.isNotEmpty)
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: restaurant.foodPhotos.length > 4 ? 4 : restaurant.foodPhotos.length,
              itemBuilder: (context, index) {
                return ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    restaurant.foodPhotos[index],
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: Colors.grey[200],
                        child: const Icon(Icons.image, color: Colors.grey),
                      );
                    },
                  ),
                );
              },
            ),

          const SizedBox(height: 32),

          // Social media section
          const Text(
            "Here's what people are saying online",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),

          const SizedBox(height: 16),

          Row(
            children: [
              // Instagram
              if (restaurant.instagramHandle.isNotEmpty)
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      debugPrint('Instagram clicked: ${restaurant.instagramHandle}');
                      // In production: launch Instagram profile
                      // launchUrl(Uri.parse('https://instagram.com/${restaurant.instagramHandle}'));
                    },
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE4405F).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: const Color(0xFFE4405F).withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.camera_alt,
                            color: Color(0xFFE4405F),
                            size: 20,
                          ),
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              restaurant.instagramHandle,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFFE4405F),
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

              const SizedBox(width: 12),

              // TikTok
              if (restaurant.tiktokHandle.isNotEmpty)
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      debugPrint('TikTok clicked: ${restaurant.tiktokHandle}');
                      // In production: launch TikTok profile
                      // launchUrl(Uri.parse('https://tiktok.com/${restaurant.tiktokHandle}'));
                    },
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.black.withOpacity(0.2),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.play_circle_filled,
                            color: Colors.black,
                            size: 20,
                          ),
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              restaurant.tiktokHandle,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Colors.black,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  // Screen 3: Menu and popular dish photos
  Widget _buildScreen3() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Here's the menu and popular pics",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),

          const SizedBox(height: 16),

          // Menu images
          if (restaurant.menuImages.isNotEmpty)
            SizedBox(
              height: 300,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: restaurant.menuImages.length,
                itemBuilder: (context, index) {
                  return Container(
                    width: 220,
                    margin: EdgeInsets.only(
                      right: index < restaurant.menuImages.length - 1 ? 12 : 0,
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        restaurant.menuImages[index],
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: Colors.grey[200],
                            child: const Icon(Icons.menu_book, color: Colors.grey, size: 48),
                          );
                        },
                      ),
                    ),
                  );
                },
              ),
            ),

          const SizedBox(height: 16),

          // Popular dish photos
          if (restaurant.popularDishPhotos.isNotEmpty)
            SizedBox(
              height: 200,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: restaurant.popularDishPhotos.length,
                itemBuilder: (context, index) {
                  return Container(
                    width: 280,
                    margin: EdgeInsets.only(
                      right: index < restaurant.popularDishPhotos.length - 1 ? 12 : 0,
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        restaurant.popularDishPhotos[index],
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: Colors.grey[200],
                            child: const Icon(Icons.restaurant, color: Colors.grey, size: 48),
                          );
                        },
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }

}

import 'package:flutter/material.dart';
import 'package:jelly/theme/app_theme.dart';
import 'package:swipable_stack/swipable_stack.dart';
import '../data/mock_restaurants.dart';
import '../models/restaurant.dart';
import '../widgets/restaurant_card.dart';

class SwipeScreen extends StatefulWidget {
  const SwipeScreen({super.key});

  @override
  State<SwipeScreen> createState() => _SwipeScreenState();
}

class _SwipeScreenState extends State<SwipeScreen> {
  late final SwipableStackController _controller;
  final List<Restaurant> _restaurants = MockRestaurants.restaurants;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _controller = SwipableStackController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onSwipeCompleted(int index, SwipeDirection direction) {
    setState(() {
      _currentIndex = index + 1;
    });

    if (direction == SwipeDirection.right) {
      debugPrint('Liked: ${_restaurants[index].name}');
    } else if (direction == SwipeDirection.left) {
      debugPrint('Passed: ${_restaurants[index].name}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Full-screen swipable stack
          _currentIndex >= _restaurants.length
              ? _buildEndScreen()
              : SwipableStack(
                  controller: _controller,
                  onSwipeCompleted: _onSwipeCompleted,
                  horizontalSwipeThreshold: 0.7,
                  verticalSwipeThreshold: 1.0,
                  overlayBuilder: (context, properties) {
                    final opacity = properties.swipeProgress.clamp(0.0, 1.0);
                    final isRight =
                        properties.direction == SwipeDirection.right;
                    final isLeft = properties.direction == SwipeDirection.left;

                    return Stack(
                      children: [
                        // Like indicator
                        if (isRight)
                          Positioned(
                            top: 60,
                            left: 40,
                            child: Opacity(
                              opacity: opacity,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                  vertical: 12,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.green,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'LIKE',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 18,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        // Pass indicator
                        if (isLeft)
                          Positioned(
                            top: 60,
                            right: 40,
                            child: Opacity(
                              opacity: opacity,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                  vertical: 12,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.red,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'PASS',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 18,
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    );
                  },
                  builder: (context, properties) {
                    final itemIndex = properties.index % _restaurants.length;
                    return RestaurantCard(restaurant: _restaurants[itemIndex]);
                  },
                ),

          // Bottom navigation bar
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.primary,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black,
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildNavItem(
                        icon: Icons.bookmark,
                        label: 'Saved Places',
                        isSelected: true,
                      ),
                      _buildNavItem(
                        icon: Icons.settings,
                        label: 'Settings',
                        isSelected: false,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required bool isSelected,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          color: isSelected ? AppColors.textDark : AppColors.textLight,
          size: 24,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isSelected ? AppColors.textDark : AppColors.textLight,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  Widget _buildEndScreen() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.restaurant_menu,
              size: 60,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 32),
          const Text(
            'All done for now!',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          const Text(
            'Come back later for more\nrestaurant recommendations',
            style: TextStyle(fontSize: 16, color: Colors.grey, height: 1.5),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _currentIndex = 0;
              });
              _controller.currentIndex = 0;
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.black,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
            ),
            child: const Text(
              'Start Over',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

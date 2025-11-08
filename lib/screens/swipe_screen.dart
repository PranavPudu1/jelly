import 'package:flutter/material.dart';
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
      backgroundColor: const Color(0xFFF5F5F5),
      body: SafeArea(
        child: Column(
          children: [
            // Simple header
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Jelly',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  Text(
                    '${_currentIndex + 1}/${_restaurants.length}',
                    style: const TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),

            // Swipable stack
            Expanded(
              child: _currentIndex >= _restaurants.length
                  ? _buildEndScreen()
                  : SwipableStack(
                      controller: _controller,
                      onSwipeCompleted: _onSwipeCompleted,
                      horizontalSwipeThreshold: 0.7,
                      verticalSwipeThreshold: 1.0,
                      overlayBuilder: (context, properties) {
                        final opacity = properties.swipeProgress.clamp(0.0, 1.0);
                        final isRight = properties.direction == SwipeDirection.right;
                        final isLeft = properties.direction == SwipeDirection.left;

                        return Stack(
                          children: [
                            // Like indicator
                            if (isRight)
                              Positioned(
                                top: 40,
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
                                top: 40,
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
                        return RestaurantCard(
                          restaurant: _restaurants[itemIndex],
                        );
                      },
                    ),
            ),

          ],
        ),
      ),
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
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey,
              height: 1.5,
            ),
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
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

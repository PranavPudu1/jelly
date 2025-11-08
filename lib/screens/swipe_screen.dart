import 'package:flutter/material.dart';
import 'package:swipable_stack/swipable_stack.dart';
import '../data/mock_restaurants.dart';
import '../models/restaurant.dart';
import '../theme/app_theme.dart';
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
      debugPrint('Saved: ${_restaurants[index].name}');
    } else if (direction == SwipeDirection.left) {
      debugPrint('Skipped: ${_restaurants[index].name}');
    }
  }

  void _handleSave() {
    if (_currentIndex < _restaurants.length) {
      _controller.next(
        swipeDirection: SwipeDirection.right,
        duration: const Duration(milliseconds: 400),
      );
    }
  }

  void _handleSkip() {
    if (_currentIndex < _restaurants.length) {
      _controller.next(
        swipeDirection: SwipeDirection.left,
        duration: const Duration(milliseconds: 400),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'Jelly',
          style: Theme.of(context).textTheme.displaySmall?.copyWith(
                color: AppColors.primary,
                fontSize: 26,
                fontWeight: FontWeight.w600,
                letterSpacing: -0.5,
              ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Subtle progress indicator
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: LinearProgressIndicator(
                        value: (_currentIndex + 1) / _restaurants.length,
                        backgroundColor: AppColors.primary.withOpacity(0.1),
                        valueColor: AlwaysStoppedAnimation<Color>(
                          AppColors.primary.withOpacity(0.6),
                        ),
                        minHeight: 4,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    '${_currentIndex + 1}/${_restaurants.length}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textLight,
                          fontSize: 13,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Swipable stack
            Expanded(
              child: _currentIndex >= _restaurants.length
                  ? _buildEndScreen()
                  : Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: SwipableStack(
                        controller: _controller,
                        onSwipeCompleted: _onSwipeCompleted,
                        horizontalSwipeThreshold: 0.75,
                        verticalSwipeThreshold: 1.0,
                        overlayBuilder: (context, properties) {
                          final opacity = properties.swipeProgress.clamp(0.0, 1.0);
                          final isRight = properties.direction == SwipeDirection.right;
                          final isLeft = properties.direction == SwipeDirection.left;

                          return Stack(
                            children: [
                              // Save overlay - elegant badge
                              if (isRight)
                                Positioned(
                                  top: 60,
                                  left: 50,
                                  child: Opacity(
                                    opacity: opacity,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 20,
                                        vertical: 10,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.save.withOpacity(0.95),
                                        borderRadius: BorderRadius.circular(20),
                                        boxShadow: [
                                          BoxShadow(
                                            color: AppColors.save.withOpacity(0.4),
                                            blurRadius: 20,
                                            offset: const Offset(0, 8),
                                          ),
                                        ],
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Text(
                                            '🍴',
                                            style: TextStyle(fontSize: 18),
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            'Saved',
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyMedium
                                                ?.copyWith(
                                                  color: AppColors.white,
                                                  fontWeight: FontWeight.w600,
                                                  fontSize: 16,
                                                ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              // Skip overlay - elegant badge
                              if (isLeft)
                                Positioned(
                                  top: 60,
                                  right: 50,
                                  child: Opacity(
                                    opacity: opacity,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 20,
                                        vertical: 10,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.skip.withOpacity(0.95),
                                        borderRadius: BorderRadius.circular(20),
                                        boxShadow: [
                                          BoxShadow(
                                            color: AppColors.skip.withOpacity(0.4),
                                            blurRadius: 20,
                                            offset: const Offset(0, 8),
                                          ),
                                        ],
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Text(
                                            '🚫',
                                            style: TextStyle(fontSize: 18),
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            'Pass',
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyMedium
                                                ?.copyWith(
                                                  color: AppColors.white,
                                                  fontWeight: FontWeight.w600,
                                                  fontSize: 16,
                                                ),
                                          ),
                                        ],
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
            ),
            // Premium action chips
            if (_currentIndex < _restaurants.length)
              Padding(
                padding: const EdgeInsets.fromLTRB(32, 20, 32, 32),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Skip chip
                    _buildActionChip(
                      onPressed: _handleSkip,
                      emoji: '🚫',
                      label: 'Pass',
                      color: AppColors.skip,
                    ),
                    const SizedBox(width: 16),
                    // Save chip - larger, more prominent
                    _buildActionChip(
                      onPressed: _handleSave,
                      emoji: '🍴',
                      label: 'Save',
                      color: AppColors.save,
                      isPrimary: true,
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionChip({
    required VoidCallback onPressed,
    required String emoji,
    required String label,
    required Color color,
    bool isPrimary = false,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(30),
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: isPrimary ? 32 : 24,
            vertical: isPrimary ? 16 : 14,
          ),
          decoration: BoxDecoration(
            color: isPrimary ? color : AppColors.white,
            borderRadius: BorderRadius.circular(30),
            border: isPrimary ? null : Border.all(
              color: color.withOpacity(0.3),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(isPrimary ? 0.3 : 0.1),
                blurRadius: isPrimary ? 20 : 12,
                offset: Offset(0, isPrimary ? 10 : 6),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                emoji,
                style: TextStyle(fontSize: isPrimary ? 20 : 18),
              ),
              const SizedBox(width: 8),
              Text(
                label,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: isPrimary ? AppColors.white : color,
                      fontWeight: FontWeight.w600,
                      fontSize: isPrimary ? 17 : 15,
                      letterSpacing: 0.3,
                    ),
              ),
            ],
          ),
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
              color: AppColors.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.restaurant_menu,
              size: 60,
              color: AppColors.primary.withOpacity(0.6),
            ),
          ),
          const SizedBox(height: 32),
          Text(
            'All done for now',
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  color: AppColors.text,
                  fontSize: 24,
                  fontWeight: FontWeight.w600,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            'Come back later for more\nrestaurant recommendations',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: AppColors.textLight,
                  height: 1.6,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 40),
          _buildActionChip(
            onPressed: () {
              setState(() {
                _currentIndex = 0;
              });
              _controller.currentIndex = 0;
            },
            emoji: '🔄',
            label: 'Start Over',
            color: AppColors.primary,
            isPrimary: true,
          ),
        ],
      ),
    );
  }
}

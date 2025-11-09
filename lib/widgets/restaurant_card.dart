import 'package:flutter/material.dart';
import '../models/restaurant.dart';

class RestaurantCard extends StatefulWidget {
  final Restaurant restaurant;

  const RestaurantCard({
    super.key,
    required this.restaurant,
  });

  @override
  State<RestaurantCard> createState() => _RestaurantCardState();
}

class _RestaurantCardState extends State<RestaurantCard> {

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
              _buildAmbienceSection(),

              // Food reviews section with expandable view
              _buildFoodReviewsSection(),

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
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 6),
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
                            widget.restaurant.name,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              color: Colors.black,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        // Price indicator in orange
                        Text(
                          '\$\$\$',
                          style: const TextStyle(
                            fontSize: 14,
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
                        index < widget.restaurant.rating.floor()
                            ? Icons.star
                            : Icons.star_border,
                        color: Colors.orange,
                        size: 14,
                      );
                    }),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              // Cuisine type below
              Text(
                'Italian Contemporary',
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          ),
        ),

        // Hero food image - larger and more prominent
        ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Image.network(
              widget.restaurant.heroImageUrl,
              height: 480,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  height: 480,
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.restaurant, size: 80, color: Colors.grey),
                );
              },
            ),
          ),
        ),

        // Location with pin and distance
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
          child: Row(
            children: [
              const Icon(Icons.location_on, size: 14, color: Colors.grey),
              const SizedBox(width: 4),
              Text(
                widget.restaurant.location,
                style: const TextStyle(
                  fontSize: 11,
                  color: Colors.grey,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                '• 2.3 miles',
                style: const TextStyle(
                  fontSize: 11,
                  color: Colors.grey,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          ),
        ),

        // Restaurant info table - more compact
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
          child: Column(
            children: widget.restaurant.infoList.map((info) {
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
                padding: const EdgeInsets.symmetric(vertical: 8),
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
                      size: 16,
                      color: Colors.grey[600],
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            info.label,
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          const SizedBox(height: 1),
                          Text(
                            info.value,
                            style: const TextStyle(
                              fontSize: 12,
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

  // Ambience section with expandable view
  Widget _buildAmbienceSection() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 12, 8, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: const Text(
              'Ambience',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
          ),
          const SizedBox(height: 8),

          // Ambience photo with review quote overlay - tappable, larger
          GestureDetector(
            onTap: () {
              _showAmbienceFullscreen(context);
            },
            child: Container(
              height: 400,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Stack(
                children: [
                  // Ambience image
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      widget.restaurant.ambientImageUrl,
                      width: double.infinity,
                      height: 400,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: Colors.grey[200],
                          child: const Icon(Icons.image, size: 80, color: Colors.grey),
                        );
                      },
                    ),
                  ),

                  // Dark gradient overlay at bottom
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(12),
                          bottomRight: Radius.circular(12),
                        ),
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withOpacity(0.7),
                          ],
                        ),
                      ),
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '"${widget.restaurant.reviewQuote}"',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.white,
                              fontWeight: FontWeight.w500,
                              height: 1.4,
                            ),
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '- ${widget.restaurant.reviewAuthor}',
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.white.withOpacity(0.9),
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Food reviews section with expandable view
  Widget _buildFoodReviewsSection() {
    // Use foodItems if available, otherwise fall back to old structure
    final foodItems = widget.restaurant.foodItems.isNotEmpty
        ? widget.restaurant.foodItems
        : [];

    if (foodItems.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 12, 8, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section header "Food"
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: const Text(
              'Food',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
          ),
          const SizedBox(height: 6),

          // Social media text
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: const Text(
              "Here's what people are saying online",
              style: TextStyle(
                fontSize: 11,
                color: Colors.grey,
                fontWeight: FontWeight.w400,
              ),
            ),
          ),
          const SizedBox(height: 8),

          // Social media handles (Instagram and TikTok)
          Row(
            children: [
              // Instagram
              if (widget.restaurant.instagramHandle.isNotEmpty)
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      debugPrint('Instagram clicked: ${widget.restaurant.instagramHandle}');
                    },
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE4405F).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
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
                            size: 14,
                          ),
                          const SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              widget.restaurant.instagramHandle,
                              style: const TextStyle(
                                fontSize: 11,
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

              if (widget.restaurant.instagramHandle.isNotEmpty && widget.restaurant.tiktokHandle.isNotEmpty)
                const SizedBox(width: 8),

              // TikTok
              if (widget.restaurant.tiktokHandle.isNotEmpty)
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      debugPrint('TikTok clicked: ${widget.restaurant.tiktokHandle}');
                    },
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(10),
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
                            size: 14,
                          ),
                          const SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              widget.restaurant.tiktokHandle,
                              style: const TextStyle(
                                fontSize: 11,
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

          const SizedBox(height: 12),

          // Food items with reviews (alternating layout)
          ...foodItems.asMap().entries.map((entry) {
            final index = entry.key;
            final foodItem = entry.value;
            final isImageLeft = index % 2 == 0; // Alternating: 0, 2, 4... = left; 1, 3, 5... = right
            final firstReview = foodItem.reviews.isNotEmpty
                ? foodItem.reviews[0]
                : Review(author: 'Guest', quote: 'Delicious!', rating: 5.0);

            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              child: GestureDetector(
                onTap: () {
                  _showFoodItemFullscreen(context, foodItem);
                },
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: isImageLeft
                      ? [
                          // Image on LEFT
                          _buildFoodImage(foodItem.images.isNotEmpty ? foodItem.images[0] : ''),
                          const SizedBox(width: 8),
                          // Review on RIGHT
                          Expanded(child: _buildReviewSnippet(firstReview)),
                        ]
                      : [
                          // Review on LEFT
                          Expanded(child: _buildReviewSnippet(firstReview)),
                          const SizedBox(width: 8),
                          // Image on RIGHT
                          _buildFoodImage(foodItem.images.isNotEmpty ? foodItem.images[0] : ''),
                        ],
                ),
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  // Build food image widget - larger and more prominent
  Widget _buildFoodImage(String imageUrl) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: Image.network(
        imageUrl,
        width: 160,
        height: 160,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return Container(
            width: 160,
            height: 160,
            color: Colors.grey[200],
            child: const Icon(Icons.image, color: Colors.grey),
          );
        },
      ),
    );
  }

  // Build review snippet widget - smaller fonts
  Widget _buildReviewSnippet(Review review) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Author and rating
        Row(
          children: [
            CircleAvatar(
              radius: 10,
              backgroundColor: Colors.orange,
              child: Text(
                review.author[0],
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 8,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: Text(
                review.author,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),

        // Stars
        Row(
          children: List.generate(5, (index) {
            return Icon(
              index < review.rating.floor()
                  ? Icons.star
                  : Icons.star_border,
              color: Colors.orange,
              size: 11,
            );
          }),
        ),
        const SizedBox(height: 6),

        // Review quote
        Text(
          '"${review.quote}"',
          style: const TextStyle(
            fontSize: 11,
            color: Colors.black87,
            height: 1.3,
          ),
          maxLines: 4,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  // Screen 3: Menu and popular dish photos - more image-focused
  Widget _buildScreen3() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 12, 8, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: const Text(
              "Here's the menu and popular pics",
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
          ),

          const SizedBox(height: 10),

          // Menu images - larger
          if (widget.restaurant.menuImages.isNotEmpty)
            SizedBox(
              height: 360,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: widget.restaurant.menuImages.length,
                itemBuilder: (context, index) {
                  return Container(
                    width: 260,
                    margin: EdgeInsets.only(
                      right: index < widget.restaurant.menuImages.length - 1 ? 10 : 0,
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        widget.restaurant.menuImages[index],
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

          const SizedBox(height: 10),

          // Popular dish photos - larger
          if (widget.restaurant.popularDishPhotos.isNotEmpty)
            SizedBox(
              height: 240,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: widget.restaurant.popularDishPhotos.length,
                itemBuilder: (context, index) {
                  return Container(
                    width: 320,
                    margin: EdgeInsets.only(
                      right: index < widget.restaurant.popularDishPhotos.length - 1 ? 10 : 0,
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        widget.restaurant.popularDishPhotos[index],
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

  // Show fullscreen ambience photo gallery with reviews
  void _showAmbienceFullscreen(BuildContext context) {
    // Use ambiencePhotos if available, otherwise fall back to ambientImageUrl
    final photos = widget.restaurant.ambiencePhotos.isNotEmpty
        ? widget.restaurant.ambiencePhotos.map((p) => p.imageUrl).toList()
        : [widget.restaurant.ambientImageUrl];

    final reviews = widget.restaurant.reviews.isNotEmpty
        ? widget.restaurant.reviews
        : [Review(author: widget.restaurant.reviewAuthor, quote: widget.restaurant.reviewQuote, rating: widget.restaurant.rating)];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _FullscreenPhotoGallery(
        photos: photos,
        title: 'Ambience',
        reviews: reviews,
      ),
    );
  }

  // Show fullscreen for a food item with multiple images and reviews
  void _showFoodItemFullscreen(BuildContext context, FoodItem foodItem) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _FullscreenPhotoGallery(
        photos: foodItem.images,
        title: foodItem.name,
        reviews: foodItem.reviews,
      ),
    );
  }
}

// Fullscreen photo gallery widget with swipeable photos and reviews
class _FullscreenPhotoGallery extends StatefulWidget {
  final List<String> photos;
  final String title;
  final List<Review> reviews;

  const _FullscreenPhotoGallery({
    required this.photos,
    required this.title,
    required this.reviews,
  });

  @override
  State<_FullscreenPhotoGallery> createState() => _FullscreenPhotoGalleryState();
}

class _FullscreenPhotoGalleryState extends State<_FullscreenPhotoGallery> {
  late PageController _pageController;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height,
      decoration: const BoxDecoration(
        color: Colors.black,
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Header with close button
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.title,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white, size: 28),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),

            // Photo gallery and draggable reviews in a stack
            Expanded(
              child: Stack(
                children: [
                  // Photo gallery (swipeable) - takes full available space
                  Column(
                    children: [
                      Expanded(
                        child: PageView.builder(
                          controller: _pageController,
                          onPageChanged: (index) {
                            setState(() {
                              _currentPage = index;
                            });
                          },
                          itemCount: widget.photos.length,
                          itemBuilder: (context, index) {
                            return Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: Image.network(
                                  widget.photos[index],
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      color: Colors.grey[800],
                                      child: const Icon(Icons.image, size: 80, color: Colors.grey),
                                    );
                                  },
                                ),
                              ),
                            );
                          },
                        ),
                      ),

                      // Page indicator
                      if (widget.photos.length > 1)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(
                              widget.photos.length,
                              (index) => Container(
                                width: 8,
                                height: 8,
                                margin: const EdgeInsets.symmetric(horizontal: 4),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _currentPage == index
                                      ? Colors.white
                                      : Colors.white.withOpacity(0.4),
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),

                  // Draggable reviews section - positioned at bottom
                  DraggableScrollableSheet(
                    initialChildSize: 0.22,
                    minChildSize: 0.22,
                    maxChildSize: 0.85,
                    snap: true,
                    snapSizes: const [0.22, 0.85],
                    builder: (BuildContext context, ScrollController scrollController) {
                      return Container(
                        decoration: BoxDecoration(
                          color: Colors.grey[900],
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(24),
                            topRight: Radius.circular(24),
                          ),
                        ),
                        child: Column(
                          children: [
                            // Drag handle - more prominent
                            Container(
                              margin: const EdgeInsets.only(top: 12, bottom: 12),
                              width: 50,
                              height: 5,
                              decoration: BoxDecoration(
                                color: Colors.grey[500],
                                borderRadius: BorderRadius.circular(3),
                              ),
                            ),

                            // Reviews content
                            Expanded(
                              child: ListView(
                                controller: scrollController,
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text(
                                        'Reviews',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                      Text(
                                        '${widget.reviews.length} reviews',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey[400],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),

                                  // Display all reviews
                                  ...widget.reviews.map((review) {
                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 12),
                                      padding: const EdgeInsets.all(14),
                                      decoration: BoxDecoration(
                                        color: Colors.grey[850],
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              CircleAvatar(
                                                radius: 18,
                                                backgroundColor: Colors.orange,
                                                child: Text(
                                                  review.author[0],
                                                  style: const TextStyle(
                                                    color: Colors.white,
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 16,
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      review.author,
                                                      style: const TextStyle(
                                                        fontSize: 14,
                                                        fontWeight: FontWeight.bold,
                                                        color: Colors.white,
                                                      ),
                                                    ),
                                                    const SizedBox(height: 2),
                                                    Row(
                                                      children: List.generate(5, (index) {
                                                        return Icon(
                                                          index < review.rating.floor()
                                                              ? Icons.star
                                                              : Icons.star_border,
                                                          color: Colors.orange,
                                                          size: 12,
                                                        );
                                                      }),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 10),
                                          Text(
                                            review.quote,
                                            style: const TextStyle(
                                              fontSize: 13,
                                              color: Colors.white,
                                              height: 1.4,
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  }).toList(),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

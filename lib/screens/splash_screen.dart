import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'swipe_screen.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.gradientStart,
              AppColors.background,
              AppColors.gradientEnd,
            ],
            stops: const [0.0, 0.5, 1.0],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(40.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(flex: 2),
                // Decorative element
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.white.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: const Text(
                    '🍴',
                    style: TextStyle(fontSize: 48),
                  ),
                ),
                const SizedBox(height: 32),
                // Logo
                Text(
                  'Jelly',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        color: AppColors.primary,
                        fontSize: 64,
                        fontWeight: FontWeight.w600,
                        letterSpacing: -2,
                      ),
                ),
                const SizedBox(height: 12),
                // Tagline
                Text(
                  'Swipe. Taste. Repeat.',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: AppColors.textLight,
                        fontSize: 17,
                        fontWeight: FontWeight.w400,
                        letterSpacing: 1.2,
                      ),
                ),
                const Spacer(flex: 3),
                // Start button - premium style
                Container(
                  width: double.infinity,
                  height: 58,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(
                          builder: (context) => const SwipeScreen(),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: AppColors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      'Start Discovering',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: AppColors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 17,
                            letterSpacing: 0.3,
                          ),
                    ),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

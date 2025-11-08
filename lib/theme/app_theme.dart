import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Primary colors - Soft, premium palette
  static const Color primary = Color(0xFFE8A87C); // Soft terracotta
  static const Color accent = Color(0xFFC38D9E); // Dusty rose
  static const Color background = Color(0xFFFAF8F5); // Warm off-white
  static const Color text = Color(0xFF2D2D2D); // Softer black
  static const Color textLight = Color(0xFF8B8B8B); // Light grey

  // Action colors - Foodie inspired
  static const Color save = Color(0xFF8BA888); // Sage green
  static const Color skip = Color(0xFFD4A5A5); // Muted pink

  // Gradient colors
  static const Color gradientStart = Color(0xFFFFF5EB); // Peachy cream
  static const Color gradientEnd = Color(0xFFE8DFD8); // Warm sand

  // Additional colors
  static const Color white = Color(0xFFFFFFFE);
  static const Color cardShadow = Color(0x0D000000);
  static const Color overlay = Color(0x40000000);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.accent,
        surface: AppColors.background,
        onPrimary: AppColors.white,
        onSecondary: AppColors.text,
        onSurface: AppColors.text,
      ),
      scaffoldBackgroundColor: AppColors.background,
      textTheme: TextTheme(
        // Logo text - Poppins
        displayLarge: GoogleFonts.poppins(
          fontSize: 48,
          fontWeight: FontWeight.bold,
          color: AppColors.text,
        ),
        displayMedium: GoogleFonts.poppins(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: AppColors.text,
        ),
        displaySmall: GoogleFonts.poppins(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: AppColors.text,
        ),
        // Body text - Inter
        bodyLarge: GoogleFonts.inter(
          fontSize: 16,
          color: AppColors.text,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          color: AppColors.text,
        ),
        bodySmall: GoogleFonts.inter(
          fontSize: 12,
          color: AppColors.text,
        ),
        // Tagline text
        titleLarge: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w500,
          color: AppColors.text,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: AppColors.text,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.white,
          textStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
          elevation: 0,
        ),
      ),
    );
  }
}

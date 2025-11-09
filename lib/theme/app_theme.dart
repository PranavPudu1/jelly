import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Dark mode color palette
  static const Color primary = Color(0xFFFEE0DE); // Pink
  static const Color accent = Color(0xFF584D52); // Gray
  static const Color background = Color(0xFF212121); // Black
  static const Color textDark = Color(0xFF212121); // Black
  static const Color text = Color(0xFFFAF7F7); // White
  static const Color textLight = Color(
    0xFFB0B0B0,
  ); // Light grey for secondary text

  // Action colors - Adjusted for dark mode
  static const Color save = Color(0xFFFEE0DE); // Pink
  static const Color skip = Color(0xFF584D52); // Gray

  // Surface colors
  static const Color surface = Color(
    0xFF2E2E2E,
  ); // Slightly lighter than background
  static const Color surfaceVariant = Color(0xFF584D52); // Gray

  // Additional colors
  static const Color white = Color(0xFFFAF7F7);
  static const Color cardShadow = Color(0x26000000);
  static const Color overlay = Color(0x60000000);
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.accent,
        surface: AppColors.surface,
        background: AppColors.background,
        onPrimary: AppColors.background,
        onSecondary: AppColors.text,
        onSurface: AppColors.text,
        onBackground: AppColors.text,
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
        bodyLarge: GoogleFonts.inter(fontSize: 16, color: AppColors.text),
        bodyMedium: GoogleFonts.inter(fontSize: 14, color: AppColors.text),
        bodySmall: GoogleFonts.inter(fontSize: 12, color: AppColors.textLight),
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
          foregroundColor: AppColors.background,
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
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 2,
        shadowColor: AppColors.cardShadow,
      ),
    );
  }
}

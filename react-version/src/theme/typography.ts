import { TextStyle } from 'react-native';
import { AppColors } from './colors';

export const FontFamily = {
    poppins: {
        regular: 'Poppins-Regular',
        semiBold: 'Poppins-SemiBold',
        bold: 'Poppins-Bold',
    },
    inter: {
        regular: 'Inter-Regular',
        medium: 'Inter-Medium',
        semiBold: 'Inter-SemiBold',
        bold: 'Inter-Bold',
    },
};

export const Typography = {
    // Display styles (Poppins)
    displayLarge: {
        fontFamily: FontFamily.poppins.bold,
        fontSize: 48,
        color: AppColors.text,
    } as TextStyle,

    displayMedium: {
        fontFamily: FontFamily.poppins.bold,
        fontSize: 32,
        color: AppColors.text,
    } as TextStyle,

    displaySmall: {
        fontFamily: FontFamily.poppins.semiBold,
        fontSize: 24,
        color: AppColors.text,
    } as TextStyle,

    // Body styles (Inter)
    bodyLarge: {
        fontFamily: FontFamily.inter.regular,
        fontSize: 16,
        color: AppColors.text,
    } as TextStyle,

    bodyMedium: {
        fontFamily: FontFamily.inter.regular,
        fontSize: 14,
        color: AppColors.text,
    } as TextStyle,

    bodySmall: {
        fontFamily: FontFamily.inter.regular,
        fontSize: 12,
        color: AppColors.textLight,
    } as TextStyle,

    // Title styles (Inter)
    titleLarge: {
        fontFamily: FontFamily.inter.medium,
        fontSize: 18,
        color: AppColors.text,
    } as TextStyle,

    titleMedium: {
        fontFamily: FontFamily.inter.medium,
        fontSize: 16,
        color: AppColors.text,
    } as TextStyle,

    // Button text
    button: {
        fontFamily: FontFamily.inter.semiBold,
        fontSize: 16,
        color: AppColors.background,
    } as TextStyle,
};

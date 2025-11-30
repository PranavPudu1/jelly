import { TextStyle } from 'react-native';
import { AppColors } from './colors';

export const FontFamily = {
    // Headers and display text
    poppins: {
        regular: 'Poppins-Regular',
        semiBold: 'Poppins-SemiBold',
        bold: 'Poppins-Bold',
    },
    // Body text and buttons
    varelaRound: {
        regular: 'VarelaRound-Regular',
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

    // Body styles (Varela Round)
    bodyLarge: {
        fontFamily: FontFamily.varelaRound.regular,
        fontSize: 16,
        color: AppColors.text,
    } as TextStyle,

    bodyMedium: {
        fontFamily: FontFamily.varelaRound.regular,
        fontSize: 14,
        color: AppColors.text,
    } as TextStyle,

    bodySmall: {
        fontFamily: FontFamily.varelaRound.regular,
        fontSize: 12,
        color: AppColors.textLight,
    } as TextStyle,

    // Title styles (Varela Round)
    titleLarge: {
        fontFamily: FontFamily.varelaRound.regular,
        fontSize: 18,
        color: AppColors.text,
    } as TextStyle,

    titleMedium: {
        fontFamily: FontFamily.varelaRound.regular,
        fontSize: 16,
        color: AppColors.text,
    } as TextStyle,

    // Button text (Varela Round)
    button: {
        fontFamily: FontFamily.varelaRound.regular,
        fontSize: 16,
        color: AppColors.background,
    } as TextStyle,
};

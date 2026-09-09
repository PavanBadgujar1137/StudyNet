import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

/// Outfit for headings, Plus Jakarta Sans for body — matches OpenHand web tokens.
class AppTypography {
  AppTypography._();

  static TextTheme textTheme() {
    final head = GoogleFonts.outfitTextTheme();
    final body = GoogleFonts.plusJakartaSansTextTheme();

    return body.copyWith(
      displayLarge: head.displayLarge?.copyWith(
        fontSize: 40,
        fontWeight: FontWeight.w700,
        height: 1.15,
        letterSpacing: -0.8,
        color: AppColors.navy,
      ),
      displayMedium: head.displayMedium?.copyWith(
        fontSize: 32,
        fontWeight: FontWeight.w700,
        height: 1.18,
        letterSpacing: -0.6,
        color: AppColors.navy,
      ),
      headlineLarge: head.headlineLarge?.copyWith(
        fontSize: 26,
        fontWeight: FontWeight.w700,
        height: 1.22,
        letterSpacing: -0.4,
        color: AppColors.navy,
      ),
      headlineMedium: head.headlineMedium?.copyWith(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        height: 1.25,
        letterSpacing: -0.3,
        color: AppColors.navy,
      ),
      titleLarge: head.titleLarge?.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        height: 1.3,
        letterSpacing: -0.2,
        color: AppColors.navy,
      ),
      titleMedium: head.titleMedium?.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        height: 1.35,
        color: AppColors.navy,
      ),
      titleSmall: head.titleSmall?.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        height: 1.35,
        color: AppColors.navy,
      ),
      bodyLarge: body.bodyLarge?.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w500,
        height: 1.55,
        color: AppColors.muted,
      ),
      bodyMedium: body.bodyMedium?.copyWith(
        fontSize: 14.5,
        fontWeight: FontWeight.w500,
        height: 1.5,
        color: AppColors.muted,
      ),
      bodySmall: body.bodySmall?.copyWith(
        fontSize: 13,
        fontWeight: FontWeight.w500,
        height: 1.45,
        color: AppColors.slateMeta,
      ),
      labelLarge: body.labelLarge?.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.1,
        color: AppColors.navy,
      ),
      labelMedium: body.labelMedium?.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.2,
        color: AppColors.muted2,
      ),
      labelSmall: body.labelSmall?.copyWith(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.6,
        color: AppColors.slateMeta,
      ),
    );
  }
}

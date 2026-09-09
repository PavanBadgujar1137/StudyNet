import 'package:flutter/material.dart';

/// OpenHand brand tokens — sourced from frontend/src/styles/global.css
class AppColors {
  AppColors._();

  static const Color navy = Color(0xFF0F172A);
  static const Color navy90 = Color(0xE60F172A);
  static const Color muted = Color(0xFF334155);
  static const Color muted2 = Color(0xFF475569);
  static const Color slateMeta = Color(0xFF64748B);
  static const Color slate400 = Color(0xFF94A3B8);
  static const Color slate200 = Color(0xFFE2E8F0);
  static const Color slate100 = Color(0xFFF1F5F9);

  static const Color blue = Color(0xFF2563EB);
  static const Color blueDeep = Color(0xFF1F5FE0);
  static const Color indigoMid = Color(0xFF4733C9);
  static const Color violet = Color(0xFF7C3AED);
  static const Color altViolet = Color(0xFF8A2BE0);
  static const Color sky = Color(0xFF60A5FA);

  static const Color mist = Color(0xFFF8FAFC);
  static const Color card = Color(0xFFFFFFFF);
  static const Color blueWash = Color(0xFFDBEAFE);
  static const Color skyWash = Color(0xFFEFF6FF);
  static const Color violetWash = Color(0xFFEDE9FE);

  static const Color ok = Color(0xFF059669);
  static const Color okSoft = Color(0xFFDCFCE7);
  static const Color okBorder = Color(0xFFBBF7D0);
  static const Color okText = Color(0xFF166534);
  static const Color warn = Color(0xFFD97706);
  static const Color warnSoft = Color(0xFFFEF3C7);
  static const Color warnText = Color(0xFF92400E);
  static const Color error = Color(0xFFDC2626);
  static const Color errorSoft = Color(0xFFFEE2E2);
  static const Color errorText = Color(0xFF991B1B);

  static const Color rule = Color(0x1A0D1B3D);
  static const Color brandStart = Color(0xFF1F5FE0);
  static const Color brandEnd = Color(0xFF8A2BE0);

  static const LinearGradient brand = LinearGradient(
    begin: Alignment(-0.9, 0),
    end: Alignment(0.9, 0),
    colors: [Color(0xFF2563EB), Color(0xFF7C3AED)],
  );

  static const LinearGradient brandDiagonal = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1F5FE0), Color(0xFF8A2BE0)],
  );

  static const LinearGradient journey = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFF1F5FE0), Color(0xFF4733C9), Color(0xFF8A2BE0)],
  );

  static const LinearGradient softWash = LinearGradient(
    colors: [Color(0x1F2563EB), Color(0x1F7C3AED)],
  );
}

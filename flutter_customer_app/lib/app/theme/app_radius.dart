import 'package:flutter/material.dart';

class AppRadius {
  AppRadius._();

  static const double sm = 10;
  static const double md = 14;
  static const double lg = 20;
  static const double xl = 26;
  static const double pill = 999;

  static BorderRadius get rSm => BorderRadius.circular(sm);
  static BorderRadius get rMd => BorderRadius.circular(md);
  static BorderRadius get rLg => BorderRadius.circular(lg);
  static BorderRadius get rXl => BorderRadius.circular(xl);
  static BorderRadius get rPill => BorderRadius.circular(pill);
}

class AppElevation {
  AppElevation._();

  static const List<BoxShadow> sm = [
    BoxShadow(
      color: Color(0x140D1B3D),
      blurRadius: 16,
      offset: Offset(0, 6),
      spreadRadius: -6,
    ),
  ];

  static const List<BoxShadow> md = [
    BoxShadow(
      color: Color(0x1F0D1B3D),
      blurRadius: 32,
      offset: Offset(0, 14),
      spreadRadius: -12,
    ),
  ];
}

import 'package:flutter/animation.dart';

class AppDurations {
  AppDurations._();

  static const Duration fast = Duration(milliseconds: 140);
  static const Duration base = Duration(milliseconds: 220);
  static const Duration slow = Duration(milliseconds: 380);

  static const Curve ease = Cubic(0.4, 0, 0.2, 1);
}

import 'package:flutter/material.dart';

/// Responsive OpenHand layout — phones, large phones, and tablets.
class AppLayout {
  AppLayout._();

  static const double maxContent = 560;
  static const double compact = 360;
  static const double medium = 600;

  static EdgeInsets pagePadding(
    BuildContext context, {
    double top = 16,
    double bottom = 32,
  }) {
    final width = MediaQuery.sizeOf(context).width;
    final horizontal = width < compact
        ? 16.0
        : width >= medium
            ? 28.0
            : 20.0;
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    return EdgeInsets.fromLTRB(horizontal, top, horizontal, bottom + bottomInset);
  }

  static Widget constrain({required Widget child}) {
    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: maxContent),
        child: child,
      ),
    );
  }
}

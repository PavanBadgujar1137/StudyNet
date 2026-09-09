import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';

class OpenHandBrand extends StatelessWidget {
  const OpenHandBrand({
    super.key,
    this.iconHeight = 88,
    this.showTagline = true,
    this.gap = 18,
    this.horizontal = false,
  });

  final double iconHeight;
  final bool showTagline;
  final double gap;
  final bool horizontal;

  @override
  Widget build(BuildContext context) {
    final mark = Image.asset(
      'assets/images/logo_icon.png',
      height: iconHeight,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.high,
      semanticLabel: 'OpenHand logo',
    );
    final wordmark = Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: 'Open',
            style: (horizontal
                    ? Theme.of(context).textTheme.headlineMedium
                    : Theme.of(context).textTheme.headlineLarge)
                ?.copyWith(
              color: AppColors.blue,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.6,
            ),
          ),
          TextSpan(
            text: 'Hand',
            style: (horizontal
                    ? Theme.of(context).textTheme.headlineMedium
                    : Theme.of(context).textTheme.headlineLarge)
                ?.copyWith(
              color: AppColors.violet,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.6,
            ),
          ),
        ],
      ),
    );

    if (horizontal) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          mark,
          SizedBox(width: gap),
          wordmark,
        ],
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        mark,
        SizedBox(height: gap),
        wordmark,
        if (showTagline) ...[
          const SizedBox(height: 8),
          Text(
            'YOUR GROWTH, OUR GUIDANCE',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: AppColors.slateMeta,
                  letterSpacing: 1.6,
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import 'auth_controller.dart';
import 'openhand_brand.dart';

class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  void _leaveSplash(BuildContext context, AuthState auth) {
    switch (auth.status) {
      case AuthStatus.unauthenticated:
      case AuthStatus.sessionExpired:
        context.go('/login');
      case AuthStatus.authenticated:
        context.go('/journey');
      case AuthStatus.wrongRole:
        context.go('/wrong-role');
      case AuthStatus.unknown:
      case AuthStatus.initializing:
        break;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen<AuthState>(authControllerProvider, (previous, next) {
      _leaveSplash(context, next);
    });
    final auth = ref.watch(authControllerProvider);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (context.mounted) _leaveSplash(context, auth);
    });

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const OpenHandBrand(iconHeight: 96)
                      .animate()
                      .fadeIn(duration: 480.ms)
                      .scale(begin: const Offset(0.96, 0.96), duration: 480.ms),
                  const SizedBox(height: 40),
                  const SizedBox(
                    width: 26,
                    height: 26,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.6,
                      color: AppColors.blue,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

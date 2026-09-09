import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../app/config/app_config.dart';
import '../../../app/theme/app_layout.dart';
import '../../../core/widgets/widgets.dart';
import 'auth_controller.dart';

class WrongRoleScreen extends ConsumerWidget {
  const WrongRoleScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(authControllerProvider);
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: AppLayout.pagePadding(context),
          child: AppLayout.constrain(
            child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 24),
              const OhIconBox(icon: Icons.shield_outlined, size: 56, iconSize: 26),
              const SizedBox(height: 18),
              Text('This app is for learners', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 10),
              Text(
                state.message ??
                    'Your account cannot use the Learner app. Continue on the web portal.',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const Spacer(),
              PrimaryButton(
                label: 'Open OpenHand on the web',
                onPressed: () => launchUrl(
                  Uri.parse(AppConfig.current.webOrigin),
                  mode: LaunchMode.externalApplication,
                ),
              ),
              const SizedBox(height: 12),
              SecondaryButton(
                label: 'Use a different account',
                onPressed: () => ref.read(authControllerProvider.notifier).logout(),
              ),
            ],
          ),
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphoricons_flutter/phosphoricons_flutter.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../core/widgets/widgets.dart';
import '../auth/presentation/auth_controller.dart';

class AppShell extends ConsumerWidget {
  const AppShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    return Scaffold(
      backgroundColor: AppColors.mist,
      body: navigationShell,
      bottomNavigationBar: DecoratedBox(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.slate200)),
          boxShadow: AppElevation.sm,
        ),
        child: SafeArea(
          child: NavigationBar(
            selectedIndex: navigationShell.currentIndex,
            onDestinationSelected: (index) {
              HapticFeedback.selectionClick();
              navigationShell.goBranch(
                index,
                initialLocation: index == navigationShell.currentIndex,
              );
            },
            labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
            destinations: [
              const NavigationDestination(
                icon: Icon(PhosphorIconsRegular.path),
                selectedIcon: Icon(PhosphorIconsFill.path),
                label: 'Journey',
              ),
              const NavigationDestination(
                icon: Icon(PhosphorIconsRegular.heart),
                selectedIcon: Icon(PhosphorIconsFill.heart),
                label: 'Check in',
              ),
              const NavigationDestination(
                icon: Icon(PhosphorIconsRegular.playCircle),
                selectedIcon: Icon(PhosphorIconsFill.playCircle),
                label: 'Courses',
              ),
              const NavigationDestination(
                icon: Icon(PhosphorIconsRegular.chatCircle),
                selectedIcon: Icon(PhosphorIconsFill.chatCircle),
                label: 'Community',
              ),
              NavigationDestination(
                icon: AppAvatar(imageUrl: user?.image, initials: user?.initials ?? 'ME', size: 24, radius: 8),
                selectedIcon: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.blue, width: 1.5),
                  ),
                  child: AppAvatar(imageUrl: user?.image, initials: user?.initials ?? 'ME', size: 24, radius: 7),
                ),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class MoreSheet extends StatelessWidget {
  const MoreSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('OpenHand portal', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 4),
            Text(
              'Personalized space',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 16),
            _MoreTile(
              icon: PhosphorIconsRegular.magnifyingGlass,
              title: 'Practitioners',
              subtitle: 'Find a guide and book a session',
              onTap: () {
                Navigator.pop(context);
                context.push('/practitioners');
              },
            ),
            _MoreTile(
              icon: PhosphorIconsRegular.usersThree,
              title: 'My Circle',
              subtitle: 'Peer support and growth circles',
              onTap: () {
                Navigator.pop(context);
                context.push('/circles');
              },
            ),
            _MoreTile(
              icon: PhosphorIconsRegular.videoCamera,
              title: 'Sessions & resources',
              subtitle: 'Upcoming Zoom classes',
              onTap: () {
                Navigator.pop(context);
                context.push('/sessions');
              },
            ),
            _MoreTile(
              icon: PhosphorIconsRegular.notePencil,
              title: 'Reflections',
              subtitle: 'Prompts from your practitioner',
              onTap: () {
                Navigator.pop(context);
                context.push('/reflections');
              },
            ),
            _MoreTile(
              icon: PhosphorIconsRegular.crown,
              title: 'Plans',
              subtitle: 'Manage your OpenHand membership',
              onTap: () {
                Navigator.pop(context);
                context.push('/plans');
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _MoreTile extends StatelessWidget {
  const _MoreTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AppCard(
        onTap: onTap,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        child: Row(
          children: [
            OhIconBox(icon: icon),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 2),
                  Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            const Icon(PhosphorIconsRegular.caretRight, size: 16, color: AppColors.slate400),
          ],
        ),
      ),
    );
  }
}

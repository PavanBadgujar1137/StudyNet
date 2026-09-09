import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_layout.dart';
import '../../app/theme/app_radius.dart';
import '../../core/constants/unsplash.dart';
import '../../core/errors/api_exception.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/widgets.dart';
import '../shared/models.dart';
import '../shared/providers.dart';

class SessionsScreen extends ConsumerWidget {
  const SessionsScreen({super.key});

  Future<void> _join(BuildContext context, WidgetRef ref, LiveClassSummary cls) async {
    try {
      final data = await ref.read(openHandRepositoryProvider).joinLive(cls.id);
      final url = data['zoomJoinUrl']?.toString() ?? cls.zoomJoinUrl;
      if (url == null || url.isEmpty) {
        if (context.mounted) showAppSnack(context, 'Zoom link is not available yet', error: true);
        return;
      }
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    } catch (e) {
      if (!context.mounted) return;
      showAppSnack(context, e is ApiException ? e.message : 'Could not join class', error: true);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dash = ref.watch(dashboardProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Sessions & resources')),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(dashboardProvider);
          await ref.read(dashboardProvider.future);
        },
        child: ListView(
          padding: AppLayout.pagePadding(context, top: 8),
          children: [
            const SectionHeader(
              eyebrow: 'Sessions',
              title: 'Everything in one place',
              subtitle: 'Your Zoom live classes, course materials, and resources.',
            ),
            const SizedBox(height: 16),
            const PhotoCarousel(slides: Unsplash.sessionSlides, height: 180),
            const SizedBox(height: 16),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Coming up', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  dash.when(
                    loading: () => const SkeletonView(height: 72),
                    error: (e, _) => ErrorView(message: e.toString(), onRetry: () => ref.invalidate(dashboardProvider)),
                    data: (data) {
                      if (data.upcomingClasses.isEmpty) {
                        return const Text('No upcoming Zoom live classes scheduled at this moment.');
                      }
                      return Column(
                        children: data.upcomingClasses.map((cls) {
                          final start = cls.scheduledStart;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: Row(
                              children: [
                                Container(
                                  width: 52,
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  decoration: BoxDecoration(
                                    color: AppColors.skyWash,
                                    borderRadius: AppRadius.rMd,
                                  ),
                                  child: Column(
                                    children: [
                                      Text(
                                        start == null ? '--' : '${start.day}',
                                        style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.navy),
                                      ),
                                      Text(Formatters.monthShort(start), style: Theme.of(context).textTheme.bodySmall),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(cls.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                                      Text(
                                        '${cls.instructor?.fullName ?? 'Instructor'} · ${Formatters.time(start)}',
                                        style: Theme.of(context).textTheme.bodySmall,
                                      ),
                                    ],
                                  ),
                                ),
                                TextButton(
                                  onPressed: () => _join(context, ref, cls),
                                  child: const Text('Join'),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            const AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Past sessions & notes', style: TextStyle(fontWeight: FontWeight.w700)),
                  SizedBox(height: 8),
                  Text('Past session recordings and instructor notes will appear here as live classes conclude.'),
                ],
              ),
            ),
            const SizedBox(height: 14),
            const AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Course study materials', style: TextStyle(fontWeight: FontWeight.w700)),
                  SizedBox(height: 8),
                  Text('Resource guides, audio walkthroughs, and worksheets for enrolled courses will be accessible here.'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

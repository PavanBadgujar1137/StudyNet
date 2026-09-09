import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphoricons_flutter/phosphoricons_flutter.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_layout.dart';
import '../../app/theme/app_radius.dart';
import '../../core/constants/unsplash.dart';
import '../../core/widgets/widgets.dart';
import '../auth/presentation/auth_controller.dart';
import '../shared/models.dart';
import '../shared/providers.dart';
import '../shell/app_shell.dart';

class JourneyScreen extends ConsumerWidget {
  const JourneyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    final dash = ref.watch(dashboardProvider);
    final sub = ref.watch(subscriptionProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(dashboardProvider);
            ref.invalidate(subscriptionProvider);
            await ref.read(dashboardProvider.future);
          },
          child: ListView(
            padding: AppLayout.pagePadding(context, top: 12),
            children: [
              FadeIn(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'LEARNER PORTAL',
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                  color: AppColors.violet,
                                  letterSpacing: 1.1,
                                ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Hello, ${user?.firstName ?? 'there'}',
                            style: Theme.of(context).textTheme.headlineLarge,
                          ),
                          Text(
                            'Personalized space',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    IconButton.filledTonal(
                      tooltip: 'More',
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.navy,
                        side: const BorderSide(color: AppColors.slate200),
                      ),
                      onPressed: () => showModalBottomSheet(
                        context: context,
                        builder: (_) => const MoreSheet(),
                      ),
                      icon: const Icon(PhosphorIconsRegular.squaresFour),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const PhotoCarousel(slides: Unsplash.journeySlides, height: 200),
              const SizedBox(height: 16),
              sub.when(
                data: (s) => _PlanBanner(info: s),
                loading: () => const SkeletonView(height: 56),
                error: (_, _) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 16),
              dash.when(
                data: (data) => _JourneyBody(data: data, firstName: user?.firstName ?? 'there'),
                loading: () => const Column(
                  children: [
                    SkeletonView(height: 140),
                    SizedBox(height: 16),
                    SkeletonView(height: 220),
                  ],
                ),
                error: (e, _) => ErrorView(
                  message: e.toString(),
                  onRetry: () => ref.invalidate(dashboardProvider),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PlanBanner extends StatelessWidget {
  const _PlanBanner({required this.info});
  final SubscriptionInfo info;

  @override
  Widget build(BuildContext context) {
    if (info.hasActiveSubscription) {
      return StatusBadge(
        label: info.planName ?? info.planKey ?? 'Active plan',
        tone: BadgeTone.success,
      );
    }
    if (info.isTrialActive) {
      return GestureDetector(
        onTap: () => context.push('/plans'),
        child: StatusBadge(
          label: '7-day trial · ${info.trialDaysRemaining}d left',
          tone: BadgeTone.info,
        ),
      );
    }
    return GestureDetector(
      onTap: () => context.push('/plans'),
      child: const StatusBadge(
        label: 'Trial expired — select a plan',
        tone: BadgeTone.danger,
      ),
    );
  }
}

class _JourneyBody extends StatelessWidget {
  const _JourneyBody({required this.data, required this.firstName});
  final DashboardData data;
  final String firstName;

  @override
  Widget build(BuildContext context) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final today = DateTime.now().weekday; // 1-7
    final practitioner = data.practitioner?.firstName ?? 'your practitioner';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          eyebrow: 'My journey',
          subtitle:
              'This is your personal learning path — kept private to you and $practitioner. There is no score, no comparison, and no wrong pace.',
        ),
        const SizedBox(height: 16),
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text('Your check-in rhythm', style: Theme.of(context).textTheme.titleMedium),
                  ),
                  Text(
                    '${data.streak} day streak',
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(color: AppColors.blue),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text('${data.checkInCount} total check-ins', style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 14),
              Row(
                children: List.generate(7, (i) {
                  final isToday = i + 1 == today;
                  return Expanded(
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: isToday ? AppColors.blue : AppColors.slate100,
                        borderRadius: AppRadius.rSm,
                      ),
                      child: Text(
                        days[i],
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: isToday ? Colors.white : AppColors.muted2,
                        ),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 12),
              Text(
                'Missed a day? Nothing breaks. Come back whenever — the point is the noticing, not the streak.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            _QuickAction(icon: PhosphorIconsRegular.heart, label: 'Check in', onTap: () => context.go('/checkin')),
            _QuickAction(icon: PhosphorIconsRegular.magnifyingGlass, label: 'Practitioners', onTap: () => context.push('/practitioners')),
            _QuickAction(icon: PhosphorIconsRegular.usersThree, label: 'Circles', onTap: () => context.push('/circles')),
            _QuickAction(icon: PhosphorIconsRegular.videoCamera, label: 'Sessions', onTap: () => context.push('/sessions')),
            _QuickAction(icon: PhosphorIconsRegular.notePencil, label: 'Reflections', onTap: () => context.push('/reflections')),
          ],
        ),
        const SizedBox(height: 22),
        Text('Your path', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        _StepCard(
          step: '1',
          done: true,
          title: 'You created your OpenHand account',
          body: 'Your personalized space was initialized and connected with practitioner and course resources.',
          tag: 'Where it started',
        ),
        _StepCard(
          step: '2',
          done: data.checkInCount > 0,
          title: 'Daily check-in rhythm',
          body: data.checkInCount > 0
              ? 'You have logged ${data.checkInCount} check-ins so far. Keep up the rhythm.'
              : 'Log your first daily check-in to track your mood and sleep rhythm.',
          tag: data.checkInCount > 0 ? 'Active rhythm' : 'Next step',
        ),
        _StepCard(
          step: '3',
          done: data.upcomingClasses.isNotEmpty,
          title: 'Zoom live classes & sessions',
          body: data.upcomingClasses.isNotEmpty
              ? 'You have ${data.upcomingClasses.length} live class(es) scheduled.'
              : 'Enroll in live classes to join Zoom sessions with your instructor.',
          tag: 'Live learning',
        ),
        _StepCard(
          step: '4',
          done: false,
          title: 'Peer support & growth circles',
          body: 'Join Circles to share reflections, track milestones, and learn alongside peers.',
          tag: 'Ongoing',
        ),
        const SizedBox(height: 8),
        Text('Milestones you’ve reached', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        if (data.milestones.isEmpty)
          const AppCard(
            child: Text('Joined platform'),
          )
        else
          ...data.milestones.map(
            (m) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: AppCard(
                child: Row(
                  children: [
                    Icon(
                      m.achieved ? PhosphorIconsFill.diamond : PhosphorIconsRegular.diamond,
                      color: m.achieved ? AppColors.violet : AppColors.slate400,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(m.label, style: Theme.of(context).textTheme.titleSmall),
                    ),
                    Text(m.date, style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
            ),
          ),
        const SizedBox(height: 8),
        Text(
          'Milestones are private by default. If you ever want to share one, that’s your choice.',
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: AppRadius.rMd,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadius.rMd,
          child: Ink(
          width: ((MediaQuery.sizeOf(context).width.clamp(0, AppLayout.maxContent)) - 50) / 2,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: AppRadius.rMd,
            border: Border.all(color: AppColors.slate200),
          ),
          child: Row(
            children: [
              OhIconBox(icon: icon, size: 34, iconSize: 16),
              const SizedBox(width: 10),
              Expanded(
                child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StepCard extends StatelessWidget {
  const _StepCard({
    required this.step,
    required this.done,
    required this.title,
    required this.body,
    required this.tag,
  });

  final String step;
  final bool done;
  final String title;
  final String body;
  final String tag;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AppCard(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                gradient: done ? AppColors.brandDiagonal : null,
                color: done ? null : AppColors.slate100,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: done
                    ? const Icon(PhosphorIconsBold.check, color: Colors.white, size: 16)
                    : Text(
                        step,
                        style: const TextStyle(
                          color: AppColors.muted2,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 4),
                  Text(body, style: Theme.of(context).textTheme.bodySmall),
                  const SizedBox(height: 8),
                  StatusBadge(label: tag, tone: done ? BadgeTone.success : BadgeTone.neutral),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:phosphoricons_flutter/phosphoricons_flutter.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_layout.dart';
import '../../app/theme/app_radius.dart';
import '../../core/constants/api_paths.dart';
import '../../core/constants/unsplash.dart';
import '../../core/errors/api_exception.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/widgets.dart';
import '../auth/presentation/auth_controller.dart';
import '../shared/providers.dart';

class CheckInScreen extends ConsumerStatefulWidget {
  const CheckInScreen({super.key});

  @override
  ConsumerState<CheckInScreen> createState() => _CheckInScreenState();
}

class _CheckInScreenState extends ConsumerState<CheckInScreen> {
  String _mood = 'steady';
  double _sleep = 7;
  final _note = TextEditingController();
  bool _saving = false;
  bool _saved = false;

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await ref.read(openHandRepositoryProvider).submitCheckIn(
            mood: _mood,
            sleepScore: _sleep.round(),
            note: _note.text.trim(),
          );
      ref.invalidate(dashboardProvider);
      if (!mounted) return;
      setState(() => _saved = true);
      showAppSnack(context, 'Check-in logged successfully');
    } catch (e) {
      if (!mounted) return;
      showAppSnack(context, e is ApiException ? e.message : 'Could not save check-in', error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).user;
    final dash = ref.watch(dashboardProvider);
    final practitioner = dash.valueOrNull?.practitioner?.firstName;
    final title = Formatters.practitionerTitle(practitioner);
    final history = dash.valueOrNull?.checkIns ?? [];

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: AppLayout.pagePadding(context),
          children: [
            const SectionHeader(
              eyebrow: 'Check in',
              title: 'How are you today?',
            ),
            const SizedBox(height: 8),
            Text(
              'Takes about fifteen seconds. $title can review your check-ins to track your ongoing progress.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            const PhotoCarousel(slides: Unsplash.checkInSlides, height: 188),
            const SizedBox(height: 20),
            if (_saved)
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Saved. Thanks, ${user?.firstName ?? ''}.',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 6),
                    const Text('Your check-in has been logged.'),
                    const SizedBox(height: 14),
                    SecondaryButton(
                      label: 'Log another check-in',
                      onPressed: () => setState(() => _saved = false),
                    ),
                  ],
                ),
              )
            else
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(Formatters.dateLong(DateTime.now()), style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 4),
                    Text(
                      'There’s no right answer here, and nothing you pick is a problem.',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: 18),
                    Text('Which of these is closest?', style: Theme.of(context).textTheme.titleSmall),
                    const SizedBox(height: 10),
                    ...Moods.options.map((m) {
                      final on = _mood == m.key;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Material(
                          color: on ? AppColors.skyWash : AppColors.mist,
                          borderRadius: AppRadius.rMd,
                          child: InkWell(
                            borderRadius: AppRadius.rMd,
                            onTap: () => setState(() => _mood = m.key),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                              decoration: BoxDecoration(
                                borderRadius: AppRadius.rMd,
                                border: Border.all(color: on ? AppColors.blue : AppColors.slate200),
                              ),
                              child: Row(
                                children: [
                                  Text(m.symbol, style: const TextStyle(fontSize: 18)),
                                  const SizedBox(width: 10),
                                  Text(m.label, style: const TextStyle(fontWeight: FontWeight.w700)),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
                    const SizedBox(height: 8),
                    Text('How much did sleep help this week?', style: Theme.of(context).textTheme.titleSmall),
                    Slider(
                      value: _sleep,
                      min: 0,
                      max: 10,
                      divisions: 10,
                      label: '${_sleep.round()} / 10',
                      onChanged: (v) => setState(() => _sleep = v),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Not at all', style: Theme.of(context).textTheme.bodySmall),
                        Text('${_sleep.round()} / 10', style: Theme.of(context).textTheme.labelMedium),
                        Text('Completely', style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                    const SizedBox(height: 16),
                    AppTextField(
                      label: 'Anything you want to put down? (Optional)',
                      controller: _note,
                      hint: 'How are you feeling today?',
                      maxLines: 4,
                    ),
                    const SizedBox(height: 16),
                    PrimaryButton(
                      label: "Save today's check-in",
                      loading: _saving,
                      onPressed: _saving ? null : _save,
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Only you and ${practitioner ?? 'your practitioner'} can see this. It is never shared with your employer, your circle, or anyone else.',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 20),
            Text(
              'Your check-in log (${history.length} recorded)',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 10),
            if (history.isEmpty)
              const EmptyView(
                icon: PhosphorIconsRegular.heart,
                title: 'No check-ins yet',
                description: 'Log your first check-in above. Missed days don’t break anything.',
              )
            else
              ...history.take(8).map(
                    (c) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: AppCard(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${c.mood} mood',
                                    style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.navy),
                                  ),
                                  if (c.note != null)
                                    Text('“${c.note}”', style: Theme.of(context).textTheme.bodySmall),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text('Sleep ${c.sleepScore}/10', style: Theme.of(context).textTheme.bodySmall),
                                Text(Formatters.dateShort(c.createdAt), style: Theme.of(context).textTheme.bodySmall),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}

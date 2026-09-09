import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/theme/app_layout.dart';
import '../../core/constants/unsplash.dart';
import '../../core/errors/api_exception.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/widgets.dart';
import '../shared/models.dart';
import '../shared/providers.dart';

class ReflectionsScreen extends ConsumerStatefulWidget {
  const ReflectionsScreen({super.key});

  @override
  ConsumerState<ReflectionsScreen> createState() => _ReflectionsScreenState();
}

class _ReflectionsScreenState extends ConsumerState<ReflectionsScreen> {
  bool _loading = true;
  String? _error;
  List<ReflectionPrompt> _prompts = [];
  final Map<String, TextEditingController> _answers = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    for (final c in _answers.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await ref.read(openHandRepositoryProvider).reflections();
      for (final p in list) {
        _answers.putIfAbsent(p.id, TextEditingController.new);
      }
      setState(() {
        _prompts = list;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Could not load reflections';
      });
    }
  }

  Future<void> _act(ReflectionPrompt p, String action, {bool isPrivate = false}) async {
    try {
      await ref.read(openHandRepositoryProvider).answerReflection(
            promptId: p.id,
            answerText: _answers[p.id]?.text ?? '',
            action: action,
            isPrivate: isPrivate,
          );
      if (!mounted) return;
      showAppSnack(context, action == 'skip' ? 'Prompt skipped' : 'Reflection saved');
      await _load();
    } catch (e) {
      if (!mounted) return;
      showAppSnack(context, 'Failed to submit reflection', error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pending = _prompts.where((p) => p.status == 'pending').length;
    return Scaffold(
      appBar: AppBar(title: const Text('Reflections')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: AppLayout.pagePadding(context, top: 8),
          children: [
            SectionHeader(
              eyebrow: 'Reflections',
              title: pending > 0 ? '$pending prompt(s) waiting for you' : 'Your reflection journal',
              subtitle: 'Written by your practitioner to guide your personal journey. There is no deadline.',
            ),
            const SizedBox(height: 16),
            const PhotoCarousel(slides: Unsplash.reflectionSlides, height: 180),
            const SizedBox(height: 16),
            if (_loading)
              const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
            else if (_error != null)
              ErrorView(message: _error!, onRetry: _load)
            else if (_prompts.isEmpty)
              const EmptyView(
                icon: Icons.edit_note_outlined,
                title: 'No prompts yet',
                description: 'No active reflection prompts assigned yet. Your journal notes will appear here.',
              )
            else
              ..._prompts.map((p) {
                final name = Formatters.practitionerTitle(p.practitioner?.fullName);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            AppAvatar(initials: p.practitioner?.initials ?? 'PG', size: 36),
                            const SizedBox(width: 10),
                            Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.w700))),
                            Text(Formatters.dateShort(p.createdAt), style: Theme.of(context).textTheme.bodySmall),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text('“${p.promptText}”', style: Theme.of(context).textTheme.titleSmall),
                        const SizedBox(height: 12),
                        if (p.status == 'answered')
                          Text(p.answerText ?? '')
                        else if (p.status == 'skipped')
                          Text('You skipped this reflection.', style: Theme.of(context).textTheme.bodySmall)
                        else
                          AppTextField(
                            label: 'Your answer',
                            controller: _answers[p.id],
                            maxLines: 5,
                            hint: 'Write as much or as little as you want.',
                          ),
                        if (p.status == 'pending') ...[
                          const SizedBox(height: 12),
                          PrimaryButton(
                            label: 'Send to practitioner',
                            onPressed: () => _act(p, 'answer'),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              TextButton(
                                onPressed: () => _act(p, 'answer', isPrivate: true),
                                child: const Text('Keep private'),
                              ),
                              TextButton(
                                onPressed: () => _act(p, 'skip'),
                                child: const Text('Skip this one'),
                              ),
                            ],
                          ),
                        ],
                        Text(
                          p.status == 'answered'
                              ? (p.isPrivate ? 'Saved privately' : 'Shared with $name')
                              : p.status == 'skipped'
                                  ? 'Skipped'
                                  : 'Only $name sees this',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                );
              }),
            const SizedBox(height: 8),
            Text(
              'Skipping prompts doesn’t affect anything. Your practitioner can see which ones you answered, never which ones you skipped and why.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}

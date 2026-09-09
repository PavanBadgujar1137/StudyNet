import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_layout.dart';
import '../../core/constants/unsplash.dart';
import '../../core/errors/api_exception.dart';
import '../../core/widgets/widgets.dart';
import '../auth/presentation/auth_controller.dart';
import '../shared/models.dart';
import '../shared/providers.dart';

class CirclesScreen extends ConsumerStatefulWidget {
  const CirclesScreen({super.key});

  @override
  ConsumerState<CirclesScreen> createState() => _CirclesScreenState();
}

class _CirclesScreenState extends ConsumerState<CirclesScreen> {
  bool _loading = true;
  String? _error;
  List<CircleItem> _circles = [];
  String? _joining;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await ref.read(openHandRepositoryProvider).circles();
      setState(() {
        _circles = list;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Could not load circles';
      });
    }
  }

  Future<void> _join(String id) async {
    setState(() => _joining = id);
    try {
      await ref.read(openHandRepositoryProvider).joinCircle(id);
      if (!mounted) return;
      showAppSnack(context, 'Successfully joined Circle');
      await _load();
    } catch (e) {
      if (!mounted) return;
      showAppSnack(context, e is ApiException ? e.message : 'Could not join this Circle', error: true);
    } finally {
      if (mounted) setState(() => _joining = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final uid = ref.watch(authControllerProvider).user?.id;
    return Scaffold(
      appBar: AppBar(title: const Text('My Circle')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: AppLayout.pagePadding(context, top: 8),
          children: [
            const SectionHeader(
              eyebrow: 'My Circles',
              title: 'Peer support & growth circles',
              subtitle: 'Join small Circles led by verified practitioners. Chat syncs to Community.',
            ),
            const SizedBox(height: 16),
            const PhotoCarousel(slides: Unsplash.circleSlides, height: 188),
            const SizedBox(height: 16),
            if (_loading)
              const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
            else if (_error != null)
              ErrorView(message: _error!, onRetry: _load)
            else if (_circles.isEmpty)
              const EmptyView(
                icon: Icons.groups_outlined,
                title: 'No circles published yet',
                description: 'Practitioners have not published circles yet. Check back soon.',
              )
            else
              ..._circles.map((c) {
                final joined = uid != null && c.memberIds.contains(uid);
                final fill = c.seats == 0 ? 0.0 : (c.filled / c.seats).clamp(0, 1).toDouble();
                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            StatusBadge(
                              label: joined ? 'Enrolled circle' : 'Practitioner circle',
                              tone: joined ? BadgeTone.info : BadgeTone.neutral,
                            ),
                            const Spacer(),
                            StatusBadge(
                              label: c.status == 'active' ? 'Active' : 'Forming',
                              tone: c.status == 'active' ? BadgeTone.success : BadgeTone.warning,
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(c.name, style: Theme.of(context).textTheme.titleLarge),
                        const SizedBox(height: 6),
                        Text(c.topic ?? c.description ?? 'Small circle focusing on practical wellness and peer support.'),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            AppAvatar(
                              imageUrl: c.practitioner?.image,
                              initials: c.practitioner?.initials ?? 'PR',
                              size: 36,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                c.practitioner?.fullName ?? 'Verified Practitioner',
                                style: const TextStyle(fontWeight: FontWeight.w700),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Text('Capacity ${c.filled}/${c.seats}', style: Theme.of(context).textTheme.bodySmall),
                            const Spacer(),
                            Text('${(fill * 100).round()}% filled', style: Theme.of(context).textTheme.bodySmall),
                          ],
                        ),
                        const SizedBox(height: 6),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(99),
                          child: LinearProgressIndicator(
                            value: fill,
                            minHeight: 6,
                            backgroundColor: AppColors.slate200,
                          ),
                        ),
                        const SizedBox(height: 14),
                        if (joined)
                          Row(
                            children: [
                              const Expanded(child: StatusBadge(label: 'Joined & active', tone: BadgeTone.success)),
                              TextButton(onPressed: () => context.push('/community'), child: const Text('Chat')),
                            ],
                          )
                        else
                          PrimaryButton(
                            label: _joining == c.id ? 'Joining…' : 'Join this Circle',
                            loading: _joining == c.id,
                            onPressed: _joining == c.id ? null : () => _join(c.id),
                          ),
                      ],
                    ),
                  ),
                );
              }),
            const SizedBox(height: 8),
            const AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Circle community guidelines', style: TextStyle(fontWeight: FontWeight.w700)),
                  SizedBox(height: 8),
                  Text('Nobody sees your private check-ins, your notes, or your 1:1 sessions. What is shared in circle stays in the circle.'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

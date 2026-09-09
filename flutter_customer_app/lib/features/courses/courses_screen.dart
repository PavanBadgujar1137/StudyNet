import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:video_player/video_player.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_layout.dart';
import '../../core/constants/unsplash.dart';
import '../../core/errors/api_exception.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/widgets.dart';
import '../auth/presentation/auth_controller.dart';
import '../shared/models.dart';
import '../shared/providers.dart';
import '../shared/razorpay_checkout.dart';

class CoursesScreen extends ConsumerStatefulWidget {
  const CoursesScreen({super.key});

  @override
  ConsumerState<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends ConsumerState<CoursesScreen> {
  final _search = TextEditingController();
  bool _loading = true;
  String? _error;
  List<CourseItem> _courses = [];
  SubscriptionInfo? _sub;
  String? _buyingId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final repo = ref.read(openHandRepositoryProvider);
      final courses = await repo.courses();
      SubscriptionInfo? sub;
      try {
        sub = await repo.mySubscription();
      } catch (_) {}
      setState(() {
        _courses = courses;
        _sub = sub;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Could not load courses';
      });
    }
  }

  bool _hasAccess(CourseItem c) {
    final user = ref.read(authControllerProvider).user;
    final uid = user?.id;
    if (uid != null && (c.enrolledIds.contains(uid) || c.practitionerId == uid)) return true;
    final paid = c.price > 0 && !c.isFree;
    if (paid) return false;
    return _sub?.hasActiveSubscription == true || _sub?.isTrialActive == true;
  }

  Future<void> _buy(CourseItem course) async {
    final user = ref.read(authControllerProvider).user;
    setState(() => _buyingId = course.id);
    final checkout = RazorpayCheckout();
    try {
      final repo = ref.read(openHandRepositoryProvider);
      final order = await repo.buyCourse(course.id);
      final result = await checkout.open(
        order: order,
        name: 'Course: ${course.title}',
        description: 'By ${order.meta['practitionerName'] ?? 'Practitioner'}',
        email: user?.email,
        prefillName: user?.fullName,
      );
      await repo.verifyCoursePayment(
        courseId: course.id,
        orderId: result.orderId,
        paymentId: result.paymentId,
        signature: result.signature,
      );
      if (!mounted) return;
      showAppSnack(context, '${course.title} unlocked');
      await _load();
    } catch (e) {
      if (!mounted) return;
      showAppSnack(context, e is ApiException ? e.message : e.toString(), error: true);
    } finally {
      checkout.dispose();
      if (mounted) setState(() => _buyingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final q = _search.text.toLowerCase();
    final filtered = _courses.where((c) {
      if (q.isEmpty) return true;
      return '${c.title} ${c.description} ${c.practitioner?.fullName}'.toLowerCase().contains(q);
    }).toList();

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            padding: AppLayout.pagePadding(context),
            children: [
              Row(
                children: [
                  Expanded(
                    child: SectionHeader(
                      eyebrow: 'Library',
                      title: 'Courses',
                      subtitle: 'Video courses from practitioners — subscribe or buy to unlock.',
                    ),
                  ),
                  if (_sub != null)
                    StatusBadge(
                      label: _sub!.hasActiveSubscription
                          ? (_sub!.planName ?? 'Active')
                          : _sub!.isTrialActive
                              ? 'Trial ${_sub!.trialDaysRemaining}d'
                              : 'Trial expired',
                      tone: _sub!.hasActiveSubscription
                          ? BadgeTone.success
                          : _sub!.isTrialActive
                              ? BadgeTone.info
                              : BadgeTone.danger,
                    ),
                ],
              ),
              const SizedBox(height: 16),
              const PhotoCarousel(slides: Unsplash.coursesSlides, height: 188),
              if (_sub != null && !_sub!.hasActiveSubscription) ...[
                const SizedBox(height: 12),
                AppCard(
                  onTap: () => context.push('/plans'),
                  child: Row(
                    children: [
                      Icon(
                        Icons.workspace_premium_outlined,
                        color: _sub!.isTrialActive ? AppColors.violet : AppColors.error,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _sub!.isTrialActive
                              ? 'Trial active. Subscribe anytime to keep course access.'
                              : 'Subscribe to unlock free practitioner courses.',
                        ),
                      ),
                      const Icon(Icons.chevron_right),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 16),
              AppTextField(
                label: 'Search courses',
                controller: _search,
                prefixIcon: Icons.search,
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 16),
              if (_loading)
                const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
              else if (_error != null)
                ErrorView(message: _error!, onRetry: _load)
              else if (filtered.isEmpty)
                EmptyView(
                  icon: Icons.menu_book_outlined,
                  title: q.isEmpty ? 'No courses published yet' : 'No courses found',
                  description: q.isEmpty
                      ? 'Practitioners are preparing courses — check back soon.'
                      : 'Try a different search term.',
                )
              else
                ...filtered.map((c) {
                  final access = _hasAccess(c);
                  final paid = c.price > 0 && !c.isFree;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: AppCard(
                      onTap: () => context.push('/courses/${c.id}', extra: {'course': c, 'hasAccess': access}),
                      padding: EdgeInsets.zero,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClipRRect(
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                            child: SizedBox(
                              height: 140,
                              width: double.infinity,
                              child: AppImage(
                                url: c.thumbnail ?? Unsplash.cover(c.id),
                              ),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(child: Text(c.title, style: Theme.of(context).textTheme.titleMedium)),
                                    StatusBadge(
                                      label: access
                                          ? 'Unlocked'
                                          : paid
                                              ? Formatters.rupees(c.price)
                                              : 'Plan course',
                                      tone: access
                                          ? BadgeTone.success
                                          : paid
                                              ? BadgeTone.warning
                                              : BadgeTone.neutral,
                                    ),
                                  ],
                                ),
                                if (c.description != null) ...[
                                  const SizedBox(height: 6),
                                  Text(c.description!, maxLines: 2, overflow: TextOverflow.ellipsis),
                                ],
                                const SizedBox(height: 10),
                                Text(
                                  'Dr. ${c.practitioner?.fullName ?? 'Practitioner'} · ${c.videoCount} videos',
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                                if (paid && !access) ...[
                                  const SizedBox(height: 12),
                                  PrimaryButton(
                                    label: _buyingId == c.id ? 'Processing…' : 'Buy course — ${Formatters.rupees(c.price)}',
                                    loading: _buyingId == c.id,
                                    onPressed: _buyingId == c.id ? null : () => _buy(c),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
            ],
          ),
        ),
      ),
    );
  }
}

class CourseDetailScreen extends ConsumerStatefulWidget {
  const CourseDetailScreen({super.key, required this.course, required this.hasAccess});
  final CourseItem course;
  final bool hasAccess;

  @override
  ConsumerState<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends ConsumerState<CourseDetailScreen> {
  List<CourseVideo> _videos = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    if (widget.hasAccess) _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final videos = await ref.read(openHandRepositoryProvider).courseVideos(widget.course.id);
      setState(() => _videos = videos);
    } catch (e) {
      if (mounted) showAppSnack(context, 'Failed to load videos', error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.course;
    return Scaffold(
      appBar: AppBar(title: const Text('Course')),
      body: ListView(
        padding: AppLayout.pagePadding(context, top: 8),
        children: [
          Text(c.title, style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          if (c.description != null) Text(c.description!),
          const SizedBox(height: 8),
          Text('By Dr. ${c.practitioner?.fullName ?? 'Practitioner'}', style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 20),
          if (!widget.hasAccess)
            AppCard(
              child: Column(
                children: [
                  const Icon(Icons.lock_outline, color: AppColors.blue, size: 36),
                  const SizedBox(height: 12),
                  Text('Subscription required', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 8),
                  Text(
                    c.requiredPlan == 'beginner'
                        ? 'This course requires a Beginner Plan (₹51/mo) or above.'
                        : 'Subscribe to access practitioner courses.',
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  PrimaryButton(label: 'View plans', onPressed: () => context.push('/plans')),
                ],
              ),
            )
          else if (_loading)
            const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
          else if (_videos.isEmpty)
            const EmptyView(
              icon: Icons.videocam_off_outlined,
              title: 'No videos yet',
              description: 'No videos have been added to this course.',
            )
          else
            ..._videos.asMap().entries.map((e) {
              final i = e.key;
              final v = e.value;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: AppCard(
                  onTap: v.videoUrl == null
                      ? null
                      : () => Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => VideoPlayerScreen(videos: _videos, index: i),
                            ),
                          ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: const BoxDecoration(
                          gradient: AppColors.brandDiagonal,
                          borderRadius: BorderRadius.all(Radius.circular(10)),
                        ),
                        child: const Icon(Icons.play_arrow, color: Colors.white),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('${i + 1}. ${v.title}', style: Theme.of(context).textTheme.titleSmall),
                            if (v.description != null)
                              Text(v.description!, maxLines: 1, overflow: TextOverflow.ellipsis),
                          ],
                        ),
                      ),
                      Text(Formatters.duration(v.durationSeconds), style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}

class VideoPlayerScreen extends StatefulWidget {
  const VideoPlayerScreen({super.key, required this.videos, required this.index});
  final List<CourseVideo> videos;
  final int index;

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  late int _index;
  VideoPlayerController? _controller;

  CourseVideo get _video => widget.videos[_index];

  @override
  void initState() {
    super.initState();
    _index = widget.index;
    _init();
  }

  Future<void> _init() async {
    final url = _video.videoUrl;
    if (url == null) return;
    final controller = VideoPlayerController.networkUrl(Uri.parse(url));
    await controller.initialize();
    await controller.play();
    if (!mounted) return;
    setState(() => _controller = controller);
  }

  Future<void> _next() async {
    if (_index >= widget.videos.length - 1) return;
    await _controller?.dispose();
    setState(() {
      _controller = null;
      _index += 1;
    });
    await _init();
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(_video.title, style: const TextStyle(color: Colors.white, fontSize: 16)),
      ),
      body: Column(
        children: [
          Expanded(
            child: Center(
              child: _controller == null
                  ? const CircularProgressIndicator(color: Colors.white)
                  : AspectRatio(
                      aspectRatio: _controller!.value.aspectRatio == 0 ? 16 / 9 : _controller!.value.aspectRatio,
                      child: VideoPlayer(_controller!),
                    ),
            ),
          ),
          if (_controller != null)
            IconButton(
              color: Colors.white,
              iconSize: 42,
              onPressed: () {
                setState(() {
                  _controller!.value.isPlaying ? _controller!.pause() : _controller!.play();
                });
              },
              icon: Icon(_controller!.value.isPlaying ? Icons.pause_circle : Icons.play_circle),
            ),
          if (_index < widget.videos.length - 1)
            Padding(
              padding: const EdgeInsets.all(16),
              child: PrimaryButton(label: 'Next video', onPressed: _next),
            ),
        ],
      ),
    );
  }
}

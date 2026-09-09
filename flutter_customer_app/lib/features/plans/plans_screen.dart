import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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

class PlansScreen extends ConsumerStatefulWidget {
  const PlansScreen({super.key});

  @override
  ConsumerState<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends ConsumerState<PlansScreen> {
  bool _loading = true;
  String? _error;
  List<PlanItem> _plans = [];
  String? _buying;

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
      final plans = await ref.read(openHandRepositoryProvider).plans();
      setState(() {
        _plans = plans.where((p) => p.isLearnerPlan).toList();
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Could not load plans';
      });
    }
  }

  Future<void> _subscribe(PlanItem plan) async {
    final user = ref.read(authControllerProvider).user;
    setState(() => _buying = plan.planKey);
    final checkout = RazorpayCheckout();
    try {
      final repo = ref.read(openHandRepositoryProvider);
      final order = await repo.createSubscription(plan.planKey);
      final result = await checkout.open(
        order: order,
        name: 'OpenHand',
        description: plan.name,
        email: user?.email,
        prefillName: user?.fullName,
      );
      await repo.verifySubscription(
        planKey: plan.planKey,
        orderId: result.orderId,
        paymentId: result.paymentId,
        signature: result.signature,
      );
      ref.invalidate(subscriptionProvider);
      ref.invalidate(dashboardProvider);
      if (!mounted) return;
      showAppSnack(context, '${plan.name} activated');
    } catch (e) {
      if (!mounted) return;
      showAppSnack(context, e is ApiException ? e.message : e.toString(), error: true);
    } finally {
      checkout.dispose();
      if (mounted) setState(() => _buying = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Choose a plan')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: AppLayout.pagePadding(context, top: 8),
          children: [
            Text(
              'Subscribe via Razorpay to unlock practitioner courses and keep your space.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            const PhotoCarousel(slides: Unsplash.planSlides, height: 188),
            const SizedBox(height: 16),
            if (_loading)
              const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
            else if (_error != null)
              ErrorView(message: _error!, onRetry: _load)
            else
              ..._plans.map((p) {
                final featured = p.planKey == 'advance';
                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: AppCard(
                    padding: EdgeInsets.zero,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        PhotoBanner(
                          url: Unsplash.cover(p.planKey),
                          height: 120,
                          title: p.name,
                          radius: const BorderRadius.vertical(top: Radius.circular(20)),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                        Row(
                          children: [
                            Expanded(child: Text(p.name, style: Theme.of(context).textTheme.titleLarge)),
                            if (featured) const StatusBadge(label: 'Most popular', tone: BadgeTone.info),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${Formatters.rupees(p.monthlyFee)} / month',
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.navy),
                        ),
                        const SizedBox(height: 8),
                        Text(p.tagline),
                        const SizedBox(height: 12),
                        ...p.features.map(
                          (f) => Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.check, size: 16, color: AppColors.ok),
                                const SizedBox(width: 8),
                                Expanded(child: Text(f, style: Theme.of(context).textTheme.bodySmall)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        PrimaryButton(
                          label: _buying == p.planKey ? 'Processing…' : 'Subscribe',
                          loading: _buying == p.planKey,
                          onPressed: _buying == null ? () => _subscribe(p) : null,
                        ),
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
    );
  }
}

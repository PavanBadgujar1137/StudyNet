import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_layout.dart';
import '../../app/theme/app_radius.dart';
import '../../core/constants/unsplash.dart';
import '../../core/constants/api_paths.dart';
import '../../core/errors/api_exception.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/widgets.dart';
import '../auth/presentation/auth_controller.dart';
import '../shared/models.dart';
import '../shared/providers.dart';
import '../shared/razorpay_checkout.dart';

class PractitionersScreen extends ConsumerStatefulWidget {
  const PractitionersScreen({super.key});

  @override
  ConsumerState<PractitionersScreen> createState() => _PractitionersScreenState();
}

class _PractitionersScreenState extends ConsumerState<PractitionersScreen> {
  final _search = TextEditingController();
  String _specialty = 'All';
  bool _loading = true;
  String? _error;
  List<PractitionerCard> _all = [];
  List<ConnectionRecord> _connections = [];
  final Map<String, Set<String>> _selected = {};
  String? _payingId;

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
      final results = await Future.wait([
        repo.practitioners(),
        repo.myConnections(),
      ]);
      final list = results[0] as List<PractitionerCard>;
      final conns = results[1] as List<ConnectionRecord>;
      final map = <String, Set<String>>{};
      for (final p in list) {
        if (p.offers.isNotEmpty) map[p.id] = {p.offers.first.id};
      }
      setState(() {
        _all = list;
        _connections = conns;
        _selected.addAll(map);
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Could not load practitioners';
      });
    }
  }

  ConnectionRecord? _conn(String id) {
    try {
      return _connections.firstWhere((c) => c.practitionerId == id);
    } catch (_) {
      return null;
    }
  }

  num _fee(PractitionerCard p) {
    final ids = _selected[p.id] ?? {};
    final selected = p.offers.where((o) => ids.contains(o.id)).toList();
    if (selected.isEmpty) return p.sessionRate;
    return selected.fold<num>(0, (s, o) => s + o.price);
  }

  Future<void> _pay(PractitionerCard p) async {
    final user = ref.read(authControllerProvider).user;
    final selectedIds = _selected[p.id]?.toList() ?? [];
    if (selectedIds.isEmpty) {
      showAppSnack(context, 'Select at least one offer', error: true);
      return;
    }
    setState(() => _payingId = p.id);
    final checkout = RazorpayCheckout();
    try {
      final repo = ref.read(openHandRepositoryProvider);
      for (final offerId in selectedIds) {
        final order = await repo.bookOffer(offerId);
        if (order.orderId == 'free' || order.amountPaise == 0) {
          continue;
        }
        final result = await checkout.open(
          order: order,
          name: 'OpenHand',
          description: 'Session with ${p.fullName}',
          email: user?.email,
          prefillName: user?.fullName,
        );
        final bookingId = order.meta['bookingId']?.toString() ?? '';
        if (bookingId.isNotEmpty) {
          await repo.verifyOfferBooking(
            bookingId: bookingId,
            orderId: result.orderId,
            paymentId: result.paymentId,
            signature: result.signature,
          );
        }
        await repo.connectPractitioner(
          practitionerId: p.id,
          amountPaid: (order.meta['amount'] as num?) ?? (order.amountPaise / 100),
          orderId: result.orderId,
          paymentId: result.paymentId,
          signature: result.signature,
          offerId: offerId,
        );
      }
      if (!mounted) return;
      showAppSnack(context, 'Payment successful. Connection request sent.');
      await _load();
    } catch (e) {
      if (!mounted) return;
      showAppSnack(context, e is ApiException ? e.message : e.toString(), error: true);
    } finally {
      checkout.dispose();
      if (mounted) setState(() => _payingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final query = _search.text.toLowerCase();
    final filtered = _all.where((p) {
      if (p.offers.isEmpty) return false;
      final hay = '${p.fullName} ${p.email} ${p.credentials} ${p.specialties.join(' ')}'.toLowerCase();
      final matchesSearch = query.isEmpty || hay.contains(query);
      if (_specialty == 'All') return matchesSearch;
      final cat = _specialty.toLowerCase().split(' ').first;
      return matchesSearch && p.specialties.join(' ').toLowerCase().contains(cat);
    }).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Practitioners')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: AppLayout.pagePadding(context, top: 8),
          children: [
            const SectionHeader(
              eyebrow: 'Directory',
              title: 'Select your practitioner',
              subtitle: 'Browse verified practitioners, choose an offer, and connect.',
            ),
            const SizedBox(height: 16),
            const PhotoCarousel(slides: Unsplash.practitionerSlides, height: 188),
            const SizedBox(height: 16),
            AppTextField(
              label: 'Search',
              controller: _search,
              hint: 'Name, credentials, or specialty',
              prefixIcon: Icons.search,
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: SpecialtyFilters.values.map((cat) {
                final on = _specialty == cat;
                return ChoiceChip(
                  label: Text(cat),
                  selected: on,
                  onSelected: (_) => setState(() => _specialty = cat),
                  selectedColor: AppColors.blue,
                  labelStyle: TextStyle(
                    color: on ? Colors.white : AppColors.muted2,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            if (_loading)
              const Padding(
                padding: EdgeInsets.only(top: 40),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_error != null)
              ErrorView(message: _error!, onRetry: _load)
            else if (filtered.isEmpty)
              const EmptyView(
                icon: Icons.person_search_outlined,
                title: 'No practitioners matched',
                description: 'Try clearing filters or searching a different specialty.',
              )
            else
              ...filtered.map((p) => _PractitionerTile(
                    practitioner: p,
                    connection: _conn(p.id),
                    selected: _selected[p.id] ?? {},
                    fee: _fee(p),
                    paying: _payingId == p.id,
                    onToggle: (id) => setState(() {
                      final set = {...(_selected[p.id] ?? {})};
                      if (set.contains(id)) {
                        set.remove(id);
                      } else {
                        set.add(id);
                      }
                      _selected[p.id] = set;
                    }),
                    onPay: () => _pay(p),
                    onChat: () => context.push('/community'),
                  )),
          ],
        ),
      ),
    );
  }
}

class _PractitionerTile extends StatelessWidget {
  const _PractitionerTile({
    required this.practitioner,
    required this.connection,
    required this.selected,
    required this.fee,
    required this.paying,
    required this.onToggle,
    required this.onPay,
    required this.onChat,
  });

  final PractitionerCard practitioner;
  final ConnectionRecord? connection;
  final Set<String> selected;
  final num fee;
  final bool paying;
  final ValueChanged<String> onToggle;
  final VoidCallback onPay;
  final VoidCallback onChat;

  @override
  Widget build(BuildContext context) {
    final status = connection?.status;
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: AppCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                AppAvatar(imageUrl: practitioner.image, initials: practitioner.initials),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(practitioner.fullName, style: Theme.of(context).textTheme.titleMedium),
                          ),
                          const SizedBox(width: 6),
                          const StatusBadge(label: 'Verified', tone: BadgeTone.warning),
                        ],
                      ),
                      Text(
                        practitioner.credentials?.isNotEmpty == true
                            ? practitioner.credentials!
                            : 'Verified Clinical Practitioner',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.blue),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              practitioner.bio?.isNotEmpty == true
                  ? practitioner.bio!
                  : 'Certified practitioner specializing in holistic guidance and learner growth.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            if (practitioner.specialties.isNotEmpty) ...[
              const SizedBox(height: 10),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: practitioner.specialties
                    .map((s) => StatusBadge(label: s, tone: BadgeTone.neutral))
                    .toList(),
              ),
            ],
            const SizedBox(height: 12),
            ...practitioner.offers.map((o) {
              final on = selected.contains(o.id);
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: InkWell(
                  onTap: () => onToggle(o.id),
                  borderRadius: AppRadius.rMd,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: on ? AppColors.skyWash : AppColors.mist,
                      borderRadius: AppRadius.rMd,
                      border: Border.all(color: on ? AppColors.blue : AppColors.slate200),
                    ),
                    child: Row(
                      children: [
                        Icon(on ? Icons.check_box : Icons.check_box_outline_blank, color: on ? AppColors.blue : AppColors.slate400),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(o.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                              Text(
                                '${o.type == 'circle' ? 'Circle' : '1:1 Session'} · ${o.durationMinutes ?? 50} mins',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ),
                        Text(Formatters.rupees(o.price), style: TextStyle(fontWeight: FontWeight.w800, color: on ? AppColors.blue : AppColors.navy)),
                      ],
                    ),
                  ),
                ),
              );
            }),
            const SizedBox(height: 8),
            Row(
              children: [
                Text('Selected fee  ', style: Theme.of(context).textTheme.bodySmall),
                Text(Formatters.rupees(fee), style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.blue)),
              ],
            ),
            const SizedBox(height: 12),
            if (status == 'approved' || status == 'active')
              Row(
                children: [
                  const Expanded(child: StatusBadge(label: 'Approved & connected', tone: BadgeTone.success)),
                  const SizedBox(width: 8),
                  TextButton(onPressed: onChat, child: const Text('Chat')),
                ],
              )
            else if (status == 'pending_approval')
              const StatusBadge(label: 'Awaiting practitioner approval', tone: BadgeTone.warning)
            else
              PrimaryButton(
                label: paying ? 'Processing…' : 'Pay ${Formatters.rupees(fee)} & request connection',
                loading: paying,
                onPressed: paying || fee <= 0 ? null : onPay,
              ),
          ],
        ),
      ),
    );
  }
}

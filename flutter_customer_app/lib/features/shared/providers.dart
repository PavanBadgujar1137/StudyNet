import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/presentation/auth_controller.dart';
import 'openhand_repository.dart';

final openHandRepositoryProvider = Provider<OpenHandRepository>(
  (ref) => OpenHandRepository(ref.watch(apiClientProvider)),
);

final dashboardProvider = FutureProvider.autoDispose((ref) {
  return ref.watch(openHandRepositoryProvider).clientDashboard();
});

final subscriptionProvider = FutureProvider.autoDispose((ref) {
  return ref.watch(openHandRepositoryProvider).mySubscription();
});

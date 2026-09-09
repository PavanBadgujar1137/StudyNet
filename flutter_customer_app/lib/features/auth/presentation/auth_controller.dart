import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/config/app_config.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_store.dart';
import '../data/auth_repository.dart';
import '../data/user_model.dart';

final secureStoreProvider = Provider<SecureStore>((ref) => SecureStore());

final apiClientProvider = Provider<ApiClient>((ref) {
  final client = ApiClient(
    config: AppConfig.current,
    store: ref.watch(secureStoreProvider),
  );
  client.onUnauthorized = () {
    ref.read(authControllerProvider.notifier).onSessionExpired();
  };
  return client;
});

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(ref.watch(apiClientProvider)),
);

enum AuthStatus {
  unknown,
  initializing,
  authenticated,
  unauthenticated,
  sessionExpired,
  wrongRole,
}

class AuthState {
  const AuthState({
    this.status = AuthStatus.unknown,
    this.user,
    this.token,
    this.message,
    this.signupDraft,
  });

  final AuthStatus status;
  final AppUser? user;
  final String? token;
  final String? message;
  final SignupDraft? signupDraft;

  bool get isAuthenticated => status == AuthStatus.authenticated && user != null;

  AuthState copyWith({
    AuthStatus? status,
    AppUser? user,
    String? token,
    String? message,
    SignupDraft? signupDraft,
    bool clearUser = false,
    bool clearDraft = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: clearUser ? null : (user ?? this.user),
      token: clearUser ? null : (token ?? this.token),
      message: message,
      signupDraft: clearDraft ? null : (signupDraft ?? this.signupDraft),
    );
  }
}

class AuthController extends Notifier<AuthState> {
  bool _restoreStarted = false;

  @override
  AuthState build() {
    Future.microtask(restoreSession);
    return const AuthState(status: AuthStatus.initializing);
  }

  SecureStore get _store => ref.read(secureStoreProvider);
  AuthRepository get _repo => ref.read(authRepositoryProvider);

  Future<void> restoreSession() async {
    if (_restoreStarted) return;
    _restoreStarted = true;
    state = state.copyWith(status: AuthStatus.initializing);
    try {
      await _restore().timeout(const Duration(seconds: 6));
    } catch (_) {
      if (state.status == AuthStatus.initializing || state.status == AuthStatus.unknown) {
        state = const AuthState(status: AuthStatus.unauthenticated);
      }
    }
  }

  Future<void> _restore() async {
    final token = await _store.readToken();
    if (token == null || token.isEmpty) {
      state = const AuthState(status: AuthStatus.unauthenticated);
      return;
    }

    final cached = AppUser.tryDecode(await _store.readUserJson());
    if (cached != null && cached.isLearner) {
      state = AuthState(status: AuthStatus.authenticated, user: cached, token: token);
      _refreshInBackground(token);
      return;
    }

    try {
      final user = await _repo.getUserDetails();
      if (!user.isLearner) {
        await _store.clear();
        state = AuthState(
          status: AuthStatus.wrongRole,
          user: user,
          message: _wrongRoleMessage(user.accountType),
        );
        return;
      }
      await _persist(token, user);
      state = AuthState(status: AuthStatus.authenticated, user: user, token: token);
    } catch (_) {
      await _store.clear();
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> _refreshInBackground(String token) async {
    try {
      final user = await _repo.getUserDetails();
      if (!user.isLearner) {
        await _store.clear();
        state = AuthState(
          status: AuthStatus.wrongRole,
          user: user,
          message: _wrongRoleMessage(user.accountType),
        );
        return;
      }
      await _persist(token, user);
      state = AuthState(status: AuthStatus.authenticated, user: user, token: token);
    } catch (_) {}
  }

  Future<void> login(String email, String password) async {
    final session = await _repo.login(email: email, password: password);
    await _accept(session);
  }

  Future<void> sendOtp(SignupDraft draft) async {
    await _repo.sendOtp(draft.email);
    state = state.copyWith(signupDraft: draft);
  }

  Future<void> verifySignup(String otp) async {
    final draft = state.signupDraft;
    if (draft == null) {
      throw const FormatException('Please complete signup first.');
    }
    final session = await _repo.signup(draft: draft, otp: otp);
    await _accept(session);
  }

  Future<void> logout() async {
    await _store.clear();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  Future<void> onSessionExpired() async {
    await _store.clear();
    state = const AuthState(
      status: AuthStatus.sessionExpired,
      message: 'Your session has expired. Please sign in again.',
    );
  }

  Future<void> refreshUser() async {
    final user = await _repo.getUserDetails();
    final token = state.token ?? await _store.readToken();
    if (token != null) await _persist(token, user);
    state = state.copyWith(user: user);
  }

  Future<void> setUser(AppUser user) async {
    final token = state.token ?? await _store.readToken();
    if (token != null) await _persist(token, user);
    state = state.copyWith(user: user);
  }

  Future<void> _accept(AuthSession session) async {
    if (!session.user.isLearner) {
      await _store.clear();
      state = AuthState(
        status: AuthStatus.wrongRole,
        user: session.user,
        message: _wrongRoleMessage(session.user.accountType),
      );
      return;
    }
    await _persist(session.token, session.user);
    state = AuthState(
      status: AuthStatus.authenticated,
      user: session.user,
      token: session.token,
    );
  }

  Future<void> _persist(String token, AppUser user) async {
    await _store.saveToken(token);
    await _store.saveUserJson(user.encode());
  }

  String _wrongRoleMessage(String type) {
    if (type == 'Practitioner' || type == 'Instructor') {
      return 'This app is for learners. Practitioners can use the Practitioner app or openhand.live/practice.';
    }
    if (type == 'Admin' || type == 'OrgAdmin') {
      return 'Admin and organization accounts are managed on the web at openhand.live.';
    }
    return 'This account type cannot use the Learner app.';
  }
}

final authControllerProvider = NotifierProvider<AuthController, AuthState>(AuthController.new);

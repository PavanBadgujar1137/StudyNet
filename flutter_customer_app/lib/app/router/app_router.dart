import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/auth_controller.dart';
import '../../features/auth/presentation/forgot_password_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/otp_screen.dart';
import '../../features/auth/presentation/signup_screen.dart';
import '../../features/auth/presentation/splash_screen.dart';
import '../../features/auth/presentation/wrong_role_screen.dart';
import '../../features/checkin/checkin_screen.dart';
import '../../features/circle/circles_screen.dart';
import '../../features/community/community_screen.dart';
import '../../features/courses/courses_screen.dart';
import '../../features/journey/journey_screen.dart';
import '../../features/plans/plans_screen.dart';
import '../../features/practitioners/practitioners_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/reflections/reflections_screen.dart';
import '../../features/sessions/sessions_screen.dart';
import '../../features/shared/models.dart';
import '../../features/shell/app_shell.dart';

final _rootKey = GlobalKey<NavigatorState>();

GoRouter createRouter(Ref ref) {
  final refresh = ValueNotifier<int>(0);
  ref.listen<AuthState>(authControllerProvider, (_, _) {
    refresh.value++;
  });
  ref.onDispose(refresh.dispose);

  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/splash',
    refreshListenable: refresh,
    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      final loc = state.matchedLocation;
      final public = {
        '/login',
        '/signup',
        '/verify-email',
        '/forgot-password',
      };
      final isPublic = public.contains(loc) || loc.startsWith('/reset-password');

      if (auth.status == AuthStatus.unknown || auth.status == AuthStatus.initializing) {
        return loc == '/splash' ? null : '/splash';
      }
      if (auth.status == AuthStatus.wrongRole) {
        return loc == '/wrong-role' ? null : '/wrong-role';
      }
      if (auth.status == AuthStatus.unauthenticated || auth.status == AuthStatus.sessionExpired) {
        if (loc == '/splash' || !isPublic) return '/login';
        return null;
      }
      if (auth.isAuthenticated && (isPublic || loc == '/splash' || loc == '/wrong-role')) {
        return '/journey';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, _) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
      GoRoute(path: '/signup', builder: (_, _) => const SignupScreen()),
      GoRoute(path: '/verify-email', builder: (_, _) => const OtpScreen()),
      GoRoute(path: '/forgot-password', builder: (_, _) => const ForgotPasswordScreen()),
      GoRoute(
        path: '/reset-password/:token',
        builder: (_, state) => ResetPasswordScreen(token: state.pathParameters['token'] ?? ''),
      ),
      GoRoute(path: '/wrong-role', builder: (_, _) => const WrongRoleScreen()),
      StatefulShellRoute.indexedStack(
        builder: (_, _, shell) => AppShell(navigationShell: shell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(path: '/journey', builder: (_, _) => const JourneyScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/checkin', builder: (_, _) => const CheckInScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/courses', builder: (_, _) => const CoursesScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/community', builder: (_, _) => const CommunityScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/profile', builder: (_, _) => const ProfileScreen()),
          ]),
        ],
      ),
      GoRoute(path: '/practitioners', builder: (_, _) => const PractitionersScreen()),
      GoRoute(path: '/circles', builder: (_, _) => const CirclesScreen()),
      GoRoute(path: '/sessions', builder: (_, _) => const SessionsScreen()),
      GoRoute(path: '/reflections', builder: (_, _) => const ReflectionsScreen()),
      GoRoute(path: '/plans', builder: (_, _) => const PlansScreen()),
      GoRoute(path: '/profile/edit', builder: (_, _) => const EditProfileScreen()),
      GoRoute(path: '/profile/password', builder: (_, _) => const ChangePasswordScreen()),
      GoRoute(path: '/profile/photo', builder: (_, _) => const ChangePhotoScreen()),
      GoRoute(
        path: '/courses/:id',
        builder: (_, state) {
          final extra = state.extra;
          CourseItem? course;
          var hasAccess = false;
          if (extra is Map) {
            course = extra['course'] as CourseItem?;
            hasAccess = extra['hasAccess'] == true;
          }
          if (course == null) {
            return const Scaffold(body: Center(child: Text('Course not found')));
          }
          return CourseDetailScreen(course: course, hasAccess: hasAccess);
        },
      ),
    ],
  );
}

final appRouterProvider = Provider<GoRouter>((ref) => createRouter(ref));

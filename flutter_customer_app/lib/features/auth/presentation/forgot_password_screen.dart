import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/errors/api_exception.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/widgets.dart';
import '../../../app/theme/app_layout.dart';
import 'auth_controller.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _email = TextEditingController();
  bool _sent = false;
  bool _loading = false;

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final error = Validators.email(_email.text);
    if (error != null) {
      showAppSnack(context, error, error: true);
      return;
    }
    setState(() => _loading = true);
    try {
      await ref.read(authRepositoryProvider).requestPasswordReset(_email.text);
      setState(() => _sent = true);
    } catch (e) {
      if (!mounted) return;
      showAppSnack(
        context,
        e is ApiException ? e.message : 'Failed to send reset email',
        error: true,
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reset password')),
      backgroundColor: Colors.white,
      body: Padding(
        padding: AppLayout.pagePadding(context, top: 12, bottom: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _sent ? 'Check your email' : 'Forgot your password?',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              _sent
                  ? 'We sent reset instructions to ${_email.text}.'
                  : 'We’ll email you a link to choose a new password.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            if (!_sent)
              AppTextField(
                label: 'Email address',
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                validator: Validators.email,
              ),
            const SizedBox(height: 24),
            PrimaryButton(
              label: _sent ? 'Resend email' : 'Send reset email',
              loading: _loading,
              onPressed: _loading ? null : _submit,
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => context.go('/login'),
              child: const Text('Back to sign in'),
            ),
          ],
        ),
      ),
    );
  }
}

class ResetPasswordScreen extends ConsumerStatefulWidget {
  const ResetPasswordScreen({super.key, required this.token});
  final String token;

  @override
  ConsumerState<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  bool _obscure = true;
  bool _loading = false;

  @override
  void dispose() {
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final p = Validators.password(_password.text);
    final c = Validators.confirmPassword(_confirm.text, _password.text);
    if (p != null || c != null) {
      showAppSnack(context, p ?? c ?? 'Invalid password', error: true);
      return;
    }
    setState(() => _loading = true);
    try {
      await ref.read(authRepositoryProvider).resetPassword(
            token: widget.token,
            password: _password.text,
            confirmPassword: _confirm.text,
          );
      if (!mounted) return;
      showAppSnack(context, 'Password reset successfully');
      context.go('/login');
    } catch (e) {
      if (!mounted) return;
      showAppSnack(
        context,
        e is ApiException ? e.message : 'Could not reset password',
        error: true,
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Choose a new password')),
      backgroundColor: Colors.white,
      body: Padding(
        padding: AppLayout.pagePadding(context, top: 12, bottom: 24),
        child: Column(
          children: [
            AppTextField(
              label: 'New password',
              controller: _password,
              obscure: _obscure,
              onToggleObscure: () => setState(() => _obscure = !_obscure),
            ),
            const SizedBox(height: 14),
            AppTextField(
              label: 'Confirm new password',
              controller: _confirm,
              obscure: true,
            ),
            const SizedBox(height: 24),
            PrimaryButton(
              label: 'Reset password',
              loading: _loading,
              onPressed: _loading ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }
}

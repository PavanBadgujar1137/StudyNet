import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_layout.dart';
import '../../../app/theme/app_radius.dart';
import '../../../core/errors/api_exception.dart';
import '../../../core/widgets/widgets.dart';
import 'auth_controller.dart';

class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _otp = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _otp.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    if (_otp.text.trim().length != 6) {
      showAppSnack(context, 'Enter the 6-digit code', error: true);
      return;
    }
    setState(() => _loading = true);
    try {
      await ref.read(authControllerProvider.notifier).verifySignup(_otp.text);
    } catch (e) {
      if (!mounted) return;
      showAppSnack(
        context,
        e is ApiException ? e.message : 'Verification failed',
        error: true,
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resend() async {
    final draft = ref.read(authControllerProvider).signupDraft;
    if (draft == null) {
      context.go('/signup');
      return;
    }
    try {
      await ref.read(authControllerProvider.notifier).sendOtp(draft);
      if (!mounted) return;
      showAppSnack(context, 'OTP sent successfully');
    } catch (e) {
      if (!mounted) return;
      showAppSnack(context, 'Could not resend OTP', error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final email = ref.watch(authControllerProvider).signupDraft?.email ?? '';
    return Scaffold(
      appBar: AppBar(title: const Text('Verify email')),
      backgroundColor: Colors.white,
      body: Padding(
        padding: AppLayout.pagePadding(context, top: 12, bottom: 24),
        child: AppLayout.constrain(
          child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Check your inbox', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(
              email.isEmpty
                  ? 'A 6-digit verification code has been sent to you.'
                  : 'We sent a 6-digit code to $email.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 28),
            TextField(
              controller: _otp,
              maxLength: 6,
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w700,
                letterSpacing: 10,
                color: AppColors.navy,
              ),
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: InputDecoration(
                counterText: '',
                hintText: '------',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: AppRadius.rMd),
              ),
            ),
            const SizedBox(height: 24),
            PrimaryButton(
              label: 'Verify email',
              loading: _loading,
              onPressed: _loading ? null : _verify,
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(
                  onPressed: () => context.go('/signup'),
                  child: const Text('Back to signup'),
                ),
                TextButton(onPressed: _resend, child: const Text('Resend code')),
              ],
            ),
          ],
        ),
        ),
      ),
    );
  }
}

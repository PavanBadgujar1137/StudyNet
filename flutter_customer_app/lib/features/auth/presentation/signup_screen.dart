import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphoricons_flutter/phosphoricons_flutter.dart';

import '../../../app/theme/app_layout.dart';
import '../../../core/constants/unsplash.dart';
import '../../../core/errors/api_exception.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/widgets.dart';
import '../data/user_model.dart';
import 'auth_controller.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _first = TextEditingController();
  final _last = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  bool _obscure = true;
  bool _obscure2 = true;
  bool _loading = false;

  @override
  void dispose() {
    _first.dispose();
    _last.dispose();
    _email.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    final draft = SignupDraft(
      firstName: _first.text,
      lastName: _last.text,
      email: _email.text,
      password: _password.text,
      confirmPassword: _confirm.text,
      accountType: 'Learner',
    );
    try {
      await ref.read(authControllerProvider.notifier).sendOtp(draft);
      if (!mounted) return;
      context.push('/verify-email');
    } catch (e) {
      if (!mounted) return;
      showAppSnack(
        context,
        e is ApiException ? e.message : 'Could not send OTP',
        error: true,
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final keyboardOpen = MediaQuery.viewInsetsOf(context).bottom > 40;
    final width = MediaQuery.sizeOf(context).width;
    final pad = width < AppLayout.compact ? 16.0 : 20.0;

    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        backgroundColor: Colors.white,
        toolbarHeight: 48,
        title: const Text('Create account'),
      ),
      body: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(pad, 4, pad, 12),
          child: LayoutBuilder(
            builder: (context, constraints) {
                return SizedBox(
                  height: constraints.maxHeight,
                  child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (!keyboardOpen) ...[
                        Expanded(
                          child: PhotoCarousel(slides: Unsplash.signupSlides)
                              .animate()
                              .fadeIn(duration: 360.ms),
                        ),
                        const SizedBox(height: 12),
                      ],
                      Text(
                        'Begin your journey with OpenHand',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'A practitioner, circles, and a path that stays yours.',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: AppTextField(
                              label: 'First name',
                              controller: _first,
                              compact: true,
                              prefixIcon: PhosphorIconsRegular.user,
                              textInputAction: TextInputAction.next,
                              validator: (v) => Validators.requiredField(v, 'First name'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: AppTextField(
                              label: 'Last name',
                              controller: _last,
                              compact: true,
                              prefixIcon: PhosphorIconsRegular.user,
                              textInputAction: TextInputAction.next,
                              validator: (v) => Validators.requiredField(v, 'Last name'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      AppTextField(
                        label: 'Email address',
                        controller: _email,
                        compact: true,
                        prefixIcon: PhosphorIconsRegular.envelopeSimple,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        validator: Validators.email,
                      ),
                      const SizedBox(height: 10),
                      AppTextField(
                        label: 'Password',
                        controller: _password,
                        compact: true,
                        prefixIcon: PhosphorIconsRegular.lockKey,
                        obscure: _obscure,
                        onToggleObscure: () => setState(() => _obscure = !_obscure),
                        textInputAction: TextInputAction.next,
                        validator: Validators.password,
                      ),
                      const SizedBox(height: 10),
                      AppTextField(
                        label: 'Confirm password',
                        controller: _confirm,
                        compact: true,
                        prefixIcon: PhosphorIconsRegular.lockKey,
                        obscure: _obscure2,
                        onToggleObscure: () => setState(() => _obscure2 = !_obscure2),
                        validator: (v) => Validators.confirmPassword(v, _password.text),
                      ),
                      const SizedBox(height: 16),
                      PrimaryButton(
                        label: 'Create free account',
                        icon: PhosphorIconsRegular.sparkle,
                        loading: _loading,
                        onPressed: _loading ? null : _submit,
                      ),
                      Center(
                        child: TextButton(
                          style: TextButton.styleFrom(
                            visualDensity: VisualDensity.compact,
                          ),
                          onPressed: () => context.go('/login'),
                          child: const Text('Already have an account? Sign in'),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphoricons_flutter/phosphoricons_flutter.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_layout.dart';
import '../../../core/constants/unsplash.dart';
import '../../../core/errors/api_exception.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/widgets.dart';
import 'auth_controller.dart';
import 'openhand_brand.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;
  bool _loading = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await ref.read(authControllerProvider.notifier).login(
            _email.text,
            _password.text,
          );
    } catch (e) {
      if (!mounted) return;
      final message = e is ApiException ? e.message : 'Login failed. Please try again.';
      showAppSnack(context, message, error: true);
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
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.fromLTRB(pad, 12, pad, 12),
          child: LayoutBuilder(
            builder: (context, constraints) {
              return SizedBox(
                height: constraints.maxHeight,
                child: Form(
                  key: _formKey,
                  child: AutofillGroup(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (!keyboardOpen) ...[
                          Expanded(
                            child: PhotoCarousel(slides: Unsplash.loginSlides)
                                .animate()
                                .fadeIn(duration: 360.ms),
                          ),
                          const SizedBox(height: 16),
                        ],
                        const OpenHandBrand(
                          iconHeight: 52,
                          showTagline: false,
                          gap: 12,
                          horizontal: true,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Sign in to your learner portal',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 18),
                        AppTextField(
                          label: 'Email address',
                          controller: _email,
                          hint: 'you@example.com',
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          prefixIcon: PhosphorIconsRegular.envelopeSimple,
                          autofillHints: const [AutofillHints.email],
                          validator: Validators.email,
                        ),
                        const SizedBox(height: 12),
                        AppTextField(
                          label: 'Password',
                          controller: _password,
                          obscure: _obscure,
                          onToggleObscure: () => setState(() => _obscure = !_obscure),
                          textInputAction: TextInputAction.done,
                          prefixIcon: PhosphorIconsRegular.lockKey,
                          autofillHints: const [AutofillHints.password],
                          validator: Validators.password,
                        ),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            style: TextButton.styleFrom(
                              visualDensity: VisualDensity.compact,
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            onPressed: () => context.push('/forgot-password'),
                            child: const Text('Forgot password?'),
                          ),
                        ),
                        const SizedBox(height: 12),
                        PrimaryButton(
                          label: 'Sign in to OpenHand',
                          icon: PhosphorIconsRegular.arrowRight,
                          loading: _loading,
                          onPressed: _loading ? null : _submit,
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('New here?', style: Theme.of(context).textTheme.bodyMedium),
                            TextButton(
                              style: TextButton.styleFrom(
                                visualDensity: VisualDensity.compact,
                                padding: const EdgeInsets.symmetric(horizontal: 6),
                                minimumSize: Size.zero,
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                              onPressed: () => context.push('/signup'),
                              child: const Text('Create a free account'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'This app is for learners. Practitioner and admin accounts use the web portal.',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.slateMeta,
                              ),
                        ),
                      ],
                    ),
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

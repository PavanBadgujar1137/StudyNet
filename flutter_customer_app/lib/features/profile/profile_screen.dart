import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:phosphoricons_flutter/phosphoricons_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app/config/app_config.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_layout.dart';
import '../../core/errors/api_exception.dart';
import '../../core/utils/validators.dart';
import '../../core/widgets/widgets.dart';
import '../auth/presentation/auth_controller.dart';
import '../shared/providers.dart';
import '../shell/app_shell.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    final sub = ref.watch(subscriptionProvider);
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: AppLayout.pagePadding(context),
          children: [
            const FadeIn(
              child: SectionHeader(
                eyebrow: 'Account',
                title: 'Profile & settings',
                subtitle: 'Your OpenHand learner space.',
              ),
            ),
            const SizedBox(height: 16),
            AppCard(
              child: Row(
                children: [
                  AppAvatar(imageUrl: user?.image, initials: user?.initials ?? 'ME', size: 64, radius: 16),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user?.fullName ?? 'Learner', style: Theme.of(context).textTheme.titleLarge),
                        Text(user?.email ?? '', style: Theme.of(context).textTheme.bodySmall),
                        const SizedBox(height: 6),
                        const StatusBadge(label: 'Learner', tone: BadgeTone.info),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            sub.when(
              data: (s) => AppCard(
                onTap: () => context.push('/plans'),
                child: Row(
                  children: [
                    const Icon(PhosphorIconsRegular.crown, color: AppColors.violet),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        s.hasActiveSubscription
                            ? (s.planName ?? 'Active membership')
                            : s.isTrialActive
                                ? 'Trial · ${s.trialDaysRemaining} days left'
                                : 'No active plan',
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                    const Icon(PhosphorIconsRegular.caretRight),
                  ],
                ),
              ),
              loading: () => const SkeletonView(height: 64),
              error: (_, _) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 18),
            _tile(context, PhosphorIconsRegular.user, 'Personal details', () => context.push('/profile/edit')),
            _tile(context, PhosphorIconsRegular.image, 'Profile photo', () => context.push('/profile/photo')),
            _tile(context, PhosphorIconsRegular.lockKey, 'Security & password', () => context.push('/profile/password')),
            _tile(context, PhosphorIconsRegular.squaresFour, 'More in the portal', () {
              showModalBottomSheet(context: context, builder: (_) => const MoreSheet());
            }),
            _tile(context, PhosphorIconsRegular.lifebuoy, 'Help & support', () {
              launchUrl(Uri.parse('${AppConfig.current.webOrigin}/help-support'), mode: LaunchMode.externalApplication);
            }),
            _tile(context, PhosphorIconsRegular.fileText, 'Terms of service', () {
              launchUrl(Uri.parse('${AppConfig.current.webOrigin}/terms'), mode: LaunchMode.externalApplication);
            }),
            _tile(context, PhosphorIconsRegular.shieldCheck, 'Privacy policy', () {
              launchUrl(Uri.parse('${AppConfig.current.webOrigin}/privacy-policy'), mode: LaunchMode.externalApplication);
            }),
            const SizedBox(height: 8),
            SecondaryButton(
              label: 'Log out',
              icon: PhosphorIconsRegular.signOut,
              onPressed: () => ref.read(authControllerProvider.notifier).logout(),
            ),
            const SizedBox(height: 20),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Delete account', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.errorText)),
                  const SizedBox(height: 6),
                  const Text('Deleting your account is permanent and will remove your data, progress, and sessions.'),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: () async {
                      final ok = await confirmDestructive(
                        context,
                        title: 'Delete account?',
                        body: 'This action cannot be undone.',
                        confirmLabel: 'Delete permanently',
                      );
                      if (!ok) return;
                      try {
                        await ref.read(authRepositoryProvider).deleteProfile();
                        await ref.read(authControllerProvider.notifier).logout();
                      } catch (e) {
                        if (context.mounted) {
                          showAppSnack(context, 'Could not delete profile', error: true);
                        }
                      }
                    },
                    style: TextButton.styleFrom(foregroundColor: AppColors.error),
                    child: const Text('Delete my account permanently'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _tile(BuildContext context, IconData icon, String label, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AppCard(
        onTap: onTap,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        child: Row(
          children: [
            OhIconBox(icon: icon, size: 38, iconSize: 18),
            const SizedBox(width: 12),
            Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700))),
            const Icon(PhosphorIconsRegular.caretRight, color: AppColors.slate400, size: 16),
          ],
        ),
      ),
    );
  }
}

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _first;
  late final TextEditingController _last;
  late final TextEditingController _about;
  late final TextEditingController _phone;
  late final TextEditingController _dob;
  String _gender = 'Prefer not to say';
  bool _saving = false;

  static const genders = ['Male', 'Female', 'Non-Binary', 'Prefer not to say', 'Other'];

  @override
  void initState() {
    super.initState();
    final user = ref.read(authControllerProvider).user;
    _first = TextEditingController(text: user?.firstName ?? '');
    _last = TextEditingController(text: user?.lastName ?? '');
    _about = TextEditingController(text: user?.additionalDetails?.about ?? '');
    _phone = TextEditingController(text: user?.additionalDetails?.contactNumber ?? '');
    _dob = TextEditingController(text: user?.additionalDetails?.dateOfBirth ?? '');
    _gender = user?.additionalDetails?.gender ?? 'Prefer not to say';
    if (!genders.contains(_gender)) _gender = 'Prefer not to say';
  }

  @override
  void dispose() {
    _first.dispose();
    _last.dispose();
    _about.dispose();
    _phone.dispose();
    _dob.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final user = await ref.read(authRepositoryProvider).updateProfile({
        'firstName': _first.text.trim(),
        'lastName': _last.text.trim(),
        'dateOfBirth': _dob.text.trim(),
        'about': _about.text.trim(),
        'contactNumber': _phone.text.trim(),
        'gender': _gender,
      });
      await ref.read(authControllerProvider.notifier).setUser(user);
      if (!mounted) return;
      showAppSnack(context, 'Profile updated successfully');
      context.pop();
    } catch (e) {
      if (!mounted) return;
      showAppSnack(context, 'Could not update profile', error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Personal details')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: AppLayout.pagePadding(context, top: 8),
          children: [
            AppTextField(label: 'First name', controller: _first, validator: (v) => Validators.requiredField(v, 'First name')),
            const SizedBox(height: 12),
            AppTextField(label: 'Last name', controller: _last, validator: (v) => Validators.requiredField(v, 'Last name')),
            const SizedBox(height: 12),
            AppTextField(label: 'Date of birth', controller: _dob, hint: 'YYYY-MM-DD', keyboardType: TextInputType.datetime),
            const SizedBox(height: 12),
            InputDecorator(
              decoration: const InputDecoration(labelText: 'Gender'),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  isExpanded: true,
                  value: _gender,
                  items: genders.map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(),
                  onChanged: (v) => setState(() => _gender = v ?? _gender),
                ),
              ),
            ),
            const SizedBox(height: 12),
            AppTextField(label: 'Contact number', controller: _phone, keyboardType: TextInputType.phone, validator: Validators.phone),
            const SizedBox(height: 12),
            AppTextField(label: 'About / bio', controller: _about, maxLines: 3),
            const SizedBox(height: 24),
            PrimaryButton(label: 'Save personal details', loading: _saving, onPressed: _saving ? null : _save),
          ],
        ),
      ),
    );
  }
}

class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  ConsumerState<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final _old = TextEditingController();
  final _next = TextEditingController();
  bool _obscure = true;
  bool _saving = false;

  @override
  void dispose() {
    _old.dispose();
    _next.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final err = Validators.password(_next.text);
    if ((_old.text).isEmpty || err != null) {
      showAppSnack(context, err ?? 'Enter your current password', error: true);
      return;
    }
    setState(() => _saving = true);
    try {
      await ref.read(authRepositoryProvider).changePassword(oldPassword: _old.text, newPassword: _next.text);
      if (!mounted) return;
      showAppSnack(context, 'Password changed successfully');
      context.pop();
    } catch (e) {
      if (!mounted) return;
      showAppSnack(context, e is ApiException ? e.message : 'Could not update password', error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Security & password')),
      body: ListView(
        padding: AppLayout.pagePadding(context, top: 8),
        children: [
          AppTextField(label: 'Current password', controller: _old, obscure: _obscure, onToggleObscure: () => setState(() => _obscure = !_obscure)),
          const SizedBox(height: 12),
          AppTextField(label: 'New password', controller: _next, obscure: true),
          const SizedBox(height: 24),
          PrimaryButton(label: 'Update password', loading: _saving, onPressed: _saving ? null : _save),
        ],
      ),
    );
  }
}

class ChangePhotoScreen extends ConsumerStatefulWidget {
  const ChangePhotoScreen({super.key});

  @override
  ConsumerState<ChangePhotoScreen> createState() => _ChangePhotoScreenState();
}

class _ChangePhotoScreenState extends ConsumerState<ChangePhotoScreen> {
  String? _path;
  bool _saving = false;

  Future<void> _pick() async {
    final file = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85, maxWidth: 1200);
    if (file != null) setState(() => _path = file.path);
  }

  Future<void> _save() async {
    if (_path == null) return;
    setState(() => _saving = true);
    try {
      final user = await ref.read(authRepositoryProvider).updateDisplayPicture(_path!);
      await ref.read(authControllerProvider.notifier).setUser(user);
      if (!mounted) return;
      showAppSnack(context, 'Display picture updated');
      context.pop();
    } catch (e) {
      if (!mounted) return;
      showAppSnack(context, e is ApiException ? e.message : 'Could not update photo', error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).user;
    return Scaffold(
      appBar: AppBar(title: const Text('Profile photo')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            AppAvatar(imageUrl: user?.image, initials: user?.initials ?? 'ME', size: 112, radius: 24),
            const SizedBox(height: 12),
            Text('PNG or JPG. Square works best.', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 24),
            SecondaryButton(label: 'Choose photo', icon: Icons.photo_outlined, onPressed: _pick),
            const SizedBox(height: 12),
            PrimaryButton(label: 'Upload photo', loading: _saving, onPressed: _path == null || _saving ? null : _save),
          ],
        ),
      ),
    );
  }
}

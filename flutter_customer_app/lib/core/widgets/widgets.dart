import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:phosphoricons_flutter/phosphoricons_flutter.dart';
import 'package:shimmer/shimmer.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_durations.dart';
import '../../app/theme/app_layout.dart';
import '../../app/theme/app_radius.dart';
import '../constants/unsplash.dart';

export 'photo_carousel.dart';

class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.loading = false,
    this.icon,
    this.expand = true,
    this.height = 52,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final IconData? icon;
  final bool expand;
  final double height;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null && !loading;
    return Semantics(
      button: true,
      label: label,
      child: AnimatedOpacity(
        duration: AppDurations.fast,
        opacity: enabled ? 1 : 0.55,
        child: DecoratedBox(
          decoration: BoxDecoration(
            gradient: AppColors.brandDiagonal,
            borderRadius: AppRadius.rMd,
            boxShadow: enabled ? AppElevation.sm : null,
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: enabled
                  ? () {
                      HapticFeedback.selectionClick();
                      onPressed?.call();
                    }
                  : null,
              borderRadius: AppRadius.rMd,
              child: SizedBox(
                height: height,
                width: expand ? double.infinity : null,
                child: Padding(
                  padding: expand ? EdgeInsets.zero : const EdgeInsets.symmetric(horizontal: 22),
                  child: Center(
                    child: loading
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white),
                          )
                        : Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (icon != null) ...[
                                Icon(icon, color: Colors.white, size: 18),
                                const SizedBox(width: 8),
                              ],
                              Flexible(
                                child: Text(
                                  label,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 15,
                                  ),
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class SecondaryButton extends StatelessWidget {
  const SecondaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: onPressed,
        icon: icon == null ? const SizedBox.shrink() : Icon(icon, size: 18),
        label: Text(label, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700)),
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.navy,
          side: const BorderSide(color: AppColors.slate200),
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: AppRadius.rMd),
        ),
      ),
    );
  }
}

class AppTextField extends StatelessWidget {
  const AppTextField({
    super.key,
    required this.label,
    this.controller,
    this.hint,
    this.obscure = false,
    this.onToggleObscure,
    this.keyboardType,
    this.textInputAction,
    this.validator,
    this.maxLines = 1,
    this.enabled = true,
    this.prefixIcon,
    this.autofillHints,
    this.onChanged,
    this.compact = false,
  });

  final String label;
  final TextEditingController? controller;
  final String? hint;
  final bool obscure;
  final VoidCallback? onToggleObscure;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final String? Function(String?)? validator;
  final int maxLines;
  final bool enabled;
  final IconData? prefixIcon;
  final Iterable<String>? autofillHints;
  final ValueChanged<String>? onChanged;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: obscure,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      validator: validator,
      maxLines: maxLines,
      enabled: enabled,
      autofillHints: autofillHints,
      onChanged: onChanged,
      style: const TextStyle(
        color: AppColors.navy,
        fontWeight: FontWeight.w600,
        fontSize: 15,
      ),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        isDense: compact,
        contentPadding: compact
            ? const EdgeInsets.symmetric(horizontal: 14, vertical: 12)
            : const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        prefixIcon: prefixIcon == null ? null : Icon(prefixIcon, color: AppColors.slateMeta, size: 20),
        suffixIcon: onToggleObscure == null
            ? null
            : IconButton(
                onPressed: onToggleObscure,
                tooltip: obscure ? 'Show password' : 'Hide password',
                icon: Icon(
                  obscure ? PhosphorIconsRegular.eye : PhosphorIconsRegular.eyeSlash,
                  color: AppColors.slateMeta,
                  size: 20,
                ),
              ),
      ),
    );
  }
}

class AppCard extends StatelessWidget {
  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(18),
    this.onTap,
  });

  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final content = Padding(padding: padding, child: child);
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.rLg,
        border: Border.all(color: AppColors.slate200),
        boxShadow: AppElevation.sm,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadius.rLg,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadius.rLg,
          child: content,
        ),
      ),
    );
  }
}

class OhIconBox extends StatelessWidget {
  const OhIconBox({
    super.key,
    required this.icon,
    this.size = 42,
    this.iconSize = 20,
    this.gradient = true,
  });

  final IconData icon;
  final double size;
  final double iconSize;
  final bool gradient;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: gradient ? AppColors.brandDiagonal : null,
        color: gradient ? null : AppColors.skyWash,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Icon(icon, color: gradient ? Colors.white : AppColors.blue, size: iconSize),
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.eyebrow,
    this.title,
    this.subtitle,
    this.trailing,
  });

  final String eyebrow;
  final String? title;
  final String? subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                eyebrow.toUpperCase(),
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: AppColors.violet,
                      letterSpacing: 1.1,
                    ),
              ),
            ),
            if (trailing != null) trailing!,
          ],
        ),
        if (title != null) ...[
          const SizedBox(height: 6),
          Text(title!, style: Theme.of(context).textTheme.headlineMedium),
        ],
        if (subtitle != null) ...[
          const SizedBox(height: 6),
          Text(subtitle!, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ],
    );
  }
}

class StatusBadge extends StatelessWidget {
  const StatusBadge({
    super.key,
    required this.label,
    this.tone = BadgeTone.neutral,
  });

  final String label;
  final BadgeTone tone;

  @override
  Widget build(BuildContext context) {
    final colors = switch (tone) {
      BadgeTone.success => (AppColors.okSoft, AppColors.okText, AppColors.okBorder),
      BadgeTone.warning => (AppColors.warnSoft, AppColors.warnText, const Color(0xFFFDE68A)),
      BadgeTone.danger => (AppColors.errorSoft, AppColors.errorText, const Color(0xFFFCA5A5)),
      BadgeTone.info => (AppColors.blueWash, AppColors.blue, const Color(0xFFBFDBFE)),
      BadgeTone.neutral => (AppColors.slate100, AppColors.muted2, AppColors.slate200),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: colors.$1,
        borderRadius: AppRadius.rPill,
        border: Border.all(color: colors.$3),
      ),
      child: Text(
        label,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          color: colors.$2,
          fontSize: 11.5,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

enum BadgeTone { success, warning, danger, info, neutral }

class AppAvatar extends StatelessWidget {
  const AppAvatar({
    super.key,
    this.imageUrl,
    required this.initials,
    this.size = 48,
    this.radius = 12,
  });

  final String? imageUrl;
  final String initials;
  final double size;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: SizedBox(
        width: size,
        height: size,
        child: imageUrl != null && imageUrl!.isNotEmpty
            ? AppImage(url: imageUrl!, fit: BoxFit.cover)
            : DecoratedBox(
                decoration: const BoxDecoration(gradient: AppColors.brandDiagonal),
                child: Center(
                  child: Text(
                    initials,
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: size * 0.32,
                    ),
                  ),
                ),
              ),
      ),
    );
  }
}

class AppImage extends StatelessWidget {
  const AppImage({
    super.key,
    required this.url,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
  });

  final String url;
  final BoxFit fit;
  final double? width;
  final double? height;

  @override
  Widget build(BuildContext context) {
    return CachedNetworkImage(
      imageUrl: url,
      fit: fit,
      width: width,
      height: height,
      httpHeaders: Unsplash.imageHeaders,
      memCacheWidth: 900,
      placeholder: (_, _) => const SkeletonView(height: double.infinity),
      errorWidget: (_, _, _) => CachedNetworkImage(
        imageUrl: Unsplash.fallback,
        httpHeaders: Unsplash.imageHeaders,
        fit: fit,
        memCacheWidth: 900,
        errorWidget: (_, _, _) => ColoredBox(
          color: AppColors.slate100,
          child: Center(
            child: Icon(PhosphorIconsRegular.image, color: AppColors.slate400, size: 28),
          ),
        ),
      ),
    );
  }
}

class SkeletonView extends StatelessWidget {
  const SkeletonView({
    super.key,
    this.height = 16,
    this.width,
    this.radius = 10,
  });

  final double height;
  final double? width;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.slate100,
      highlightColor: Colors.white,
      child: Container(
        height: height,
        width: width,
        decoration: BoxDecoration(
          color: AppColors.slate200,
          borderRadius: BorderRadius.circular(radius),
        ),
      ),
    );
  }
}

class EmptyView extends StatelessWidget {
  const EmptyView({
    super.key,
    required this.title,
    required this.description,
    this.icon = Icons.inbox_outlined,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String description;
  final IconData icon;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 36),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          OhIconBox(icon: icon, size: 64, iconSize: 28),
          const SizedBox(height: 16),
          Text(title, textAlign: TextAlign.center, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text(
            description,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: 20),
            PrimaryButton(label: actionLabel!, onPressed: onAction, expand: false),
          ],
        ],
      ),
    );
  }
}

class ErrorView extends StatelessWidget {
  const ErrorView({
    super.key,
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return EmptyView(
      icon: PhosphorIconsRegular.wifiSlash,
      title: 'Couldn’t load this',
      description: message,
      actionLabel: 'Try again',
      onAction: onRetry,
    );
  }
}

class GradientAppBar extends StatelessWidget implements PreferredSizeWidget {
  const GradientAppBar({
    super.key,
    required this.title,
    this.subtitle,
    this.leading,
    this.actions,
  });

  final String title;
  final String? subtitle;
  final Widget? leading;
  final List<Widget>? actions;

  @override
  Size get preferredSize => const Size.fromHeight(72);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      leading: leading,
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title),
          if (subtitle != null)
            Text(
              subtitle!,
              style: Theme.of(context).textTheme.bodySmall,
            ),
        ],
      ),
      actions: actions,
    );
  }
}

void showAppSnack(BuildContext context, String message, {bool error = false}) {
  ScaffoldMessenger.of(context).hideCurrentSnackBar();
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      backgroundColor: error ? AppColors.error : AppColors.navy,
      content: Row(
        children: [
          Icon(
            error ? PhosphorIconsRegular.warningCircle : PhosphorIconsRegular.checkCircle,
            color: Colors.white,
            size: 18,
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(message)),
        ],
      ),
    ),
  );
  HapticFeedback.lightImpact();
}

Future<bool> confirmDestructive(
  BuildContext context, {
  required String title,
  required String body,
  String confirmLabel = 'Delete',
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: Text(body),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context, true),
          style: TextButton.styleFrom(foregroundColor: AppColors.error),
          child: Text(confirmLabel),
        ),
      ],
    ),
  );
  return result ?? false;
}

class ScreenPadding extends StatelessWidget {
  const ScreenPadding({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: AppLayout.pagePadding(context),
      child: child,
    );
  }
}

class PhotoBanner extends StatelessWidget {
  const PhotoBanner({
    super.key,
    required this.url,
    this.height = 176,
    this.kicker,
    this.title,
    this.subtitle,
    this.radius,
  });

  final String url;
  final double height;
  final String? kicker;
  final String? title;
  final String? subtitle;
  final BorderRadius? radius;

  @override
  Widget build(BuildContext context) {
    final corners = radius ?? AppRadius.rLg;
    return ClipRRect(
      borderRadius: corners,
      child: SizedBox(
        height: height,
        width: double.infinity,
        child: Stack(
          fit: StackFit.expand,
          children: [
            AppImage(url: url),
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0x140F172A),
                    Color(0x8C0F172A),
                    Color(0xE60F172A),
                  ],
                  stops: [0.15, 0.55, 1],
                ),
              ),
            ),
            if (kicker != null || title != null || subtitle != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(18, 18, 18, 18),
                child: Align(
                  alignment: Alignment.bottomLeft,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (kicker != null)
                        Text(
                          kicker!.toUpperCase(),
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                color: AppColors.sky,
                                letterSpacing: 1.4,
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                      if (title != null) ...[
                        if (kicker != null) const SizedBox(height: 6),
                        Text(
                          title!,
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                height: 1.2,
                              ),
                        ),
                      ],
                      if (subtitle != null) ...[
                        const SizedBox(height: 6),
                        Text(
                          subtitle!,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Colors.white.withValues(alpha: 0.92),
                                height: 1.4,
                              ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class FadeIn extends StatelessWidget {
  const FadeIn({super.key, required this.child, this.delay = Duration.zero});
  final Widget child;
  final Duration delay;

  @override
  Widget build(BuildContext context) {
    return child
        .animate()
        .fadeIn(duration: AppDurations.slow, delay: delay, curve: AppDurations.ease)
        .moveY(begin: 10, end: 0, duration: AppDurations.slow, delay: delay, curve: AppDurations.ease);
  }
}

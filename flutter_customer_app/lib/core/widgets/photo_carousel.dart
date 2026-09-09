import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:phosphoricons_flutter/phosphoricons_flutter.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_durations.dart';
import '../../app/theme/app_radius.dart';
import '../constants/unsplash.dart';

class PhotoCarousel extends StatefulWidget {
  const PhotoCarousel({
    super.key,
    required this.slides,
    this.height,
    this.autoPlay = true,
  });

  final List<UnsplashSlide> slides;
  final double? height;
  final bool autoPlay;

  @override
  State<PhotoCarousel> createState() => _PhotoCarouselState();
}

class _PhotoCarouselState extends State<PhotoCarousel> {
  late final PageController _pages;
  Timer? _timer;
  int _index = 0;

  @override
  void initState() {
    super.initState();
    _pages = PageController();
    _start();
    WidgetsBinding.instance.addPostFrameCallback((_) => _prefetch());
  }

  void _prefetch() {
    if (!mounted) return;
    for (final slide in widget.slides) {
      precacheImage(
        CachedNetworkImageProvider(slide.url, headers: Unsplash.imageHeaders),
        context,
      );
    }
  }

  void _start() {
    _timer?.cancel();
    if (!widget.autoPlay || widget.slides.length < 2) return;
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted || !_pages.hasClients) return;
      final next = (_index + 1) % widget.slides.length;
      _pages.animateToPage(
        next,
        duration: AppDurations.slow,
        curve: AppDurations.ease,
      );
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pages.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final slides = widget.slides;
    if (slides.isEmpty) return const SizedBox.shrink();

    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: AppRadius.rLg,
        boxShadow: [
          BoxShadow(
            color: AppColors.navy.withValues(alpha: 0.14),
            blurRadius: 28,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: AppRadius.rLg,
        child: SizedBox(
          height: widget.height,
          width: double.infinity,
          child: Stack(
            fit: StackFit.expand,
            children: [
              PageView.builder(
                controller: _pages,
                onPageChanged: (i) {
                  setState(() => _index = i);
                  _start();
                },
                itemCount: slides.length,
                itemBuilder: (context, i) {
                  final slide = slides[i];
                  return Stack(
                    fit: StackFit.expand,
                    children: [
                      CachedNetworkImage(
                        imageUrl: slide.url,
                        httpHeaders: Unsplash.imageHeaders,
                        fit: BoxFit.cover,
                        memCacheWidth: 900,
                        fadeInDuration: AppDurations.base,
                        fadeOutDuration: Duration.zero,
                        placeholder: (_, _) => const ColoredBox(color: AppColors.navy),
                        errorWidget: (_, _, _) => CachedNetworkImage(
                          imageUrl: Unsplash.fallback,
                          httpHeaders: Unsplash.imageHeaders,
                          fit: BoxFit.cover,
                          memCacheWidth: 900,
                          placeholder: (_, _) => const ColoredBox(color: AppColors.navy),
                          errorWidget: (_, _, _) => ColoredBox(
                            color: AppColors.navy,
                            child: Center(
                              child: Icon(PhosphorIconsRegular.image, color: AppColors.slate400),
                            ),
                          ),
                        ),
                      ),
                      const DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Color(0x080F172A),
                              Color(0x660F172A),
                              Color(0xF20F172A),
                            ],
                            stops: [0.08, 0.48, 1],
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(18, 16, 18, 34),
                        child: Align(
                          alignment: Alignment.bottomLeft,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                slide.kicker.toUpperCase(),
                                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                      color: AppColors.sky,
                                      letterSpacing: 1.6,
                                      fontWeight: FontWeight.w800,
                                    ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                slide.title,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w800,
                                      height: 1.18,
                                    ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                slide.subtitle,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Colors.white.withValues(alpha: 0.92),
                                      height: 1.4,
                                    ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
              Positioned(
                left: 18,
                right: 18,
                bottom: 12,
                child: Row(
                  children: List.generate(slides.length, (i) {
                    final on = i == _index;
                    return AnimatedContainer(
                      duration: AppDurations.fast,
                      curve: AppDurations.ease,
                      margin: const EdgeInsets.only(right: 6),
                      height: 4,
                      width: on ? 22 : 7,
                      decoration: BoxDecoration(
                        borderRadius: AppRadius.rPill,
                        color: on ? Colors.white : Colors.white.withValues(alpha: 0.38),
                      ),
                    );
                  }),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

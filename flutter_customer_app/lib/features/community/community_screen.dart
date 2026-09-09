import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_layout.dart';
import '../../app/theme/app_radius.dart';
import '../../core/constants/unsplash.dart';
import '../../core/errors/api_exception.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/widgets.dart';
import '../auth/presentation/auth_controller.dart';
import '../shared/models.dart';
import '../shared/providers.dart';

enum ChatTab { global, circle, direct }

class CommunityScreen extends ConsumerStatefulWidget {
  const CommunityScreen({super.key});

  @override
  ConsumerState<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends ConsumerState<CommunityScreen> {
  ChatTab _tab = ChatTab.global;
  final _input = TextEditingController();
  final _scroll = ScrollController();
  List<ChatMessage> _messages = [];
  List<CircleItem> _myCircles = [];
  List<NamedUser> _contacts = [];
  CircleItem? _circle;
  NamedUser? _contact;
  bool _loading = true;
  bool _sending = false;
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    _bootstrap();
    _poll = Timer.periodic(const Duration(seconds: 5), (_) => _loadMessages(silent: true));
  }

  @override
  void dispose() {
    _poll?.cancel();
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    final repo = ref.read(openHandRepositoryProvider);
    final uid = ref.read(authControllerProvider).user?.id;
    try {
      final circles = await repo.circles();
      final mine = circles.where((c) => uid != null && c.memberIds.contains(uid)).toList();
      List<NamedUser> contacts = [];
      try {
        contacts = await repo.contacts();
      } catch (_) {}
      setState(() {
        _myCircles = mine;
        _circle = mine.isEmpty ? null : mine.first;
        _contacts = contacts;
        _contact = contacts.isEmpty ? null : contacts.first;
      });
      await _loadMessages();
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _loadMessages({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);
    try {
      final repo = ref.read(openHandRepositoryProvider);
      List<ChatMessage> msgs = [];
      switch (_tab) {
        case ChatTab.global:
          msgs = await repo.globalChat();
          break;
        case ChatTab.circle:
          final id = _circle?.id ?? _circle?.practitioner?.id;
          if (id != null) msgs = await repo.groupChat(id);
          break;
        case ChatTab.direct:
          if (_contact != null) msgs = await repo.directChat(_contact!.id);
          break;
      }
      if (!mounted) return;
      setState(() {
        _messages = msgs;
        _loading = false;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scroll.hasClients) {
          _scroll.jumpTo(_scroll.position.maxScrollExtent);
        }
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _send() async {
    final text = _input.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() => _sending = true);
    _input.clear();
    try {
      final repo = ref.read(openHandRepositoryProvider);
      switch (_tab) {
        case ChatTab.global:
          await repo.sendGlobal(text);
          break;
        case ChatTab.circle:
          final id = _circle?.id;
          if (id == null) throw const ApiException(message: 'Join or select a Circle first.');
          await repo.sendGroup(id, text);
          break;
        case ChatTab.direct:
          if (_contact == null) throw const ApiException(message: 'Select a contact first.');
          await repo.sendDirect(_contact!.id, text);
          break;
      }
      await _loadMessages(silent: true);
    } catch (e) {
      if (!mounted) return;
      showAppSnack(context, e is ApiException ? e.message : 'Message could not be sent', error: true);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final uid = ref.watch(authControllerProvider).user?.id;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: AppLayout.pagePadding(context, top: 12, bottom: 8),
              child: const SectionHeader(
                eyebrow: 'Together',
                title: 'Community & Chat',
                trailing: StatusBadge(label: 'Live', tone: BadgeTone.success),
              ),
            ),
            Padding(
              padding: AppLayout.pagePadding(context, top: 0, bottom: 12),
              child: const PhotoCarousel(slides: Unsplash.communitySlides, height: 176),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SegmentedButton<ChatTab>(
                segments: const [
                  ButtonSegment(value: ChatTab.global, label: Text('Global'), icon: Icon(Icons.public, size: 16)),
                  ButtonSegment(value: ChatTab.circle, label: Text('Circle'), icon: Icon(Icons.groups, size: 16)),
                  ButtonSegment(value: ChatTab.direct, label: Text('Direct'), icon: Icon(Icons.person, size: 16)),
                ],
                selected: {_tab},
                onSelectionChanged: (s) {
                  setState(() => _tab = s.first);
                  _loadMessages();
                },
              ),
            ),
            if (_tab == ChatTab.circle && _myCircles.isNotEmpty)
              SizedBox(
                height: 52,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
                  children: _myCircles
                      .map(
                        (c) => Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text(c.name),
                            selected: _circle?.id == c.id,
                            onSelected: (_) {
                              setState(() => _circle = c);
                              _loadMessages();
                            },
                          ),
                        ),
                      )
                      .toList(),
                ),
              ),
            if (_tab == ChatTab.direct && _contacts.isNotEmpty)
              SizedBox(
                height: 52,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
                  children: _contacts
                      .map(
                        (c) => Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text(c.fullName),
                            selected: _contact?.id == c.id,
                            onSelected: (_) {
                              setState(() => _contact = c);
                              _loadMessages();
                            },
                          ),
                        ),
                      )
                      .toList(),
                ),
              ),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _messages.isEmpty
                      ? EmptyView(
                          icon: Icons.chat_bubble_outline,
                          title: _tab == ChatTab.circle && _myCircles.isEmpty
                              ? 'Join a Circle first'
                              : 'No messages yet',
                          description: _tab == ChatTab.circle && _myCircles.isEmpty
                              ? 'When you join a practitioner Circle, its thread appears here.'
                              : 'Be the first to say hello.',
                        )
                      : ListView.builder(
                          controller: _scroll,
                          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                          itemCount: _messages.length,
                          itemBuilder: (context, i) {
                            final m = _messages[i];
                            final mine = m.sender?.id == uid;
                            return Align(
                              alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.78),
                                padding: const EdgeInsets.fromLTRB(12, 10, 12, 8),
                                decoration: BoxDecoration(
                                  color: mine ? AppColors.blue : Colors.white,
                                  borderRadius: AppRadius.rMd,
                                  border: mine ? null : Border.all(color: AppColors.slate200),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (!mine)
                                      Text(
                                        m.sender?.fullName ?? 'Member',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          color: mine ? Colors.white70 : AppColors.blue,
                                        ),
                                      ),
                                    Text(
                                      m.content,
                                      style: TextStyle(
                                        color: mine ? Colors.white : AppColors.navy,
                                        height: 1.4,
                                      ),
                                    ),
                                    if (m.createdAt != null)
                                      Text(
                                        Formatters.time(m.createdAt),
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: mine ? Colors.white70 : AppColors.slateMeta,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _input,
                        minLines: 1,
                        maxLines: 4,
                        decoration: const InputDecoration(
                          hintText: 'Write a message',
                          isDense: true,
                        ),
                        onSubmitted: (_) => _send(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      onPressed: _sending ? null : _send,
                      style: IconButton.styleFrom(backgroundColor: AppColors.blue),
                      icon: _sending
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Icon(Icons.send_rounded),
                    ),
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

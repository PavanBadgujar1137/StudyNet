import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { theme } from '../../theme';

const CHANNELS = [
  { key: 'circles', label: 'My Circles', icon: '🌀' },
  { key: 'global', label: 'Global Feed', icon: '🌍' },
  { key: 'direct', label: 'Direct Guide', icon: '💬' },
];

export default function CommunityTabScreen() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState('circles');

  // Circles state
  const [circles, setCircles] = useState([]);
  const [joinedIds, setJoinedIds] = useState([]);
  const [circlesLoading, setCirclesLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Global chat state
  const [globalMessages, setGlobalMessages] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const scrollRef = useRef(null);

  // ── Load Circles ──
  const loadCircles = useCallback(async () => {
    setCirclesLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.LEARNER.CIRCLES_ALL);
      if (res.data?.success) {
        const list = res.data.circles || res.data.data || [];
        setCircles(list);
        const myJoined = list
          .filter((c) => (c.members || []).some((m) => String(m._id || m) === String(user?._id)))
          .map((c) => c._id);
        setJoinedIds(myJoined);
      }
    } catch (e) {
      console.warn('Circles fetch error:', e.message);
    } finally {
      setCirclesLoading(false);
      setRefreshing(false);
    }
  }, [user?._id]);

  // ── Load Global Feed ──
  const loadGlobalFeed = useCallback(async () => {
    setGlobalLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.CHAT.GLOBAL);
      if (res.data?.success) {
        setGlobalMessages(res.data.messages || res.data.data || []);
      }
    } catch (e) {
      console.warn('Global feed error:', e.message);
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCircles();
  }, [loadCircles]);

  useEffect(() => {
    if (activeChannel === 'global') {
      loadGlobalFeed();
    }
  }, [activeChannel, loadGlobalFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    if (activeChannel === 'circles') loadCircles();
    else if (activeChannel === 'global') loadGlobalFeed();
  };

  const handleJoinCircle = async (circleId) => {
    setJoiningId(circleId);
    try {
      const res = await apiClient.post(ENDPOINTS.LEARNER.JOIN_CIRCLE(circleId));
      if (res.data?.success) {
        setJoinedIds((prev) => [...prev, circleId]);
        Alert.alert('✓ Joined', res.data.message || 'Successfully joined the circle!');
        loadCircles();
      } else {
        Alert.alert('Error', res.data?.message || 'Could not join circle.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not join this circle.');
    } finally {
      setJoiningId(null);
    }
  };

  const handleSendGlobalMessage = async () => {
    const text = chatInput.trim();
    if (!text || sendingMsg) return;
    setSendingMsg(true);
    try {
      await apiClient.post(ENDPOINTS.CHAT.GLOBAL, { message: text });
      setChatInput('');
      loadGlobalFeed();
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    } catch (e) {
      Alert.alert('Error', 'Could not send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* ── Channel Switcher ── */}
      <View style={styles.channelBar}>
        {CHANNELS.map((ch) => (
          <TouchableOpacity
            key={ch.key}
            style={[styles.channelBtn, activeChannel === ch.key && styles.channelBtnActive]}
            onPress={() => setActiveChannel(ch.key)}
          >
            <Text style={styles.channelIcon}>{ch.icon}</Text>
            <Text
              style={[
                styles.channelBtnText,
                activeChannel === ch.key && styles.channelBtnTextActive,
              ]}
            >
              {ch.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Circles Channel ── */}
      {activeChannel === 'circles' && (
        circlesLoading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={theme.colors.blue} />
            <Text style={styles.loadingText}>Loading circles…</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <Text style={styles.sectionTitle}>GROWTH CIRCLES</Text>
            <Text style={styles.sectionSubtitle}>
              Peer cohort discussions with members of your joined circles.
            </Text>

            {circles.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🌀</Text>
                <Text style={styles.emptyTitle}>No Circles Yet</Text>
                <Text style={styles.emptyDesc}>
                  Your practitioner guide will create growth circles. Check back soon.
                </Text>
              </View>
            ) : (
              circles.map((circle) => {
                const isJoined = joinedIds.includes(circle._id);
                const memberCount = circle.members?.length || 0;
                const isJoining = joiningId === circle._id;
                return (
                  <View key={circle._id} style={styles.circleCard}>
                    <View style={styles.circleIconWrap}>
                      <Text style={styles.circleIcon}>🌀</Text>
                    </View>
                    <View style={styles.circleInfo}>
                      <Text style={styles.circleName}>{circle.name}</Text>
                      {circle.description ? (
                        <Text style={styles.circleDesc} numberOfLines={2}>
                          {circle.description}
                        </Text>
                      ) : null}
                      <Text style={styles.circleMeta}>
                        {memberCount} member{memberCount !== 1 ? 's' : ''}
                        {circle.practitioner?.firstName
                          ? ` · Guide: ${circle.practitioner.firstName}`
                          : ''}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.joinBtn,
                        isJoined && styles.joinBtnJoined,
                        isJoining && { opacity: 0.6 },
                      ]}
                      onPress={() => !isJoined && handleJoinCircle(circle._id)}
                      disabled={isJoined || isJoining}
                    >
                      {isJoining ? (
                        <ActivityIndicator size="small" color={isJoined ? theme.colors.successText : '#FFF'} />
                      ) : (
                        <Text style={[styles.joinBtnText, isJoined && styles.joinBtnTextJoined]}>
                          {isJoined ? 'Joined ✓' : 'Join'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        )
      )}

      {/* ── Global Feed Channel ── */}
      {activeChannel === 'global' && (
        <>
          {globalLoading && globalMessages.length === 0 ? (
            <View style={styles.loadingCenter}>
              <ActivityIndicator size="large" color={theme.colors.blue} />
              <Text style={styles.loadingText}>Loading community feed…</Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.chatContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              {globalMessages.length === 0 && (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyIcon}>🌍</Text>
                  <Text style={styles.emptyTitle}>Global Community Feed</Text>
                  <Text style={styles.emptyDesc}>
                    Connect with compassionate peers across the entire OpenHand network. Be the first to share.
                  </Text>
                </View>
              )}
              {globalMessages.map((msg, i) => {
                const isMe = String(msg.sender?._id || msg.sender) === String(user?._id);
                const senderName = msg.sender?.firstName
                  ? `${msg.sender.firstName} ${msg.sender.lastName || ''}`
                  : 'Community Member';
                return (
                  <View
                    key={msg._id || i}
                    style={[
                      styles.globalBubbleWrap,
                      isMe ? styles.globalBubbleMe : styles.globalBubbleThem,
                    ]}
                  >
                    {!isMe && (
                      <View style={styles.miniAvatar}>
                        <Text style={styles.miniAvatarText}>
                          {senderName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.globalBubble,
                        isMe ? styles.globalBubbleMeBg : styles.globalBubbleThemBg,
                      ]}
                    >
                      {!isMe && <Text style={styles.senderName}>{senderName}</Text>}
                      <Text style={isMe ? styles.globalTextMe : styles.globalTextThem}>
                        {msg.message || msg.content || msg.text}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
          {/* Global Chat Input */}
          <View style={styles.chatInputBar}>
            <TextInput
              style={styles.chatInput}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Share with the community…"
              placeholderTextColor={theme.colors.textLight}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!chatInput.trim() || sendingMsg) && styles.sendBtnDisabled]}
              onPress={handleSendGlobalMessage}
              disabled={!chatInput.trim() || sendingMsg}
            >
              {sendingMsg ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.sendBtnText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Direct Guide Channel ── */}
      {activeChannel === 'direct' && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Direct Guide Messaging</Text>
            <Text style={styles.emptyDesc}>
              Send a confidential message directly to your assigned practitioner guide. This feature opens once your guide has been assigned.
            </Text>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // ── Channel Bar ──
  channelBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  channelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: theme.spacing.borderRadiusPill,
    backgroundColor: theme.colors.surfaceSubtle,
    gap: 4,
  },
  channelBtnActive: { backgroundColor: theme.colors.blue },
  channelIcon: { fontSize: 13 },
  channelBtnText: {
    fontSize: 11,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.textMuted,
  },
  channelBtnTextActive: {
    color: theme.colors.textWhite,
    fontWeight: theme.typography.bold,
  },
  // ── Common ──
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
  },
  content: {
    padding: theme.spacing.base,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.heavy,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.base,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  emptyIcon: { fontSize: 36, marginBottom: theme.spacing.md },
  emptyTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  // ── Circle Cards ──
  circleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  circleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIcon: { fontSize: 18 },
  circleInfo: { flex: 1 },
  circleName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  circleDesc: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  circleMeta: {
    fontSize: theme.typography.xs,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  joinBtn: {
    backgroundColor: theme.colors.blue,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.spacing.borderRadiusPill,
    minWidth: 56,
    alignItems: 'center',
  },
  joinBtnJoined: {
    backgroundColor: theme.colors.successLight,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  joinBtnText: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
    color: '#FFF',
  },
  joinBtnTextJoined: { color: theme.colors.successText },
  // ── Global Feed ──
  chatContent: {
    padding: theme.spacing.base,
    paddingBottom: 20,
    gap: theme.spacing.sm,
  },
  globalBubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  globalBubbleMe: { justifyContent: 'flex-end' },
  globalBubbleThem: { justifyContent: 'flex-start' },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.indigo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  globalBubble: {
    maxWidth: '78%',
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.md,
  },
  globalBubbleMeBg: { backgroundColor: theme.colors.blue, borderBottomRightRadius: 4 },
  globalBubbleThemBg: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.indigo,
    marginBottom: 3,
  },
  globalTextMe: { fontSize: theme.typography.sm, color: '#FFF', lineHeight: 19 },
  globalTextThem: { fontSize: theme.typography.sm, color: theme.colors.text, lineHeight: 19 },
  // ── Chat Input ──
  chatInputBar: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
    alignItems: 'flex-end',
  },
  chatInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.spacing.borderRadiusPill,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 10,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    maxHeight: 90,
  },
  sendBtn: {
    backgroundColor: theme.colors.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.spacing.borderRadiusPill,
  },
  sendBtnDisabled: { opacity: 0.45 },
  sendBtnText: { color: '#FFF', fontSize: theme.typography.sm, fontWeight: theme.typography.bold },
});

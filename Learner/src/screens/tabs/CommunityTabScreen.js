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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { theme } from '../../theme';

const CHANNELS = [
  { key: 'circles', label: 'Circles', icon: 'people-circle-outline' },
  { key: 'practitioners', label: 'Guides', icon: 'shield-checkmark-outline' },
  { key: 'global', label: 'Feed', icon: 'globe-outline' },
  { key: 'direct', label: 'Direct', icon: 'chatbubble-ellipses-outline' },
];

export default function CommunityTabScreen({ navigation, route }) {
  const { user } = useAuth();
  const { isDark } = useAppTheme();
  const [activeChannel, setActiveChannel] = useState(
    route?.params?.initialChannel || 'circles'
  );

  // Circles state
  const [circles, setCircles] = useState([]);
  const [joinedIds, setJoinedIds] = useState([]);
  const [circlesLoading, setCirclesLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  // Practitioners state (Practitioners.jsx parity)
  const [practitioners, setPractitioners] = useState([]);
  const [practitionersLoading, setPractitionersLoading] = useState(false);
  const [practitionerSearch, setPractitionerSearch] = useState('');

  // Global chat state
  const [globalMessages, setGlobalMessages] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Direct chat state
  const [directPartner, setDirectPartner] = useState(route?.params?.targetPractitioner || null);
  const [directMessages, setDirectMessages] = useState([]);
  const [directLoading, setDirectLoading] = useState(false);
  const [directInput, setDirectInput] = useState('');

  const [refreshing, setRefreshing] = useState(false);
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

  // ── Load Practitioners Directory ──
  const loadPractitioners = useCallback(async () => {
    setPractitionersLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.LEARNER.PRACTITIONERS);
      if (res.data?.success) {
        setPractitioners(res.data.practitioners || res.data.data || []);
      }
    } catch (e) {
      console.warn('Practitioners directory fetch error:', e.message);
    } finally {
      setPractitionersLoading(false);
      setRefreshing(false);
    }
  }, []);

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
      setRefreshing(false);
    }
  }, []);

  // ── Load Direct Messages ──
  const loadDirectMessages = useCallback(async () => {
    if (!directPartner?._id && !directPartner?.user?._id) return;
    const targetId = directPartner?.user?._id || directPartner?._id;
    setDirectLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.CHAT.DIRECT(targetId));
      if (res.data?.success) {
        setDirectMessages(res.data.messages || res.data.data || []);
      }
    } catch (e) {
      console.warn('Direct chat error:', e.message);
    } finally {
      setDirectLoading(false);
      setRefreshing(false);
    }
  }, [directPartner]);

  useEffect(() => {
    if (activeChannel === 'circles') loadCircles();
    else if (activeChannel === 'practitioners') loadPractitioners();
    else if (activeChannel === 'global') loadGlobalFeed();
    else if (activeChannel === 'direct') loadDirectMessages();
  }, [activeChannel, loadCircles, loadPractitioners, loadGlobalFeed, loadDirectMessages]);

  const onRefresh = () => {
    setRefreshing(true);
    if (activeChannel === 'circles') loadCircles();
    else if (activeChannel === 'practitioners') loadPractitioners();
    else if (activeChannel === 'global') loadGlobalFeed();
    else if (activeChannel === 'direct') loadDirectMessages();
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
        Alert.alert('Notice', res.data?.message || 'Could not join circle.');
      }
    } catch (e) {
      Alert.alert('Notice', e.response?.data?.message || 'Could not join this circle.');
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
      Alert.alert('Notice', 'Could not send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleSendDirectMessage = async () => {
    const text = directInput.trim();
    if (!text) return;
    const targetId = directPartner?.user?._id || directPartner?._id;
    if (!targetId) {
      Alert.alert('Notice', 'Please select a practitioner guide to start direct messaging.');
      return;
    }

    const optimisticMsg = {
      _id: `m-${Date.now()}`,
      content: text,
      sender: user?._id,
      createdAt: new Date().toISOString(),
    };
    setDirectMessages((prev) => [...prev, optimisticMsg]);
    setDirectInput('');

    try {
      await apiClient.post(ENDPOINTS.CHAT.DIRECT(targetId), { message: text });
    } catch (e) {
      console.warn('Direct message sending error:', e.message);
    }
  };

  const filteredPractitioners = practitioners.filter((p) => {
    const pName = `${p.user?.firstName || p.firstName || ''} ${p.user?.lastName || p.lastName || ''}`;
    const pBio = p.bio || p.credentials || '';
    return [pName, pBio].join(' ').toLowerCase().includes(practitionerSearch.toLowerCase());
  });

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#040817', '#08112C', '#0E1D45', '#080E24']
          : ['#DCEEFF', '#E8F2FF', '#F4F0FF', '#FFFFFF']
      }
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* ── Channel Switcher ── */}
        <View style={[styles.channelBar, isDark && { backgroundColor: 'rgba(13, 21, 44, 0.75)', borderBottomColor: 'rgba(255, 255, 255, 0.1)' }]}>
          {CHANNELS.map((ch) => {
            const isActive = activeChannel === ch.key;
            return (
              <TouchableOpacity
                key={ch.key}
                style={[styles.channelBtn, isActive && styles.channelBtnActive]}
                onPress={() => setActiveChannel(ch.key)}
              >
                <Ionicons
                  name={ch.icon}
                  size={18}
                  color={isActive ? '#1E64EB' : (isDark ? '#94A3B8' : theme.colors.textMuted)}
                />
                <Text style={[styles.channelBtnText, isDark && { color: '#94A3B8' }, isActive && styles.channelBtnTextActive]}>
                  {ch.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Circles Channel ── */}
        {activeChannel === 'circles' && (
          circlesLoading ? (
            <View style={styles.loadingCenter}>
              <ActivityIndicator size="large" color="#1E64EB" />
              <Text style={[styles.loadingText, isDark && { color: '#94A3B8' }]}>Loading growth circles…</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.content}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              <Text style={[styles.sectionTitle, isDark && { color: '#38BDF8' }]}>PEER GROWTH CIRCLES</Text>
              <Text style={[styles.sectionSubtitle, isDark && { color: '#94A3B8' }]}>
                Join small cohorts led by verified OpenHand practitioners.
              </Text>

              {circles.length === 0 ? (
                <View style={[styles.emptyCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <Ionicons name="people-outline" size={40} color={isDark ? '#64748B' : theme.colors.textLight} />
                  <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>No Circles Yet</Text>
                  <Text style={[styles.emptyDesc, isDark && { color: '#94A3B8' }]}>
                    Your practitioner guide will create growth circles. Check back soon.
                  </Text>
                </View>
              ) : (
                circles.map((circle) => {
                  const isJoined = joinedIds.includes(circle._id);
                  const memberCount = circle.members?.length || 0;
                  const isJoining = joiningId === circle._id;
                  return (
                    <TouchableOpacity
                      key={circle._id}
                      style={[styles.circleCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('CircleDetail', {
                          circleId: circle._id,
                          initialCircle: {
                            ...circle,
                            title: circle.name || circle.title,
                          },
                        })
                      }
                    >
                      <View style={[styles.circleIconWrap, isDark && { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                        <Ionicons name="people" size={20} color={isDark ? '#38BDF8' : '#1E64EB'} />
                      </View>
                      <View style={styles.circleInfo}>
                        <Text style={[styles.circleName, isDark && { color: '#FFFFFF' }]}>{circle.name || circle.title}</Text>
                        {circle.description ? (
                          <Text style={[styles.circleDesc, isDark && { color: '#94A3B8' }]} numberOfLines={2}>
                            {circle.description}
                          </Text>
                        ) : null}
                        <Text style={[styles.circleMeta, isDark && { color: '#64748B' }]}>
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
                        onPress={(e) => {
                          e.stopPropagation?.();
                          !isJoined && handleJoinCircle(circle._id);
                        }}
                        disabled={isJoined || isJoining}
                      >
                        {isJoining ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text style={[styles.joinBtnText, isJoined && styles.joinBtnTextJoined]}>
                            {isJoined ? 'Joined ✓' : 'Join'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )
        )}

      {/* ── Practitioners Directory Channel (Practitioners.jsx parity) ── */}
      {activeChannel === 'practitioners' && (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Search Bar */}
          <View style={[styles.searchWrap, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <Ionicons name="search" size={18} color={isDark ? '#64748B' : theme.colors.textMuted} />
            <TextInput
              style={[styles.searchInput, isDark && { color: '#FFFFFF' }]}
              value={practitionerSearch}
              onChangeText={setPractitionerSearch}
              placeholder="Search guides by name or focus…"
              placeholderTextColor={isDark ? '#64748B' : theme.colors.textLight}
            />
            {practitionerSearch.length > 0 && (
              <TouchableOpacity onPress={() => setPractitionerSearch('')}>
                <Ionicons name="close-circle" size={18} color={isDark ? '#94A3B8' : theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.sectionTitle, isDark && { color: '#38BDF8' }]}>OPENHAND VERIFIED GUIDES</Text>
          <Text style={[styles.sectionSubtitle, isDark && { color: '#94A3B8' }]}>
            Connect with certified practitioners across somatic regulation, breathwork, and holistic wellness.
          </Text>

          {practitionersLoading ? (
            <View style={styles.loadingCenter}>
              <ActivityIndicator size="large" color="#1E64EB" />
              <Text style={[styles.loadingText, isDark && { color: '#94A3B8' }]}>Loading practitioner directory…</Text>
            </View>
          ) : filteredPractitioners.length === 0 ? (
            <View style={[styles.emptyCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <Ionicons name="shield-outline" size={40} color={isDark ? '#64748B' : theme.colors.textLight} />
              <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>No Guides Found</Text>
              <Text style={[styles.emptyDesc, isDark && { color: '#94A3B8' }]}>
                {practitionerSearch
                  ? `No practitioners match "${practitionerSearch}".`
                  : 'Verified practitioner profiles will appear here.'}
              </Text>
            </View>
          ) : (
            filteredPractitioners.map((p) => {
              const u = p.user || p;
              const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Practitioner Guide';
              const cred = p.credentials || 'Certified OpenHand Guide';

              return (
                <TouchableOpacity
                  key={p._id || u._id}
                  style={[styles.practitionerCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('PractitionerDetail', {
                      practitioner: { ...p, ...u },
                    })
                  }
                >
                  <View style={styles.practAvatar}>
                    <Text style={styles.practAvatarText}>
                      {u.firstName?.[0] || 'G'}{u.lastName?.[0] || 'P'}
                    </Text>
                  </View>
                  <View style={styles.practInfo}>
                    <View style={styles.practNameRow}>
                      <Text style={[styles.practName, isDark && { color: '#FFFFFF' }]}>{name}</Text>
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.emerald} />
                    </View>
                    <Text style={[styles.practCred, isDark && { color: '#38BDF8' }]}>{cred}</Text>
                    {p.bio ? (
                      <Text style={[styles.practBio, isDark && { color: '#94A3B8' }]} numberOfLines={2}>
                        {p.bio}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={isDark ? '#64748B' : theme.colors.textMuted} />
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* ── Global Feed Channel ── */}
      {activeChannel === 'global' && (
        <>
          {globalLoading && globalMessages.length === 0 ? (
            <View style={styles.loadingCenter}>
              <ActivityIndicator size="large" color="#1E64EB" />
              <Text style={[styles.loadingText, isDark && { color: '#94A3B8' }]}>Loading community feed…</Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.content}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              <Text style={[styles.sectionTitle, isDark && { color: '#38BDF8' }]}>GLOBAL COMMUNITY FEED</Text>
              <Text style={[styles.sectionSubtitle, isDark && { color: '#94A3B8' }]}>
                Shared reflections and intentions across all OpenHand learners.
              </Text>

              {globalMessages.length === 0 ? (
                <View style={[styles.emptyCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <Ionicons name="chatbubbles-outline" size={40} color={isDark ? '#64748B' : theme.colors.textLight} />
                  <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>Feed is Quiet</Text>
                  <Text style={[styles.emptyDesc, isDark && { color: '#94A3B8' }]}>Be the first to post an intention or reflection.</Text>
                </View>
              ) : (
                globalMessages.map((msg, i) => (
                  <View key={msg._id || i} style={[styles.messageBubble, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                    <View style={styles.msgHeader}>
                      <Text style={[styles.msgAuthor, isDark && { color: '#38BDF8' }]}>
                        {msg.sender?.firstName || 'Learner'} {msg.sender?.lastName?.[0] || ''}.
                      </Text>
                      <Text style={[styles.msgTime, isDark && { color: '#64748B' }]}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={[styles.msgBody, isDark && { color: '#F1F5F9' }]}>{msg.content || msg.message}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          )}

          {/* Chat Input */}
          <View style={[styles.inputBar, isDark && { backgroundColor: 'rgba(13, 21, 44, 0.85)', borderTopColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <TextInput
              style={[styles.inputField, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }]}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Share a thought or reflection with the community…"
              placeholderTextColor={isDark ? '#64748B' : theme.colors.textLight}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!chatInput.trim() || sendingMsg) && { opacity: 0.5 }]}
              onPress={handleSendGlobalMessage}
              disabled={!chatInput.trim() || sendingMsg}
            >
              <Ionicons name="send" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Direct Guide Channel ── */}
      {activeChannel === 'direct' && (
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={[styles.directHeaderCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <Ionicons name="shield-checkmark" size={24} color={isDark ? '#38BDF8' : '#1E64EB'} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.directHeaderTitle, isDark && { color: '#FFFFFF' }]}>
                  {directPartner
                    ? `Direct Channel: ${directPartner.firstName || 'Guide'}`
                    : '1-on-1 Guide Communication'}
                </Text>
                <Text style={[styles.directHeaderDesc, isDark && { color: '#94A3B8' }]}>
                  Private, encrypted message space between you and your practitioner.
                </Text>
              </View>
            </View>

            {directMessages.length === 0 ? (
              <View style={[styles.emptyCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Ionicons name="chatbubble-outline" size={36} color={isDark ? '#64748B' : theme.colors.textLight} />
                <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>Start a Private Conversation</Text>
                <Text style={[styles.emptyDesc, isDark && { color: '#94A3B8' }]}>
                  Send your guide questions, reflections, or follow-ups between sessions.
                </Text>
              </View>
            ) : (
              directMessages.map((msg, i) => {
                const isMe = String(msg.sender) === String(user?._id);
                return (
                  <View
                    key={msg._id || i}
                    style={[
                      styles.directBubble,
                      isMe ? styles.directBubbleMe : [styles.directBubbleGuide, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)' }],
                    ]}
                  >
                    <Text style={isMe ? styles.directTextMe : [styles.directTextGuide, isDark && { color: '#F1F5F9' }]}>
                      {msg.content || msg.message}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={[styles.inputBar, isDark && { backgroundColor: 'rgba(13, 21, 44, 0.85)', borderTopColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <TextInput
              style={[styles.inputField, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }]}
              value={directInput}
              onChangeText={setDirectInput}
              placeholder="Type message to your guide…"
              placeholderTextColor={isDark ? '#64748B' : theme.colors.textLight}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !directInput.trim() && { opacity: 0.5 }]}
              onPress={handleSendDirectMessage}
              disabled={!directInput.trim()}
            >
              <Ionicons name="send" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  channelBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  channelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  channelBtnActive: {
    borderBottomColor: theme.colors.blue,
  },
  channelBtnText: {
    fontSize: 11,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.textMuted,
  },
  channelBtnTextActive: {
    color: theme.colors.blue,
    fontWeight: theme.typography.bold,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.heavy,
    color: theme.colors.blue,
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
  },
  loadingCenter: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 36,
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xl,
    gap: 8,
  },
  emptyTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  emptyDesc: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  circleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    gap: 12,
  },
  circleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  circleDesc: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  circleMeta: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  joinBtn: {
    backgroundColor: theme.colors.blue,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  joinBtnJoined: {
    backgroundColor: theme.colors.successLight,
  },
  joinBtnText: {
    color: '#FFF',
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
  },
  joinBtnTextJoined: {
    color: theme.colors.successText,
  },
  practitionerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    gap: 12,
  },
  practAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practAvatarText: {
    color: '#FFF',
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
  },
  practInfo: {
    flex: 1,
  },
  practNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  practName: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  practCred: {
    fontSize: 10,
    color: theme.colors.blue,
    fontWeight: theme.typography.semiBold,
    marginTop: 1,
  },
  practBio: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  messageBubble: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
  },
  msgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  msgAuthor: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
    color: theme.colors.blue,
  },
  msgTime: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  msgBody: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    lineHeight: 18,
  },
  directHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 14,
    gap: 12,
  },
  directHeaderTitle: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  directHeaderDesc: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  directBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  directBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.blue,
    borderBottomRightRadius: 2,
  },
  directBubbleGuide: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 2,
  },
  directTextMe: {
    color: '#FFF',
    fontSize: theme.typography.sm,
  },
  directTextGuide: {
    color: theme.colors.text,
    fontSize: theme.typography.sm,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 8,
  },
  inputField: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

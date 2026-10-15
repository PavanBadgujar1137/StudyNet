import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

export default function CircleDetailScreen({ route, navigation }) {
  const { circleId, initialCircle } = route.params || {};
  const { user } = useAuth();
  const scrollRef = useRef(null);

  const [circle, setCircle] = useState(initialCircle || null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (circle) {
      const joined = (circle.members || []).some(
        (m) => String(m._id || m) === String(user?._id)
      );
      setIsJoined(joined);
    }
  }, [circle, user?._id]);

  const handleToggleJoin = async () => {
    if (!circleId) return;
    setJoining(true);
    try {
      const res = await apiClient.post(ENDPOINTS.LEARNER.JOIN_CIRCLE(circleId));
      if (res.data?.success) {
        setIsJoined(!isJoined);
        Alert.alert(
          isJoined ? 'Left Circle' : 'Joined Circle',
          isJoined
            ? 'You have left this circle.'
            : 'Welcome! You can now participate in circle discussions.'
        );
      }
    } catch (e) {
      Alert.alert('Notice', e.response?.data?.message || 'Could not update circle status.');
    } finally {
      setJoining(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      _id: `m-${Date.now()}`,
      content: inputText.trim(),
      sender: {
        firstName: user?.firstName || 'Learner',
        lastName: user?.lastName || '',
      },
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Top Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {circle?.title || 'Circle'}
        </Text>
        <TouchableOpacity
          style={[styles.joinBtn, isJoined && styles.joinBtnActive]}
          onPress={handleToggleJoin}
          disabled={joining}
        >
          {joining ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.joinBtnText}>{isJoined ? 'Joined' : 'Join'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Circle Overview Card */}
        <View style={styles.circleCard}>
          <View style={styles.badgeRow}>
            <View style={styles.topicPill}>
              <Text style={styles.topicPillText}>{circle?.topic || 'Peer Healing'}</Text>
            </View>
            <View style={styles.memberPill}>
              <Ionicons name="people" size={14} color={theme.colors.textMuted} />
              <Text style={styles.memberPillText}>
                {circle?.members?.length || 1} member{circle?.members?.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <Text style={styles.circleTitle}>{circle?.title || 'Daily Grounding Circle'}</Text>
          <Text style={styles.circleDesc}>
            {circle?.description ||
              'A compassionate space for open reflection, mindful check-ins, and shared wisdom.'}
          </Text>

          {circle?.facilitator?.firstName && (
            <View style={styles.facilitatorRow}>
              <Ionicons name="shield-checkmark" size={16} color={theme.colors.blue} />
              <Text style={styles.facilitatorText}>
                Facilitator: {circle.facilitator.firstName} {circle.facilitator.lastName || ''}
              </Text>
            </View>
          )}
        </View>

        {/* Discussion Stream */}
        <View style={styles.discussionHeader}>
          <Text style={styles.discussionTitle}>Circle Reflections & Sharing</Text>
        </View>

        {messages.length === 0 ? (
          <View style={styles.emptyDiscussion}>
            <Ionicons name="chatbubbles-outline" size={36} color={theme.colors.textLight} />
            <Text style={styles.emptyDiscussionTitle}>Welcome to the Circle</Text>
            <Text style={styles.emptyDiscussionDesc}>
              Be the first to share an intention, a reflection, or how your day is feeling.
            </Text>
          </View>
        ) : (
          messages.map((msg) => (
            <View key={msg._id} style={styles.messageBubble}>
              <View style={styles.messageMeta}>
                <Text style={styles.senderName}>
                  {msg.sender?.firstName || 'Learner'} {msg.sender?.lastName?.[0] || ''}.
                </Text>
                <Text style={styles.messageTime}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.messageText}>{msg.content}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.chatInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Share your reflection with the circle…"
          placeholderTextColor={theme.colors.textLight}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || sending}
        >
          <Ionicons name="send" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
  },
  navTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  joinBtn: {
    backgroundColor: theme.colors.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  joinBtnActive: {
    backgroundColor: theme.colors.emerald,
  },
  joinBtnText: {
    color: '#FFF',
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 20,
  },
  circleCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  topicPillText: {
    color: theme.colors.blue,
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberPillText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
  },
  circleTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: 6,
  },
  circleDesc: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  facilitatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  facilitatorText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.medium,
  },
  discussionHeader: {
    marginBottom: 12,
  },
  discussionTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  emptyDiscussion: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyDiscussionTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginTop: 8,
  },
  emptyDiscussionDesc: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  messageBubble: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
  },
  messageMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  senderName: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
    color: theme.colors.blue,
  },
  messageTime: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  messageText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});

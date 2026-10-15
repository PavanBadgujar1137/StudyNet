import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { theme } from '../../theme';

const DISCLAIMER =
  'AURA is an AI-guided space for reflection and somatic grounding, not a medical service. For emergencies, please contact a qualified professional.';

const AURA_WELCOME = (name) =>
  `Welcome into this space, ${name}. 🌿\n\nI am AURA — your Virtual Counselor. In this space, there is nothing you have to prove or carry alone.\n\nWhether your nervous system feels stretched or you need clarity, I am here to hold space with compassionate guidance.\n\nHow is your body and spirit feeling right in this moment?`;

export default function AuraTabScreen() {
  const { user } = useAuth();
  const userName = user?.firstName || 'Friend';
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'aura',
      text: AURA_WELCOME(userName),
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  const handleSend = async () => {
    const userText = inputText.trim();
    if (!userText || isTyping) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await apiClient.post(ENDPOINTS.AURA.CHAT, { message: userText });
      const reply =
        res.data?.reply ||
        res.data?.message ||
        `I hear you, ${userName}. Thank you for sharing that with me. Take a slow, gentle breath. Let's explore what support you need right now.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'aura',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e) {
      // Graceful fallback if AURA API is unavailable
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'aura',
          text: `I hear you, ${userName}. I'm holding space for whatever you're carrying right now. Take a slow breath — in through the nose, out through the mouth. You are safe here.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.auraAvatar}>
          <Text style={styles.auraAvatarText}>🌿</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>AURA Counselor</Text>
          <View style={styles.onlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Active — Somatic Grounding</Text>
          </View>
        </View>
      </View>

      {/* ── Disclaimer Banner ── */}
      {showDisclaimer && (
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>ⓘ {DISCLAIMER}</Text>
          <TouchableOpacity onPress={() => setShowDisclaimer(false)}>
            <Text style={styles.disclaimerDismiss}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Chat Messages ── */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m) => {
          const isAura = m.sender === 'aura';
          return (
            <View
              key={m.id}
              style={[
                styles.bubbleWrap,
                isAura ? styles.bubbleWrapAura : styles.bubbleWrapUser,
              ]}
            >
              {isAura && (
                <View style={styles.miniAvatarWrap}>
                  <Text style={styles.miniAvatar}>🌿</Text>
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  isAura ? styles.bubbleAura : styles.bubbleUser,
                  { maxWidth: '82%' },
                ]}
              >
                <Text style={isAura ? styles.textAura : styles.textUser}>
                  {m.text}
                </Text>
                <Text style={isAura ? styles.timeAura : styles.timeUser}>
                  {m.time}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <View style={[styles.bubbleWrap, styles.bubbleWrapAura]}>
            <View style={styles.miniAvatarWrap}>
              <Text style={styles.miniAvatar}>🌿</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleAura]}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Quick Prompts ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickPromptBar}
        contentContainerStyle={styles.quickPromptContent}
      >
        {[
          'I feel overwhelmed',
          'Help me breathe',
          'I need grounding',
          'I feel disconnected',
          'Talk me through it',
        ].map((prompt) => (
          <TouchableOpacity
            key={prompt}
            style={styles.quickPromptChip}
            onPress={() => {
              setInputText(prompt);
            }}
          >
            <Text style={styles.quickPromptText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Input Bar ── */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Share what is on your mind…"
          placeholderTextColor={theme.colors.textLight}
          multiline
          maxLength={800}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isTyping}
        >
          <Text style={styles.sendButtonText}>Send</Text>
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
  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.base,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  auraAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.accentBorder,
  },
  auraAvatarText: { fontSize: 22 },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
  },
  onlineText: {
    fontSize: theme.typography.xs,
    color: theme.colors.accentDark,
    fontWeight: theme.typography.medium,
  },
  // ── Disclaimer ──
  disclaimer: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
  },
  disclaimerDismiss: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '700',
  },
  // ── Messages ──
  messageList: {
    padding: theme.spacing.base,
    paddingBottom: 8,
    gap: theme.spacing.sm,
  },
  bubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  bubbleWrapAura: {
    justifyContent: 'flex-start',
  },
  bubbleWrapUser: {
    justifyContent: 'flex-end',
  },
  miniAvatarWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatar: { fontSize: 14 },
  bubble: {
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.md,
    paddingBottom: 8,
  },
  bubbleAura: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: theme.colors.blue,
    borderBottomRightRadius: 4,
  },
  textAura: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  textUser: {
    fontSize: theme.typography.sm,
    color: '#FFF',
    lineHeight: 20,
  },
  timeAura: {
    fontSize: 10,
    color: theme.colors.textLight,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeUser: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  // ── Quick Prompts ──
  quickPromptBar: {
    maxHeight: 44,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  quickPromptContent: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  quickPromptChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: theme.colors.accentLight,
    borderRadius: theme.spacing.borderRadiusPill,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
  },
  quickPromptText: {
    fontSize: theme.typography.xs,
    color: theme.colors.accentDark,
    fontWeight: '600',
  },
  // ── Input Bar ──
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.spacing.borderRadiusPill,
    paddingHorizontal: theme.spacing.base,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.spacing.borderRadiusPill,
  },
  sendDisabled: {
    opacity: 0.45,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
  },
});

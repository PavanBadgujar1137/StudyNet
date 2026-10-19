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
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { theme } from '../../theme';

const DISCLAIMER =
  'AURA is an AI-guided space for reflection and somatic grounding, not a medical service. For emergencies, please contact a qualified professional.';

const AURA_WELCOME = (name) =>
  `Welcome into this space, ${name}. 🌿\n\nI am AURA — your Virtual Counselor. In this space, there is nothing you have to prove or carry alone.\n\nWhether your nervous system feels stretched or you need clarity, I am here to hold space with compassionate guidance.\n\nHow is your body and spirit feeling right in this moment?`;

export default function AuraTabScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isDark } = useAppTheme();
  const userName = user?.firstName || 'Friend';
  const scrollRef = useRef(null);

  const topPadding = Platform.OS === 'web' ? 14 : Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 44) + 8;

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

  const hasInput = inputText.trim().length > 0;

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#040817', '#08112C', '#0E1D45', '#080E24']
          : ['#DCEEFF', '#E8F2FF', '#F4F0FF', '#FFFFFF']
      }
      style={{ flex: 1 }}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* ── Header with Safe Area Notch/Cutout Spacing ── */}
        <View
          style={[
            styles.header,
            { paddingTop: topPadding },
            isDark && {
              backgroundColor: 'rgba(13, 21, 44, 0.85)',
              borderBottomColor: 'rgba(255, 255, 255, 0.1)',
            },
          ]}
        >
          <View
            style={[
              styles.auraAvatar,
              isDark && {
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                borderColor: 'rgba(56, 189, 248, 0.3)',
              },
            ]}
          >
            <Text style={styles.auraAvatarText}>🌿</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, isDark && { color: '#FFFFFF' }]}>
              AURA Counselor
            </Text>
            <View style={styles.onlinePill}>
              <View
                style={[
                  styles.onlineDot,
                  isDark && { backgroundColor: '#38BDF8' },
                ]}
              />
              <Text
                style={[
                  styles.onlineText,
                  isDark && { color: '#38BDF8' },
                ]}
              >
                Active — Somatic Grounding
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation?.navigate('Profile')}
            style={styles.profileAvatar}
            activeOpacity={0.8}
          >
            <Text style={styles.profileAvatarText}>
              {`${user?.firstName?.[0] || 'L'}${user?.lastName?.[0] || ''}`.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Disclaimer Banner ── */}
        {showDisclaimer && (
          <View
            style={[
              styles.disclaimer,
              isDark && {
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderBottomColor: 'rgba(245, 158, 11, 0.3)',
              },
            ]}
          >
            <Text
              style={[
                styles.disclaimerText,
                isDark && { color: '#FCD34D' },
              ]}
            >
              ⓘ {DISCLAIMER}
            </Text>
            <TouchableOpacity onPress={() => setShowDisclaimer(false)}>
              <Text
                style={[
                  styles.disclaimerDismiss,
                  isDark && { color: '#FBBF24' },
                ]}
              >
                Dismiss
              </Text>
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
                  <View
                    style={[
                      styles.miniAvatarWrap,
                      isDark && { backgroundColor: 'rgba(56, 189, 248, 0.15)' },
                    ]}
                  >
                    <Text style={styles.miniAvatar}>🌿</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    isAura
                      ? [
                          styles.bubbleAura,
                          isDark && {
                            backgroundColor: 'rgba(14, 23, 46, 0.85)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        ]
                      : styles.bubbleUser,
                    { maxWidth: '82%' },
                  ]}
                >
                  <Text
                    style={
                      isAura
                        ? [styles.textAura, isDark && { color: '#F1F5F9' }]
                        : styles.textUser
                    }
                  >
                    {m.text}
                  </Text>
                  <Text
                    style={
                      isAura
                        ? [styles.timeAura, isDark && { color: '#64748B' }]
                        : styles.timeUser
                    }
                  >
                    {m.time}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <View style={[styles.bubbleWrap, styles.bubbleWrapAura]}>
              <View
                style={[
                  styles.miniAvatarWrap,
                  isDark && { backgroundColor: 'rgba(56, 189, 248, 0.15)' },
                ]}
              >
                <Text style={styles.miniAvatar}>🌿</Text>
              </View>
              <View
                style={[
                  styles.bubble,
                  styles.bubbleAura,
                  isDark && {
                    backgroundColor: 'rgba(14, 23, 46, 0.85)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                ]}
              >
                <ActivityIndicator
                  size="small"
                  color={isDark ? '#38BDF8' : '#0D9488'}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Quick Prompts ── */}
        <View
          style={[
            styles.quickPromptSection,
            isDark && {
              backgroundColor: 'rgba(13, 21, 44, 0.85)',
              borderTopColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
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
                style={[
                  styles.quickPromptChip,
                  isDark && styles.quickPromptChipDark,
                ]}
                onPress={() => {
                  setInputText(prompt);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.quickPromptText,
                    isDark && styles.quickPromptTextDark,
                  ]}
                >
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Input Bar ── */}
        <View
          style={[
            styles.inputContainer,
            isDark && {
              backgroundColor: 'rgba(13, 21, 44, 0.95)',
              borderTopColor: 'rgba(255, 255, 255, 0.1)',
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              isDark && {
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                isDark && { color: '#FFFFFF' },
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Share what is on your mind…"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              multiline
              maxLength={800}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={handleSend}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              isDark && styles.sendButtonDark,
              (!hasInput || isTyping) && (isDark ? styles.sendDisabledDark : styles.sendDisabled),
            ]}
            onPress={handleSend}
            disabled={!hasInput || isTyping}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={!hasInput || isTyping ? (isDark ? '#475569' : '#94A3B8') : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
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
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  auraAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6FBF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#99F6E4',
  },
  auraAvatarText: { fontSize: 22 },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Disclaimer ──
  disclaimer: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  disclaimerDismiss: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '700',
  },

  // ── Messages ──
  messageList: {
    padding: 16,
    paddingBottom: 16,
    gap: 12,
  },
  bubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
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
    backgroundColor: '#E6FBF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  miniAvatar: { fontSize: 14 },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleAura: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleUser: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  textAura: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 21,
  },
  textUser: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 21,
  },
  timeAura: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  timeUser: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 6,
    alignSelf: 'flex-end',
  },

  // ── Quick Prompts ──
  quickPromptSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 10,
  },
  quickPromptContent: {
    paddingHorizontal: 14,
    gap: 8,
    alignItems: 'center',
  },
  quickPromptChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPromptChipDark: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.28)',
  },
  quickPromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
    includeFontPadding: false,
  },
  quickPromptTextDark: {
    color: '#38BDF8',
  },

  // ── Input Bar ──
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
    textAlignVertical: 'center',
    padding: 0,
    margin: 0,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDark: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
  },
  sendDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendDisabledDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowOpacity: 0,
    elevation: 0,
  },
});


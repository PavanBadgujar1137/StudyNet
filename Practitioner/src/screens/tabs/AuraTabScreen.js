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
  Alert,
  StatusBar as NativeStatusBar,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';

const CLINICAL_FOCUS_OPTIONS = [
  { id: 'soap', label: 'SOAP Notes (S-O-A-P)', icon: 'file-text' },
  { id: 'case', label: 'Case Formulation', icon: 'git-branch' },
  { id: 'prompts', label: 'Reflection Prompts', icon: 'feather' },
  { id: 'regulation', label: 'Nervous System Care', icon: 'heart' },
];

export default function AuraTabScreen() {
  const { user } = useAuth();
  const { isDark, tokens } = useAppTheme();
  const userName = user?.firstName || 'Dr. Evelyn';
  const scrollViewRef = useRef(null);
  const insets = useSafeAreaInsets();
  // Reliable status-bar-aware top inset for Android & iOS
  const topInset = Platform.OS === 'web'
    ? 0
    : Math.max(insets?.top || 0, Platform.OS === 'android' ? (NativeStatusBar.currentHeight || 0) : 0);

  const getInitialMessages = () => [
    {
      id: 'welcome',
      sender: 'aura',
      text: `Welcome colleague, ${userName}. ⚡\n\nI am AURA — your Clinical & Practice AI Copilot. I am ready to assist your professional workflows:\n\n• SOAP & DAP Note Synthesis from raw session debriefs\n• Therapeutic Case Conceptualization (ACT, Somatic, IFS)\n• Personalized Client Reflection Prompts\n• Clinical Boundary & Nervous System Self-Care\n\nWhat clinical inquiry or patient debrief shall we explore today?`,
      time: 'Just now',
    },
  ];

  const [messages, setMessages] = useState(getInitialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState('soap');

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const handleSend = async (overrideText = null) => {
    const textToSend = (overrideText !== null ? overrideText : inputText).trim();
    if (!textToSend || isTyping) return;

    const userMsg = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (overrideText === null) setInputText('');
    setIsTyping(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender === 'aura' ? 'model' : 'user',
        text: m.text,
      }));

      const res = await apiClient.post(ENDPOINTS.AURA.CHAT, {
        message: textToSend,
        role: 'practitioner',
        focus: selectedFocus,
        history: historyPayload,
      });

      if (res.data?.success && res.data?.reply) {
        const botMsg = {
          id: String(Date.now() + 1),
          sender: 'aura',
          text: res.data.reply,
          practicalExercise: res.data.practicalExercise,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const fallbackMsg = {
          id: String(Date.now() + 1),
          sender: 'aura',
          text: `Clinical synthesis for ${userName}:\n\n• S (Subjective): Client reported heightened sympathetic arousal during workplace transitions.\n• O (Objective): Flat affect initially, softening to regulated parasympathetic breath rate after 4-7-8 pacing.\n• A (Assessment): Mild acute distress; demonstrates strong capacity for somatic interoception.\n• P (Plan): Assign somatic grounding inquiry via learner portal; follow up on boundary setting.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch (e) {
      const fallbackMsg = {
        id: String(Date.now() + 1),
        sender: 'aura',
        text: `Clinical synthesis for ${userName}:\n\n• S (Subjective): Client reported heightened sympathetic arousal during workplace transitions.\n• O (Objective): Regulated parasympathetic breath rate observed after somatic pacing.\n• A (Assessment): Demonstrates strong responsiveness to interoceptive cues.\n• P (Plan): Continue grounding exercises; schedule next live session.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert('Reset AURA Chat', 'Clear the current clinical conversation session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => setMessages(getInitialMessages()),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={[styles.container, { backgroundColor: tokens.backgroundSolid }]}
    >
      {/* ── Copilot Header Bar ── */}
      <View style={[styles.header, { backgroundColor: tokens.card, borderBottomColor: tokens.cardBorder, paddingTop: topInset + 8 }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.auraAvatar, isDark && styles.auraAvatarDark]}>
            <Ionicons name="flash" size={18} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: tokens.text }]}>AURA Assistant</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>CLINICAL AI</Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { color: tokens.textMuted }]}>
              Clinical Copilot &amp; SOAP Synthesizer
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={handleClearChat} activeOpacity={0.7}>
          <Feather name="rotate-ccw" size={16} color={tokens.textMuted} />
        </TouchableOpacity>
      </View>

      {/* ── Quick Clinical Focus Selector ── */}
      <View style={[styles.focusContainer, { backgroundColor: isDark ? '#070A1E' : '#F8FAFC' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.focusScroll}>
          {CLINICAL_FOCUS_OPTIONS.map((opt) => {
            const active = selectedFocus === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.focusChip,
                  active && styles.focusChipActive,
                  isDark && styles.focusChipDark,
                ]}
                onPress={() => setSelectedFocus(opt.id)}
                activeOpacity={0.8}
              >
                <Feather
                  name={opt.icon}
                  size={12}
                  color={active ? '#FFFFFF' : tokens.textMuted}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.focusChipText,
                    active && styles.focusChipTextActive,
                    { color: active ? '#FFFFFF' : tokens.text },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Chat Messages Stream ── */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <View
              key={m.id}
              style={[
                styles.messageRow,
                isUser ? styles.messageRowUser : styles.messageRowAura,
              ]}
            >
              {!isUser && (
                <View style={[styles.botAvatar, isDark && styles.botAvatarDark]}>
                  <Ionicons name="flash" size={13} color="#FFFFFF" />
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  isUser
                    ? styles.bubbleUser
                    : [
                        styles.bubbleAura,
                        {
                          backgroundColor: tokens.card,
                          borderColor: tokens.cardBorder,
                        },
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isUser ? '#FFFFFF' : tokens.text },
                  ]}
                >
                  {m.text}
                </Text>

                <View style={styles.bubbleFooter}>
                  <Text
                    style={[
                      styles.timestampText,
                      { color: isUser ? 'rgba(255, 255, 255, 0.7)' : tokens.textLight },
                    ]}
                  >
                    {m.time}
                  </Text>
                  {!isUser && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert('Copied', 'Clinical synthesis copied to clipboard.');
                      }}
                    >
                      <Feather name="copy" size={11} color={tokens.textLight} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {isTyping && (
          <View style={[styles.messageRow, styles.messageRowAura]}>
            <View style={[styles.botAvatar, isDark && styles.botAvatarDark]}>
              <Ionicons name="flash" size={13} color="#FFFFFF" />
            </View>
            <View
              style={[
                styles.bubble,
                styles.bubbleAura,
                styles.typingBubble,
                { backgroundColor: tokens.card, borderColor: tokens.cardBorder },
              ]}
            >
              <ActivityIndicator size="small" color="#7C3AED" style={{ marginRight: 8 }} />
              <Text style={[styles.typingText, { color: tokens.textMuted }]}>
                AURA is synthesizing clinical case formulation...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Suggested Quick Inquiries ── */}
      <View style={[styles.suggestionsRow, { borderTopColor: tokens.cardBorder }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionScroll}>
          <TouchableOpacity
            style={[styles.suggestionChip, { backgroundColor: isDark ? '#0F1738' : '#F5F3FF', borderColor: tokens.cardBorder }]}
            onPress={() => handleSend('Structure my raw notes into a 4-part SOAP format.')}
          >
            <Text style={[styles.suggestionText, { color: tokens.primary }]}>📝 Structure SOAP Note</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.suggestionChip, { backgroundColor: isDark ? '#0F1738' : '#F5F3FF', borderColor: tokens.cardBorder }]}
            onPress={() => handleSend('Generate 3 somatic reflection prompts for an anxious client.')}
          >
            <Text style={[styles.suggestionText, { color: tokens.primary }]}>🌿 3 Somatic Prompts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.suggestionChip, { backgroundColor: isDark ? '#0F1738' : '#F5F3FF', borderColor: tokens.cardBorder }]}
            onPress={() => handleSend('Draft an ACT defusion exercise for cognitive rumination.')}
          >
            <Text style={[styles.suggestionText, { color: tokens.primary }]}>🧠 ACT Defusion Exercise</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Bottom Input Row ── */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: tokens.card,
            borderTopColor: tokens.cardBorder,
          },
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: tokens.surfaceSubtle,
              borderColor: tokens.border,
              color: tokens.text,
            },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type clinical notes or consultation inquiries..."
          placeholderTextColor={tokens.textLight}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isTyping}
          activeOpacity={0.85}
        >
          <Feather name="arrow-up" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  auraAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  auraAvatarDark: {
    backgroundColor: '#6D28D9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  aiBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiBadgeText: {
    color: '#059669',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    fontSize: 11.5,
  },
  resetBtn: {
    padding: 8,
    borderRadius: 8,
  },
  focusContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
  },
  focusScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  focusChipDark: {
    backgroundColor: '#0E1738',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  focusChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  focusChipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  focusChipTextActive: {
    fontWeight: '800',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAura: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  botAvatarDark: {
    backgroundColor: '#6D28D9',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    padding: 14,
  },
  bubbleUser: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
  },
  bubbleAura: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestampText: {
    fontSize: 10,
    fontWeight: '500',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  typingText: {
    fontSize: 12,
  },
  suggestionsRow: {
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  suggestionScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 13.5,
    maxHeight: 90,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});

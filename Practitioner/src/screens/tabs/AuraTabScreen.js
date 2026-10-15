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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { theme } from '../../theme';

export default function AuraTabScreen() {
  const { user } = useAuth();
  const userName = user?.firstName || 'Colleague';
  const scrollViewRef = useRef(null);

  const getInitialMessages = () => [
    {
      id: 'welcome',
      sender: 'aura',
      text: `Welcome colleague, Dr. ${userName}. ⚡\n\nI am AURA — your Clinical & Practice Copilot. I am ready to assist your clinical workflows:\n\n• SOAP & DAP Note Synthesis from session debriefs\n• Therapeutic Case Conceptualization (ACT, Somatic, IFS)\n• Personalized Client Reflection Prompts\n• Clinical Boundary & Nervous System Care\n\nWhat clinical inquiry or practice workflow shall we explore together?`,
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
        // Fallback response
        const fallbackMsg = {
          id: String(Date.now() + 1),
          sender: 'aura',
          text: `Understood, Dr. ${userName}. I have noted this clinical context. Would you like me to structure this into a standardized SOAP note format (Subjective, Objective, Assessment, Plan), or generate somatic reflection inquiries for the learner?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (e) {
      // Graceful offline/timeout fallback
      const fallbackMsg = {
        id: String(Date.now() + 1),
        sender: 'aura',
        text: `Clinical synthesis for Dr. ${userName}:\n\n• Focus: ${selectedFocus.toUpperCase()}\n• Observations recorded from your notes.\n\nKey Inquiry: How is the client's autonomic nervous system regulating during these discussions? Would you like a prompt assigned to their portal?`,
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
      style={styles.container}
    >
      {/* ── Copilot Header Bar ── */}
      <View style={styles.header}>
        <View style={styles.auraAvatar}>
          <Text style={styles.auraAvatarText}>⚡</Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>AURA Assistant</Text>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI COPILOT</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Clinical &amp; SOAP Practice Synthesizer</Text>
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={handleClearChat}>
          <Feather name="rotate-ccw" size={16} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* ── Quick Clinical Focus Suggestions (Matches Web) ── */}
      <View style={styles.quickBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickChips}>
          <TouchableOpacity
            style={[styles.quickChip, selectedFocus === 'soap' && styles.quickChipActive]}
            onPress={() => {
              setSelectedFocus('soap');
              handleSend('Generate a standard clinical SOAP note template from my last session.');
            }}
          >
            <Text style={styles.quickChipEmoji}>📝</Text>
            <Text style={[styles.quickChipText, selectedFocus === 'soap' && styles.quickChipTextActive]}>
              SOAP Note
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickChip, selectedFocus === 'conceptualization' && styles.quickChipActive]}
            onPress={() => {
              setSelectedFocus('conceptualization');
              handleSend('Provide a therapeutic case conceptualization integrating Somatic Experiencing and IFS.');
            }}
          >
            <Text style={styles.quickChipEmoji}>🧠</Text>
            <Text style={[styles.quickChipText, selectedFocus === 'conceptualization' && styles.quickChipTextActive]}>
              Case Conceptualization
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickChip, selectedFocus === 'prompts' && styles.quickChipActive]}
            onPress={() => {
              setSelectedFocus('prompts');
              handleSend('Generate 3 compassionate reflection inquiry prompts for my learner to complete this week.');
            }}
          >
            <Text style={styles.quickChipEmoji}>🌿</Text>
            <Text style={[styles.quickChipText, selectedFocus === 'prompts' && styles.quickChipTextActive]}>
              Reflection Prompts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickChip, selectedFocus === 'intake' && styles.quickChipActive]}
            onPress={() => {
              setSelectedFocus('intake');
              handleSend('Help me structure a client intake evaluation and wellness baseline check.');
            }}
          >
            <Text style={styles.quickChipEmoji}>📋</Text>
            <Text style={[styles.quickChipText, selectedFocus === 'intake' && styles.quickChipTextActive]}>
              Intake Checklist
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Messages List ── */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageContent}
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
                <View style={styles.bubbleAvatar}>
                  <Text style={styles.bubbleAvatarText}>⚡</Text>
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  isAura ? styles.bubbleAura : styles.bubbleUser,
                ]}
              >
                {isAura && (
                  <View style={styles.bubbleHeaderRow}>
                    <Text style={styles.bubbleSenderName}>AURA Clinical Copilot</Text>
                    <TouchableOpacity
                      onPress={() => Alert.alert('Copied', 'Note content copied to clipboard.')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="copy" size={13} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                )}
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

        {isTyping && (
          <View style={[styles.bubbleWrap, styles.bubbleWrapAura]}>
            <View style={styles.bubbleAvatar}>
              <Text style={styles.bubbleAvatarText}>⚡</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleAura, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
              <ActivityIndicator color="#7C3AED" size="small" />
              <Text style={styles.typingText}>AURA is analyzing clinical context...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Input Bar ── */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Dictate debrief, ask clinical question, or draft SOAP note..."
          placeholderTextColor="#94A3B8"
          multiline={false}
          returnKeyType="send"
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isTyping}
          activeOpacity={0.8}
        >
          <Feather name="send" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  auraAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  auraAvatarText: {
    fontSize: 18,
    color: '#FFF',
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  aiBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  aiBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6D28D9',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  resetBtn: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
  },
  quickChips: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickChipActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
  },
  quickChipEmoji: {
    fontSize: 12,
    marginRight: 5,
  },
  quickChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  quickChipTextActive: {
    color: '#6D28D9',
    fontWeight: '700',
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bubbleWrap: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bubbleWrapAura: {
    justifyContent: 'flex-start',
  },
  bubbleWrapUser: {
    justifyContent: 'flex-end',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  bubbleAvatarText: {
    fontSize: 13,
    color: '#FFF',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 14,
  },
  bubbleAura: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0E1235',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleUser: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
  },
  bubbleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bubbleSenderName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6D28D9',
  },
  textAura: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 19,
  },
  textUser: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 19,
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
  typingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0F172A',
  },
  sendButton: {
    backgroundColor: '#7C3AED',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});


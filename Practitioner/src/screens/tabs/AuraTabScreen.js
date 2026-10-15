import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

export default function AuraTabScreen() {
  const { user } = useAuth();
  const userName = user?.firstName || 'Colleague';

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'aura',
      text: `Welcome colleague, ${userName}. ⚡\n\nI am AURA — your dedicated Clinical & Practice Assistant. I am ready to support your practice:\n\n• SOAP & DAP Note Synthesis from session debriefs\n• Therapeutic Case Conceptualization (ACT, Somatic, IFS)\n• Personalized Client Reflection Prompts\n\nWhat clinical narrative or practice workflow shall we work on?`,
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = {
      id: String(Date.now()),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'aura',
          text: `Understood, ${userName}. I am synthesizing that clinical context. Would you like me to format this as a standard SOAP note, or generate therapeutic inquiry prompts for your learner?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.auraAvatar}>
          <Text style={styles.auraAvatarText}>⚡</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>AURA Assistant</Text>
          <Text style={styles.headerSubtitle}>Clinical &amp; Practice Copilot</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.messageList}>
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
              <View
                style={[
                  styles.bubble,
                  isAura ? styles.bubbleAura : styles.bubbleUser,
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
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Dictate session debrief or ask clinical question..."
          placeholderTextColor={theme.colors.textLight}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
  },
  auraAvatarText: {
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.accent,
    fontWeight: theme.typography.medium,
  },
  messageList: {
    padding: theme.spacing.base,
    paddingBottom: 24,
  },
  bubbleWrap: {
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
  },
  bubbleWrapAura: {
    justifyContent: 'flex-start',
  },
  bubbleWrapUser: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.md,
  },
  bubbleAura: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bubbleUser: {
    backgroundColor: theme.colors.accent,
  },
  textAura: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  textUser: {
    fontSize: theme.typography.sm,
    color: theme.colors.textWhite,
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
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.spacing.borderRadiusPill,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 10,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
  },
  sendButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.spacing.borderRadiusPill,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
  },
});

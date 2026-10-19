import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ContactSupportModal({ visible, onClose, isDark, user, onOpenAura }) {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 20 : Math.max(insets.top, 20) + 8;
  const bottomPadding = Platform.OS === 'web' ? 24 : Math.max(insets.bottom, 16) + 16;

  const [category, setCategory] = useState('Account & Profile');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const categories = [
    'Account & Profile',
    'Course & Video Player',
    '1-on-1 Session & Room',
    'Community Circles',
    'Payment & Refunds',
    'Other Inquiries',
  ];

  const handleOpenEmail = async () => {
    const email = 'connect@openhand.live';
    const sub = encodeURIComponent(`OpenHand Learner Support [ID: ${user?.learnerId || 'N/A'}]`);
    const body = encodeURIComponent(
      `Hello OpenHand Support Team,\n\nLearner Name: ${user?.firstName || ''} ${user?.lastName || ''}\nLearner ID: ${user?.learnerId || 'N/A'}\nEmail: ${user?.email || ''}\n\nDescribe your issue or query below:\n`
    );
    const url = `mailto:${email}?subject=${sub}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Support Email', 'Please write directly to: connect@openhand.live');
      }
    } catch {
      Alert.alert('Support Email', 'Please write directly to: connect@openhand.live');
    }
  };

  const handleSubmitTicket = () => {
    if (!subject.trim()) {
      Alert.alert('Subject Required', 'Please enter a brief subject for your support request.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      Alert.alert('Details Required', 'Please provide at least a short description of what you need help with.');
      return;
    }

    setSending(true);
    setTimeout(() => {
      const randomTicketId = `OH-${Math.floor(100000 + Math.random() * 900000)}`;
      setSending(false);
      setSubmittedTicket(randomTicketId);
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
        {/* Header Bar */}
        <View style={[styles.header, { paddingTop: topPadding }, isDark ? styles.headerDark : styles.headerLight]}>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, isDark ? styles.badgeDark : styles.badgeLight]}>
                <Text style={[styles.badgeText, isDark ? styles.badgeTextDark : styles.badgeTextLight]}>
                  SUPPORT & HELP DESK
                </Text>
              </View>
              <Text style={[styles.statusPill, isDark && { color: '#34D399' }]}>● Desk Online</Text>
            </View>
            <Text style={[styles.headerTitle, isDark && { color: '#FFFFFF' }]}>Contact Support</Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, isDark ? styles.closeBtnDark : styles.closeBtnLight]}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={isDark ? '#F1F5F9' : '#0F172A'} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Action Channels */}
          <Text style={[styles.sectionHeading, isDark && { color: '#94A3B8' }]}>DIRECT CHANNELS</Text>

          {/* AURA Live Chat Banner */}
          <TouchableOpacity
            style={[styles.channelCard, isDark ? styles.channelCardDark : styles.channelCardLight]}
            onPress={() => {
              onClose();
              if (onOpenAura) onOpenAura();
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.channelIconBox, { backgroundColor: '#7C3AED' }]}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rowBetween}>
                <Text style={[styles.channelTitle, isDark && { color: '#FFFFFF' }]}>AURA AI Assistant</Text>
                <Text style={styles.speedPill}>Instant 24/7</Text>
              </View>
              <Text style={[styles.channelDesc, isDark && { color: '#94A3B8' }]}>
                Ask questions about your courses, reflections, or daily grounding practices right now.
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={isDark ? '#64748B' : '#94A3B8'} />
          </TouchableOpacity>

          {/* Email Support Desk */}
          <TouchableOpacity
            style={[styles.channelCard, isDark ? styles.channelCardDark : styles.channelCardLight]}
            onPress={handleOpenEmail}
            activeOpacity={0.8}
          >
            <View style={[styles.channelIconBox, { backgroundColor: '#2563EB' }]}>
              <Ionicons name="mail" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rowBetween}>
                <Text style={[styles.channelTitle, isDark && { color: '#FFFFFF' }]}>Email Support Desk</Text>
                <Text style={styles.speedPillBlue}>Within 1 Day</Text>
              </View>
              <Text style={[styles.channelDesc, isDark && { color: '#94A3B8' }]}>
                connect@openhand.live for billing, practitioner refunds, and formal escalations.
              </Text>
            </View>
            <Feather name="external-link" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
          </TouchableOpacity>

          {/* Response Time SLA Guarantees */}
          <View style={[styles.slaCard, isDark ? styles.slaCardDark : styles.slaCardLight]}>
            <View style={styles.slaTitleRow}>
              <Ionicons name="time-outline" size={18} color={isDark ? '#38BDF8' : '#0284C7'} />
              <Text style={[styles.slaHeading, isDark && { color: '#38BDF8' }]}>Guaranteed Response Times</Text>
            </View>
            <View style={styles.slaGrid}>
              <View style={styles.slaItem}>
                <Text style={[styles.slaItemVal, isDark && { color: '#F1F5F9' }]}>&lt; 15 Mins</Text>
                <Text style={[styles.slaItemLabel, isDark && { color: '#94A3B8' }]}>Live Session Emergencies</Text>
              </View>
              <View style={styles.slaDivider} />
              <View style={styles.slaItem}>
                <Text style={[styles.slaItemVal, isDark && { color: '#F1F5F9' }]}>Same Day</Text>
                <Text style={[styles.slaItemLabel, isDark && { color: '#94A3B8' }]}>Payment &amp; Refund Issues</Text>
              </View>
              <View style={styles.slaDivider} />
              <View style={styles.slaItem}>
                <Text style={[styles.slaItemVal, isDark && { color: '#F1F5F9' }]}>1 Day</Text>
                <Text style={[styles.slaItemLabel, isDark && { color: '#94A3B8' }]}>General Inquiries</Text>
              </View>
            </View>
          </View>

          {/* In-App Ticket Form */}
          <Text style={[styles.sectionHeading, { marginTop: 14 }, isDark && { color: '#94A3B8' }]}>
            SUBMIT A HELP TICKET
          </Text>

          {submittedTicket ? (
            <View style={[styles.successCard, isDark ? styles.successCardDark : styles.successCardLight]}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={44} color="#10B981" />
              </View>
              <Text style={[styles.successTitle, isDark && { color: '#FFFFFF' }]}>Ticket Submitted Successfully!</Text>
              <View style={[styles.ticketBadge, isDark && { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Text style={styles.ticketBadgeText}>Reference ID: {submittedTicket}</Text>
              </View>
              <Text style={[styles.successDesc, isDark && { color: '#CBD5E1' }]}>
                Our team has received your inquiry. A confirmation has been logged for {user?.email || 'your account'} and
                we will respond via email.
              </Text>
              <TouchableOpacity
                style={styles.newTicketBtn}
                onPress={() => setSubmittedTicket(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.newTicketBtnText}>Submit Another Ticket</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.formCard, isDark ? styles.formCardDark : styles.formCardLight]}>
              {/* Category Pills */}
              <Text style={[styles.fieldLabel, isDark && { color: '#E2E8F0' }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={styles.catRow}>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.catPill,
                        isDark ? styles.catPillDark : styles.catPillLight,
                        category === c && (isDark ? styles.catPillActiveDark : styles.catPillActiveLight),
                      ]}
                      onPress={() => setCategory(c)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.catPillText,
                          isDark ? styles.catPillTextDark : styles.catPillTextLight,
                          category === c && styles.catPillTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Subject */}
              <Text style={[styles.fieldLabel, isDark && { color: '#E2E8F0' }]}>Subject</Text>
              <TextInput
                style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                value={subject}
                onChangeText={setSubject}
                placeholder="e.g. Issue connecting to Live Room"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              />

              {/* Message */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }, isDark && { color: '#E2E8F0' }]}>
                Message &amp; Details
              </Text>
              <TextInput
                style={[styles.textArea, isDark ? styles.inputDark : styles.inputLight]}
                value={message}
                onChangeText={setMessage}
                placeholder="Please describe your issue, steps to reproduce, or question in detail..."
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, sending && { opacity: 0.7 }]}
                onPress={handleSubmitTicket}
                disabled={sending}
                activeOpacity={0.8}
              >
                {sending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="paper-plane-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>Submit Support Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#F8FAFC',
  },
  containerDark: {
    backgroundColor: '#050914',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
  },
  headerDark: {
    backgroundColor: '#0A1024',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLight: {
    backgroundColor: '#EEF2FF',
  },
  badgeDark: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTextLight: {
    color: '#4F46E5',
  },
  badgeTextDark: {
    color: '#A5B4FC',
  },
  statusPill: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnLight: {
    backgroundColor: '#F1F5F9',
  },
  closeBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollContent: {
    padding: 18,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  channelCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  channelCardDark: {
    backgroundColor: '#0E172E',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  channelIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  channelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  speedPill: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  speedPillBlue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  channelDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  slaCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 14,
  },
  slaCardLight: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  slaCardDark: {
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    borderColor: 'rgba(2, 132, 199, 0.25)',
  },
  slaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  slaHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  slaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slaItem: {
    flex: 1,
    alignItems: 'center',
  },
  slaItemVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  slaItemLabel: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  slaDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#BAE6FD',
  },
  formCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  formCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  formCardDark: {
    backgroundColor: '#0E172E',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  catRow: {
    flexDirection: 'row',
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  catPillLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  catPillDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  catPillActiveLight: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  catPillActiveDark: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderColor: '#38BDF8',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  catPillTextLight: {
    color: '#475569',
  },
  catPillTextDark: {
    color: '#94A3B8',
  },
  catPillTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    height: 100,
  },
  inputLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  inputDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    color: '#F1F5F9',
  },
  submitBtn: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  successCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  successCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  successCardDark: {
    backgroundColor: '#0E172E',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  successIcon: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  ticketBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },
  ticketBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  successDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },
  newTicketBtn: {
    borderWidth: 1,
    borderColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  newTicketBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
});

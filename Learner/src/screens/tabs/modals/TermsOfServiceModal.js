import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsOfServiceModal({ visible, onClose, isDark }) {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 20 : Math.max(insets.top, 20) + 8;
  const bottomPadding = Platform.OS === 'web' ? 24 : Math.max(insets.bottom, 16) + 16;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText('https://openhand.live/terms-of-service');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
    Alert.alert('Terms Link Copied', 'https://openhand.live/terms-of-service copied to clipboard.');
  };

  const sections = [
    {
      id: 'plain-lang',
      title: 'The Plain-Language Version',
      icon: 'book-open',
      highlight: true,
      content:
        "By using Open Hand, you agree to engage respectfully with practitioners, attend booked sessions or cancel with adequate notice, respect the confidentiality of fellow circle learners, and use the platform for legitimate learning and wellness.\n\nIn return, Open Hand commits to keeping the platform reliable, securing your data under Indian DPDP and global privacy frameworks, and never selling your personal session information to third parties.",
    },
    {
      id: 'who',
      title: '1. Who Can Use Open Hand',
      icon: 'user-check',
      content:
        "• You must be at least 18 years of age, or have explicit parental/guardian consent to access learning offerings.\n• You agree to provide accurate information during registration and keep your account details current.\n• Each Learner account is for individual personal use. Sharing credentials across multiple users is prohibited.",
    },
    {
      id: 'what',
      title: "2. What Open Hand Is (and Isn't)",
      icon: 'shield',
      content:
        "• Open Hand is an integrated technology and community platform connecting learners with independent certified practitioners, coaches, and somatic guides.\n• Open Hand is NOT an emergency hospital, clinical psychiatric emergency department, or crisis hotline. If you are experiencing an acute medical or psychological emergency, please contact local emergency authorities immediately.\n• Practitioners operate independently and are solely responsible for their clinical and educational counsel.",
    },
    {
      id: 'account',
      title: '3. Your Account & Unique Learner ID',
      icon: 'award',
      content:
        "• Your unique Learner ID is assigned upon registration. You may share this ID with your practitioner to claim scholarships, fee waivers, and customized course discounts.\n• You are responsible for safeguarding your password and notifying Open Hand immediately at connect@openhand.live if you suspect unauthorized access.",
    },
    {
      id: 'conduct',
      title: '4. Acceptable Use & Community Guidelines',
      icon: 'alert-triangle',
      content:
        "• Zero tolerance for hate speech, harassment, stalking, or disruptive behavior during live video rooms and community circle chats.\n• Strict prohibition against recording, screen-capturing, or broadcasting audio/video of other participants without mutual written consent.\n• Violation of community rules will result in immediate suspension or permanent termination of platform access.",
    },
    {
      id: 'payments',
      title: '5. Payments, Fees & Refunds',
      icon: 'dollar-sign',
      content:
        "• Learner registration and library browsing are 100% free with zero platform subscription charges.\n• You only pay when booking specific 1-on-1 sessions, paid masterclasses, or specialized circles.\n• All payments are processed securely via verified gateways (including PayGlocal).\n• Cancellation refunds: 1-on-1 sessions canceled at least 24 hours prior are eligible for refund or rescheduling in accordance with the practitioner's stated policy.",
    },
    {
      id: 'content',
      title: '6. Intellectual Property & Confidentiality',
      icon: 'lock',
      content:
        "• Course curriculum, video recordings, and worksheets provided by practitioners remain the intellectual property of their respective creators.\n• You are granted a personal, non-transferable, revocable license to view purchased educational materials.",
    },
    {
      id: 'governing',
      title: '7. Governing Law & Dispute Resolution',
      icon: 'map-pin',
      content:
        "• These Terms are governed by and construed in accordance with the laws of the Republic of India.\n• Any legal disputes shall be subject to the exclusive jurisdiction of the competent courts in Pune, Maharashtra, India.",
    },
    {
      id: 'contact',
      title: '8. Legal Contact',
      icon: 'mail',
      content:
        "For legal inquiries, terms clarification, or formal communications:\nEmail: connect@openhand.live\nPlatform Domain: openhand.live\nResponse Time: Within 1-2 business days.",
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
        {/* Header Bar */}
        <View style={[styles.header, { paddingTop: topPadding }, isDark ? styles.headerDark : styles.headerLight]}>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, isDark ? styles.badgeDark : styles.badgeLight]}>
                <Text style={[styles.badgeText, isDark ? styles.badgeTextDark : styles.badgeTextLight]}>
                  LEGAL & PLATFORM TERMS
                </Text>
              </View>
              <Text style={[styles.dateText, isDark && { color: '#94A3B8' }]}>Effective: 30.07.2026</Text>
            </View>
            <Text style={[styles.headerTitle, isDark && { color: '#FFFFFF' }]}>Terms of Service</Text>
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
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding + 60 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Notice Banner */}
          <View style={[styles.noticeCard, isDark ? styles.noticeCardDark : styles.noticeCardLight]}>
            <View style={styles.noticeIconWrap}>
              <Ionicons name="document-text-outline" size={22} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.noticeTitle, isDark && { color: '#E0F2FE' }]}>
                Standard Operating Terms & Conditions
              </Text>
              <Text style={[styles.noticeBody, isDark && { color: '#BAE6FD' }]}>
                Applicable to all OpenHand Learner mobile app and web portal users across India and globally.
              </Text>
            </View>
          </View>

          {/* Section Cards */}
          {sections.map((sec) => (
            <View
              key={sec.id}
              style={[
                styles.sectionCard,
                isDark ? styles.sectionCardDark : styles.sectionCardLight,
                sec.highlight && (isDark ? styles.highlightDark : styles.highlightLight),
              ]}
            >
              <View style={styles.sectionTitleRow}>
                <View
                  style={[
                    styles.iconBox,
                    isDark ? styles.iconBoxDark : styles.iconBoxLight,
                    sec.highlight && { backgroundColor: '#0284C7' },
                  ]}
                >
                  <Feather
                    name={sec.icon}
                    size={16}
                    color={sec.highlight ? '#FFFFFF' : isDark ? '#38BDF8' : '#0284C7'}
                  />
                </View>
                <Text
                  style={[
                    styles.sectionTitle,
                    isDark && { color: '#FFFFFF' },
                    sec.highlight && { color: isDark ? '#38BDF8' : '#0369A1', fontWeight: '800' },
                  ]}
                >
                  {sec.title}
                </Text>
              </View>

              <Text style={[styles.sectionBody, isDark && { color: '#CBD5E1' }]}>{sec.content}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Floating Bar */}
        <View style={[styles.footer, { paddingBottom: bottomPadding }, isDark ? styles.footerDark : styles.footerLight]}>
          <TouchableOpacity
            style={[styles.shareBtn, isDark ? styles.shareBtnDark : styles.shareBtnLight]}
            onPress={handleCopyLink}
            activeOpacity={0.7}
          >
            <Feather name={copied ? 'check' : 'copy'} size={15} color={isDark ? '#38BDF8' : '#0284C7'} />
            <Text style={[styles.shareBtnText, isDark ? { color: '#38BDF8' } : { color: '#0284C7' }]}>
              {copied ? 'Copied' : 'Copy Web Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>I Understand & Close</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#E0F2FE',
  },
  badgeDark: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTextLight: {
    color: '#0369A1',
  },
  badgeTextDark: {
    color: '#38BDF8',
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
    gap: 14,
  },
  noticeCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  noticeCardLight: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  noticeCardDark: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderColor: 'rgba(2, 132, 199, 0.3)',
  },
  noticeIconWrap: {
    marginTop: 1,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  noticeBody: {
    fontSize: 12,
    color: '#0284C7',
    lineHeight: 17,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionCardDark: {
    backgroundColor: '#0E172E',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  highlightLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#0284C7',
    borderLeftWidth: 4,
  },
  highlightDark: {
    backgroundColor: 'rgba(14, 23, 46, 0.95)',
    borderColor: '#38BDF8',
    borderLeftWidth: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxLight: {
    backgroundColor: '#E0F2FE',
  },
  iconBoxDark: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  footerLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
  },
  footerDark: {
    backgroundColor: '#0A1024',
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  shareBtnLight: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  shareBtnDark: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  doneBtn: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

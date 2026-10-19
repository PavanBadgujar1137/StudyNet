import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicyModal({ visible, onClose, isDark }) {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 20 : Math.max(insets.top, 20) + 8;
  const bottomPadding = Platform.OS === 'web' ? 24 : Math.max(insets.bottom, 16) + 16;
  const [copied, setCopied] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setScrollReady(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setScrollReady(false);
    }
  }, [visible]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText('https://openhand.live/privacy-policy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
    Alert.alert('Privacy Policy Link Copied', 'https://openhand.live/privacy-policy copied to clipboard.');
  };

  const sections = [
    {
      id: 'preamble',
      title: 'A Note Before the Legal Bit',
      icon: 'heart',
      highlight: true,
      content:
        "Open Hand exists to help practitioners and learners connect during important learning, reflection, and wellness moments. That makes the information on our platform deeply personal. We treat your privacy with maximum discretion and zero compromises — never treating privacy as a check-box exercise.",
    },
    {
      id: 'compliance',
      title: '1. Regulatory Compliance Framework',
      icon: 'shield',
      content:
        "• This Privacy Policy is constructed in strict adherence to the Digital Personal Data Protection Act, 2023 (DPDP Act, India) and international privacy frameworks including GDPR.\n• We operate as a Data Fiduciary regarding platform accounts and as a processor regarding session coordination.",
    },
    {
      id: 'collect',
      title: '2. What Data We Collect',
      icon: 'database',
      content:
        "• Account Data: Full name, verified email address, phone number, profile image, unique Learner ID.\n• Learning Activity: Enrolled courses, video progress, check-in reflections, circle group chats.\n• Transaction Logs: Payment confirmation IDs from PayGlocal (note: we never store full credit/debit card numbers or CVV on our servers).\n• Device Diagnostics: Operating system version, IP address, and basic crash diagnostics to maintain app performance.",
    },
    {
      id: 'sensitive',
      title: '3. Special-Category & Sensitive Reflections',
      icon: 'lock',
      content:
        "• Reflections and check-in logs submitted through your learner dashboard are encrypted and accessible only to you and, if explicitly permitted, your assigned practitioner guide.\n• Open Hand will NEVER sell, rent, monetize, or broker your personal reflections or wellness notes to data advertisers or insurance brokers.",
    },
    {
      id: 'ai',
      title: '4. AI & Machine Learning Policy (AURA)',
      icon: 'cpu',
      content:
        "• AURA AI provides educational guidance, grounding exercises, and study assistance.\n• AURA runs on dedicated private endpoints. Your private session conversations and check-in reflections are NOT used to train public foundation models.",
    },
    {
      id: 'storage',
      title: '5. Where Data Is Stored & Encryption',
      icon: 'hard-drive',
      content:
        "• All primary database records are hosted in secure AWS data centers in the Asia-Pacific (Mumbai, India) region.\n• Data in transit is protected using TLS 1.3 cryptographic protocols.\n• Data at rest is encrypted using industry-standard AES-256 cipher blocks.",
    },
    {
      id: 'sharing',
      title: '6. Who We Share Data With',
      icon: 'share-2',
      content:
        "We share data exclusively with:\n1. Your chosen practitioner (to conduct 1-on-1 sessions and circle learning).\n2. Payment infrastructure (PayGlocal for processing transactions).\n3. Cloud infrastructure providers (AWS for hosting, CloudFront CDN for streaming media).\nNo external marketing partners receive your data.",
    },
    {
      id: 'rights',
      title: '7. Your Rights (Access, Portability & Erasure)',
      icon: 'user-check',
      content:
        "Under the DPDP Act and GDPR, you have the right to:\n• Access a copy of your personal data.\n• Correct inaccuracies in your name, contact details, or profile.\n• Request scheduled deletion of your account with a 30-day grace period.\n• Withdraw consent at any time without penalty.",
    },
    {
      id: 'contact',
      title: '8. Data Protection Officer (DPO)',
      icon: 'mail',
      content:
        "If you have questions, data access requests, or privacy concerns:\nEmail: connect@openhand.live\nSubject: Attn: Data Protection Officer\nResponse Time: Guaranteed within 1 business day.",
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={false}
      onShow={() => setScrollReady(true)}
    >
      <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
        {/* Header Bar */}
        <View style={[styles.header, { paddingTop: topPadding }, isDark ? styles.headerDark : styles.headerLight]}>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, isDark ? styles.badgeDark : styles.badgeLight]}>
                <Text style={[styles.badgeText, isDark ? styles.badgeTextDark : styles.badgeTextLight]}>
                  INDIA DPDP ACT 2023 + GDPR
                </Text>
              </View>
              <Text style={[styles.dateText, isDark && { color: '#94A3B8' }]}>Updated: 30.07.2026</Text>
            </View>
            <Text style={[styles.headerTitle, isDark && { color: '#FFFFFF' }]}>Privacy Policy</Text>
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
        <View style={styles.scrollWrapper}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 36 }]}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            bounces={true}
            alwaysBounceVertical={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={Platform.OS === 'android'}
          >
            {scrollReady ? (
              <>
                {/* Trust Banner */}
                <View style={[styles.trustCard, isDark ? styles.trustCardDark : styles.trustCardLight]}>
                  <View style={styles.trustIconWrap}>
                    <Ionicons name="shield-checkmark" size={24} color="#0D9488" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.trustTitle, isDark && { color: '#CCFBF1' }]}>
                      End-to-End Privacy Guarantee
                    </Text>
                    <Text style={[styles.trustBody, isDark && { color: '#99F6E4' }]}>
                      Your notes, check-ins, and session interactions are private. We never sell your personal data.
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
                          sec.highlight && { backgroundColor: '#0D9488' },
                        ]}
                      >
                        <Feather
                          name={sec.icon}
                          size={16}
                          color={sec.highlight ? '#FFFFFF' : isDark ? '#2DD4BF' : '#0D9488'}
                        />
                      </View>
                      <Text
                        style={[
                          styles.sectionTitle,
                          isDark && { color: '#FFFFFF' },
                          sec.highlight && { color: isDark ? '#2DD4BF' : '#0F766E', fontWeight: '800' },
                        ]}
                      >
                        {sec.title}
                      </Text>
                    </View>

                    <Text style={[styles.sectionBody, isDark && { color: '#CBD5E1' }]}>{sec.content}</Text>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="small" color={isDark ? '#2DD4BF' : '#0D9488'} />
              </View>
            )}
          </ScrollView>
        </View>

        {/* Bottom Floating Bar */}
        <View style={[styles.footer, { paddingBottom: bottomPadding }, isDark ? styles.footerDark : styles.footerLight]}>
          <TouchableOpacity
            style={[styles.shareBtn, isDark ? styles.shareBtnDark : styles.shareBtnLight]}
            onPress={handleCopyLink}
            activeOpacity={0.7}
          >
            <Feather name={copied ? 'check' : 'copy'} size={15} color={isDark ? '#2DD4BF' : '#0D9488'} />
            <Text style={[styles.shareBtnText, isDark ? { color: '#2DD4BF' } : { color: '#0D9488' }]}>
              {copied ? 'Copied' : 'Copy Web Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Close & Return</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
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
    flexShrink: 0,
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
    backgroundColor: '#CCFBF1',
  },
  badgeDark: {
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTextLight: {
    color: '#0F766E',
  },
  badgeTextDark: {
    color: '#2DD4BF',
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
  scrollWrapper: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    padding: 18,
    gap: 14,
  },
  loaderWrap: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  trustCardLight: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  trustCardDark: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderColor: 'rgba(13, 148, 136, 0.3)',
  },
  trustIconWrap: {
    marginTop: 1,
  },
  trustTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
    marginBottom: 2,
  },
  trustBody: {
    fontSize: 12,
    color: '#0D9488',
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
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
    borderLeftWidth: 4,
  },
  highlightDark: {
    backgroundColor: 'rgba(14, 23, 46, 0.95)',
    borderColor: '#2DD4BF',
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
    backgroundColor: '#CCFBF1',
  },
  iconBoxDark: {
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
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
    flexShrink: 0,
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
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  shareBtnDark: {
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    borderColor: 'rgba(45, 212, 191, 0.25)',
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  doneBtn: {
    flex: 1,
    backgroundColor: '#0D9488',
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

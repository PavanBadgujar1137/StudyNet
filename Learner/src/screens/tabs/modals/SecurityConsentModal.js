import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SecurityConsentModal({ visible, onClose, isDark, user }) {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 20 : Math.max(insets.top, 20) + 8;
  const bottomPadding = Platform.OS === 'web' ? 24 : Math.max(insets.bottom, 16) + 16;
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

  const securityPillars = [
    {
      title: 'Encryption in Transit (TLS 1.3)',
      desc: 'All communications between the mobile app, API endpoints, and LiveKit WebRTC video tunnels are encrypted with TLS 1.3.',
      icon: 'shield',
      badge: 'Active Protocol',
    },
    {
      title: 'Encryption at Rest (AES-256)',
      desc: 'Database records, user notes, and personal learning roadmaps are encrypted using AES-256 in AWS Asia-Pacific data centers.',
      icon: 'lock',
      badge: 'Database Level',
    },
    {
      title: 'Live Session Media Privacy',
      desc: 'LiveKit rooms use ephemeral media streams. Audio/video feeds are never recorded or stored unless all participants explicitly consent.',
      icon: 'video',
      badge: 'Zero-Leak',
    },
    {
      title: 'Password Security & Salted Hashing',
      desc: 'Your credentials are never stored in plain text. Passwords use bcrypt salted key derivation iterations.',
      icon: 'key',
      badge: 'Industry Standard',
    },
    {
      title: 'Explicit Consent Tracking',
      desc: 'You maintain ownership of your learning data. You can withdraw consent or request an export of your activity at any time.',
      icon: 'check-circle',
      badge: 'DPDP 2023',
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
                  PLATFORM TRUST &amp; PRIVACY
                </Text>
              </View>
              <Text style={styles.activePill}>● Encrypted</Text>
            </View>
            <Text style={[styles.headerTitle, isDark && { color: '#FFFFFF' }]}>Security &amp; Consent</Text>
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
                {/* User Consent Status Banner */}
                <View style={[styles.consentBanner, isDark ? styles.bannerDark : styles.bannerLight]}>
            <View style={styles.consentIcon}>
              <Ionicons name="finger-print-outline" size={26} color="#0D9488" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.consentTitle, isDark && { color: '#CCFBF1' }]}>
                Data Consent Status: Active &amp; Granted
              </Text>
              <Text style={[styles.consentDesc, isDark && { color: '#99F6E4' }]}>
                Registered to: {user?.email || 'Learner Account'}. Under the DPDP Act 2023, you retain full ownership and the right
                to revoke consent.
              </Text>
            </View>
          </View>

          {/* Pillars List */}
          <Text style={[styles.sectionHeading, isDark && { color: '#94A3B8' }]}>SECURITY SAFEGUARDS</Text>
          {securityPillars.map((p, i) => (
            <View key={i} style={[styles.pillarCard, isDark ? styles.cardDark : styles.cardLight]}>
              <View style={styles.pillarTop}>
                <View style={[styles.iconBox, isDark ? styles.iconBoxDark : styles.iconBoxLight]}>
                  <Feather name={p.icon} size={16} color={isDark ? '#38BDF8' : '#0284C7'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pillarTitle, isDark && { color: '#FFFFFF' }]}>{p.title}</Text>
                </View>
                <View style={[styles.badgeTag, isDark ? styles.badgeTagDark : styles.badgeTagLight]}>
                  <Text style={[styles.badgeTagText, isDark ? styles.badgeTagTextDark : styles.badgeTagTextLight]}>
                    {p.badge}
                  </Text>
                </View>
              </View>
              <Text style={[styles.pillarDesc, isDark && { color: '#94A3B8' }]}>{p.desc}</Text>
            </View>
          ))}
        </>
            ) : (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="small" color="#0284C7" />
              </View>
            )}
          </ScrollView>
        </View>

        {/* Bottom Bar */}
        <View style={[styles.footer, { paddingBottom: bottomPadding }, isDark ? styles.footerDark : styles.footerLight]}>
          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Close &amp; Return</Text>
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
  activePill: {
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
  },
  loaderWrap: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentBanner: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bannerLight: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  bannerDark: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderColor: 'rgba(13, 148, 136, 0.3)',
  },
  consentIcon: {
    marginTop: 1,
  },
  consentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
    marginBottom: 2,
  },
  consentDesc: {
    fontSize: 12,
    color: '#0D9488',
    lineHeight: 17,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  pillarCard: {
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardDark: {
    backgroundColor: '#0E172E',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconBox: {
    width: 30,
    height: 30,
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
  pillarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeTagLight: {
    backgroundColor: '#F1F5F9',
  },
  badgeTagDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTagTextLight: {
    color: '#475569',
  },
  badgeTagTextDark: {
    color: '#94A3B8',
  },
  pillarDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
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
  doneBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 13,
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

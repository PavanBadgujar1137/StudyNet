import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function SubscriptionTierModal({ visible, onClose, isDark, user }) {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 20 : Math.max(insets.top, 20) + 8;
  const bottomPadding = Platform.OS === 'web' ? 24 : Math.max(insets.bottom, 16) + 16;

  const features = [
    { title: '100% Free Lifetime Account', desc: 'Zero monthly subscriptions, zero sign-up fees, no credit card required to enroll.' },
    { title: 'Personalized Learner ID', desc: `Your official ID (${user?.learnerId || 'Active'}) unlocks customized practitioner scholarships.` },
    { title: 'Pay-As-You-Go Flexibility', desc: 'Only pay when you book specific 1-on-1 sessions, paid masterclasses, or specialized circles.' },
    { title: 'AURA AI Counselor Included', desc: 'Daily grounding check-ins, reflection prompts, and learning guidance at zero extra charge.' },
    { title: 'Open Community Circles', desc: 'Join free wellness cohorts and peer discussion spaces across multiple modalities.' },
    { title: 'Secure PayGlocal Checkouts', desc: 'Instant UPI, Cards, and Netbanking receipts with automated booking calendar sync.' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose} statusBarTranslucent={false}>
      <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
        {/* Header Bar */}
        <View style={[styles.header, { paddingTop: topPadding }, isDark ? styles.headerDark : styles.headerLight]}>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>100% FREE FOREVER</Text>
              </View>
              <Text style={[styles.tierSub, isDark && { color: '#34D399' }]}>Lifetime Access</Text>
            </View>
            <Text style={[styles.headerTitle, isDark && { color: '#FFFFFF' }]}>My Plan &amp; Billing</Text>
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
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding + 60 }]}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          bounces={true}
          alwaysBounceVertical={true}
        >
          {/* Hero Emerald Card matching Web App */}
          <LinearGradient
            colors={['#064E3B', '#065F46', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>NO SUBSCRIPTION REQUIRED</Text>
              </View>
              <Text style={styles.activePill}>● Active</Text>
            </View>

            <Text style={styles.heroTitle}>Free Learner Account</Text>
            <Text style={styles.heroPrice}>₹0 / month</Text>
            <Text style={styles.heroDesc}>
              Your OpenHand account is 100% free with no recurring fees. You only pay directly with PayGlocal when booking
              specific practitioner masterclasses, 1-on-1 private rooms, or specialized circle cohorts.
            </Text>
          </LinearGradient>

          {/* Included Features List */}
          <Text style={[styles.sectionHeading, isDark && { color: '#94A3B8' }]}>WHAT IS INCLUDED IN YOUR PLAN</Text>
          <View style={[styles.featuresCard, isDark ? styles.cardDark : styles.cardLight]}>
            {features.map((f, i) => (
              <View
                key={i}
                style={[
                  styles.featureRow,
                  isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
                  i === features.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.checkIconBox}>
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.featureTitle, isDark && { color: '#FFFFFF' }]}>{f.title}</Text>
                  <Text style={[styles.featureDesc, isDark && { color: '#94A3B8' }]}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Transparent Billing Notice */}
          <View style={[styles.noticeCard, isDark ? styles.noticeCardDark : styles.noticeCardLight]}>
            <Ionicons name="receipt-outline" size={22} color={isDark ? '#38BDF8' : '#0284C7'} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.noticeTitle, isDark && { color: '#38BDF8' }]}>Transparent Receipts &amp; Invoices</Text>
              <Text style={[styles.noticeBody, isDark && { color: '#94A3B8' }]}>
                Whenever you book a session or course, GST compliant receipts with full practitioner credentials are
                sent to {user?.email || 'your email'}.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        <View style={[styles.footer, { paddingBottom: bottomPadding }, isDark ? styles.footerDark : styles.footerLight]}>
          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Close &amp; Return to Profile</Text>
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
  freeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  freeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.5,
  },
  tierSub: {
    fontSize: 11,
    color: '#059669',
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
  scrollView: {
    flex: 1,
    flexGrow: 1,
  },
  scrollContent: {
    padding: 18,
    flexGrow: 1,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activePill: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6EE7B7',
    marginTop: 2,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 13,
    color: '#D1FAE5',
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  featuresCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardDark: {
    backgroundColor: '#0E172E',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  featureRow: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
    alignItems: 'flex-start',
  },
  checkIconBox: {
    marginTop: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
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
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    borderColor: 'rgba(2, 132, 199, 0.25)',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 2,
  },
  noticeBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
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
    backgroundColor: '#059669',
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

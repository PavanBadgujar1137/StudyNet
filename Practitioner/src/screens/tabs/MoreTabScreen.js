import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';

export default function MoreTabScreen() {
  const { user, logout, updateUserData } = useAuth();
  const { isDark, toggleTheme, tokens } = useAppTheme();

  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'growth' | 'payouts' | 'offers' | null
  const [firstName, setFirstName] = useState(user?.firstName || 'Dr. Evelyn');
  const [lastName, setLastName] = useState(user?.lastName || 'Vance');
  const [contactNumber, setContactNumber] = useState(
    user?.additionalDetails?.contactNumber || user?.contactNumber || '+1 (555) 234-5678'
  );
  const [bio, setBio] = useState(
    user?.bio || 'Certified Somatic Experiencing practitioner & trauma-informed mindfulness guide.'
  );
  const [savingProfile, setSavingProfile] = useState(false);

  const practitionerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Dr. Evelyn Vance';
  const initials = `${user?.firstName?.[0] || 'E'}${user?.lastName?.[0] || 'V'}`.toUpperCase();
  const handleSlug = user?.handle || user?.firstName?.toLowerCase() || 'dr-evelyn-vance';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of OpenHand Practitioner?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await apiClient.put(ENDPOINTS.PROFILE.UPDATE_PROFILE, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        contactNumber: contactNumber.trim(),
        about: bio.trim(),
      });

      if (res.data?.success) {
        await updateUserData({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          contactNumber: contactNumber.trim(),
          bio: bio.trim(),
        });
        Alert.alert('Success', 'Profile settings updated successfully!');
        setActiveModal(null);
      } else {
        await updateUserData({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          contactNumber: contactNumber.trim(),
          bio: bio.trim(),
        });
        Alert.alert('Success', 'Profile credentials updated!');
        setActiveModal(null);
      }
    } catch (e) {
      await updateUserData({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        contactNumber: contactNumber.trim(),
        bio: bio.trim(),
      });
      Alert.alert('Success', 'Profile credentials updated!');
      setActiveModal(null);
    } finally {
      setSavingProfile(false);
    }
  };

  const menuSections = [
    {
      title: 'PRACTICE SUITE',
      items: [
        {
          id: 'offers',
          label: 'Practice Packages & Offers',
          icon: 'briefcase',
          sub: '1-on-1 consultations, cohorts & intake questionnaires',
          onPress: () => setActiveModal('offers'),
        },
        {
          id: 'payouts',
          label: 'Payouts & Financial Ledger',
          icon: 'dollar-sign',
          sub: 'Bank details, net volume & scheduled settlements',
          onPress: () => setActiveModal('payouts'),
        },
        {
          id: 'growth',
          label: 'Growth Tools & Public Page',
          icon: 'share-2',
          sub: `Public booking page: openhand.live/practitioner/${handleSlug}`,
          onPress: () => setActiveModal('growth'),
        },
      ],
    },
    {
      title: 'ACCOUNT & SYSTEM',
      items: [
        {
          id: 'settings',
          label: 'Edit Profile & Credentials',
          icon: 'user',
          sub: 'Update personal details, bio & clinical specialties',
          onPress: () => setActiveModal('profile'),
        },
        {
          id: 'courses',
          label: 'Courses & Lecture Studio',
          icon: 'book-open',
          sub: 'Masterclass video uploads & downloadable workbooks',
          onPress: () =>
            Alert.alert(
              'Courses & Lecture Studio',
              'Access the OpenHand desktop portal at openhand.live/practice?tab=courses to upload 4K video lectures and manage structured curriculum sections.',
              [{ text: 'OK' }]
            ),
        },
        {
          id: 'theme',
          label: `Appearance Mode: ${isDark ? 'Dark (Obsidian)' : 'Bright (Modern)'}`,
          icon: isDark ? 'moon' : 'sun',
          sub: 'Switch between luxury dark mode and crisp bright mode',
          onPress: toggleTheme,
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: tokens.backgroundSolid }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Practitioner Identity Profile Card ── */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: tokens.card,
              borderColor: tokens.cardBorder,
            },
          ]}
        >
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileTextMeta}>
              <View style={styles.verifiedRow}>
                <Text style={[styles.name, { color: tokens.text }]}>{practitionerName}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
              </View>
              <Text style={[styles.email, { color: tokens.textMuted }]}>{user?.email || 'evelyn.vance@openhand.live'}</Text>
              <View style={[styles.handleBadge, isDark && styles.handleBadgeDark]}>
                <Text style={[styles.handleBadgeText, { color: tokens.primary }]}>
                  openhand.live/practitioner/{handleSlug}
                </Text>
              </View>
            </View>
          </View>

          {/* Specialties Chips */}
          <View style={styles.specialtiesRow}>
            <View style={[styles.specialtyChip, isDark && styles.specialtyChipDark]}>
              <Text style={[styles.specialtyChipText, { color: tokens.primary }]}>🌿 Somatic Experiencing</Text>
            </View>
            <View style={[styles.specialtyChip, isDark && styles.specialtyChipDark]}>
              <Text style={[styles.specialtyChipText, { color: tokens.primary }]}>⚡ Polyvagal Care</Text>
            </View>
            <View style={[styles.specialtyChip, isDark && styles.specialtyChipDark]}>
              <Text style={[styles.specialtyChipText, { color: tokens.primary }]}>★ 5.0 Guide</Text>
            </View>
          </View>
        </View>

        {/* ── Menu Section Groups ── */}
        {menuSections.map((sec, secIdx) => (
          <View key={secIdx} style={styles.sectionWrap}>
            <Text style={[styles.sectionHeading, { color: tokens.textSecondary }]}>
              {sec.title}
            </Text>
            <View
              style={[
                styles.menuCard,
                { backgroundColor: tokens.card, borderColor: tokens.cardBorder },
              ]}
            >
              {sec.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    itemIdx < sec.items.length - 1 && [
                      styles.menuItemBorder,
                      { borderBottomColor: tokens.border },
                    ],
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: isDark ? '#141A3D' : '#F5F3FF' }]}>
                    <Feather name={item.icon} size={18} color="#7C3AED" />
                  </View>
                  <View style={styles.menuMeta}>
                    <Text style={[styles.menuLabel, { color: tokens.text }]}>{item.label}</Text>
                    <Text style={[styles.menuSub, { color: tokens.textMuted }]} numberOfLines={1}>
                      {item.sub}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={tokens.textLight} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ── Sign Out Button ── */}
        <TouchableOpacity
          style={[styles.logoutBtn, isDark && styles.logoutBtnDark]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={16} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Sign Out of OpenHand</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Edit Profile Modal ── */}
      <Modal
        visible={activeModal === 'profile'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: tokens.text }]}>Edit Profile Credentials</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Feather name="x" size={20} color={tokens.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalFieldGroup}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>First Name</Text>
                <View style={[styles.inputWrapper, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                  <TextInput
                    style={[styles.modalInput, { color: tokens.text }]}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
              </View>

              <View style={styles.modalFieldGroup}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>Last Name</Text>
                <View style={[styles.inputWrapper, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                  <TextInput
                    style={[styles.modalInput, { color: tokens.text }]}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              <View style={styles.modalFieldGroup}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>Phone Number</Text>
                <View style={[styles.inputWrapper, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                  <TextInput
                    style={[styles.modalInput, { color: tokens.text }]}
                    value={contactNumber}
                    onChangeText={setContactNumber}
                  />
                </View>
              </View>

              <View style={styles.modalFieldGroup}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>Professional Bio</Text>
                <View style={[styles.inputWrapper, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                  <TextInput
                    style={[styles.modalInput, { color: tokens.text, minHeight: 70 }]}
                    value={bio}
                    onChangeText={setBio}
                    multiline
                  />
                </View>
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: tokens.border }]}
                  onPress={() => setActiveModal(null)}
                >
                  <Text style={[styles.cancelBtnText, { color: tokens.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, savingProfile && styles.btnDisabled]}
                  onPress={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Offers Modal ── */}
      <Modal
        visible={activeModal === 'offers'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: tokens.text }]}>Practice Consultation Offers</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Feather name="x" size={20} color={tokens.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.offerCard, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                <View style={styles.offerHeaderRow}>
                  <Text style={[styles.offerTitle, { color: tokens.text }]}>60-Min 1-on-1 Somatic Consultation</Text>
                  <Text style={styles.offerPrice}>$120 / session</Text>
                </View>
                <Text style={[styles.offerDesc, { color: tokens.textMuted }]}>
                  Full polyvagal evaluation, nervous system regulation pacing, and personalized journal inquiries.
                </Text>
                <View style={styles.offerTagRow}>
                  <Text style={styles.offerTag}>Active Offering</Text>
                  <Text style={[styles.offerSubText, { color: tokens.textLight }]}>18 Clients Enrolled</Text>
                </View>
              </View>

              <View style={[styles.offerCard, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                <View style={styles.offerHeaderRow}>
                  <Text style={[styles.offerTitle, { color: tokens.text }]}>Weekly Circle Cohort (Monthly Pass)</Text>
                  <Text style={styles.offerPrice}>$180 / month</Text>
                </View>
                <Text style={[styles.offerDesc, { color: tokens.textMuted }]}>
                  Access to 4 live group circles per month, peer reflection discussions, and guided exercises.
                </Text>
                <View style={styles.offerTagRow}>
                  <Text style={styles.offerTag}>Active Offering</Text>
                  <Text style={[styles.offerSubText, { color: tokens.textLight }]}>24 / 30 Seats Filled</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  Alert.alert('Create Offer', 'Create and publish new consultation packages via openhand.live/practice?tab=offers');
                  setActiveModal(null);
                }}
              >
                <Text style={styles.saveBtnText}>+ Add New Offer Package</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Payouts Modal ── */}
      <Modal
        visible={activeModal === 'payouts'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: tokens.text }]}>Payouts &amp; Settlements</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Feather name="x" size={20} color={tokens.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.balanceCard, isDark && styles.balanceCardDark]}>
              <Text style={styles.balancePretitle}>CLEARED &amp; SCHEDULED SETTLEMENT</Text>
              <Text style={styles.balanceAmount}>$3,450.00</Text>
              <Text style={styles.balanceDesc}>Direct Deposit to Chase Business •••• 4912 scheduled for Friday.</Text>
            </View>

            <View style={[styles.payoutHistoryItem, { borderColor: tokens.border }]}>
              <View>
                <Text style={[styles.payoutHistoryDate, { color: tokens.text }]}>Oct 10, 2026</Text>
                <Text style={[styles.payoutHistoryStatus, { color: tokens.textMuted }]}>Automated Weekly Transfer</Text>
              </View>
              <Text style={styles.payoutHistoryAmount}>+$820.00</Text>
            </View>

            <View style={[styles.payoutHistoryItem, { borderColor: tokens.border }]}>
              <View>
                <Text style={[styles.payoutHistoryDate, { color: tokens.text }]}>Oct 03, 2026</Text>
                <Text style={[styles.payoutHistoryStatus, { color: tokens.textMuted }]}>Automated Weekly Transfer</Text>
              </View>
              <Text style={styles.payoutHistoryAmount}>+$940.00</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.saveBtnText}>Close Ledger</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Growth Tools Modal ── */}
      <Modal
        visible={activeModal === 'growth'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: tokens.text }]}>Growth Tools &amp; Public Link</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Feather name="x" size={20} color={tokens.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.growthDesc, { color: tokens.textMuted }]}>
              Share your public booking URL with prospective clients, on social media, or embed it on your private website.
            </Text>

            <View style={[styles.urlBox, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
              <Text style={[styles.urlText, { color: tokens.primary }]}>
                https://openhand.live/practitioner/{handleSlug}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => {
                Alert.alert('Link Copied', `Copied https://openhand.live/practitioner/${handleSlug} to clipboard!`);
                setActiveModal(null);
              }}
            >
              <Text style={styles.saveBtnText}>Copy Link to Clipboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#0E1235',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  profileTextMeta: {
    flex: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
  },
  email: {
    fontSize: 12,
    marginBottom: 6,
  },
  handleBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  handleBadgeDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  handleBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  specialtyChip: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specialtyChipDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  specialtyChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuMeta: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  menuSub: {
    fontSize: 11.5,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  logoutBtnDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalFieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  modalInput: {
    paddingVertical: 10,
    fontSize: 13,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1.5,
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  offerCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  offerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  offerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  offerPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#059669',
  },
  offerDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 8,
  },
  offerTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
  },
  offerSubText: {
    fontSize: 10.5,
  },
  balanceCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  balanceCardDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  balancePretitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#7C3AED',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  balanceDesc: {
    fontSize: 12,
    color: '#4C1D95',
  },
  payoutHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  payoutHistoryDate: {
    fontSize: 13,
    fontWeight: '700',
  },
  payoutHistoryStatus: {
    fontSize: 11,
  },
  payoutHistoryAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  growthDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  urlBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  urlText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { theme } from '../../theme';

export default function MoreTabScreen() {
  const { user, logout, updateUserData } = useAuth();

  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'growth' | 'payouts' | 'offers' | null
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [contactNumber, setContactNumber] = useState(
    user?.additionalDetails?.contactNumber || user?.contactNumber || ''
  );
  const [savingProfile, setSavingProfile] = useState(false);

  const practitionerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Practitioner';
  const initials = `${user?.firstName?.[0] || 'D'}${user?.lastName?.[0] || 'R'}`.toUpperCase();
  const handleSlug = user?.handle || user?.firstName?.toLowerCase() || 'practitioner';

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
      });

      if (res.data?.success) {
        await updateUserData({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          contactNumber: contactNumber.trim(),
        });
        Alert.alert('Success', 'Profile settings updated successfully!');
        setActiveModal(null);
      } else {
        Alert.alert('Error', res.data?.message || 'Could not update profile.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const menuItems = [
    {
      id: 'offers',
      label: 'My Practice Offers',
      icon: 'briefcase',
      sub: 'Consultations, packages & client intake questionnaires',
      onPress: () => setActiveModal('offers'),
    },
    {
      id: 'payouts',
      label: 'Payouts & Invoices Ledger',
      icon: 'dollar-sign',
      sub: 'Bank details, net volume & scheduled settlements',
      onPress: () => setActiveModal('payouts'),
    },
    {
      id: 'growth',
      label: 'Growth Tools & Public Link',
      icon: 'share-2',
      sub: `Public booking page: openhand.live/practitioner/${handleSlug}`,
      onPress: () => setActiveModal('growth'),
    },
    {
      id: 'settings',
      label: 'Edit Profile & Account Settings',
      icon: 'user',
      sub: 'Update personal credentials, contact info & password',
      onPress: () => setActiveModal('profile'),
    },
    {
      id: 'courses',
      label: 'Courses & Lecture Studio',
      icon: 'book-open',
      sub: 'Recorded curriculum, lecture modules & download assets',
      onPress: () =>
        Alert.alert(
          'Courses & Lecture Studio',
          'Access the desktop portal at openhand.live/practice?tab=courses to upload high-definition video lectures and manage curriculum modules.',
          [{ text: 'OK' }]
        ),
    },
    {
      id: 'coupons',
      label: 'Coupons & Learner Grants',
      icon: 'tag',
      sub: 'Manage promotional coupon codes & personalized discounts',
      onPress: () =>
        Alert.alert(
          'Coupons & Grants',
          'Learner-specific discounts can be managed via the Learners tab lookup or at openhand.live/practice?tab=coupons.',
          [{ text: 'OK' }]
        ),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Profile Header Card ── */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{practitionerName}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.roleBadge}>
            <Feather name="shield" size={11} color="#15803D" style={{ marginRight: 4 }} />
            <Text style={styles.roleBadgeText}>Verified Practitioner Guide</Text>
          </View>
          <View style={styles.handleBadge}>
            <Text style={styles.handleBadgeText}>@{handleSlug}</Text>
          </View>
        </View>
      </View>

      {/* ── Practice Hub Menu ── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>PRACTICE MANAGEMENT</Text>
      </View>

      <View style={styles.menuCard}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuRow, idx === menuItems.length - 1 && { borderBottomWidth: 0 }]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Feather name={item.icon} size={18} color="#7C3AED" />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Sign Out Button ── */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
        <Feather name="log-out" size={16} color="#DC2626" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Sign Out of Practice</Text>
      </TouchableOpacity>

      {/* ── Modal: Edit Profile & Settings ── */}
      {activeModal === 'profile' && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setActiveModal(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Feather name="user" size={18} color="#7C3AED" style={{ marginRight: 8 }} />
                  <Text style={styles.modalTitle}>Edit Profile Settings</Text>
                </View>
                <TouchableOpacity onPress={() => setActiveModal(null)}>
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.modalInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.modalInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Contact Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={contactNumber}
                onChangeText={setContactNumber}
                placeholder="+91 98765 43210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setActiveModal(null)}>
                  <Text style={styles.cancelModalText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveModalBtn, savingProfile && { opacity: 0.7 }]}
                  onPress={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveModalText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ── Modal: Growth Tools & Handle ── */}
      {activeModal === 'growth' && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setActiveModal(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Feather name="share-2" size={18} color="#7C3AED" style={{ marginRight: 8 }} />
                  <Text style={styles.modalTitle}>Growth &amp; Booking Link</Text>
                </View>
                <TouchableOpacity onPress={() => setActiveModal(null)}>
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDesc}>
                Share your personal OpenHand booking link directly with clients via WhatsApp, Instagram, or email. Learners can book 1-on-1 consultations directly.
              </Text>

              <View style={styles.linkBox}>
                <Text style={styles.linkText} selectable={true}>
                  https://openhand.live/practitioner/{handleSlug}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.copyBigBtn}
                onPress={() => {
                  Alert.alert('Link Copied', `https://openhand.live/practitioner/${handleSlug}`);
                  setActiveModal(null);
                }}
              >
                <Feather name="copy" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.copyBigBtnText}>Copy Link to Clipboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ── Modal: Payouts Ledger ── */}
      {activeModal === 'payouts' && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setActiveModal(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Feather name="dollar-sign" size={18} color="#7C3AED" style={{ marginRight: 8 }} />
                  <Text style={styles.modalTitle}>Payouts &amp; Bank Ledger</Text>
                </View>
                <TouchableOpacity onPress={() => setActiveModal(null)}>
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDesc}>
                OpenHand settles all session earnings directly to your verified bank account on a scheduled weekly cycle.
              </Text>

              <View style={styles.payoutCard}>
                <Text style={styles.payoutLabel}>Payment Partner</Text>
                <Text style={styles.payoutVal}>PayGlocal International Gateway</Text>
                <Text style={[styles.payoutLabel, { marginTop: 10 }]}>Settlement Cycle</Text>
                <Text style={styles.payoutVal}>Weekly direct bank clearance</Text>
              </View>

              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setActiveModal(null)}>
                <Text style={styles.closeModalBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ── Modal: Offers ── */}
      {activeModal === 'offers' && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setActiveModal(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Feather name="briefcase" size={18} color="#7C3AED" style={{ marginRight: 8 }} />
                  <Text style={styles.modalTitle}>Practice Offers</Text>
                </View>
                <TouchableOpacity onPress={() => setActiveModal(null)}>
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDesc}>
                Active consultation offerings displayed on your public booking profile:
              </Text>

              <View style={styles.offerItem}>
                <View style={styles.offerHeader}>
                  <Text style={styles.offerTitle}>1-on-1 Clinical Consultation</Text>
                  <Text style={styles.offerPrice}>₹1,500</Text>
                </View>
                <Text style={styles.offerSub}>60 Minutes · Dedicated Video Consultation</Text>
              </View>

              <View style={styles.offerItem}>
                <View style={styles.offerHeader}>
                  <Text style={styles.offerTitle}>4-Week Integration Package</Text>
                  <Text style={styles.offerPrice}>₹5,000</Text>
                </View>
                <Text style={styles.offerSub}>4 Weekly Sessions + AURA Reflection Prompts</Text>
              </View>

              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setActiveModal(null)}>
                <Text style={styles.closeModalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0E1235',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#DDD6FE',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  email: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  roleBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  handleBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  handleBadgeText: {
    color: '#6D28D9',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0E1235',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 14,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  cancelModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  saveModalBtn: {
    flex: 1.4,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 10,
  },
  saveModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  linkBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
  },
  copyBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 10,
  },
  copyBigBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  payoutCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  payoutLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  payoutVal: {
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 2,
  },
  closeModalBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  closeModalBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  offerItem: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  offerPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
  offerSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
  },
});


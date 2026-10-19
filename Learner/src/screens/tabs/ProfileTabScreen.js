import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { theme } from '../../theme';

// Import All Web-Parity Modals
import TermsOfServiceModal from './modals/TermsOfServiceModal';
import PrivacyPolicyModal from './modals/PrivacyPolicyModal';
import ContactSupportModal from './modals/ContactSupportModal';
import NotificationPreferencesModal from './modals/NotificationPreferencesModal';
import SubscriptionTierModal from './modals/SubscriptionTierModal';
import SecurityConsentModal from './modals/SecurityConsentModal';
import DeleteAccountModal from './modals/DeleteAccountModal';

export default function ProfileTabScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout, updateUserData } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();
  const topPadding = Platform.OS === 'web' ? 24 : Math.max(insets.top, 24) + 12;

  // Active modal: 'terms' | 'privacy' | 'support' | 'notifications' | 'subscription' | 'security' | 'delete' | null
  const [activeModal, setActiveModal] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [contactNumber, setContactNumber] = useState(
    user?.contactNumber || user?.additionalDetails?.contactNumber || ''
  );
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const fullName = `${user?.firstName || 'Learner'} ${user?.lastName || ''}`.trim();
  const initials = `${user?.firstName?.[0] || 'L'}${user?.lastName?.[0] || ''}`.toUpperCase();

  const handleCopyLearnerId = () => {
    if (!user?.learnerId) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(user.learnerId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
    Alert.alert(
      'Learner ID Copied! ✓',
      `ID: ${user.learnerId}\n\nCopied to clipboard. Share with your practitioner guide to claim scholarships and discounts.`
    );
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm
        ? window.confirm('Are you sure you want to sign out of OpenHand Learner?')
        : true;
      if (confirmed) {
        logout();
      }
      return;
    }
    Alert.alert('Sign Out', 'Are you sure you want to sign out of OpenHand Learner?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim()) {
      Alert.alert('Validation', 'First name cannot be empty.');
      return;
    }
    setSaving(true);
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
        setEditMode(false);
        Alert.alert('✓ Saved', 'Profile updated successfully.');
      } else {
        Alert.alert('Error', res.data?.message || 'Could not save profile.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Validation', 'Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Validation', 'New password must be at least 8 characters.');
      return;
    }
    setSavingPwd(true);
    try {
      const res = await apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        oldPassword,
        newPassword,
      });
      if (res.data?.success) {
        setChangingPassword(false);
        setOldPassword('');
        setNewPassword('');
        Alert.alert('✓ Done', 'Password changed successfully.');
      } else {
        Alert.alert('Error', res.data?.message || 'Could not change password.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPwd(false);
    }
  };

  const handleNavigateToAura = () => {
    if (navigation?.navigate) {
      navigation.navigate('MainTabs', { screen: 'Aura' });
    }
  };

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#040817', '#08112C', '#0E1D45', '#080E24']
          : ['#DCEEFF', '#E8F2FF', '#F4F0FF', '#FFFFFF']
      }
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Hero Card ── */}
        <View style={[styles.profileCard, isDark && styles.cardDarkGlass]}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, isDark && { backgroundColor: '#1E64EB' }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          <Text style={[styles.name, isDark && { color: '#FFFFFF' }]}>{fullName}</Text>
          <Text style={[styles.email, isDark && { color: '#94A3B8' }]}>{user?.email}</Text>

          {/* Learner ID Badge */}
          {user?.learnerId ? (
            <TouchableOpacity
              style={[
                styles.learnerIdWrap,
                isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' },
              ]}
              onPress={handleCopyLearnerId}
              activeOpacity={0.8}
            >
              <Text style={[styles.learnerIdLabel, isDark && { color: '#38BDF8' }]}>
                OFFICIAL LEARNER ID {copiedId ? '✓ COPIED' : '(TAP TO COPY)'}
              </Text>
              <View
                style={[
                  styles.learnerIdBadge,
                  isDark && { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.3)' },
                ]}
              >
                <Text style={[styles.learnerIdValue, isDark && { color: '#38BDF8' }]}>{user.learnerId}</Text>
              </View>
              <Text style={[styles.learnerIdHelp, isDark && { color: '#64748B' }]}>
                Share this ID with your practitioner to claim scholarships &amp; personal discounts.
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Edit Profile Toggle */}
          <TouchableOpacity
            style={[styles.editBtn, isDark && { borderColor: 'rgba(255, 255, 255, 0.2)' }]}
            onPress={() => {
              if (editMode) {
                setFirstName(user?.firstName || '');
                setLastName(user?.lastName || '');
                setContactNumber(user?.contactNumber || user?.additionalDetails?.contactNumber || '');
              }
              setEditMode(!editMode);
            }}
          >
            <Text style={[styles.editBtnText, isDark && { color: '#FFFFFF' }]}>
              {editMode ? 'Cancel Edit' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Edit Profile Form ── */}
        {editMode && (
          <View style={[styles.card, isDark && styles.cardDarkGlass]}>
            <Text style={[styles.cardTitle, isDark && { color: '#38BDF8' }]}>EDIT PROFILE</Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, isDark && { color: '#FFFFFF' }]}>First Name</Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' },
                ]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={isDark ? '#64748B' : theme.colors.textLight}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, isDark && { color: '#FFFFFF' }]}>Last Name</Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' },
                ]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={isDark ? '#64748B' : theme.colors.textLight}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, isDark && { color: '#FFFFFF' }]}>Contact Number</Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' },
                ]}
                value={contactNumber}
                onChangeText={setContactNumber}
                placeholder="+91 9876543210"
                placeholderTextColor={isDark ? '#64748B' : theme.colors.textLight}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Account Status & Tier ── */}
        <View style={[styles.card, isDark && styles.cardDarkGlass]}>
          <Text style={[styles.cardTitle, isDark && { color: '#38BDF8' }]}>ACCOUNT &amp; STATUS</Text>

          <View style={[styles.row, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}>
            <Text style={[styles.rowLabel, isDark && { color: '#94A3B8' }]}>Account Type</Text>
            <Text style={[styles.rowValue, isDark && { color: '#FFFFFF' }]}>{user?.accountType || 'Learner'}</Text>
          </View>

          <TouchableOpacity
            style={[styles.row, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}
            onPress={() => setActiveModal('subscription')}
            activeOpacity={0.7}
          >
            <View>
              <Text style={[styles.rowLabel, isDark && { color: '#94A3B8' }]}>Access Tier</Text>
              <Text style={{ fontSize: 11, color: isDark ? '#C084FC' : '#7C3AED', marginTop: 1 }}>
                Tap to view plan details ›
              </Text>
            </View>
            <View style={styles.freePlanBadge}>
              <Text style={styles.freePlanText}>100% Free Lifetime</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.row, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}>
            <Text style={[styles.rowLabel, isDark && { color: '#94A3B8' }]}>Contact Number</Text>
            <Text style={[styles.rowValue, isDark && { color: '#FFFFFF' }]}>
              {user?.contactNumber || user?.additionalDetails?.contactNumber || '—'}
            </Text>
          </View>

          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={[styles.rowLabel, isDark && { color: '#94A3B8' }]}>Member Since</Text>
            <Text style={[styles.rowValue, isDark && { color: '#FFFFFF' }]}>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </Text>
          </View>
        </View>

        {/* ── Security & Password ── */}
        <View style={[styles.card, isDark && styles.cardDarkGlass]}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, isDark && { color: '#38BDF8' }]}>SECURITY CREDENTIALS</Text>
            <TouchableOpacity onPress={() => setChangingPassword(!changingPassword)}>
              <Text style={[styles.toggleLink, isDark && { color: '#38BDF8' }]}>
                {changingPassword ? 'Cancel' : 'Change Password'}
              </Text>
            </TouchableOpacity>
          </View>

          {changingPassword && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, isDark && { color: '#FFFFFF' }]}>Current Password</Text>
                <TextInput
                  style={[
                    styles.fieldInput,
                    isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' },
                  ]}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? '#64748B' : theme.colors.textLight}
                  secureTextEntry
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, isDark && { color: '#FFFFFF' }]}>New Password (min 8 chars)</Text>
                <TextInput
                  style={[
                    styles.fieldInput,
                    isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' },
                  ]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? '#64748B' : theme.colors.textLight}
                  secureTextEntry
                />
              </View>
              <TouchableOpacity
                style={[styles.saveBtn, savingPwd && { opacity: 0.7 }]}
                onPress={handleChangePassword}
                disabled={savingPwd}
              >
                {savingPwd ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── App Preferences & Notifications ── */}
        <View style={[styles.card, isDark && styles.cardDarkGlass]}>
          <Text style={[styles.cardTitle, isDark && { color: '#38BDF8' }]}>APP &amp; NOTIFICATIONS</Text>

          {/* Theme switcher */}
          <TouchableOpacity
            style={[styles.menuRow, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.15)' : '#F5F3FF' }]}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={isDark ? '#C084FC' : '#7C3AED'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, isDark && { color: '#FFFFFF' }]}>Theme Appearance</Text>
              <Text style={{ fontSize: 11, color: isDark ? '#94A3B8' : theme.colors.textMuted }}>
                {isDark ? 'Dark Mode (Deep Slate)' : 'Bright Mode (Light Soft)'}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isDark ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#C084FC' : '#7C3AED' }}>
                {isDark ? 'Dark' : 'Bright'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Notifications & WhatsApp Alerts */}
          <TouchableOpacity
            style={[styles.menuRow, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}
            onPress={() => setActiveModal('notifications')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7' }]}>
              <Ionicons name="notifications" size={18} color="#16A34A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, isDark && { color: '#FFFFFF' }]}>Notifications &amp; Alerts</Text>
              <Text style={{ fontSize: 11, color: isDark ? '#94A3B8' : theme.colors.textMuted }}>
                WhatsApp circle alerts, session reminders &amp; emails
              </Text>
            </View>
            <Text style={[styles.menuChevron, isDark && { color: '#64748B' }]}>›</Text>
          </TouchableOpacity>

          {/* My Subscription & Billing */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => setActiveModal('subscription')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7' }]}>
              <Ionicons name="card" size={18} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, isDark && { color: '#FFFFFF' }]}>My Subscription &amp; Billing</Text>
              <Text style={{ fontSize: 11, color: isDark ? '#94A3B8' : theme.colors.textMuted }}>
                100% Free Lifetime Account &amp; session billing info
              </Text>
            </View>
            <Text style={[styles.menuChevron, isDark && { color: '#64748B' }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Legal, Privacy & Compliance ── */}
        <View style={[styles.card, isDark && styles.cardDarkGlass]}>
          <Text style={[styles.cardTitle, isDark && { color: '#38BDF8' }]}>LEGAL &amp; POLICIES</Text>

          {/* Terms of Service */}
          <TouchableOpacity
            style={[styles.menuRow, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}
            onPress={() => setActiveModal('terms')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#EFF6FF' }]}>
              <Ionicons name="document-text" size={18} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, isDark && { color: '#FFFFFF' }]}>Terms of Service</Text>
              <Text style={{ fontSize: 11, color: isDark ? '#94A3B8' : theme.colors.textMuted }}>
                Operating rules, booking policies &amp; learner terms
              </Text>
            </View>
            <Text style={[styles.menuChevron, isDark && { color: '#64748B' }]}>›</Text>
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity
            style={[styles.menuRow, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}
            onPress={() => setActiveModal('privacy')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: isDark ? 'rgba(13, 148, 136, 0.15)' : '#F0FDFA' }]}>
              <Ionicons name="shield-checkmark" size={18} color="#0D9488" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, isDark && { color: '#FFFFFF' }]}>Privacy Policy</Text>
              <Text style={{ fontSize: 11, color: isDark ? '#94A3B8' : theme.colors.textMuted }}>
                India DPDP Act 2023 &amp; GDPR health data protection
              </Text>
            </View>
            <Text style={[styles.menuChevron, isDark && { color: '#64748B' }]}>›</Text>
          </TouchableOpacity>

          {/* Security & Data Consent */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => setActiveModal('security')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : '#FAF5FF' }]}>
              <Ionicons name="lock-closed" size={18} color="#9333EA" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, isDark && { color: '#FFFFFF' }]}>Security &amp; Data Consent</Text>
              <Text style={{ fontSize: 11, color: isDark ? '#94A3B8' : theme.colors.textMuted }}>
                TLS 1.3, AES-256 encryption &amp; consent records
              </Text>
            </View>
            <Text style={[styles.menuChevron, isDark && { color: '#64748B' }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Help & Support Desk ── */}
        <View style={[styles.card, isDark && styles.cardDarkGlass]}>
          <Text style={[styles.cardTitle, isDark && { color: '#38BDF8' }]}>HELP &amp; SUPPORT</Text>

          {/* Contact Support */}
          <TouchableOpacity
            style={[styles.menuRow, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}
            onPress={() => setActiveModal('support')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2' }]}>
              <Ionicons name="headset" size={18} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, isDark && { color: '#FFFFFF' }]}>Contact Support Desk</Text>
              <Text style={{ fontSize: 11, color: isDark ? '#94A3B8' : theme.colors.textMuted }}>
                Emergency response SLAs, email desk &amp; ticket submission
              </Text>
            </View>
            <Text style={[styles.menuChevron, isDark && { color: '#64748B' }]}>›</Text>
          </TouchableOpacity>

          {/* AURA Quick Counselor Chat */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={handleNavigateToAura}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.15)' : '#F5F3FF' }]}>
              <Ionicons name="sparkles" size={18} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, isDark && { color: '#FFFFFF' }]}>Talk with AURA AI</Text>
              <Text style={{ fontSize: 11, color: isDark ? '#94A3B8' : theme.colors.textMuted }}>
                Instant guidance, study reflections &amp; somatic check-ins
              </Text>
            </View>
            <Text style={[styles.menuChevron, isDark && { color: '#64748B' }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Danger Zone & Account Management ── */}
        <View style={[styles.card, isDark && styles.cardDarkGlass]}>
          <Text style={[styles.cardTitle, isDark && { color: '#F87171' }]}>ACCOUNT MANAGEMENT</Text>

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => setActiveModal('delete')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' }]}>
              <Feather name="trash-2" size={18} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, { color: '#DC2626' }]}>Delete / Deactivate Account</Text>
              <Text style={{ fontSize: 11, color: isDark ? '#94A3B8' : theme.colors.textMuted }}>
                30-day safety grace period before permanent purge
              </Text>
            </View>
            <Text style={[styles.menuChevron, isDark && { color: '#64748B' }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Sign Out ── */}
        <TouchableOpacity
          style={[styles.logoutButton, isDark && { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={theme.colors.dangerText} style={{ marginRight: 6 }} />
          <Text style={styles.logoutText}>Sign Out of OpenHand</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, isDark && { color: '#64748B' }]}>
          OpenHand Learner • v1.0.0 (Build 4fbcb19c)
        </Text>
      </ScrollView>

      {/* ── All Web-Parity Modals ── */}
      <TermsOfServiceModal
        visible={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        isDark={isDark}
      />

      <PrivacyPolicyModal
        visible={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        isDark={isDark}
      />

      <ContactSupportModal
        visible={activeModal === 'support'}
        onClose={() => setActiveModal(null)}
        isDark={isDark}
        user={user}
        onOpenAura={handleNavigateToAura}
      />

      <NotificationPreferencesModal
        visible={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
        isDark={isDark}
        user={user}
        onUpdateUser={updateUserData}
      />

      <SubscriptionTierModal
        visible={activeModal === 'subscription'}
        onClose={() => setActiveModal(null)}
        isDark={isDark}
        user={user}
      />

      <SecurityConsentModal
        visible={activeModal === 'security'}
        onClose={() => setActiveModal(null)}
        isDark={isDark}
        user={user}
      />

      <DeleteAccountModal
        visible={activeModal === 'delete'}
        onClose={() => setActiveModal(null)}
        isDark={isDark}
        user={user}
        onLogout={logout}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.base,
    paddingBottom: 64,
  },
  // ── Profile Hero Card ──
  profileCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.base,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDarkGlass: {
    backgroundColor: 'rgba(14, 23, 46, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarWrap: { marginBottom: theme.spacing.md },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.borderActive,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: theme.typography.heavy,
    color: '#FFF',
  },
  name: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.heavy,
    color: theme.colors.text,
  },
  email: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  learnerIdWrap: {
    marginTop: theme.spacing.lg,
    width: '100%',
    backgroundColor: '#EEF2FF',
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  learnerIdLabel: {
    fontSize: 10,
    fontWeight: theme.typography.heavy,
    color: theme.colors.indigo,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  learnerIdBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.spacing.borderRadiusSm,
    marginVertical: 4,
  },
  learnerIdValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 16,
    fontWeight: theme.typography.heavy,
    color: theme.colors.indigo,
  },
  learnerIdHelp: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  editBtn: {
    marginTop: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.blue,
    borderRadius: theme.spacing.borderRadiusPill,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  editBtnText: {
    color: theme.colors.blue,
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
  },
  // ── Card ──
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.base,
  },
  cardTitle: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.heavy,
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  toggleLink: {
    fontSize: theme.typography.sm,
    color: theme.colors.blue,
    fontWeight: theme.typography.semiBold,
  },
  // ── Account Info Rows ──
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceSubtle,
  },
  rowLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
  },
  rowValue: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.text,
  },
  freePlanBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freePlanText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
  // ── Edit Fields ──
  fieldGroup: { marginBottom: theme.spacing.base },
  fieldLabel: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  fieldInput: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadiusSm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 11,
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  saveBtn: {
    backgroundColor: theme.colors.blue,
    borderRadius: theme.spacing.borderRadiusSm,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
  },
  // ── Menu Rows ──
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceSubtle,
    gap: 12,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: theme.typography.sm,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  menuChevron: {
    fontSize: 20,
    color: theme.colors.textLight,
  },
  // ── Sign Out ──
  logoutButton: {
    backgroundColor: theme.colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: theme.spacing.borderRadiusMd,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.base,
  },
  logoutText: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
  },
  versionText: {
    textAlign: 'center',
    fontSize: theme.typography.xs,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
});

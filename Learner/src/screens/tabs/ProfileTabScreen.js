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
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { theme } from '../../theme';

const MENU_ITEMS = [
  { icon: '📋', label: 'Terms of Service', onPress: () => {} },
  { icon: '🔒', label: 'Privacy Policy', onPress: () => {} },
  { icon: '💌', label: 'Contact Support', onPress: () => {} },
];

export default function ProfileTabScreen() {
  const { user, logout, updateUserData } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();

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

  const fullName = `${user?.firstName || 'Learner'} ${user?.lastName || ''}`.trim();
  const initials = `${user?.firstName?.[0] || 'L'}${user?.lastName?.[0] || ''}`.toUpperCase();

  const handleLogout = () => {
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

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#040817', '#08112C', '#0E1D45', '#080E24']
          : ['#DCEEFF', '#E8F2FF', '#F4F0FF', '#FFFFFF']
      }
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        {/* ── Profile Hero Card ── */}
        <View style={[styles.profileCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
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
            <View style={[styles.learnerIdWrap, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <Text style={[styles.learnerIdLabel, isDark && { color: '#38BDF8' }]}>OFFICIAL LEARNER ID</Text>
              <View style={[styles.learnerIdBadge, isDark && { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.3)' }]}>
                <Text style={[styles.learnerIdValue, isDark && { color: '#38BDF8' }]}>{user.learnerId}</Text>
              </View>
              <Text style={[styles.learnerIdHelp, isDark && { color: '#64748B' }]}>
                Share this ID with your practitioner to claim scholarships & personal discounts.
              </Text>
            </View>
          ) : null}

          {/* Edit Profile Toggle */}
          <TouchableOpacity
            style={[styles.editBtn, isDark && { borderColor: 'rgba(255, 255, 255, 0.2)' }]}
            onPress={() => {
              if (editMode) {
                // Cancel — reset fields
                setFirstName(user?.firstName || '');
                setLastName(user?.lastName || '');
                setContactNumber(user?.contactNumber || user?.additionalDetails?.contactNumber || '');
              }
              setEditMode(!editMode);
            }}
          >
            <Text style={[styles.editBtnText, isDark && { color: '#FFFFFF' }]}>{editMode ? 'Cancel Edit' : 'Edit Profile'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Edit Profile Form ── */}
        {editMode && (
          <View style={[styles.card, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <Text style={[styles.cardTitle, isDark && { color: '#38BDF8' }]}>EDIT PROFILE</Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, isDark && { color: '#FFFFFF' }]}>First Name</Text>
              <TextInput
                style={[styles.fieldInput, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }]}
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
                style={[styles.fieldInput, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }]}
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
                style={[styles.fieldInput, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }]}
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
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Account Info ── */}
        <View style={[styles.card, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
          <Text style={[styles.cardTitle, isDark && { color: '#38BDF8' }]}>ACCOUNT & STATUS</Text>

          <View style={[styles.row, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}>
            <Text style={[styles.rowLabel, isDark && { color: '#94A3B8' }]}>Account Type</Text>
            <Text style={[styles.rowValue, isDark && { color: '#FFFFFF' }]}>{user?.accountType || 'Learner'}</Text>
          </View>

          <View style={[styles.row, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}>
            <Text style={[styles.rowLabel, isDark && { color: '#94A3B8' }]}>Access Tier</Text>
            <Text style={[styles.rowValue, { color: isDark ? '#34D399' : theme.colors.successText }]}>
              100% Free Access
            </Text>
          </View>

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

        {/* ── Change Password ── */}
        <View style={[styles.card, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, isDark && { color: '#38BDF8' }]}>SECURITY</Text>
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
                  style={[styles.fieldInput, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }]}
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
                  style={[styles.fieldInput, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }]}
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
                {savingPwd ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── App Preferences (including Theme Mode) ── */}
        <View style={[styles.card, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
          <Text style={[styles.cardTitle, isDark && { color: '#38BDF8' }]}>APPEARANCE & APP</Text>

          {/* Theme switcher row */}
          <TouchableOpacity
            style={[styles.menuRow, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}
            onPress={toggleTheme}
          >
            <Text style={styles.menuIcon}>{isDark ? '☀️' : '🌙'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, isDark && { color: '#FFFFFF' }]}>Theme Appearance</Text>
              <Text style={{ fontSize: 10, color: isDark ? '#94A3B8' : theme.colors.textMuted }}>
                {isDark ? 'Dark Mode (Phone 1)' : 'Bright Mode (Phone 2)'}
              </Text>
            </View>
            <View style={{
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 100, 235, 0.1)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#38BDF8' : '#1E64EB' }}>
                {isDark ? 'Dark' : 'Bright'}
              </Text>
            </View>
          </TouchableOpacity>

          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }, i === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 }]}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, isDark && { color: '#FFFFFF' }]}>{item.label}</Text>
              <Text style={[styles.menuChevron, isDark && { color: '#64748B' }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Sign Out ── */}
        <TouchableOpacity style={[styles.logoutButton, isDark && { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' }]} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, isDark && { color: '#64748B' }]}>OpenHand Learner • v1.0.0</Text>
      </ScrollView>
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
    paddingBottom: 56,
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
    letterSpacing: 0.5,
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
    paddingVertical: 10,
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
    gap: theme.spacing.md,
  },
  menuIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  menuLabel: {
    flex: 1,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
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

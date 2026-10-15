import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

export default function MoreTabScreen() {
  const { user, logout } = useAuth();

  const practitionerName = user?.firstName ? `Dr. ${user.firstName} ${user.lastName || ''}`.trim() : 'Practitioner';
  const initials = `${user?.firstName?.[0] || 'D'}${user?.lastName?.[0] || 'R'}`.toUpperCase();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of OpenHand Practitioner?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { id: 'courses', label: 'My Courses & Lecture Studio', icon: '📚', sub: 'Upload lectures & course resources' },
    { id: 'coupons', label: 'Coupons & Learner Discounts', icon: '🏷️', sub: 'Manage promo codes & personal grants' },
    { id: 'offers', label: 'My Practice Offers', icon: '💼', sub: 'Consultations, packages & questionnaires' },
    { id: 'circles', label: 'Growth Circles Management', icon: '⭕', sub: 'Cohort capacities and meeting schedules' },
    { id: 'payouts', label: 'Payouts & Invoices', icon: '💰', sub: 'Bank details, net volume & ledger' },
    { id: 'growth', label: 'Growth & Social Tools', icon: '🚀', sub: 'Custom profile handle & lead links' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{practitionerName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>Verified Practitioner Guide</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuCard}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuRow, idx === menuItems.length - 1 && { borderBottomWidth: 0 }]}
          >
            <View style={styles.menuIconWrap}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out of Practice</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.base,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.base,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: 22,
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
  roleBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.spacing.borderRadiusPill,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  roleBadgeText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: theme.typography.bold,
  },
  menuCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.base,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceSubtle,
    gap: theme.spacing.md,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.text,
  },
  menuSub: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 22,
    color: theme.colors.textLight,
  },
  logoutButton: {
    backgroundColor: theme.colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: theme.spacing.borderRadiusMd,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  logoutText: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
  },
});

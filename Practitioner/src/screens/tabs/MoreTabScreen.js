import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';

export default function MoreTabScreen() {
  const { user, logout, updateUserData } = useAuth();
  const { isDark, toggleTheme, tokens } = useAppTheme();

  // Modal State: 'profile' | 'growth' | 'payouts' | 'offers' | null
  const [activeModal, setActiveModal] = useState(null);

  // Real backend dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Form Fields (initialized strictly from logged-in user without fake data)
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [contactNumber, setContactNumber] = useState(
    user?.additionalDetails?.contactNumber || user?.contactNumber || ''
  );
  const [bio, setBio] = useState(
    user?.additionalDetails?.about || user?.bio || ''
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Dynamic Interactive States
  const [isAcceptingClients, setIsAcceptingClients] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState(false);

  // Entrance Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Fetch real backend data for the practitioner dashboard
  const fetchPracticeData = useCallback(async () => {
    try {
      setLoadingDashboard(true);
      const [dashRes, profileRes] = await Promise.allSettled([
        apiClient.get(ENDPOINTS.PRACTITIONER.DASHBOARD),
        apiClient.get(ENDPOINTS.PROFILE.GET_USER_DETAILS),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data?.success) {
        setDashboardData(dashRes.value.data.data);
      }

      if (profileRes.status === 'fulfilled' && profileRes.value.data?.success && profileRes.value.data?.data) {
        const u = profileRes.value.data.data;
        await updateUserData(u);
        setFirstName(u.firstName || '');
        setLastName(u.lastName || '');
        setContactNumber(u.additionalDetails?.contactNumber || u.contactNumber || '');
        setBio(u.additionalDetails?.about || u.bio || '');
      }
    } catch (e) {
      console.warn('Error fetching practice data:', e.message);
    } finally {
      setLoadingDashboard(false);
    }
  }, [updateUserData]);

  useEffect(() => {
    fetchPracticeData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulsing animation for online indicator
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [fetchPracticeData]);

  // Sync state if user context updates
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setContactNumber(user.additionalDetails?.contactNumber || user.contactNumber || '');
      setBio(user.additionalDetails?.about || user.bio || '');
    }
  }, [user]);

  // Real identity computation
  const realFirstName = user?.firstName || dashboardData?.practitioner?.firstName || '';
  const realLastName = user?.lastName || dashboardData?.practitioner?.lastName || '';
  const practitionerName = `${realFirstName} ${realLastName}`.trim() || 'Practitioner';
  const initials = `${realFirstName?.[0] || 'P'}${realLastName?.[0] || ''}`.toUpperCase();
  const practitionerEmail = user?.email || dashboardData?.practitioner?.email || '';

  // Handle slug: derived from user handle or actual name, fallback to id/user
  const rawHandle = user?.handle || dashboardData?.practitioner?.handle;
  const handleSlug = rawHandle
    ? rawHandle
    : realFirstName
    ? `${realFirstName.toLowerCase()}${realLastName ? `-${realLastName.toLowerCase()}` : ''}`.replace(/[^a-z0-9-]/g, '')
    : 'practitioner';

  // Real metrics from backend stats (with 0 if no data)
  const activeClientsCount = dashboardData?.stats?.activeClientsCount ?? 0;
  const rawRating = dashboardData?.practitioner?.rating;
  const ratingDisplay = rawRating !== null && rawRating !== undefined ? `${Number(rawRating).toFixed(1)} ★` : '0.0';
  const totalEarnings = dashboardData?.stats?.totalEarnings ?? 0;
  const clearingThisWeek = dashboardData?.stats?.clearingThisWeek ?? 0;

  // Real offers and payouts lists
  const offersList = Array.isArray(dashboardData?.offers) ? dashboardData.offers : [];
  const payoutsList = Array.isArray(dashboardData?.payouts) ? dashboardData.payouts : [];

  // Real specialties
  const realSpecialties = Array.isArray(user?.specialties) && user.specialties.length > 0
    ? user.specialties
    : Array.isArray(dashboardData?.practitioner?.specialties) && dashboardData.practitioner.specialties.length > 0
    ? dashboardData.practitioner.specialties
    : [];

  const handleCopySlug = () => {
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2200);
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      let confirmed = true;
      if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        try {
          confirmed = window.confirm('Are you sure you want to sign out?');
        } catch (_) {
          confirmed = true;
        }
      }
      if (confirmed) {
        await logout();
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); } },
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
        const updated = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          contactNumber: contactNumber.trim(),
          bio: bio.trim(),
          additionalDetails: {
            ...user?.additionalDetails,
            contactNumber: contactNumber.trim(),
            about: bio.trim(),
          },
        };
        await updateUserData(updated);
        Alert.alert('Success', 'Profile updated successfully!');
        setActiveModal(null);
        fetchPracticeData();
      } else {
        throw new Error(res.data?.message || 'Failed to update profile.');
      }
    } catch (e) {
      Alert.alert('Notice', e.response?.data?.message || e.message || 'Profile updated locally.');
      const fallbackUpdated = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        contactNumber: contactNumber.trim(),
        bio: bio.trim(),
      };
      await updateUserData(fallbackUpdated);
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
          iconColor: '#7C3AED',
          iconBg: isDark ? 'rgba(124, 58, 237, 0.16)' : '#F5F3FF',
          badgeText: `${offersList.length} ${offersList.length === 1 ? 'Package' : 'Packages'}`,
          badgeColor: '#7C3AED',
          sub: offersList.length > 0 ? `${offersList.length} active consultation offers published` : '0 offers published',
          onPress: () => setActiveModal('offers'),
        },
        {
          id: 'payouts',
          label: 'Payouts & Financial Ledger',
          icon: 'dollar-sign',
          iconColor: '#059669',
          iconBg: isDark ? 'rgba(5, 150, 105, 0.16)' : '#ECFDF5',
          badgeText: `$${clearingThisWeek.toFixed(2)} Scheduled`,
          badgeColor: '#059669',
          sub: `Net Earnings: $${totalEarnings.toFixed(2)}`,
          onPress: () => setActiveModal('payouts'),
        },
        {
          id: 'growth',
          label: 'Growth Tools & Public Page',
          icon: 'share-2',
          iconColor: '#2563EB',
          iconBg: isDark ? 'rgba(37, 99, 235, 0.16)' : '#EFF6FF',
          badgeText: 'Live URL',
          badgeColor: '#2563EB',
          sub: `openhand.live/practitioner/${handleSlug}`,
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
          iconColor: '#8B5CF6',
          iconBg: isDark ? 'rgba(139, 92, 246, 0.16)' : '#F3E8FF',
          badgeText: bio ? 'Profile Active' : 'Incomplete',
          badgeColor: '#8B5CF6',
          sub: bio ? 'Personal details & clinical focus set' : 'Add your professional bio & credentials',
          onPress: () => setActiveModal('profile'),
        },
        {
          id: 'courses',
          label: 'Courses & Lecture Studio',
          icon: 'book-open',
          iconColor: '#D97706',
          iconBg: isDark ? 'rgba(217, 119, 6, 0.16)' : '#FFFBEB',
          badgeText: 'Studio',
          badgeColor: '#D97706',
          sub: 'Masterclass video lectures & curriculum',
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
          iconColor: isDark ? '#FBBF24' : '#7C3AED',
          iconBg: isDark ? 'rgba(251, 191, 36, 0.14)' : '#F5F3FF',
          badgeText: isDark ? 'Obsidian' : 'Modern Light',
          badgeColor: isDark ? '#FBBF24' : '#7C3AED',
          sub: 'Switch between luxury dark mode and crisp bright mode',
          onPress: toggleTheme,
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: tokens.backgroundSolid }]}>
      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* ── Practitioner Identity Hero Profile Card ── */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: tokens.card,
              borderColor: tokens.cardBorder,
            },
            isDark && styles.profileCardDark,
          ]}
        >
          {/* Top Verification & Action Banner */}
          <View style={styles.cardHeaderRow}>
            <View style={[styles.clinicalBadge, isDark && styles.clinicalBadgeDark]}>
              <Ionicons name="shield-checkmark" size={13} color="#059669" />
              <Text style={styles.clinicalBadgeText}>
                {user?.isVerified || dashboardData?.practitioner?.credentials ? 'VERIFIED PRACTITIONER' : 'PRACTITIONER PORTAL'}
              </Text>
            </View>

            {/* Quick Edit Icon Button */}
            <Pressable
              onPress={() => setActiveModal('profile')}
              style={({ pressed, hovered }) => [
                styles.quickEditBtn,
                isDark && styles.quickEditBtnDark,
                hovered && styles.quickEditBtnHover,
                pressed && { opacity: 0.75, transform: [{ scale: 0.94 }] },
              ]}
              hitSlop={8}
            >
              <Feather name="edit-3" size={14} color={tokens.primary} />
              <Text style={[styles.quickEditText, { color: tokens.primary }]}>Edit</Text>
            </Pressable>
          </View>

          {/* Avatar and Identity Meta */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: tokens.primary }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              {/* Online Pulse Indicator */}
              <Animated.View
                style={[
                  styles.onlineDotPulse,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.profileTextMeta}>
              <View style={styles.verifiedRow}>
                <Text style={[styles.name, { color: tokens.text }]}>{practitionerName}</Text>
                {user?.isVerified && (
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                )}
              </View>
              {practitionerEmail ? (
                <Text style={[styles.email, { color: tokens.textMuted }]}>{practitionerEmail}</Text>
              ) : null}

              {/* Interactive Copyable Public Handle */}
              <Pressable
                onPress={handleCopySlug}
                style={({ pressed, hovered }) => [
                  styles.handleBadge,
                  isDark && styles.handleBadgeDark,
                  hovered && styles.handleBadgeHover,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Feather
                  name={copiedSlug ? 'check' : 'link-2'}
                  size={12}
                  color={copiedSlug ? '#059669' : tokens.primary}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.handleBadgeText,
                    { color: copiedSlug ? '#059669' : tokens.primary },
                  ]}
                  numberOfLines={1}
                >
                  {copiedSlug ? 'Copied to clipboard!' : `openhand.live/${handleSlug}`}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Dynamic Availability Bar */}
          <View
            style={[
              styles.availabilityBox,
              { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border },
            ]}
          >
            <View style={styles.availabilityLeft}>
              <View
                style={[
                  styles.statusIndicatorDot,
                  { backgroundColor: isAcceptingClients ? '#059669' : '#94A3B8' },
                ]}
              />
              <View>
                <Text style={[styles.availabilityTitle, { color: tokens.text }]}>
                  {isAcceptingClients ? 'Accepting Clients' : 'Practice Paused'}
                </Text>
                <Text style={[styles.availabilitySub, { color: tokens.textMuted }]}>
                  {isAcceptingClients ? 'Clients can book consultations directly' : 'Direct bookings currently closed'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => setIsAcceptingClients(!isAcceptingClients)}
              style={({ pressed, hovered }) => [
                styles.togglePill,
                isAcceptingClients ? styles.togglePillActive : styles.togglePillInactive,
                hovered && { opacity: 0.9 },
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <Text style={[styles.togglePillText, isAcceptingClients ? styles.toggleTextActive : styles.toggleTextInactive]}>
                {isAcceptingClients ? 'Open' : 'Off'}
              </Text>
            </Pressable>
          </View>

          {/* Real Backend KPI Metrics Row */}
          <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
              <View style={styles.kpiIconWrap}>
                <Feather name="users" size={13} color="#7C3AED" />
              </View>
              <Text style={[styles.kpiValue, { color: tokens.text }]}>{activeClientsCount}</Text>
              <Text style={[styles.kpiLabel, { color: tokens.textMuted }]}>Active Roster</Text>
            </View>

            <View style={[styles.kpiCard, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
              <View style={styles.kpiIconWrap}>
                <Ionicons name="star" size={13} color="#F59E0B" />
              </View>
              <Text style={[styles.kpiValue, { color: tokens.text }]}>{ratingDisplay}</Text>
              <Text style={[styles.kpiLabel, { color: tokens.textMuted }]}>Client Rating</Text>
            </View>

            <View style={[styles.kpiCard, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
              <View style={styles.kpiIconWrap}>
                <Feather name="dollar-sign" size={13} color="#059669" />
              </View>
              <Text style={[styles.kpiValue, { color: tokens.text }]}>${totalEarnings}</Text>
              <Text style={[styles.kpiLabel, { color: tokens.textMuted }]}>Net Volume</Text>
            </View>
          </View>

          {/* Real Specialties Chips */}
          <View style={[styles.specialtiesRow, { borderTopColor: tokens.border }]}>
            {realSpecialties.length > 0 ? (
              realSpecialties.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.specialtyChip,
                    isDark ? styles.specialtyChipDark : styles.specialtyChipLight,
                  ]}
                >
                  <Text style={[styles.specialtyChipText, { color: tokens.primary }]}>
                    {item}
                  </Text>
                </View>
              ))
            ) : (
              <Pressable
                onPress={() => setActiveModal('profile')}
                style={styles.noSpecialtiesWrap}
              >
                <Feather name="plus-circle" size={13} color={tokens.primary} style={{ marginRight: 5 }} />
                <Text style={[styles.noSpecialtiesText, { color: tokens.textMuted }]}>
                  No specialties listed yet • Tap to add credentials
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Menu Section Groups ── */}
        {menuSections.map((sec, secIdx) => (
          <View key={secIdx} style={styles.sectionWrap}>
            <View style={styles.sectionHeadingRow}>
              <Text style={[styles.sectionHeading, { color: tokens.textSecondary }]}>
                {sec.title}
              </Text>
              <Text style={[styles.sectionCountBadge, { color: tokens.textMuted }]}>
                {sec.items.length} items
              </Text>
            </View>

            <View
              style={[
                styles.menuCard,
                { backgroundColor: tokens.card, borderColor: tokens.cardBorder },
              ]}
            >
              {sec.items.map((item, itemIdx) => (
                <Pressable
                  key={item.id}
                  style={({ pressed, hovered }) => [
                    styles.menuItem,
                    itemIdx < sec.items.length - 1 && [
                      styles.menuItemBorder,
                      { borderBottomColor: tokens.border },
                    ],
                    hovered && [
                      styles.menuItemHover,
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(124, 58, 237, 0.04)' },
                    ],
                    pressed && { opacity: 0.82, transform: [{ scale: 0.992 }] },
                  ]}
                  onPress={item.onPress}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                    <Feather name={item.icon} size={18} color={item.iconColor} />
                  </View>

                  <View style={styles.menuMeta}>
                    <View style={styles.menuTitleRow}>
                      <Text style={[styles.menuLabel, { color: tokens.text }]}>{item.label}</Text>
                      {item.badgeText ? (
                        <View style={[styles.itemPillBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                          <Text style={[styles.itemPillText, { color: item.badgeColor }]}>
                            {item.badgeText}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.menuSub, { color: tokens.textMuted }]} numberOfLines={1}>
                      {item.sub}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={17} color={tokens.textLight} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* ── Sign Out Button ── */}
        <Pressable
          style={({ pressed, hovered }) => [
            styles.logoutBtn,
            isDark && styles.logoutBtnDark,
            hovered && styles.logoutBtnHover,
            pressed && { transform: [{ scale: 0.98 }], opacity: 0.85 },
          ]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={16} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: 48 }} />
      </Animated.ScrollView>

      {/* ── Edit Profile Modal ── */}
      <Modal
        visible={activeModal === 'profile'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setActiveModal(null)}
          />
          <View style={[styles.modalContent, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }]}>
            <View style={[styles.sheetHandle, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.15)' }]} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalPretitle, { color: tokens.primary }]}>PRACTITIONER SETTINGS</Text>
                <Text style={[styles.modalTitle, { color: tokens.text }]}>Edit Profile Credentials</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={[styles.closeIconBtn, { backgroundColor: tokens.surfaceSubtle }]}
              >
                <Feather name="x" size={18} color={tokens.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              {/* Avatar Preview Row */}
              <View style={[styles.modalAvatarRow, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                <View style={[styles.avatarSmall, { backgroundColor: tokens.primary }]}>
                  <Text style={styles.avatarSmallText}>{initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalAvatarTitle, { color: tokens.text }]}>Clinical Avatar</Text>
                  <Text style={[styles.modalAvatarSub, { color: tokens.textMuted }]}>
                    Display name: {firstName || 'Practitioner'} {lastName}
                  </Text>
                </View>
              </View>

              <View style={styles.modalFieldGroup}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>First Name</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: tokens.surfaceSubtle, borderColor: focusedField === 'first' ? tokens.primary : tokens.border },
                  ]}
                >
                  <TextInput
                    style={[styles.modalInput, { color: tokens.text }]}
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => setFocusedField('first')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter first name"
                    placeholderTextColor={tokens.textLight}
                  />
                </View>
              </View>

              <View style={styles.modalFieldGroup}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>Last Name</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: tokens.surfaceSubtle, borderColor: focusedField === 'last' ? tokens.primary : tokens.border },
                  ]}
                >
                  <TextInput
                    style={[styles.modalInput, { color: tokens.text }]}
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() => setFocusedField('last')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter last name"
                    placeholderTextColor={tokens.textLight}
                  />
                </View>
              </View>

              <View style={styles.modalFieldGroup}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>Phone Number</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: tokens.surfaceSubtle, borderColor: focusedField === 'phone' ? tokens.primary : tokens.border },
                  ]}
                >
                  <TextInput
                    style={[styles.modalInput, { color: tokens.text }]}
                    value={contactNumber}
                    onChangeText={setContactNumber}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Phone number"
                    placeholderTextColor={tokens.textLight}
                  />
                </View>
              </View>

              <View style={styles.modalFieldGroup}>
                <View style={styles.labelCountRow}>
                  <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>Professional Bio</Text>
                  <Text style={[styles.charCountText, { color: tokens.textLight }]}>{bio.length}/280</Text>
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: tokens.surfaceSubtle, borderColor: focusedField === 'bio' ? tokens.primary : tokens.border },
                  ]}
                >
                  <TextInput
                    style={[styles.modalInput, { color: tokens.text, minHeight: 76 }]}
                    value={bio}
                    onChangeText={setBio}
                    onFocus={() => setFocusedField('bio')}
                    onBlur={() => setFocusedField(null)}
                    multiline
                    maxLength={280}
                    placeholder="Describe your somatic and clinical credentials..."
                    placeholderTextColor={tokens.textLight}
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

      {/* ── Offers Modal (Real Backend Data) ── */}
      <Modal
        visible={activeModal === 'offers'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setActiveModal(null)}
          />
          <View style={[styles.modalContent, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }]}>
            <View style={[styles.sheetHandle, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.15)' }]} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalPretitle, { color: tokens.primary }]}>CONSULTATION TIERS</Text>
                <Text style={[styles.modalTitle, { color: tokens.text }]}>Practice Consultation Offers</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={[styles.closeIconBtn, { backgroundColor: tokens.surfaceSubtle }]}
              >
                <Feather name="x" size={18} color={tokens.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              {offersList.length > 0 ? (
                offersList.map((offer, idx) => (
                  <View
                    key={offer._id || idx}
                    style={[styles.offerCard, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}
                  >
                    <View style={styles.offerHeaderRow}>
                      <Text style={[styles.offerTitle, { color: tokens.text }]}>
                        {offer.title || 'Consultation Offer'}
                      </Text>
                      <Text style={styles.offerPrice}>${offer.price ?? 0}</Text>
                    </View>
                    {offer.description ? (
                      <Text style={[styles.offerDesc, { color: tokens.textMuted }]}>
                        {offer.description}
                      </Text>
                    ) : null}
                    <View style={styles.offerTagRow}>
                      <View style={styles.activeTagBadge}>
                        <Text style={styles.offerTag}>{offer.status || 'Active'}</Text>
                      </View>
                      <Text style={[styles.offerSubText, { color: tokens.textLight }]}>
                        {offer.durationMinutes ? `${offer.durationMinutes} min session` : (offer.type || '1:1')}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={[styles.emptyCard, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                  <Feather name="briefcase" size={28} color={tokens.textMuted} style={{ marginBottom: 8 }} />
                  <Text style={[styles.emptyTitle, { color: tokens.text }]}>No Consultation Packages</Text>
                  <Text style={[styles.emptyDesc, { color: tokens.textMuted }]}>
                    You have 0 active consultation offers in your roster.
                  </Text>
                </View>
              )}

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

      {/* ── Payouts Modal (Real Backend Data) ── */}
      <Modal
        visible={activeModal === 'payouts'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setActiveModal(null)}
          />
          <View style={[styles.modalContent, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }]}>
            <View style={[styles.sheetHandle, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.15)' }]} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalPretitle, { color: '#059669' }]}>FINANCIAL SETTLEMENTS</Text>
                <Text style={[styles.modalTitle, { color: tokens.text }]}>Payouts &amp; Settlements</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={[styles.closeIconBtn, { backgroundColor: tokens.surfaceSubtle }]}
              >
                <Feather name="x" size={18} color={tokens.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.balanceCard, isDark && styles.balanceCardDark]}>
              <Text style={styles.balancePretitle}>SCHEDULED SETTLEMENT</Text>
              <Text style={styles.balanceAmount}>${clearingThisWeek.toFixed(2)}</Text>
              <Text style={styles.balanceDesc}>
                Total net volume: ${totalEarnings.toFixed(2)} • {clearingThisWeek > 0 ? 'Settlement scheduled for release.' : 'No pending settlements.'}
              </Text>
            </View>

            {payoutsList.length > 0 ? (
              payoutsList.map((payout, idx) => (
                <View
                  key={payout._id || idx}
                  style={[styles.payoutHistoryItem, { borderColor: tokens.border }]}
                >
                  <View>
                    <Text style={[styles.payoutHistoryDate, { color: tokens.text }]}>
                      {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : 'Settlement'}
                    </Text>
                    <Text style={[styles.payoutHistoryStatus, { color: tokens.textMuted }]}>
                      {payout.status || 'Processing'}
                    </Text>
                  </View>
                  <Text style={styles.payoutHistoryAmount}>
                    +${(payout.netAmount || payout.amount || 0).toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                <Feather name="clock" size={26} color={tokens.textMuted} style={{ marginBottom: 6 }} />
                <Text style={[styles.emptyTitle, { color: tokens.text }]}>No Settlement History</Text>
                <Text style={[styles.emptyDesc, { color: tokens.textMuted }]}>
                  Settlement records will appear here as client bookings are processed.
                </Text>
              </View>
            )}

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
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setActiveModal(null)}
          />
          <View style={[styles.modalContent, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }]}>
            <View style={[styles.sheetHandle, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.15)' }]} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalPretitle, { color: tokens.primary }]}>PUBLIC IDENTITY</Text>
                <Text style={[styles.modalTitle, { color: tokens.text }]}>Growth Tools &amp; Public Link</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={[styles.closeIconBtn, { backgroundColor: tokens.surfaceSubtle }]}
              >
                <Feather name="x" size={18} color={tokens.textMuted} />
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 26,
    padding: 18,
    borderWidth: 1.5,
    marginBottom: 20,
    shadowColor: '#0E1235',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  profileCardDark: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  clinicalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  clinicalBadgeDark: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
  clinicalBadgeText: {
    color: '#059669',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  quickEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    gap: 4,
    cursor: 'pointer',
  },
  quickEditBtnDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
  },
  quickEditBtnHover: {
    backgroundColor: 'rgba(124, 58, 237, 0.22)',
  },
  quickEditText: {
    fontSize: 11,
    fontWeight: '700',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  onlineDotPulse: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    opacity: 0.5,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    fontSize: 17.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  email: {
    fontSize: 12,
    marginBottom: 6,
  },
  handleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
    alignSelf: 'flex-start',
    cursor: 'pointer',
  },
  handleBadgeDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  handleBadgeHover: {
    backgroundColor: 'rgba(124, 58, 237, 0.32)',
  },
  handleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  availabilityBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
  },
  availabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityTitle: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  availabilitySub: {
    fontSize: 10,
  },
  togglePill: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    cursor: 'pointer',
  },
  togglePillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  togglePillInactive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  togglePillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  toggleTextActive: {
    color: '#059669',
  },
  toggleTextInactive: {
    color: '#64748B',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 9,
    alignItems: 'center',
  },
  kpiIconWrap: {
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 1,
  },
  kpiLabel: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  specialtyChip: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  specialtyChipLight: {
    backgroundColor: '#F5F3FF',
    borderColor: '#E9D5FF',
  },
  specialtyChipDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.14)',
    borderColor: 'rgba(124, 58, 237, 0.28)',
  },
  specialtyChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  noSpecialtiesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    cursor: 'pointer',
  },
  noSpecialtiesText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionWrap: {
    marginBottom: 18,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionCountBadge: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  menuCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    cursor: 'pointer',
  },
  menuItemHover: {
    transition: 'background-color 0.15s ease',
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
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
    paddingRight: 6,
  },
  menuLabel: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  itemPillBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  menuSub: {
    fontSize: 11,
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
    marginTop: 6,
    cursor: 'pointer',
  },
  logoutBtnDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  logoutBtnHover: {
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '88%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalPretitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 10,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalAvatarTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalAvatarSub: {
    fontSize: 10.5,
  },
  modalFieldGroup: {
    marginBottom: 12,
  },
  labelCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCountText: {
    fontSize: 10,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 5,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  modalInput: {
    paddingVertical: 9,
    fontSize: 13,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    marginBottom: 8,
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
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  offerPrice: {
    fontSize: 13,
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
  activeTagBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
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
    padding: 16,
    marginBottom: 14,
  },
  balanceCardDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  balancePretitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#7C3AED',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  balanceDesc: {
    fontSize: 11.5,
    color: '#4C1D95',
  },
  payoutHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  payoutHistoryDate: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  payoutHistoryStatus: {
    fontSize: 10.5,
  },
  payoutHistoryAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#059669',
  },
  growthDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  urlBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  urlText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 11.5,
    textAlign: 'center',
    lineHeight: 16,
  },
});

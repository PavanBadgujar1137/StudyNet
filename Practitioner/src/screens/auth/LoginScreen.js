import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar as NativeStatusBar,
  Image,
  Animated,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();

  const topInset =
    Platform.OS === 'web'
      ? 12
      : Math.max(
          insets?.top || 0,
          Platform.OS === 'android' ? NativeStatusBar.currentHeight || 0 : 0
        );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Floating animation for illustration & badges
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your practitioner email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    const result = await login(trimmedEmail, password);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  // Color tokens tailored to the reference image
  const colors = {
    bg: isDark ? '#080C24' : '#F1EFFF',
    blob1: isDark ? 'rgba(124, 58, 237, 0.16)' : 'rgba(216, 180, 254, 0.55)',
    blob2: isDark ? 'rgba(79, 70, 229, 0.12)' : 'rgba(224, 231, 255, 0.6)',
    cardBg: isDark ? '#0E1738' : '#FFFFFF',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(237, 233, 254, 0.9)',
    cardShadow: isDark ? '#000000' : 'rgba(109, 40, 217, 0.12)',
    textPrimary: isDark ? '#F8FAFC' : '#0B0F2A',
    textSecondary: isDark ? '#CBD5E1' : '#475569',
    textMuted: isDark ? '#94A3B8' : '#64748B',
    textLight: isDark ? '#64748B' : '#94A3B8',
    primary: isDark ? '#A78BFA' : '#652BEB',
    primaryDeep: isDark ? '#8B5CF6' : '#5920D9',
    badgeBg: isDark ? 'rgba(124, 58, 237, 0.18)' : '#EDE7FF',
    badgeBorder: isDark ? 'rgba(167, 139, 250, 0.3)' : '#DDD4FE',
    badgeText: isDark ? '#C4B5FD' : '#652BEB',
    inputBg: isDark ? '#131C3E' : '#F8FAFC',
    inputBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
    iconBg: isDark ? 'rgba(167, 139, 250, 0.12)' : '#EDE7FF',
    toggleBg: isDark ? '#141E44' : '#FFFFFF',
    toggleBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: colors.bg }]}
    >
      {/* Background Soft Blobs */}
      <View style={[styles.ambientBlobTop, { backgroundColor: colors.blob1 }]} />
      <View style={[styles.ambientBlobHero, { backgroundColor: colors.blob2 }]} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingTop: topInset + 6,
            paddingBottom: Math.max(insets?.bottom || 0, 24),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.responsiveWrapper}>
          {/* Top Bar with Brand and Dark/Light Mode Pill Toggle */}
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <View style={[styles.brandIconBox, { backgroundColor: colors.primary }]}>
                <Ionicons name="flash" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                  Open<Text style={{ color: colors.primary }}>Hand</Text>
                </Text>
                <Text style={[styles.brandTagline, { color: colors.textMuted }]}>
                  AI-Powered Clinical Copilot
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.themeToggleBtn,
                {
                  backgroundColor: colors.toggleBg,
                  borderColor: colors.toggleBorder,
                },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={13}
                color={isDark ? '#FBBF24' : '#652BEB'}
              />
              <Text
                style={[
                  styles.themeToggleText,
                  { color: isDark ? '#E2E8F0' : '#1E293B' },
                ]}
              >
                {isDark ? 'Light' : 'Dark'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hero Section: Welcome Text (Left) + AI Healthcare Illustration (Right) */}
          <View style={styles.heroSection}>
            <View style={styles.heroTextColumn}>
              <Text style={[styles.heroHeading, { color: colors.textPrimary }]}>
                Welcome Back to
              </Text>
              <Text style={[styles.heroTitleAccent, { color: colors.primary }]}>
                Practitioner
              </Text>
              <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
                Sign in below to manage client sessions, host live classes, and access your clinical AURA copilot.
              </Text>
            </View>

            <Animated.View
              style={[
                styles.heroIllustrationContainer,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              {/* Soft purple radial halo */}
              <View
                style={[
                  styles.heroCircleGlow,
                  {
                    backgroundColor: isDark
                      ? 'rgba(124, 58, 237, 0.22)'
                      : 'rgba(196, 181, 253, 0.45)',
                  },
                ]}
              />

              <Image
                source={require('../../../assets/hero_doctor.png')}
                style={styles.heroDoctorImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* Alerts */}
          {successMessage ? (
            <View style={styles.alertBoxSuccess}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.alertTextSuccess}>{successMessage}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.alertBoxError}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.alertTextError}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Login Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
                shadowColor: colors.cardShadow,
              },
            ]}
          >
            {/* Pill Badge Centered */}
            <View style={styles.badgeWrapper}>
              <View
                style={[
                  styles.portalBadge,
                  {
                    backgroundColor: colors.badgeBg,
                    borderColor: colors.badgeBorder,
                  },
                ]}
              >
                <Feather
                  name="shield"
                  size={12}
                  color={colors.badgeText}
                  style={styles.badgeShieldIcon}
                />
                <Text style={[styles.portalBadgeText, { color: colors.badgeText }]}>
                  PRACTITIONER PORTAL
                </Text>
              </View>
            </View>

            {/* Email Address Field */}
            <View style={styles.formGroup}>
              <View style={styles.fieldLabelRow}>
                <Feather name="mail" size={13} color={colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Email Address <Text style={styles.asterisk}>*</Text>
                </Text>
              </View>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Feather
                  name="mail"
                  size={16}
                  color={colors.textMuted}
                  style={styles.inputLeadingIcon}
                />
                <TextInput
                  style={[styles.inputElement, { color: colors.textPrimary }]}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="23030331245011@dbatu.ac.in"
                  placeholderTextColor={colors.textLight}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.formGroup}>
              <View style={styles.passwordLabelRow}>
                <View style={styles.fieldLabelRow}>
                  <Feather name="lock" size={13} color={colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    Password <Text style={styles.asterisk}>*</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.forgotPasswordLink, { color: colors.primary }]}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Feather
                  name="lock"
                  size={16}
                  color={colors.textMuted}
                  style={styles.inputLeadingIcon}
                />
                <TextInput
                  style={[styles.inputElement, { color: colors.textPrimary }]}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textLight}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeToggleButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  accessibilityLabel="Toggle password visibility"
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In CTA Button */}
            <TouchableOpacity
              style={[
                styles.ctaButton,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
                loading && styles.ctaButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <View style={styles.buttonInnerRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.ctaButtonText}>Authenticating...</Text>
                </View>
              ) : (
                <View style={styles.buttonInnerRow}>
                  <Text style={styles.ctaButtonText}>Sign In as Practitioner</Text>
                  <Feather name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </View>
              )}
            </TouchableOpacity>

            {/* Apply as Practitioner link */}
            <View style={styles.signupPromptRow}>
              <Text style={[styles.signupPromptText, { color: colors.textMuted }]}>
                New to OpenHand?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                activeOpacity={0.7}
              >
                <Text style={[styles.signupPromptLink, { color: colors.primary }]}>
                  Apply as Practitioner
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4 Feature Highlights */}
          <View style={styles.featuresRow}>
            {/* Feature 1 */}
            <View style={styles.featureItem}>
              <View style={[styles.featureIconContainer, { backgroundColor: colors.iconBg }]}>
                <Feather name="shield" size={17} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                Secure &{'\n'}Compliant
              </Text>
            </View>

            {/* Feature 2 */}
            <View style={styles.featureItem}>
              <View style={[styles.featureIconContainer, { backgroundColor: colors.iconBg }]}>
                <MaterialCommunityIcons name="brain" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                AI Co-Pilot{'\n'}Assistance
              </Text>
            </View>

            {/* Feature 3 */}
            <View style={styles.featureItem}>
              <View style={[styles.featureIconContainer, { backgroundColor: colors.iconBg }]}>
                <Ionicons name="people" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                Better Patient{'\n'}Outcomes
              </Text>
            </View>

            {/* Feature 4 */}
            <View style={styles.featureItem}>
              <View style={[styles.featureIconContainer, { backgroundColor: colors.iconBg }]}>
                <Ionicons name="flash" size={17} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                Built for{'\n'}Healthcare
              </Text>
            </View>
          </View>

          {/* Footer Notices */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerLearnerNotice, { color: colors.textMuted }]}>
              Are you a learner or client?{' '}
              <Text style={[styles.footerLearnerLink, { color: colors.primary }]}>
                Please use the OpenHand Learner App
              </Text>
            </Text>

            <View style={styles.footerSecurityRow}>
              <Feather name="lock" size={11} color={colors.textLight} style={{ marginRight: 5 }} />
              <Text style={[styles.footerSecurityText, { color: colors.textLight }]}>
                Protected by OpenHand Healthcare &amp; Clinical Data Standards
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 480,
  },

  // Ambient Blobs
  ambientBlobTop: {
    position: 'absolute',
    top: -90,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  ambientBlobHero: {
    position: 'absolute',
    top: 60,
    right: -30,
    width: 250,
    height: 250,
    borderRadius: 125,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 25,
  },
  brandTagline: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    gap: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  themeToggleText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Hero Section
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 6,
    position: 'relative',
    minHeight: 180,
  },
  heroTextColumn: {
    flex: 1.1,
    paddingRight: 8,
    zIndex: 2,
  },
  heroHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  heroTitleAccent: {
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -0.6,
    lineHeight: 33,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '400',
  },
  heroIllustrationContainer: {
    width: 155,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroCircleGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: 15,
    right: 5,
  },
  heroDoctorImage: {
    width: 155,
    height: 176,
    borderRadius: 22,
    zIndex: 1,
  },

  // Alerts
  alertBoxSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  alertTextSuccess: {
    color: '#065F46',
    fontSize: 12.5,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  alertBoxError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  alertTextError: {
    color: '#991B1B',
    fontSize: 12.5,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },

  // Card
  card: {
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 4,
    marginBottom: 20,
  },
  badgeWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  portalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 5.5,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeShieldIcon: {
    marginRight: 6,
  },
  portalBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // Form
  formGroup: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  asterisk: {
    color: '#EF4444',
  },
  forgotPasswordLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.2,
    paddingHorizontal: 13,
    height: 48,
  },
  inputLeadingIcon: {
    marginRight: 9,
  },
  inputElement: {
    flex: 1,
    height: '100%',
    fontSize: 13.5,
    fontWeight: '500',
  },
  eyeToggleButton: {
    padding: 6,
  },

  // CTA Button
  ctaButton: {
    borderRadius: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  buttonInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Signup Link
  signupPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signupPromptText: {
    fontSize: 12.5,
  },
  signupPromptLink: {
    fontSize: 12.5,
    fontWeight: '800',
  },

  // Features Row
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 10.5,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Footer
  footerContainer: {
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingBottom: 8,
  },
  footerLearnerNotice: {
    fontSize: 11.5,
    textAlign: 'center',
  },
  footerLearnerLink: {
    fontWeight: '700',
  },
  footerSecurityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  footerSecurityText: {
    fontSize: 10.5,
    textAlign: 'center',
  },
});


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
  Alert,
  StatusBar as NativeStatusBar,
  Image,
  Animated,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';

export default function SignupScreen({ navigation }) {
  const { signup, sendOtp } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const topInset =
    Platform.OS === 'web'
      ? 12
      : Math.max(
          insets?.top || 0,
          Platform.OS === 'android' ? NativeStatusBar.currentHeight || 0 : 0
        );

  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Subtle floating animation for the hero badge
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

  const handleSendOtp = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Please enter your legal first and last name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid practitioner email.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    const res = await sendOtp(email.trim(), 'signup');
    setLoading(false);

    if (res.success) {
      setStep(2);
      Alert.alert(
        'Verification OTP Sent',
        `A verification code has been dispatched to ${email.trim()}.`
      );
    } else {
      setErrorMessage(res.error || 'Failed to send OTP.');
    }
  };

  const handleCompleteSignup = async () => {
    if (!otp.trim()) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    const result = await signup({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      contactNumber,
      otp,
    });
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Registration failed.');
    }
  };

  // Color tokens tailored to the lavender-white-violet aesthetic
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
    badgeBg: isDark ? 'rgba(124, 58, 237, 0.18)' : '#EDE7FF',
    badgeBorder: isDark ? 'rgba(167, 139, 250, 0.3)' : '#DDD4FE',
    badgeText: isDark ? '#C4B5FD' : '#652BEB',
    inputBg: isDark ? '#131C3E' : '#F8FAFC',
    inputBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
    toggleBg: isDark ? '#141E44' : '#FFFFFF',
    toggleBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
    dividerColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.7)',
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: colors.bg }]}
    >
      {/* Background Soft Blobs */}
      <View style={[styles.ambientBlobTop, { backgroundColor: colors.blob1 }]} />
      <View style={[styles.ambientBlobHero, { backgroundColor: colors.blob2 }]} />
      <View style={[styles.ambientSphereBottom, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(196, 181, 253, 0.6)' }]} />

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
          {/* Top Bar with Back Button and Theme Toggle */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: colors.toggleBg,
                  borderColor: colors.toggleBorder,
                },
              ]}
              onPress={() => (step === 2 ? setStep(1) : navigation.navigate('Login'))}
              activeOpacity={0.8}
            >
              <Feather name="arrow-left" size={16} color={colors.primary} />
              <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>
                {step === 2 ? 'Edit Information' : 'Back to Sign In'}
              </Text>
            </TouchableOpacity>

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

          {/* Hero Section: Title & Subtitle Left + 3D Medical AI Badge Right */}
          <View style={styles.heroSection}>
            <View style={styles.heroTextColumn}>
              {/* Role Pill Badge */}
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
                    size={11}
                    color={colors.badgeText}
                    style={styles.badgeShieldIcon}
                  />
                  <Text style={[styles.portalBadgeText, { color: colors.badgeText }]}>
                    CLINICAL PRACTITIONER APPLICATION
                  </Text>
                </View>
              </View>

              <Text style={[styles.heroHeading, { color: colors.textPrimary }]}>
                Join as{' '}
                <Text style={{ color: colors.primary }}>Practitioner</Text>
              </Text>
              <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
                Host 1-on-1 consultations, facilitate peer growth circles, and utilize our clinical AI Co-Pilot.
              </Text>
            </View>

            <Animated.View
              style={[
                styles.heroIllustrationContainer,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              <Image
                source={require('../../../assets/signup_hero_badge.png')}
                style={styles.heroBadgeImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* Error Alert Box */}
          {errorMessage ? (
            <View style={styles.alertBoxError}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.alertTextError}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Main Card */}
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
            {step === 1 ? (
              <>
                {/* First Name & Last Name 2-Column Row */}
                <View style={styles.nameRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      First Name <Text style={styles.asterisk}>*</Text>
                    </Text>
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
                        name="user"
                        size={15}
                        color={colors.textMuted}
                        style={styles.inputLeadingIcon}
                      />
                      <TextInput
                        style={[styles.inputElement, { color: colors.textPrimary }]}
                        value={firstName}
                        onChangeText={(val) => {
                          setFirstName(val);
                          if (errorMessage) setErrorMessage('');
                        }}
                        placeholder="Evelyn"
                        placeholderTextColor={colors.textLight}
                      />
                    </View>
                  </View>

                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      Last Name <Text style={styles.asterisk}>*</Text>
                    </Text>
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
                        name="user"
                        size={15}
                        color={colors.textMuted}
                        style={styles.inputLeadingIcon}
                      />
                      <TextInput
                        style={[styles.inputElement, { color: colors.textPrimary }]}
                        value={lastName}
                        onChangeText={(val) => {
                          setLastName(val);
                          if (errorMessage) setErrorMessage('');
                        }}
                        placeholder="Vance"
                        placeholderTextColor={colors.textLight}
                      />
                    </View>
                  </View>
                </View>

                {/* Professional Email Field */}
                <View style={styles.formGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    Professional Email <Text style={styles.asterisk}>*</Text>
                  </Text>
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
                      size={15}
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
                      placeholder="doctor@openhand.live"
                      placeholderTextColor={colors.textLight}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                      autoComplete="email"
                    />
                  </View>
                </View>

                {/* Phone / Contact Field */}
                <View style={styles.formGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    Phone / Contact
                  </Text>
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
                      name="phone"
                      size={15}
                      color={colors.textMuted}
                      style={styles.inputLeadingIcon}
                    />
                    <TextInput
                      style={[styles.inputElement, { color: colors.textPrimary }]}
                      value={contactNumber}
                      onChangeText={(val) => {
                        setContactNumber(val);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="+91 98765 43210"
                      placeholderTextColor={colors.textLight}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Create Password Field */}
                <View style={styles.formGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    Create Password <Text style={styles.asterisk}>*</Text>
                  </Text>
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
                      size={15}
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

                {/* Confirm Password Field */}
                <View style={styles.formGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    Confirm Password <Text style={styles.asterisk}>*</Text>
                  </Text>
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
                      name="check"
                      size={15}
                      color={colors.textMuted}
                      style={styles.inputLeadingIcon}
                    />
                    <TextInput
                      style={[styles.inputElement, { color: colors.textPrimary }]}
                      value={confirmPassword}
                      onChangeText={(val) => {
                        setConfirmPassword(val);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Repeat password"
                      placeholderTextColor={colors.textLight}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.ctaButton,
                    {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                    },
                    loading && styles.ctaButtonDisabled,
                  ]}
                  onPress={handleSendOtp}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <View style={styles.buttonInnerRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.ctaButtonText}>Sending verification...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonInnerRow}>
                      <Text style={styles.ctaButtonText}>Verify Email &amp; Continue</Text>
                      <Feather name="arrow-right" size={17} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    </View>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              /* Step 2: OTP Verification */
              <View style={styles.otpContainer}>
                <View
                  style={[
                    styles.otpIconWrap,
                    {
                      backgroundColor: colors.badgeBg,
                      borderColor: colors.badgeBorder,
                    },
                  ]}
                >
                  <Feather name="mail" size={26} color={colors.primary} />
                </View>
                <Text style={[styles.otpTitle, { color: colors.textPrimary }]}>
                  Enter 6-Digit Code
                </Text>
                <Text style={[styles.otpDesc, { color: colors.textMuted }]}>
                  We sent a temporary verification code to{' '}
                  <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{email}</Text>
                </Text>

                <View style={[styles.formGroup, { width: '100%', marginTop: 8 }]}>
                  <View
                    style={[
                      styles.inputBox,
                      styles.otpInputWrapper,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.inputElement,
                        styles.otpInput,
                        { color: colors.textPrimary },
                      ]}
                      value={otp}
                      onChangeText={(val) => {
                        setOtp(val);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="123456"
                      placeholderTextColor={colors.textLight}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.ctaButton,
                    {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                      width: '100%',
                    },
                    loading && styles.ctaButtonDisabled,
                  ]}
                  onPress={handleCompleteSignup}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <View style={styles.buttonInnerRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.ctaButtonText}>Completing registration...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonInnerRow}>
                      <Text style={styles.ctaButtonText}>Complete Registration</Text>
                      <Feather name="arrow-right" size={17} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={handleSendOtp}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resendText, { color: colors.primary }]}>
                    Didn't receive code? Resend OTP
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom Row: Already have an account? Sign In */}
            <View style={[styles.switchContainer, { borderTopColor: colors.dividerColor }]}>
              <View style={[styles.dividerLine, { backgroundColor: colors.dividerColor }]} />
              <View style={styles.switchRow}>
                <Text style={[styles.switchText, { color: colors.textMuted }]}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.switchLink, { color: colors.primary }]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.dividerLine, { backgroundColor: colors.dividerColor }]} />
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

  // Ambient Blobs & Spheres
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
    top: 50,
    right: -20,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  ambientSphereBottom: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 6,
  },
  backButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
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
    paddingVertical: 4,
    position: 'relative',
    minHeight: 140,
  },
  heroTextColumn: {
    flex: 1.2,
    paddingRight: 6,
    zIndex: 2,
  },
  badgeWrapper: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  portalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeShieldIcon: {
    marginRight: 5,
  },
  portalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  heroHeading: {
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.6,
    lineHeight: 32,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
  },
  heroIllustrationContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeImage: {
    width: 120,
    height: 120,
  },

  // Alert Box
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

  // Form Fields
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  asterisk: {
    color: '#EF4444',
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

  // Switch to Login Row with subtle divider
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  switchText: {
    fontSize: 12.5,
  },
  switchLink: {
    fontSize: 12.5,
    fontWeight: '800',
  },

  // OTP Step Elements
  otpContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  otpIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  otpTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 6,
  },
  otpDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  otpInputWrapper: {
    justifyContent: 'center',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '800',
  },
  resendBtn: {
    marginTop: 16,
    paddingVertical: 6,
  },
  resendText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});


import React, { useState } from 'react';
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
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { isDark, toggleTheme, tokens } = useAppTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.keyboardContainer, { backgroundColor: tokens.backgroundSolid }]}
    >
      {/* Ambient Watercolor / Glow Blobs */}
      {!isDark && (
        <>
          <View style={styles.ambientBlobTopRight} />
          <View style={styles.ambientBlobCenter} />
          <View style={styles.ambientBlobLeft} />
        </>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar with Status Badge & Theme Toggle */}
        <View style={styles.topBar}>
          <View style={[styles.platformBadge, isDark && styles.platformBadgeDark]}>
            <View style={styles.liveDot} />
            <Text style={[styles.platformBadgeText, isDark && styles.textWhite]}>
              OpenHand Practice Cloud
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.themePillBtn, isDark && styles.themePillBtnDark]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={13}
              color={isDark ? '#FBBF24' : '#7C3AED'}
            />
            <Text style={[styles.themePillText, isDark && styles.themePillTextDark]}>
              {isDark ? 'Light' : 'Dark'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Brand Headline */}
        <View style={styles.headlineContainer}>
          <View style={styles.brandLogoRow}>
            <View style={[styles.brandIconSquare, isDark && styles.brandIconSquareDark]}>
              <Ionicons name="flash" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.brandNameText, { color: tokens.text }]}>
              Open<Text style={styles.brandNameAccent}>Hand</Text>
            </Text>
          </View>

          <Text style={[styles.headlineTitle, { color: tokens.text }]}>
            Welcome Back to{' '}
            <Text style={{ color: isDark ? '#A78BFA' : '#7C3AED' }}>Practitioner</Text>
          </Text>
          <Text style={[styles.headlineSubtitle, { color: tokens.textMuted }]}>
            Sign in below to manage client sessions, host live classes, and access your clinical AURA copilot.
          </Text>
        </View>

        {/* Error Alert Box */}
        {errorMessage ? (
          <View style={styles.errorAlertBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorAlertText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* ── Practitioner Login Card ── */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: tokens.card,
              borderColor: tokens.cardBorder,
            },
          ]}
        >
          {/* Card Role Header Badge */}
          <View style={styles.roleBadgeContainer}>
            <View style={[styles.roleBadge, isDark && styles.roleBadgeDark]}>
              <Feather name="shield" size={11} color={isDark ? '#A78BFA' : '#7C3AED'} style={{ marginRight: 5 }} />
              <Text style={[styles.roleBadgeText, isDark && { color: '#A78BFA' }]}>
                PRACTITIONER PORTAL
              </Text>
            </View>
          </View>

          <Text style={[styles.cardTitle, { color: isDark ? '#C4B5FD' : '#7C3AED' }]}>
            Practitioner Sign In
          </Text>
          <Text style={[styles.cardDescription, { color: tokens.textMuted }]}>
            Manage client sessions, utilize AI Co-Pilot notes, and monitor practice earnings.
          </Text>

          {/* Feature Pills Row */}
          <View style={styles.pillsRow}>
            <View style={[styles.pill, isDark && styles.pillDark]}>
              <Text style={styles.pillEmoji}>💼</Text>
              <Text style={[styles.pillText, isDark && { color: '#C4B5FD' }]}>Practice Hub</Text>
            </View>
            <View style={[styles.pill, isDark && styles.pillDark]}>
              <Text style={styles.pillEmoji}>📊</Text>
              <Text style={[styles.pillText, isDark && { color: '#C4B5FD' }]}>Client Analytics</Text>
            </View>
            <View style={[styles.pill, isDark && styles.pillDark]}>
              <Text style={styles.pillEmoji}>⚡</Text>
              <Text style={[styles.pillText, isDark && { color: '#C4B5FD' }]}>AI Co-Pilot</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>
                Email Address <Text style={styles.asterisk}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border },
                ]}
              >
                <Feather name="mail" size={16} color={tokens.textMuted} style={styles.inputLeadingIcon} />
                <TextInput
                  style={[styles.textInput, { color: tokens.text }]}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="doctor@openhand.live"
                  placeholderTextColor={tokens.textLight}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.passwordHeaderRow}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary, marginBottom: 0 }]}>
                  Password <Text style={styles.asterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.forgotText, { color: isDark ? '#A78BFA' : '#7C3AED' }]}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border, marginTop: 6 },
                ]}
              >
                <Feather name="lock" size={16} color={tokens.textMuted} style={styles.inputLeadingIcon} />
                <TextInput
                  style={[styles.textInput, { color: tokens.text }]}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  placeholderTextColor={tokens.textLight}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIconButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={tokens.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Authenticating...</Text>
                </View>
              ) : (
                <View style={styles.buttonInner}>
                  <Text style={styles.submitButtonText}>Sign In as Practitioner</Text>
                  <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </View>
              )}
            </TouchableOpacity>


            {/* Create Account Link */}
            <View style={styles.signupWrap}>
              <Text style={[styles.signupText, { color: tokens.textMuted }]}>New to OpenHand? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
                <Text style={[styles.signupLink, { color: isDark ? '#A78BFA' : '#7C3AED' }]}>
                  Apply as Practitioner
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer info */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerLearnerNotice, { color: tokens.textMuted }]}>
            Are you a learner or client?{' '}
            <Text style={{ color: '#2563EB', fontWeight: '700' }}>
              Please use the OpenHand Learner App
            </Text>
          </Text>
          <Text style={[styles.footerPrivacyNotice, { color: tokens.textLight }]}>
            🔒 Protected by OpenHand Healthcare &amp; Clinical Data Standards
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  ambientBlobTopRight: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(221, 214, 254, 0.45)',
  },
  ambientBlobCenter: {
    position: 'absolute',
    top: '35%',
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(219, 234, 254, 0.4)',
  },
  ambientBlobLeft: {
    position: 'absolute',
    bottom: 50,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(237, 233, 254, 0.35)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  platformBadgeDark: {
    backgroundColor: '#0E1738',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 7,
  },
  platformBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  textWhite: {
    color: '#F8FAFC',
  },
  themePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  themePillBtnDark: {
    backgroundColor: '#0E1738',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  themePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  themePillTextDark: {
    color: '#E2E8F0',
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  brandLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandIconSquare: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  brandIconSquareDark: {
    backgroundColor: '#6D28D9',
  },
  brandNameText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  brandNameAccent: {
    color: '#7C3AED',
  },
  headlineTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  headlineSubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  errorAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorAlertText: {
    color: '#991B1B',
    fontSize: 12.5,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  card: {
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  roleBadgeContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  roleBadgeDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 18,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  pillDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderColor: 'rgba(124, 58, 237, 0.25)',
  },
  pillEmoji: {
    fontSize: 11,
    marginRight: 4,
  },
  pillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6D28D9',
  },
  formContainer: {
    marginTop: 2,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  asterisk: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  inputLeadingIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 13.5,
    fontWeight: '500',
  },
  eyeIconButton: {
    padding: 6,
  },
  forgotText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    marginHorizontal: 10,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    borderRadius: 13,
    paddingVertical: 11,
    gap: 6,
  },
  demoButtonDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  demoButtonText: {
    color: '#6D28D9',
    fontSize: 12.5,
    fontWeight: '700',
  },
  signupWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  signupText: {
    fontSize: 12,
  },
  signupLink: {
    fontSize: 12,
    fontWeight: '800',
  },
  footerContainer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 6,
  },
  footerLearnerNotice: {
    fontSize: 11.5,
    textAlign: 'center',
  },
  footerPrivacyNotice: {
    fontSize: 10.5,
    textAlign: 'center',
  },
});

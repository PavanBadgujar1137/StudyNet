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
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
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

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Please use the OpenHand web portal (openhand.live/forgot-password) to initiate a secure password reset link to your verified email.',
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 24), paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Ambient Top Glow Badges */}
        <View style={styles.topBar}>
          <View style={styles.platformBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.platformBadgeText}>OpenHand Practice Cloud</Text>
          </View>
        </View>

        {/* Brand Headline (Matches web headline bar) */}
        <View style={styles.headlineContainer}>
          <View style={styles.brandLogoRow}>
            <View style={styles.brandIconSquare}>
              <Text style={styles.brandIconEmoji}>⚡</Text>
            </View>
            <Text style={styles.brandNameText}>
              Open<Text style={styles.brandNameAccent}>Hand</Text>
            </Text>
          </View>

          <Text style={styles.headlineTitle}>
            Welcome Back to <Text style={styles.headlineGradient}>Practitioner</Text>
          </Text>
          <Text style={styles.headlineSubtitle}>
            Sign in below to manage your client sessions, host live classes, and access your clinical AURA copilot.
          </Text>
        </View>

        {/* Error Alert Box */}
        {errorMessage ? (
          <View style={styles.errorAlertBox}>
            <View style={styles.errorIconWrap}>
              <Text style={styles.errorIconText}>⚠️</Text>
            </View>
            <Text style={styles.errorAlertText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* ── Practitioner Login Card (Faithful to Web Right Column) ── */}
        <View style={styles.card}>
          {/* Card Role Header Badge */}
          <View style={styles.roleBadgeContainer}>
            <View style={styles.roleBadge}>
              <Feather name="shield" size={12} color="#6D28D9" style={{ marginRight: 4 }} />
              <Text style={styles.roleBadgeText}>PRACTITIONER PORTAL</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>Practitioner Sign In</Text>
          <Text style={styles.cardDescription}>
            Manage your client sessions, host live classes, utilize AI Co-Pilot notes, and monitor your practice earnings.
          </Text>

          {/* Feature Pills Row (Matches web pills row verbatim) */}
          <View style={styles.pillsRow}>
            <View style={styles.pill}>
              <Text style={styles.pillEmoji}>💼</Text>
              <Text style={styles.pillText}>Practice Hub</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillEmoji}>📊</Text>
              <Text style={styles.pillText}>Client Analytics</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillEmoji}>⚡</Text>
              <Text style={styles.pillText}>AI Co-Pilot</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Email Address <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={18} color="#94A3B8" style={styles.inputLeadingIcon} />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="you@example.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Password <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#94A3B8" style={styles.inputLeadingIcon} />
                <TextInput
                  style={[styles.textInput, { paddingRight: 44 }]}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIconButton}
                  onPress={() => setShowPassword((prev) => !prev)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password Link */}
              <View style={styles.forgotRow}>
                <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>Authenticating...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Sign In as Practitioner →</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Guidance */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerLearnerNotice}>
            Are you a learner or client?{' '}
            <Text style={styles.footerLearnerLink}>Please use the OpenHand Learner App</Text>
          </Text>

          <Text style={styles.footerPrivacyNotice}>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  topBar: {
    alignItems: 'center',
    marginBottom: 16,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 7,
  },
  platformBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.3,
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandIconSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  brandIconEmoji: {
    fontSize: 16,
    color: '#FFF',
  },
  brandNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandNameAccent: {
    color: '#7C3AED',
  },
  headlineTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  headlineGradient: {
    color: '#7C3AED',
  },
  headlineSubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
  },
  errorAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorIconWrap: {
    marginRight: 10,
  },
  errorIconText: {
    fontSize: 16,
  },
  errorAlertText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    padding: 22,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  roleBadgeContainer: {
    alignItems: 'center',
    marginBottom: 10,
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
  roleBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 12.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  pillEmoji: {
    fontSize: 12,
    marginRight: 5,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6D28D9',
  },
  formContainer: {
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  asterisk: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputLeadingIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  eyeIconButton: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  submitButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  footerContainer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  footerLearnerNotice: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  footerLearnerLink: {
    color: '#2563EB',
    fontWeight: '700',
  },
  footerPrivacyNotice: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
});


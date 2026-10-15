import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

export default function SignupScreen({ navigation }) {
  const { signup, sendOtp } = useAuth();

  const [step, setStep] = useState(1); // 1: Info & OTP trigger, 2: OTP verification
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateBasicInfo = () => {
    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name.');
      return false;
    }
    if (!lastName.trim()) {
      setErrorMessage('Please enter your last name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateBasicInfo()) return;

    setErrorMessage('');
    setLoading(true);

    const res = await sendOtp(email);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setStep(2);
      setCountdown(60);
      Alert.alert('Verification Code Sent', `A 6-digit code has been sent to ${email.trim()}`);
    } else {
      setErrorMessage(res.error);
    }
  };

  const handleRegister = async () => {
    if (!otp.trim() || otp.trim().length < 4) {
      setErrorMessage('Please enter the verification code sent to your email.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    const res = await signup({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      contactNumber,
      otp,
    });

    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error);
    }
    // If successful, AuthContext updates isAuthenticated, which immediately transitions to LearnerTabNavigator
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.brandIcon}>
            <Ionicons name="sparkles" size={26} color="#FFF" />
          </View>
          <Text style={styles.title}>Join OpenHand</Text>
          <Text style={styles.subtitle}>
            Create your private learner account for personalized guidance and wisdom courses.
          </Text>
        </View>

        {/* Error Alert */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={theme.colors.dangerText} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Form Card */}
        <View style={styles.card}>
          {step === 1 ? (
            <>
              <View style={styles.row}>
                <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Jane"
                    placeholderTextColor={theme.colors.textLight}
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Doe"
                    placeholderTextColor={theme.colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="jane@example.com"
                  placeholderTextColor={theme.colors.textLight}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Phone Number (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={theme.colors.textLight}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password (Min 8 chars)</Text>
                <View style={styles.passwordWrap}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.textLight}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textLight}
                  secureTextEntry={!showPassword}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.textWhite} />
                ) : (
                  <Text style={styles.primaryButtonText}>Continue to Verification →</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Step 2: OTP Verification */}
              <View style={styles.otpHeader}>
                <Ionicons name="mail-open-outline" size={40} color={theme.colors.blue} />
                <Text style={styles.otpInstruction}>
                  Enter the verification code sent to{'\n'}
                  <Text style={{ fontWeight: '700', color: theme.colors.text }}>{email}</Text>
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>6-Digit Verification Code</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="123456"
                  placeholderTextColor={theme.colors.textLight}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.textWhite} />
                ) : (
                  <Text style={styles.primaryButtonText}>Complete Registration</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendRow}>
                {countdown > 0 ? (
                  <Text style={styles.resendText}>Resend code in {countdown}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOtp} disabled={loading}>
                    <Text style={styles.resendLink}>Resend Verification Code</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={styles.editInfoBtn} onPress={() => setStep(1)}>
                <Text style={styles.editInfoText}>← Edit Registration Details</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Switch to login */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.base,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.spacing.borderRadiusMd,
    backgroundColor: theme.colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.xxl,
    fontWeight: theme.typography.heavy,
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.dangerLight,
    borderColor: theme.colors.danger,
    borderWidth: 1,
    borderRadius: theme.spacing.borderRadiusSm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.base,
    gap: 8,
  },
  errorText: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    flex: 1,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
  },
  fieldGroup: {
    marginBottom: theme.spacing.base,
  },
  label: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadiusSm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadiusSm,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  eyeBtn: {
    paddingHorizontal: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.blue,
    borderRadius: theme.spacing.borderRadiusSm,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: theme.colors.textWhite,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
  },
  otpHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  otpInstruction: {
    textAlign: 'center',
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
  },
  resendRow: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  resendText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
  },
  resendLink: {
    fontSize: theme.typography.xs,
    fontWeight: '700',
    color: theme.colors.blue,
  },
  editInfoBtn: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  editInfoText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
  },
  footer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
  },
  footerLink: {
    color: theme.colors.blue,
    fontWeight: theme.typography.bold,
  },
});

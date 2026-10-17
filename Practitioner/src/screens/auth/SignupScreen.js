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
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';

export default function SignupScreen({ navigation }) {
  const { signup, sendOtp } = useAuth();
  const { isDark, tokens } = useAppTheme();

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
      Alert.alert('Verification OTP Sent', `A verification code has been dispatched to ${email.trim()}.`);
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: tokens.backgroundSolid }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={[styles.backButton, isDark && styles.backButtonDark]}
          onPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={18} color={tokens.text} />
          <Text style={[styles.backButtonText, { color: tokens.text }]}>
            {step === 2 ? 'Edit Information' : 'Back to Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Brand Header */}
        <View style={styles.header}>
          <View style={[styles.roleBadge, isDark && styles.roleBadgeDark]}>
            <Feather name="shield" size={12} color="#7C3AED" style={{ marginRight: 5 }} />
            <Text style={styles.roleBadgeText}>CLINICAL PRACTITIONER APPLICATION</Text>
          </View>
          <Text style={[styles.title, { color: tokens.text }]}>
            Join as <Text style={{ color: '#7C3AED' }}>Practitioner</Text>
          </Text>
          <Text style={[styles.subtitle, { color: tokens.textMuted }]}>
            Host 1-on-1 consultations, facilitate peer growth circles, and utilize our clinical AI Copilot.
          </Text>
        </View>

        {/* Error Alert */}
        {errorMessage ? (
          <View style={styles.errorAlertBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorAlertText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Form Card */}
        <View style={[styles.card, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }]}>
          {step === 1 ? (
            <>
              {/* Name Row */}
              <View style={styles.nameRow}>
                <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>First Name *</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                    <TextInput
                      style={[styles.textInput, { color: tokens.text }]}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Evelyn"
                      placeholderTextColor={tokens.textLight}
                    />
                  </View>
                </View>

                <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>Last Name *</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                    <TextInput
                      style={[styles.textInput, { color: tokens.text }]}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Vance"
                      placeholderTextColor={tokens.textLight}
                    />
                  </View>
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>Professional Email *</Text>
                <View style={[styles.inputWrapper, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                  <Feather name="mail" size={16} color={tokens.textMuted} style={styles.inputLeadingIcon} />
                  <TextInput
                    style={[styles.textInput, { color: tokens.text }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="doctor@openhand.live"
                    placeholderTextColor={tokens.textLight}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Phone Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>Phone / Contact</Text>
                <View style={[styles.inputWrapper, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                  <Feather name="phone" size={16} color={tokens.textMuted} style={styles.inputLeadingIcon} />
                  <TextInput
                    style={[styles.textInput, { color: tokens.text }]}
                    value={contactNumber}
                    onChangeText={setContactNumber}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor={tokens.textLight}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>Create Password *</Text>
                <View style={[styles.inputWrapper, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                  <Feather name="lock" size={16} color={tokens.textMuted} style={styles.inputLeadingIcon} />
                  <TextInput
                    style={[styles.textInput, { color: tokens.text }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 6 characters"
                    placeholderTextColor={tokens.textLight}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={tokens.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>Confirm Password *</Text>
                <View style={[styles.inputWrapper, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                  <Feather name="check" size={16} color={tokens.textMuted} style={styles.inputLeadingIcon} />
                  <TextInput
                    style={[styles.textInput, { color: tokens.text }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repeat password"
                    placeholderTextColor={tokens.textLight}
                    secureTextEntry={!showPassword}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.buttonInner}>
                    <Text style={styles.primaryButtonText}>Verify Email &amp; Continue</Text>
                    <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </View>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.otpHeaderBox}>
                <View style={styles.otpIconWrap}>
                  <Feather name="mail" size={24} color="#7C3AED" />
                </View>
                <Text style={[styles.otpTitle, { color: tokens.text }]}>Enter 6-Digit Code</Text>
                <Text style={[styles.otpDesc, { color: tokens.textMuted }]}>
                  We sent a temporary verification code to <Text style={{ fontWeight: '700', color: tokens.text }}>{email}</Text>
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <View style={[styles.inputWrapper, { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border }]}>
                  <TextInput
                    style={[styles.textInput, styles.otpInput, { color: tokens.text }]}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="123456"
                    placeholderTextColor={tokens.textLight}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleCompleteSignup}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Complete Registration</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <Text style={styles.resendText}>Didn't receive code? Resend OTP</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Switch to login */}
          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: tokens.textMuted }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={styles.switchLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 36,
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButtonDark: {
    backgroundColor: '#0E1738',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    marginLeft: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 10,
  },
  roleBadgeDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 14,
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
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    shadowColor: '#0E1235',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  nameRow: {
    flexDirection: 'row',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
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
  eyeBtn: {
    padding: 6,
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  otpHeaderBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  otpIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  otpDesc: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 6,
    fontWeight: '800',
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 4,
  },
  resendText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  switchText: {
    fontSize: 12.5,
  },
  switchLink: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
});

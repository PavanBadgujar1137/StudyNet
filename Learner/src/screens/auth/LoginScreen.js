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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Invalid email or password.');
    }
  };

  return (
    <LinearGradient
      colors={['#E5EFFF', '#F0F5FF', '#F9F5FF', '#FFFFFF']}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <View style={styles.freeBadge}>
                <Ionicons name="sparkles" size={12} color="#059669" />
                <Text style={styles.freeBadgeText}>100% Free Access</Text>
              </View>
            </View>

            <View style={styles.logoRow}>
              <View style={styles.brandIcon}>
                <Ionicons name="infinite" size={26} color="#FFFFFF" />
              </View>
              <Text style={styles.brandName}>OpenHand</Text>
            </View>

            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your personalized wellbeing &amp; learning journey.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Error Banner */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#B91C1C" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#68749A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#68749A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#68749A"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Sign In Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In as Learner →</Text>
              )}
            </TouchableOpacity>

            {/* Create Account Link */}
            <View style={styles.signupWrap}>
              <Text style={styles.signupText}>New to OpenHand? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer note */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Are you a practitioner? Please use the{' '}
              <Text style={styles.footerLink}>OpenHand Guide App</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 48 : 28,
    paddingBottom: 36,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeRow: {
    marginBottom: 12,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  freeBadgeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#101943',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#101943',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#68749A',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E5EAF5',
    shadowColor: 'rgba(37, 59, 120, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#101943',
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: 11.5,
    color: '#2563EB',
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#101943',
  },
  eyeBtn: {
    padding: 6,
  },
  loginButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5EAF5',
  },
  dividerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    height: 46,
    gap: 8,
  },
  demoButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
  },
  signupWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  signupText: {
    fontSize: 12.5,
    color: '#68749A',
  },
  signupLink: {
    fontSize: 12.5,
    color: '#2563EB',
    fontWeight: '800',
  },
  footer: {
    marginTop: 22,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#68749A',
    textAlign: 'center',
  },
  footerLink: {
    color: '#2563EB',
    fontWeight: '700',
  },
});

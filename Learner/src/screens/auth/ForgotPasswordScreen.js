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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleReset = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const res = await requestPasswordReset(email);
    setLoading(false);

    if (res.success) {
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.error);
    }
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
            <Ionicons name="key-outline" size={26} color="#FFF" />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the email address registered with your Learner account. We'll send you instructions to reset your password.
          </Text>
        </View>

        {/* Success Alert */}
        {successMessage ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.successText} />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        {/* Error Alert */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.dangerText} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.textLight}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.resetButton, loading && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.textWhite} />
            ) : (
              <Text style={styles.resetButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Back to Login */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>← Back to Sign In</Text>
          </TouchableOpacity>
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
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
    borderWidth: 1,
    borderRadius: theme.spacing.borderRadiusSm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.base,
    gap: 8,
  },
  successText: {
    color: theme.colors.successText,
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    flex: 1,
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
  resetButton: {
    backgroundColor: theme.colors.blue,
    borderRadius: theme.spacing.borderRadiusSm,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: theme.colors.textWhite,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
  },
  footer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  footerLink: {
    color: theme.colors.blue,
    fontWeight: theme.typography.bold,
    fontSize: theme.typography.sm,
  },
});

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
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const PURPLE = '#7138F4';
const INK = '#111943';

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
    try {
      const result = await login(email.trim(), password);
      if (!result?.success) setErrorMessage(result?.error || 'Invalid email or password.');
    } catch (error) {
      setErrorMessage('Unable to sign in right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F0EDFF', '#F8F7FF', '#FFFFFF']}
      locations={[0, 0.58, 1]}
      style={styles.screen}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F0EDFF" />
      <View pointerEvents="none" style={styles.orbTop} />
      <View pointerEvents="none" style={styles.orbLeft} />
      <View pointerEvents="none" style={styles.orbRight} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandBlock}>
            <View style={styles.brandRow}>
              <LinearGradient
                colors={['#823DFF', '#5428E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logo}
              >
                <Ionicons name="infinite" size={35} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.brandTextWrap}>
                <Text style={styles.brandName}>
                  Open<Text style={styles.brandNameAccent}>Hand</Text>
                </Text>
                <Text style={styles.brandTagline}>Your Learning Wellbeing Companion</Text>
              </View>
            </View>

            <View style={styles.freeBadge}>
              <Ionicons name="sparkles" size={15} color="#079B79" />
              <Text style={styles.freeBadgeText}>100% Free Access</Text>
            </View>

            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your personalized{'\n'}wellbeing &amp; learning journey.
            </Text>
          </View>

          <View style={styles.heroWrap}>
            <View style={styles.heroGlow} />
            <View style={styles.floatHeart}>
              <Ionicons name="heart" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.floatBook}>
              <Ionicons name="book" size={23} color="#6D5AE8" />
            </View>
            <Image
              source={require('../../assets/hd_hero_screen1.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            {/* Learner Pill */}
            <View style={styles.roleTrack}>
              <LinearGradient
                colors={['#9B55FF', '#592AF0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.roleActiveGradient}
              >
                <Ionicons name="school" size={17} color="#FFFFFF" />
                <Text style={styles.roleActiveText}>Learner</Text>
              </LinearGradient>
            </View>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={21} color="#65749B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#8D9ABC"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} activeOpacity={0.7}>
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={21} color="#65749B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#8D9ABC"
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#65749B" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.88} style={styles.submitWrap}>
              <LinearGradient
                colors={['#8D43FF', '#642EF3', '#4E2BE8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.loginButton, loading && styles.buttonDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Sign In as Learner</Text>
                    <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.signupWrap}>
              <Text style={styles.signupText}>New to OpenHand? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, overflow: 'hidden' },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 48 : 30,
    paddingBottom: 28,
  },
  orbTop: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    top: -165,
    left: -100,
    backgroundColor: 'rgba(194, 173, 255, 0.18)',
  },
  orbLeft: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: 260,
    left: -145,
    backgroundColor: 'rgba(196, 181, 253, 0.17)',
  },
  orbRight: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    top: 80,
    right: -165,
    backgroundColor: 'rgba(210, 201, 255, 0.22)',
  },
  brandBlock: { width: '100%', alignItems: 'center', zIndex: 2 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6935F0',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.28,
    shadowRadius: 13,
    elevation: 7,
  },
  brandTextWrap: { marginLeft: 12 },
  brandName: { fontSize: 30, lineHeight: 34, fontWeight: '900', color: INK, letterSpacing: -1.1 },
  brandNameAccent: { color: '#7138F4' },
  brandTagline: { fontSize: 10.5, color: '#6E789D', marginTop: 1, letterSpacing: 0.05 },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#DDFBF0',
    borderColor: '#B8F2DE',
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 24,
    marginBottom: 19,
  },
  freeBadgeText: { fontSize: 13, fontWeight: '800', color: '#078567', letterSpacing: 0.1 },
  heading: { fontSize: 34, lineHeight: 40, fontWeight: '900', color: INK, textAlign: 'center', letterSpacing: -1.2 },
  subtitle: { marginTop: 7, color: '#68759B', fontSize: 14, lineHeight: 21, textAlign: 'center', letterSpacing: 0.05 },
  heroWrap: { width: '100%', height: 168, alignItems: 'center', justifyContent: 'center', marginTop: 2, marginBottom: -8 },
  heroGlow: { position: 'absolute', width: 190, height: 145, borderRadius: 95, backgroundColor: 'rgba(191, 170, 255, 0.25)' },
  heroImage: { width: 240, height: 170, zIndex: 1 },
  floatHeart: {
    position: 'absolute',
    left: '18%',
    top: 34,
    width: 43,
    height: 43,
    borderRadius: 16,
    backgroundColor: '#F0E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 2,
  },
  floatBook: {
    position: 'absolute',
    right: '17%',
    top: 54,
    width: 43,
    height: 43,
    borderRadius: 16,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    width: '100%',
    maxWidth: 470,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 29,
    paddingHorizontal: 20,
    paddingTop: 17,
    paddingBottom: 21,
    borderWidth: 1,
    borderColor: '#E9E7FA',
    shadowColor: '#5D48B8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  roleTrack: {
    alignSelf: 'center',
    backgroundColor: '#F5F2FF',
    borderRadius: 23,
    padding: 4,
    marginBottom: 19,
    borderWidth: 1,
    borderColor: '#EEE8FF',
  },
  roleActiveGradient: {
    paddingHorizontal: 28,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 20,
    shadowColor: '#7138F4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 3,
  },
  roleActiveText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: { color: '#B91C1C', fontSize: 12, fontWeight: '600', flex: 1 },
  fieldGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '800', color: '#20274E', marginBottom: 8, letterSpacing: 0.05 },
  passwordLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  forgotLink: { fontSize: 12, color: '#6B35EF', fontWeight: '800' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    borderWidth: 1,
    borderColor: '#DDE3F5',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 54,
  },
  inputIcon: { marginRight: 11 },
  input: { flex: 1, height: '100%', fontSize: 14, color: INK, paddingVertical: 0 },
  eyeButton: { padding: 7, marginRight: -4 },
  submitWrap: { marginTop: 3 },
  loginButton: {
    minHeight: 55,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#6532EF',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.29,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.72 },
  loginButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.05 },
  signupWrap: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 18 },
  signupText: { fontSize: 12.5, color: '#68749A' },
  signupLink: { fontSize: 12.5, color: '#6532ED', fontWeight: '900' },
});
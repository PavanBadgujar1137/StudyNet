import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, useWindowDimensions, StatusBar as NativeStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled Practitioner App Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorDetails}>{this.state.error?.toString()}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={this.handleReset}>
            <Text style={styles.retryButtonText}>Reload Practice App</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { width } = useWindowDimensions();
  const { isDark, tokens } = useAppTheme();
  const insets = useSafeAreaInsets();
  const isWebWide = Platform.OS === 'web' && width > 500;

  // On native mobile devices, compute status bar safe inset so content begins cleanly below system icons
  const androidStatusBar = Platform.OS === 'android' ? (NativeStatusBar.currentHeight || 0) : 0;
  const topInset = Platform.OS === 'web' ? 0 : Math.max(insets?.top || 0, androidStatusBar);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View
        style={[
          styles.root,
          { backgroundColor: tokens.backgroundSolid },
          isDark && styles.rootDark,
          isDark && { backgroundColor: tokens.backgroundSolid },
          isWebWide && styles.webOuter,
        ]}
      >
        {isWebWide && (
          <View style={styles.webHeaderBar}>
            <View style={styles.webHeaderPill}>
              <View style={styles.webHeaderDot} />
              <Text style={styles.webHeaderTitle}>OpenHand Practitioner Studio</Text>
            </View>
          </View>
        )}

        <View
          style={[
            styles.appContainer,
            { backgroundColor: tokens.backgroundSolid, paddingTop: topInset },
            isDark && styles.appContainerDark,
            isDark && { backgroundColor: tokens.backgroundSolid },
            isWebWide && styles.webFrame,
            isWebWide && { paddingTop: 0 },
          ]}
        >
          {isWebWide && (
            <View style={styles.speakerPill}>
              <View style={styles.speakerCamera} />
            </View>
          )}
          <ErrorBoundary>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </ErrorBoundary>
        </View>
      </View>
    </>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...Feather.font,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  rootDark: {
    backgroundColor: '#040714',
  },
  webOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070A17',
    minHeight: '100vh',
    paddingVertical: 18,
  },
  webHeaderBar: {
    marginBottom: 10,
    alignItems: 'center',
  },
  webHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  webHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A78BFA',
    marginRight: 8,
  },
  webHeaderTitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  appContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  appContainerDark: {
    backgroundColor: '#070A1E',
  },
  webFrame: {
    maxWidth: 430,
    width: '100%',
    height: '92vh',
    maxHeight: 900,
    borderRadius: 46,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.55,
    shadowRadius: 36,
    elevation: 30,
    borderWidth: 10,
    borderColor: '#181E36',
  },
  speakerPill: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 96,
    height: 18,
    borderRadius: 12,
    backgroundColor: '#0A0D1F',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerCamera: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F7F8FD',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E1235',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

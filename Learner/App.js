import React from 'react';
import { StyleSheet, View, Platform, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

function AppContent() {
  const { width } = useWindowDimensions();
  const { isDark } = useAppTheme();
  const isWebWide = Platform.OS === 'web' && width > 480;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.root, isDark && styles.rootDark, isWebWide && styles.webOuter]}>
        <View style={[styles.appContainer, isDark && styles.appContainerDark, isWebWide && styles.webFrame]}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </View>
      </View>
    </>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
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
    backgroundColor: '#F1F5F9',
  },
  rootDark: {
    backgroundColor: '#030712',
  },
  webOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    minHeight: '100vh',
    paddingVertical: 20,
  },
  appContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  appContainerDark: {
    backgroundColor: '#050914',
  },
  webFrame: {
    maxWidth: 410,
    width: '100%',
    height: '92vh',
    maxHeight: 880,
    borderRadius: 44,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 25,
    borderWidth: 10,
    borderColor: '#1E293B',
  },
});



import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const themeTokens = {
  light: {
    isDark: false,
    backgroundGradient: ['#EDE9FE', '#F5F3FF', '#EEF2FF', '#FFFFFF'],
    backgroundSolid: '#F7F8FD',
    surface: '#FFFFFF',
    surfaceSubtle: '#F8FAFC',
    surfaceGlass: 'rgba(255, 255, 255, 0.92)',
    card: '#FFFFFF',
    cardBorder: '#EDE9FE',
    cardBorderSubtle: '#E2E8F0',
    text: '#0E1235',
    textSecondary: '#334155',
    textMuted: '#64748B',
    textLight: '#94A3B8',
    textWhite: '#FFFFFF',
    primary: '#7C3AED',
    primaryDark: '#6D28D9',
    primaryLight: '#EDE9FE',
    primarySoft: '#F5F3FF',
    primaryGlow: 'rgba(124, 58, 237, 0.15)',
    accent: '#4F46E5',
    accentLight: '#EEF2FF',
    accentCyan: '#0284C7',
    accentCyanSoft: '#E0F2FE',
    accentEmerald: '#059669',
    accentEmeraldSoft: '#D1FAE5',
    accentAmber: '#D97706',
    accentAmberSoft: '#FEF3C7',
    accentRose: '#E11D48',
    accentRoseSoft: '#FFE4E6',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: 'rgba(226, 232, 240, 0.9)',
    tabBarActive: '#7C3AED',
    tabBarInactive: '#64748B',
    headerBackground: '#FFFFFF',
    headerBorder: '#E2E8F0',
    shadowColor: '#0E1235',
    shadowOpacity: 0.06,
  },
  dark: {
    isDark: true,
    backgroundGradient: ['#050818', '#0A0F2E', '#111742', '#070A1E'],
    backgroundSolid: '#050818',
    surface: '#0B112C',
    surfaceSubtle: '#0E163B',
    surfaceGlass: 'rgba(11, 17, 44, 0.88)',
    card: '#0E1738',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    cardBorderSubtle: 'rgba(255, 255, 255, 0.05)',
    text: '#F8FAFC',
    textSecondary: '#E2E8F0',
    textMuted: '#94A3B8',
    textLight: '#64748B',
    textWhite: '#FFFFFF',
    primary: '#A78BFA',
    primaryDark: '#8B5CF6',
    primaryLight: 'rgba(167, 139, 250, 0.15)',
    primarySoft: 'rgba(167, 139, 250, 0.1)',
    primaryGlow: 'rgba(167, 139, 250, 0.25)',
    accent: '#818CF8',
    accentLight: 'rgba(129, 140, 248, 0.15)',
    accentCyan: '#38BDF8',
    accentCyanSoft: 'rgba(56, 189, 248, 0.15)',
    accentEmerald: '#34D399',
    accentEmeraldSoft: 'rgba(52, 211, 153, 0.15)',
    accentAmber: '#FBBF24',
    accentAmberSoft: 'rgba(251, 191, 36, 0.15)',
    accentRose: '#FB7185',
    accentRoseSoft: 'rgba(251, 113, 133, 0.15)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderStrong: 'rgba(255, 255, 255, 0.18)',
    tabBarBackground: '#070A1E',
    tabBarBorder: 'rgba(255, 255, 255, 0.08)',
    tabBarActive: '#A78BFA',
    tabBarInactive: '#64748B',
    headerBackground: '#070A1E',
    headerBorder: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
  },
};

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState('light'); // 'light' | 'dark'

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = themeMode === 'dark';
  const tokens = isDark ? themeTokens.dark : themeTokens.light;

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, toggleTheme, setThemeMode, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      isDark: false,
      themeMode: 'light',
      toggleTheme: () => {},
      setThemeMode: () => {},
      tokens: themeTokens.light,
    };
  }
  return context;
}

export default ThemeContext;

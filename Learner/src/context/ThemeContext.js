import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('light'); // 'light' | 'dark'

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = themeMode === 'dark';

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, toggleTheme, setThemeMode }}>
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
    };
  }
  return context;
}

export default ThemeContext;

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import AuthNavigator from './AuthNavigator';
import PractitionerTabNavigator from './PractitionerTabNavigator';

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { tokens } = useAppTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: tokens.backgroundSolid }]}>
        <ActivityIndicator size="large" color={tokens.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <PractitionerTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

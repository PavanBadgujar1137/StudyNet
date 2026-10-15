import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import LearnerTabNavigator from './LearnerTabNavigator';
import CourseDetailScreen from '../screens/course/CourseDetailScreen';
import LessonPlayerScreen from '../screens/course/LessonPlayerScreen';
import CircleDetailScreen from '../screens/community/CircleDetailScreen';
import PractitionerDetailScreen from '../screens/practitioner/PractitionerDetailScreen';
import ProfileTabScreen from '../screens/tabs/ProfileTabScreen';
import { theme } from '../theme';

const RootStack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.blue} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <RootStack.Screen name="MainTabs" component={LearnerTabNavigator} />
          <RootStack.Screen name="CourseDetail" component={CourseDetailScreen} />
          <RootStack.Screen name="LessonPlayer" component={LessonPlayerScreen} />
          <RootStack.Screen name="CircleDetail" component={CircleDetailScreen} />
          <RootStack.Screen name="PractitionerDetail" component={PractitionerDetailScreen} />
          <RootStack.Screen
            name="Profile"
            component={ProfileTabScreen}
            options={{
              headerShown: true,
              title: 'Profile & Settings',
              headerStyle: { backgroundColor: theme.colors.card },
              headerTintColor: theme.colors.text,
            }}
          />
        </RootStack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

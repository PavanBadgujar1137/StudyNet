import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../context/ThemeContext';
import JourneyTabScreen from '../screens/tabs/JourneyTabScreen';
import CheckInTabScreen from '../screens/tabs/CheckInTabScreen';
import AuraTabScreen from '../screens/tabs/AuraTabScreen';
import CoursesTabScreen from '../screens/tabs/CoursesTabScreen';
import CommunityTabScreen from '../screens/tabs/CommunityTabScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();

export default function LearnerTabNavigator() {
  const { isDark } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#050914' : '#FFFFFF',
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: isDark ? '#000000' : '#0F172A',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.4 : 0.04,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: isDark ? '#38BDF8' : '#1E64EB',
        tabBarInactiveTintColor: isDark ? '#64748B' : '#64748B',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Journey"
        component={JourneyTabScreen}
        options={{
          title: 'My Journey',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CheckIn"
        component={CheckInTabScreen}
        options={{
          title: 'Check-In',
          headerShown: true,
          headerTitle: 'Check-In & Reflections',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { fontWeight: '700', color: '#0F172A' },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Aura"
        component={AuraTabScreen}
        options={{
          title: 'AURA',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesTabScreen}
        options={{
          title: 'Library',
          headerShown: true,
          headerTitle: 'Courses & Masterclasses',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { fontWeight: '700', color: '#0F172A' },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityTabScreen}
        options={{
          title: 'Community',
          headerShown: true,
          headerTitle: 'Community & Circles',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { fontWeight: '700', color: '#0F172A' },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

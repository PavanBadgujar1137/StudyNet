import React from 'react';
import { Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import JourneyTabScreen from '../screens/tabs/JourneyTabScreen';
import AuraTabScreen from '../screens/tabs/AuraTabScreen';
import CoursesTabScreen from '../screens/tabs/CoursesTabScreen';
import CommunityTabScreen from '../screens/tabs/CommunityTabScreen';
import ProfileTabScreen from '../screens/tabs/ProfileTabScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();

export default function LearnerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
          elevation: 1,
          shadowColor: theme.colors.shadowColor,
          shadowOpacity: 0.05,
          shadowRadius: 4,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitleStyle: {
          fontSize: theme.typography.base,
          fontWeight: theme.typography.bold,
          color: theme.colors.text,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.blue,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Journey"
        component={JourneyTabScreen}
        options={{
          title: 'My Journey',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🧭</Text>,
        }}
      />
      <Tab.Screen
        name="Aura"
        component={AuraTabScreen}
        options={{
          title: 'AURA',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🌿</Text>,
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesTabScreen}
        options={{
          title: 'Courses',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📚</Text>,
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityTabScreen}
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTabScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

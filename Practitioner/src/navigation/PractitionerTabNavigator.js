import React from 'react';
import { Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import OverviewTabScreen from '../screens/tabs/OverviewTabScreen';
import LearnersTabScreen from '../screens/tabs/LearnersTabScreen';
import LiveRoomTabScreen from '../screens/tabs/LiveRoomTabScreen';
import AuraTabScreen from '../screens/tabs/AuraTabScreen';
import MoreTabScreen from '../screens/tabs/MoreTabScreen';
import { theme } from '../../theme';

const Tab = createBottomTabNavigator();

export default function PractitionerTabNavigator() {
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
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Overview"
        component={OverviewTabScreen}
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Learners"
        component={LearnersTabScreen}
        options={{
          title: 'Learners',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="Live"
        component={LiveRoomTabScreen}
        options={{
          title: 'Live Room',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🎥</Text>,
        }}
      />
      <Tab.Screen
        name="Aura"
        component={AuraTabScreen}
        options={{
          title: 'AURA',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚡</Text>,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreTabScreen}
        options={{
          title: 'Practice Hub',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

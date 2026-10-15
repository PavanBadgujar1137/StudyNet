import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import OverviewTabScreen from '../screens/tabs/OverviewTabScreen';
import LearnersTabScreen from '../screens/tabs/LearnersTabScreen';
import LiveRoomTabScreen from '../screens/tabs/LiveRoomTabScreen';
import AuraTabScreen from '../screens/tabs/AuraTabScreen';
import MoreTabScreen from '../screens/tabs/MoreTabScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();

export default function PractitionerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 1,
          shadowColor: '#0E1235',
          shadowOpacity: 0.04,
          shadowRadius: 6,
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        },
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: '800',
          color: '#0F172A',
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Overview"
        component={OverviewTabScreen}
        options={{
          title: 'Overview',
          headerTitle: 'Practitioner Dashboard',
          tabBarIcon: ({ color, size }) => <Feather name="grid" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Learners"
        component={LearnersTabScreen}
        options={{
          title: 'Learners',
          headerTitle: 'Learner Management',
          tabBarIcon: ({ color, size }) => <Feather name="users" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Live"
        component={LiveRoomTabScreen}
        options={{
          title: 'Live Room',
          headerTitle: 'Session Room',
          tabBarIcon: ({ color, size }) => <Feather name="video" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Aura"
        component={AuraTabScreen}
        options={{
          title: 'AURA',
          headerTitle: 'Clinical Copilot',
          tabBarIcon: ({ color, size }) => <Feather name="zap" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreTabScreen}
        options={{
          title: 'Practice Hub',
          headerTitle: 'Practice Hub & Settings',
          tabBarIcon: ({ color, size }) => <Feather name="sliders" size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}


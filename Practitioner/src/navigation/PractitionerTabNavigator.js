import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../context/ThemeContext';
import OverviewTabScreen from '../screens/tabs/OverviewTabScreen';
import LearnersTabScreen from '../screens/tabs/LearnersTabScreen';
import LiveRoomTabScreen from '../screens/tabs/LiveRoomTabScreen';
import AuraTabScreen from '../screens/tabs/AuraTabScreen';
import MoreTabScreen from '../screens/tabs/MoreTabScreen';

const Tab = createBottomTabNavigator();

export default function PractitionerTabNavigator() {
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Platform detection
  const isWeb = Platform.OS === 'web';
  const isIOS = Platform.OS === 'ios';

  // Safe area & platform spacing
  const safeBottom = insets?.bottom || 0;
  const tabPaddingBottom = isWeb ? 16 : (safeBottom > 0 ? safeBottom + 4 : 10);
  const tabHeight = isWeb ? 84 : (isIOS ? 88 : 72 + safeBottom);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          backgroundColor: isDark ? '#070A1E' : '#FFFFFF',
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.85)',
          borderTopWidth: 1,
          height: tabHeight,
          paddingTop: 8,
          paddingBottom: tabPaddingBottom,
          elevation: 12,
          shadowColor: '#0E1235',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.35 : 0.05,
          shadowRadius: 12,
        },
        tabBarItemStyle: {
          flex: 1,
        },
        tabBarActiveTintColor: isDark ? '#A78BFA' : '#7C3AED',
        tabBarInactiveTintColor: isDark ? '#64748B' : '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
          letterSpacing: -0.1,
        },
      }}
    >
      <Tab.Screen
        name="Overview"
        component={OverviewTabScreen}
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="grid" size={focused ? 21 : 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Learners"
        component={LearnersTabScreen}
        options={{
          title: 'Learners',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="users" size={focused ? 21 : 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Live"
        component={LiveRoomTabScreen}
        options={{
          title: 'Live Room',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="video" size={focused ? 21 : 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Aura"
        component={AuraTabScreen}
        options={{
          title: 'AURA AI',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flash' : 'flash-outline'} size={focused ? 22 : 21} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreTabScreen}
        options={{
          title: 'Practice Hub',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="sliders" size={focused ? 21 : 20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

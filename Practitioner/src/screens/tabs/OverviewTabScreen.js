import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  StatusBar as NativeStatusBar,
  Image,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';

export default function OverviewTabScreen({ navigation }) {
  const { user } = useAuth();
  const { isDark, toggleTheme, tokens } = useAppTheme();
  const insets = useSafeAreaInsets();
  // Reliable status-bar-aware top inset for Android & iOS
  const topInset = Platform.OS === 'web'
    ? 0
    : Math.max(insets?.top || 0, Platform.OS === 'android' ? (NativeStatusBar.currentHeight || 0) : 0);

  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartMetric, setChartMetric] = useState('earnings'); // 'earnings' | 'sessions'
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(9); // Default to current month (Oct)
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.PRACTITIONER.DASHBOARD);
      if (res.data?.success && res.data?.data) {
        setTelemetry(res.data.data);
      }
    } catch (e) {
      console.warn('Error fetching practitioner telemetry:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTelemetry();
  };

  const practitionerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Rashid Khopatkar';

  const initials = user?.firstName
    ? `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase()
    : 'RK';
  const handleSlug = user?.handle || user?.firstName?.toLowerCase() || 'rashid-khopatkar';

  const stats = telemetry?.stats || {
    monthlyEarnings: telemetry?.stats?.monthlyEarnings ?? 3450,
    totalEarnings: telemetry?.stats?.totalEarnings ?? 18200,
    activeClientsCount: telemetry?.stats?.activeClientsCount ?? (user?.activeClientsCount || 18),
    clearingThisWeek: telemetry?.stats?.clearingThisWeek ?? 850,
    circleSeatsFilled: telemetry?.stats?.circleSeatsFilled ?? 24,
    totalCircleCapacity: telemetry?.stats?.totalCircleCapacity ?? 30,
    avgWellbeing: telemetry?.stats?.avgWellbeing ?? 9.2,
  };

  const upcomingClasses = telemetry?.upcomingClasses?.length
    ? telemetry.upcomingClasses
    : [
        {
          _id: 'session_demo_1',
          title: 'Somatic Mindfulness & Nervous System Grounding',
          sessionType: '1-on-1',
          scheduledStart: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
          maxAttendees: 2,
          enrolledCount: 1,
        },
        {
          _id: 'session_demo_2',
          title: 'Weekly Practitioner Circle: Emotion Regulation',
          sessionType: 'Circle Cohort',
          scheduledStart: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          maxAttendees: 15,
          enrolledCount: 12,
        },
      ];

  const monthlyHistory = telemetry?.monthlyHistory?.length
    ? telemetry.monthlyHistory
    : [
        { month: 'Jan', amount: 1800, sessions: 12 },
        { month: 'Feb', amount: 2200, sessions: 15 },
        { month: 'Mar', amount: 2600, sessions: 18 },
        { month: 'Apr', amount: 2400, sessions: 16 },
        { month: 'May', amount: 2900, sessions: 20 },
        { month: 'Jun', amount: 3100, sessions: 22 },
        { month: 'Jul', amount: 3450, sessions: 25 },
        { month: 'Aug', amount: 3200, sessions: 23 },
        { month: 'Sep', amount: 3600, sessions: 26 },
        { month: 'Oct', amount: 3850, sessions: 28 },
        { month: 'Nov', amount: 4100, sessions: 30 },
        { month: 'Dec', amount: 4400, sessions: 32 },
      ];

  const maxVal = Math.max(
    ...monthlyHistory.map((m) => (chartMetric === 'earnings' ? m.amount : (m.sessions || 1))),
    1
  );

  const selectedMonthData = monthlyHistory[selectedMonthIdx] || monthlyHistory[monthlyHistory.length - 1];

  const handleCopyLink = () => {
    Alert.alert(
      'Verified Public Booking Link',
      `Your verified patient portal link is:\nhttps://openhand.live/practitioner/${handleSlug}\n\nClients can view your credentials, book 1-on-1 consultations, and join your growth circles.`
    );
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#050818' : '#F6F8FD' }]}>
      {/* ── Ambient Soft Glow Blobs for Depth ── */}
      {!isDark && (
        <>
          <View style={styles.ambientBlobTopRight} />
          <View style={styles.ambientBlobCenterLeft} />
        </>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Platform.OS === 'web' ? 34 : topInset + 8 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tokens.primary}
            colors={[tokens.primary]}
          />
        }
      >
        {/* ── SECTION A: Premium Header ── */}
        <View style={styles.topBar}>
          <View style={styles.brandContainer}>
            <View style={styles.brandRow}>
              <View style={[styles.brandDot, { backgroundColor: '#7C3AED' }]} />
              <Text style={[styles.brandSuper, { color: '#7C3AED' }]}>OPENHAND</Text>
            </View>
            <Text style={[styles.brandTitle, { color: isDark ? '#F8FAFC' : '#0B0F2A' }]}>
              Practitioner <Text style={{ color: '#7C3AED' }}>Studio</Text>
            </Text>
          </View>

          <View style={styles.topBarActions}>
            {/* Theme Toggle Pill */}
            <TouchableOpacity
              style={[
                styles.themePillBtn,
                {
                  backgroundColor: isDark ? '#0F1738' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0',
                },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={13}
                color={isDark ? '#FBBF24' : '#7C3AED'}
              />
              <Text
                style={[
                  styles.themePillText,
                  { color: isDark ? '#E2E8F0' : '#1E293B' },
                ]}
              >
                {isDark ? 'Light' : 'Dark'}
              </Text>
            </TouchableOpacity>

            {/* Notification Bell with Pulse Dot */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                {
                  backgroundColor: isDark ? '#0F1738' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                },
              ]}
              onPress={() => setShowAlertsModal(true)}
              activeOpacity={0.75}
            >
              <Feather name="bell" size={17} color={isDark ? '#E2E8F0' : '#1E293B'} />
              <View style={styles.notifDot} />
            </TouchableOpacity>

            {/* Avatar Pill */}
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => navigation.navigate('More')}
              activeOpacity={0.8}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── SECTION B: Practitioner Status Badges ── */}
        <View style={styles.badgesRow}>
          <View
            style={[
              styles.badgePill,
              {
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
                borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
              },
            ]}
          >
            <View style={styles.activePulseDot} />
            <Text style={[styles.badgeText, { color: isDark ? '#34D399' : '#059669' }]}>
              Open Plan (Free Access)
            </Text>
          </View>

          <View
            style={[
              styles.badgePill,
              {
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#F0F9FF',
                borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#BAE6FD',
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={13} color="#0284C7" style={{ marginRight: 4 }} />
            <Text style={[styles.badgeText, { color: isDark ? '#38BDF8' : '#0284C7' }]}>
              Verified Clinical Guide
            </Text>
          </View>

          <View
            style={[
              styles.badgePill,
              {
                backgroundColor: isDark ? 'rgba(167, 139, 250, 0.12)' : '#F5F3FF',
                borderColor: isDark ? 'rgba(167, 139, 250, 0.3)' : '#DDD6FE',
              },
            ]}
          >
            <Ionicons name="flash" size={13} color="#7C3AED" style={{ marginRight: 4 }} />
            <Text style={[styles.badgeText, { color: isDark ? '#A78BFA' : '#7C3AED' }]}>
              SOAP Copilot
            </Text>
          </View>
        </View>

        {/* ── SECTION C: Welcome Hero Card ── */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? '#0C1333' : '#FFFFFF',
              borderColor: isDark ? 'rgba(167, 139, 250, 0.2)' : '#EDE9FE',
              shadowColor: isDark ? '#000000' : 'rgba(124, 58, 237, 0.12)',
            },
          ]}
        >
          <View style={styles.heroBody}>
            {/* Top Row: Greeting Left + 3D Graphic Right */}
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextCol}>
                <View style={styles.heroDateRow}>
                  <Feather name="calendar" size={13} color="#7C3AED" style={{ marginRight: 6 }} />
                  <Text style={[styles.heroDateText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    {currentDateFormatted}
                  </Text>
                </View>

                <Text style={[styles.greetingTitle, { color: isDark ? '#F8FAFC' : '#0B0F2A' }]}>
                  Hello, {practitionerName} 👋
                </Text>

                <Text style={[styles.greetingDesc, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                  You have{' '}
                  <Text style={{ fontWeight: '800', color: '#7C3AED' }}>
                    {upcomingClasses.length || 7} live session(s)
                  </Text>{' '}
                  scheduled for today.
                </Text>
              </View>

              <View style={styles.heroBadgeWrap}>
                <Image
                  source={require('../../../assets/practice_hero_badge.png')}
                  style={styles.heroBadgeImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Bottom Row: Great progress! Left + Actions Stack Right */}
            <View style={styles.heroBottomRow}>
              {/* Great progress! Card */}
              <View
                style={[
                  styles.progressBox,
                  {
                    backgroundColor: isDark ? 'rgba(124, 58, 237, 0.14)' : '#F3E8FF',
                  },
                ]}
              >
                <View style={styles.progressHeaderRow}>
                  <Ionicons name="sparkles" size={14} color="#7C3AED" />
                  <Text style={[styles.progressTitle, { color: isDark ? '#C4B5FD' : '#6D28D9' }]}>
                    Great progress!
                  </Text>
                </View>
                <Text style={[styles.progressText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                  Your dedication to better care makes a real difference.
                </Text>
              </View>

              {/* Action Buttons Stack */}
              <View style={styles.heroButtonsCol}>
                <TouchableOpacity
                  style={styles.heroLaunchBtn}
                  onPress={() => navigation.navigate('Live')}
                  activeOpacity={0.88}
                >
                  <Feather name="video" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.heroLaunchBtnText}>Launch Live Room</Text>
                  <Feather name="arrow-right" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.heroShareBtn,
                    {
                      backgroundColor: isDark ? '#141E47' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(167, 139, 250, 0.3)' : '#DDD6FE',
                    },
                  ]}
                  onPress={handleCopyLink}
                  activeOpacity={0.85}
                >
                  <Feather name="link" size={14} color="#7C3AED" style={{ marginRight: 6 }} />
                  <Text style={[styles.heroShareBtnText, { color: '#7C3AED' }]}>Share Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ── SECTION D: Dashboard Statistics (Practice Vitals) ── */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.vitalsTitleWrap}>
            <Feather name="bar-chart-2" size={18} color="#7C3AED" style={{ marginRight: 6 }} />
            <Text style={[styles.sectionPretitle, { color: '#7C3AED' }]}>PRACTICE VITALS</Text>
          </View>

          <TouchableOpacity
            style={styles.vitalsGlanceRow}
            onPress={() => navigation.navigate('More')}
            activeOpacity={0.7}
          >
            <Text style={[styles.vitalsGlanceText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Your Practice at a Glance
            </Text>
            <Feather name="arrow-right" size={14} color="#7C3AED" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.metricsGrid}>
          {/* Tile 1: Active Clients */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: tokens.card,
                borderColor: tokens.cardBorder,
              },
            ]}
          >
            <View style={styles.metricTopRow}>
              <View
                style={[
                  styles.metricIconWrap,
                  { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#E0F2FE' },
                ]}
              >
                <Feather name="users" size={17} color="#0284C7" />
              </View>
              <View
                style={[
                  styles.trendPill,
                  { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7' },
                ]}
              >
                <Feather name="trending-up" size={10} color="#059669" style={{ marginRight: 3 }} />
                <Text style={styles.trendPillText}>+14%</Text>
              </View>
            </View>

            <Text style={[styles.metricValue, { color: tokens.text }]}>
              {stats.activeClientsCount}
            </Text>
            <Text style={[styles.metricLabel, { color: tokens.textMuted }]}>Active Clients</Text>
          </View>

          {/* Tile 2: Monthly Volume */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: tokens.card,
                borderColor: tokens.cardBorder,
              },
            ]}
          >
            <View style={styles.metricTopRow}>
              <View
                style={[
                  styles.metricIconWrap,
                  { backgroundColor: isDark ? 'rgba(167, 139, 250, 0.15)' : '#F3E8FF' },
                ]}
              >
                <Feather name="dollar-sign" size={17} color="#7C3AED" />
              </View>
              <View
                style={[
                  styles.trendPill,
                  { backgroundColor: isDark ? 'rgba(167, 139, 250, 0.15)' : '#F3E8FF' },
                ]}
              >
                <Text style={[styles.trendPillText, { color: '#7C3AED' }]}>Weekly</Text>
              </View>
            </View>

            <Text style={[styles.metricValue, { color: tokens.text }]}>
              ${Number(stats.monthlyEarnings).toLocaleString()}
            </Text>
            <Text style={[styles.metricLabel, { color: tokens.textMuted }]}>Monthly Volume</Text>
          </View>

          {/* Tile 3: Circle Capacity */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: tokens.card,
                borderColor: tokens.cardBorder,
              },
            ]}
          >
            <View style={styles.metricTopRow}>
              <View
                style={[
                  styles.metricIconWrap,
                  { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#DCFCE7' },
                ]}
              >
                <Feather name="disc" size={17} color="#059669" />
              </View>
              <View
                style={[
                  styles.trendPill,
                  { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#DCFCE7' },
                ]}
              >
                <Text style={styles.trendPillText}>80% Filled</Text>
              </View>
            </View>

            <Text style={[styles.metricValue, { color: tokens.text }]}>
              {stats.circleSeatsFilled}
              <Text style={{ fontSize: 13, fontWeight: '500', color: tokens.textMuted }}>
                /{stats.totalCircleCapacity}
              </Text>
            </Text>
            <Text style={[styles.metricLabel, { color: tokens.textMuted }]}>Circle Seats</Text>
          </View>

          {/* Tile 4: Average Client Wellbeing */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: tokens.card,
                borderColor: tokens.cardBorder,
              },
            ]}
          >
            <View style={styles.metricTopRow}>
              <View
                style={[
                  styles.metricIconWrap,
                  { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#FEF3C7' },
                ]}
              >
                <Feather name="heart" size={17} color="#D97706" />
              </View>
              <View
                style={[
                  styles.trendPill,
                  { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#FEF3C7' },
                ]}
              >
                <Text style={[styles.trendPillText, { color: '#D97706' }]}>★ Top Tier</Text>
              </View>
            </View>

            <Text style={[styles.metricValue, { color: tokens.text }]}>
              {stats.avgWellbeing}
              <Text style={{ fontSize: 13, fontWeight: '500', color: tokens.textMuted }}>/10</Text>
            </Text>
            <Text style={[styles.metricLabel, { color: tokens.textMuted }]}>Wellbeing Score</Text>
          </View>
        </View>

        {/* ── SECTION E: Monthly Activity Chart ── */}
        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: tokens.card,
              borderColor: tokens.cardBorder,
            },
          ]}
        >
          <View style={styles.chartHeaderRow}>
            <View>
              <Text style={[styles.chartPretitle, { color: tokens.primary }]}>PRACTICE ANALYTICS</Text>
              <Text style={[styles.chartTitle, { color: tokens.text }]}>12-Month Performance</Text>
            </View>

            {/* Segmented Metric Toggle */}
            <View
              style={[
                styles.chartToggleContainer,
                {
                  backgroundColor: isDark ? '#0A0F2E' : '#F1F5F9',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.chartToggleBtn,
                  chartMetric === 'earnings' && [
                    styles.chartToggleBtnActive,
                    { backgroundColor: isDark ? '#1A2352' : '#FFFFFF' },
                  ],
                ]}
                onPress={() => setChartMetric('earnings')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chartToggleText,
                    chartMetric === 'earnings' && styles.chartToggleTextActive,
                    { color: chartMetric === 'earnings' ? tokens.primary : tokens.textMuted },
                  ]}
                >
                  Volume ($)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.chartToggleBtn,
                  chartMetric === 'sessions' && [
                    styles.chartToggleBtnActive,
                    { backgroundColor: isDark ? '#1A2352' : '#FFFFFF' },
                  ],
                ]}
                onPress={() => setChartMetric('sessions')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chartToggleText,
                    chartMetric === 'sessions' && styles.chartToggleTextActive,
                    { color: chartMetric === 'sessions' ? tokens.primary : tokens.textMuted },
                  ]}
                >
                  Sessions
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bar Chart Bars Container */}
          <View style={styles.barsContainer}>
            {monthlyHistory.map((item, idx) => {
              const currentVal = chartMetric === 'earnings' ? item.amount : (item.sessions || 1);
              const barHeightPct = Math.max(Math.round((currentVal / maxVal) * 100), 10);
              const isSelected = idx === selectedMonthIdx;

              return (
                <TouchableOpacity
                  key={item.month}
                  style={styles.barColumn}
                  onPress={() => setSelectedMonthIdx(idx)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.barTrack,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${barHeightPct}%`,
                          backgroundColor: isSelected
                            ? '#7C3AED'
                            : isDark
                            ? 'rgba(167, 139, 250, 0.35)'
                            : '#DDD6FE',
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      {
                        color: isSelected ? tokens.primary : tokens.textLight,
                        fontWeight: isSelected ? '800' : '500',
                      },
                    ]}
                  >
                    {item.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Chart Summary Footer */}
          <View
            style={[
              styles.chartFooterRow,
              { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
            ]}
          >
            <View style={styles.chartFooterLeft}>
              <Text style={[styles.chartFooterText, { color: tokens.textMuted }]}>
                {selectedMonthData?.month}:{' '}
                <Text style={{ fontWeight: '800', color: tokens.text }}>
                  {chartMetric === 'earnings'
                    ? `$${Number(selectedMonthData?.amount || 0).toLocaleString()}`
                    : `${selectedMonthData?.sessions || 0} sessions`}
                </Text>
              </Text>
            </View>

            <View
              style={[
                styles.growthBadge,
                { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7' },
              ]}
            >
              <Ionicons name="arrow-up" size={11} color="#059669" style={{ marginRight: 3 }} />
              <Text style={styles.growthBadgeText}>+24% YoY</Text>
            </View>
          </View>
        </View>

        {/* ── SECTION F: Practice Workflows (2-Column Grid) ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionPretitle, { color: tokens.primary }]}>OPERATIONS</Text>
          <Text style={[styles.sectionMainTitle, { color: tokens.text }]}>Practice Workflows</Text>
        </View>

        <View style={styles.quickGrid}>
          {/* Action 1: Live Session */}
          <TouchableOpacity
            style={[
              styles.quickCard,
              { backgroundColor: tokens.card, borderColor: tokens.cardBorder },
            ]}
            onPress={() => navigation.navigate('Live')}
            activeOpacity={0.75}
          >
            <View style={styles.quickCardHeader}>
              <View
                style={[
                  styles.quickIconBox,
                  { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.2)' : '#F5F3FF' },
                ]}
              >
                <Feather name="video" size={18} color="#7C3AED" />
              </View>
              <Feather name="arrow-up-right" size={14} color={tokens.textLight} />
            </View>
            <Text style={[styles.quickTitle, { color: tokens.text }]}>Live Session</Text>
            <Text style={[styles.quickSub, { color: tokens.textMuted }]} numberOfLines={2}>
              WebRTC 1-on-1 & cohort studio
            </Text>
          </TouchableOpacity>

          {/* Action 2: Clinical Copilot (Signature AI feature) */}
          <TouchableOpacity
            style={[
              styles.quickCard,
              {
                backgroundColor: tokens.card,
                borderColor: isDark ? 'rgba(124, 58, 237, 0.4)' : '#DDD6FE',
              },
            ]}
            onPress={() => navigation.navigate('Aura')}
            activeOpacity={0.75}
          >
            <View style={styles.quickCardHeader}>
              <View
                style={[
                  styles.quickIconBox,
                  { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.25)' : '#F5F3FF' },
                ]}
              >
                <Ionicons name="flash" size={18} color="#7C3AED" />
              </View>
              <View style={styles.aiBadgePill}>
                <Text style={styles.aiBadgePillText}>AI</Text>
              </View>
            </View>
            <Text style={[styles.quickTitle, { color: tokens.text }]}>AURA Copilot</Text>
            <Text style={[styles.quickSub, { color: tokens.textMuted }]} numberOfLines={2}>
              SOAP & DAP case formulation
            </Text>
          </TouchableOpacity>

          {/* Action 3: Learners Directory */}
          <TouchableOpacity
            style={[
              styles.quickCard,
              { backgroundColor: tokens.card, borderColor: tokens.cardBorder },
            ]}
            onPress={() => navigation.navigate('Learners')}
            activeOpacity={0.75}
          >
            <View style={styles.quickCardHeader}>
              <View
                style={[
                  styles.quickIconBox,
                  { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.2)' : '#ECFDF5' },
                ]}
              >
                <Feather name="users" size={18} color="#059669" />
              </View>
              <Feather name="arrow-up-right" size={14} color={tokens.textLight} />
            </View>
            <Text style={[styles.quickTitle, { color: tokens.text }]}>Learner Directory</Text>
            <Text style={[styles.quickSub, { color: tokens.textMuted }]} numberOfLines={2}>
              Verify ID & care history
            </Text>
          </TouchableOpacity>

          {/* Action 4: Growth Circles */}
          <TouchableOpacity
            style={[
              styles.quickCard,
              { backgroundColor: tokens.card, borderColor: tokens.cardBorder },
            ]}
            onPress={() => navigation.navigate('More')}
            activeOpacity={0.75}
          >
            <View style={styles.quickCardHeader}>
              <View
                style={[
                  styles.quickIconBox,
                  { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.2)' : '#FEF3C7' },
                ]}
              >
                <Feather name="disc" size={18} color="#D97706" />
              </View>
              <Feather name="arrow-up-right" size={14} color={tokens.textLight} />
            </View>
            <Text style={[styles.quickTitle, { color: tokens.text }]}>Cohort Circles</Text>
            <Text style={[styles.quickSub, { color: tokens.textMuted }]} numberOfLines={2}>
              Manage peer cohorts
            </Text>
          </TouchableOpacity>

          {/* Action 5: Practice Offers */}
          <TouchableOpacity
            style={[
              styles.quickCard,
              { backgroundColor: tokens.card, borderColor: tokens.cardBorder },
            ]}
            onPress={() => navigation.navigate('More')}
            activeOpacity={0.75}
          >
            <View style={styles.quickCardHeader}>
              <View
                style={[
                  styles.quickIconBox,
                  { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.2)' : '#FFF1F2' },
                ]}
              >
                <Feather name="briefcase" size={18} color="#E11D48" />
              </View>
              <Feather name="arrow-up-right" size={14} color={tokens.textLight} />
            </View>
            <Text style={[styles.quickTitle, { color: tokens.text }]}>Practice Offers</Text>
            <Text style={[styles.quickSub, { color: tokens.textMuted }]} numberOfLines={2}>
              Packages & intake forms
            </Text>
          </TouchableOpacity>

          {/* Action 6: Public Booking */}
          <TouchableOpacity
            style={[
              styles.quickCard,
              { backgroundColor: tokens.card, borderColor: tokens.cardBorder },
            ]}
            onPress={handleCopyLink}
            activeOpacity={0.75}
          >
            <View style={styles.quickCardHeader}>
              <View
                style={[
                  styles.quickIconBox,
                  { backgroundColor: isDark ? 'rgba(129, 140, 248, 0.2)' : '#EEF2FF' },
                ]}
              >
                <Feather name="share-2" size={18} color="#4F46E5" />
              </View>
              <Feather name="arrow-up-right" size={14} color={tokens.textLight} />
            </View>
            <Text style={[styles.quickTitle, { color: tokens.text }]}>Public Profile</Text>
            <Text style={[styles.quickSub, { color: tokens.textMuted }]} numberOfLines={2}>
              Copy client booking link
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── SECTION G: Practitioner Credentials & Honors ── */}
        <View
          style={[
            styles.badgesBanner,
            {
              backgroundColor: isDark ? '#0C1333' : '#FFFFFF',
              borderColor: tokens.cardBorder,
            },
          ]}
        >
          <View style={styles.badgesBannerHeader}>
            <View style={styles.awardIconBox}>
              <Ionicons name="ribbon" size={16} color="#D97706" />
            </View>
            <Text style={[styles.badgesPretitle, { color: tokens.primary }]}>
              ACTIVE CLINICAL CREDENTIALS
            </Text>
          </View>

          <Text style={[styles.badgesTitle, { color: tokens.text }]}>
            Practitioner Honors & Badges
          </Text>

          <Text style={[styles.badgesDesc, { color: tokens.textMuted }]}>
            Achievement badges display on your public client profile, validating clinical focus, client satisfaction, and responsive care.
          </Text>

          <View style={styles.badgePillsContainer}>
            <View
              style={[
                styles.rewardPill,
                {
                  backgroundColor: isDark ? '#141E47' : '#F8FAFC',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                },
              ]}
            >
              <Text style={styles.rewardPillEmoji}>🎖️</Text>
              <Text style={[styles.rewardPillText, { color: tokens.text }]}>Verified Guide</Text>
            </View>

            <View
              style={[
                styles.rewardPill,
                {
                  backgroundColor: isDark ? '#141E47' : '#F8FAFC',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                },
              ]}
            >
              <Text style={styles.rewardPillEmoji}>⭐</Text>
              <Text style={[styles.rewardPillText, { color: tokens.text }]}>Top Rated 5.0</Text>
            </View>

            <View
              style={[
                styles.rewardPill,
                {
                  backgroundColor: isDark ? '#141E47' : '#F8FAFC',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                },
              ]}
            >
              <Text style={styles.rewardPillEmoji}>⚡</Text>
              <Text style={[styles.rewardPillText, { color: tokens.text }]}>Fast Responder</Text>
            </View>

            <View
              style={[
                styles.rewardPill,
                {
                  backgroundColor: isDark ? '#141E47' : '#F8FAFC',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                },
              ]}
            >
              <Text style={styles.rewardPillEmoji}>🌿</Text>
              <Text style={[styles.rewardPillText, { color: tokens.text }]}>Somatic Master</Text>
            </View>
          </View>
        </View>

        {/* ── SECTION H: Today's Schedule ── */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionPretitle, { color: tokens.primary }]}>TELEHEALTH</Text>
            <Text style={[styles.sectionMainTitle, { color: tokens.text }]}>
              Today's Schedule ({upcomingClasses.length})
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Live')}
            activeOpacity={0.75}
            style={styles.manageScheduleLink}
          >
            <Text style={[styles.sectionLink, { color: tokens.primary }]}>Manage Schedule</Text>
            <Feather name="chevron-right" size={14} color={tokens.primary} />
          </TouchableOpacity>
        </View>

        {upcomingClasses.length > 0 ? (
          upcomingClasses.map((item) => (
            <View
              key={item._id || Math.random()}
              style={[
                styles.sessionCard,
                {
                  backgroundColor: tokens.card,
                  borderColor: tokens.cardBorder,
                },
              ]}
            >
              <View style={styles.sessionHeaderRow}>
                <View
                  style={[
                    styles.sessionTypeBadge,
                    {
                      backgroundColor:
                        item.sessionType === 'Circle Cohort'
                          ? isDark
                            ? 'rgba(167, 139, 250, 0.15)'
                            : '#F5F3FF'
                          : isDark
                          ? 'rgba(56, 189, 248, 0.15)'
                          : '#EFF6FF',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sessionTypeBadgeText,
                      {
                        color:
                          item.sessionType === 'Circle Cohort' ? '#7C3AED' : '#0284C7',
                      },
                    ]}
                  >
                    {item.sessionType || '1-on-1'}
                  </Text>
                </View>

                <View style={styles.sessionTimeBadge}>
                  <Feather name="clock" size={12} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={[styles.sessionTimeText, { color: tokens.textMuted }]}>
                    {new Date(item.scheduledStart).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>

              <Text style={[styles.sessionTitle, { color: tokens.text }]} numberOfLines={2}>
                {item.title}
              </Text>

              <View
                style={[
                  styles.sessionDivider,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
                ]}
              />

              <View style={styles.sessionFooterRow}>
                <View style={styles.attendeeCountRow}>
                  <Feather name="user-check" size={13} color={tokens.textMuted} style={{ marginRight: 5 }} />
                  <Text style={[styles.attendeeCountText, { color: tokens.textMuted }]}>
                    {item.enrolledCount || 1} participant enrolled
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={() => navigation.navigate('Live')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.joinBtnText}>Open Room</Text>
                  <Feather name="arrow-right" size={13} color="#FFFFFF" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View
            style={[
              styles.emptyScheduleCard,
              { backgroundColor: tokens.card, borderColor: tokens.cardBorder },
            ]}
          >
            <Feather name="calendar" size={28} color={tokens.textLight} style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyScheduleTitle, { color: tokens.text }]}>No Sessions Today</Text>
            <Text style={[styles.emptyScheduleSub, { color: tokens.textMuted }]}>
              Schedule a 1-on-1 consultation or cohort circle anytime.
            </Text>
            <TouchableOpacity
              style={styles.emptyScheduleBtn}
              onPress={() => navigation.navigate('Live')}
            >
              <Text style={styles.emptyScheduleBtnText}>+ Schedule Live Session</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Generous bottom spacing to guarantee content is never obscured by the tab bar */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Alerts Modal ── */}
      <Modal
        visible={showAlertsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlertsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: tokens.card, borderColor: tokens.cardBorder },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Feather name="bell" size={18} color={tokens.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: tokens.text }]}>Practice Alerts</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAlertsModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={18} color={tokens.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.alertItem}>
              <View style={[styles.alertDot, { backgroundColor: '#10B981' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertItemTitle, { color: tokens.text }]}>
                  WebRTC Live Studio Operational
                </Text>
                <Text style={[styles.alertItemDesc, { color: tokens.textMuted }]}>
                  Room signaling active. Ready for live client consultations.
                </Text>
              </View>
            </View>

            <View style={styles.alertItem}>
              <View style={[styles.alertDot, { backgroundColor: '#7C3AED' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertItemTitle, { color: tokens.text }]}>
                  AURA AI Copilot Ready
                </Text>
                <Text style={[styles.alertItemDesc, { color: tokens.textMuted }]}>
                  SOAP & DAP clinical notes synthesizer connected to practice cloud.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowAlertsModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  ambientBlobTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(237, 233, 254, 0.55)',
  },
  ambientBlobCenterLeft: {
    position: 'absolute',
    top: 320,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(224, 242, 254, 0.45)',
  },

  // ── Header Bar ──
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandContainer: {
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },
  brandSuper: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  brandTitle: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  themePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },

  // ── Status Badges ──
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 999,
  },
  activePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Welcome Hero Card ──
  heroCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  heroBody: {
    padding: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroTextCol: {
    flex: 1.25,
    paddingRight: 8,
  },
  heroBadgeWrap: {
    width: 125,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeImage: {
    width: 125,
    height: 108,
  },
  heroDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroDateText: {
    fontSize: 11.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  greetingDesc: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  progressBox: {
    flex: 1.1,
    borderRadius: 16,
    padding: 13,
    justifyContent: 'center',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  progressText: {
    fontSize: 11,
    lineHeight: 15,
  },
  heroButtonsCol: {
    flex: 1.05,
    gap: 8,
    justifyContent: 'center',
  },
  heroLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    height: 42,
    borderRadius: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroLaunchBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  heroShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    height: 42,
    borderRadius: 14,
  },
  heroShareBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  // ── Section Titles ──
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 2,
  },
  vitalsTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vitalsGlanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vitalsGlanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionPretitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionMainTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  manageScheduleLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 2,
  },

  // ── Metrics Grid (2-Column) ──
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    width: '48.4%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  metricTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendPill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  metricValue: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Monthly Activity Chart ──
  chartCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartPretitle: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  chartToggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 999,
    padding: 3,
    gap: 2,
  },
  chartToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chartToggleBtnActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  chartToggleText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  chartToggleTextActive: {
    fontWeight: '800',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 12,
    paddingTop: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barTrack: {
    width: 8,
    height: 94,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 9.5,
    marginTop: 6,
  },
  chartFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  chartFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartFooterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 999,
  },
  growthBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },

  // ── Practice Workflows (2-Column Grid) ──
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  quickCard: {
    width: '48.4%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 13,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  quickCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  quickIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadgePill: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiBadgePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  quickTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  quickSub: {
    fontSize: 11,
    lineHeight: 14.5,
  },

  // ── Practitioner Honors & Badges ──
  badgesBanner: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  badgesBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  awardIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesPretitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  badgesDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  badgePillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 5,
  },
  rewardPillEmoji: {
    fontSize: 12,
  },
  rewardPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Today's Schedule Session Cards ──
  sessionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sessionTypeBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  sessionTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTimeText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    lineHeight: 20,
    marginBottom: 12,
  },
  sessionDivider: {
    height: 1,
    marginBottom: 12,
  },
  sessionFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendeeCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeCountText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  emptyScheduleCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyScheduleTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyScheduleSub: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
  },
  emptyScheduleBtn: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyScheduleBtnText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Alerts Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 10,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  alertItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  alertItemDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  modalCloseBtn: {
    marginTop: 14,
    backgroundColor: '#7C3AED',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

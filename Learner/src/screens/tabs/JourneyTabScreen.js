import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function JourneyTabScreen({ navigation }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();

  // Active view: 'dashboard' (Screen 2) | 'roadmap' (Screen 3) | 'milestones' (Screen 4)
  const [subView, setSubView] = useState('dashboard');

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.LEARNER.CLIENT_DASHBOARD);
      if (res.data?.success && res.data?.data) {
        setDashboardData(res.data.data);
      }
    } catch (e) {
      console.warn('Error fetching learner dashboard:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const clientName = user?.firstName || 'Aryan';
  const checkInCount = dashboardData?.checkInCount || 0;
  const streak = dashboardData?.streak || 0;
  const joinedCircles = dashboardData?.joinedCircles || [];
  const learnerId = user?.learnerId || 'LRN-250573';
  const initials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'M'}`.toUpperCase();

  const checkIns = dashboardData?.checkIns || [];
  const hasCheckedInToday =
    checkIns.some((c) => new Date(c.createdAt).toDateString() === new Date().toDateString()) ||
    dashboardData?.hasCheckedInToday;

  const todayDateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const notifications = [
    {
      id: 'notif_checkin',
      title: hasCheckedInToday ? 'Daily Check-in Completed ✓' : 'Daily Rhythm Pending',
      body: hasCheckedInToday
        ? 'Great job! Your wellbeing & sleep rhythm for today are logged.'
        : 'Take 60 seconds to log how your mind and body are feeling today.',
      icon: hasCheckedInToday ? 'checkmark-circle' : 'time-outline',
      iconColor: hasCheckedInToday ? '#10B981' : '#F59E0B',
      unread: !hasCheckedInToday,
      actionText: hasCheckedInToday ? 'View History' : 'Check In Now →',
      onPress: () => {
        setShowNotificationsModal(false);
        navigation.navigate('CheckIn');
      },
    },
    {
      id: 'notif_scholarship',
      title: 'Free Learner Tier Active',
      body: `Your ID ${learnerId} grants 100% free access to all masterclasses and peer growth circles.`,
      icon: 'sparkles',
      iconColor: '#8B5CF6',
      unread: false,
      actionText: 'Close',
      onPress: () => setShowNotificationsModal(false),
    },
  ];

  const unreadNotificationsCount = notifications.filter((n) => n.unread).length;

  // ─────────────────────────────────────────────────────────────
  // ── SUBVIEW: SCREEN 3 - MY JOURNEY ROADMAP ───────────────────
  // ─────────────────────────────────────────────────────────────
  if (subView === 'roadmap') {
    return (
      <LinearGradient
        colors={isDark ? ['#090D1A', '#0D1126', '#141933'] : ['#F6F7FD', '#EEF2FF', '#FFFFFF']}
        style={styles.gradientContainer}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.subviewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with back button */}
          <View style={styles.subviewHeader}>
            <TouchableOpacity
              style={[styles.backNavBtn, isDark && styles.backNavBtnDark]}
              onPress={() => setSubView('dashboard')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={isDark ? '#FFFFFF' : '#1E1B4B'} />
            </TouchableOpacity>
            <Text style={[styles.subviewHeaderTitle, isDark && styles.textWhite]}>My Journey</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Roadmap Mountain Banner / Title */}
          <View style={styles.roadmapHeroSection}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.roadmapHeroTitle, isDark && styles.textWhite]}>
                My Journey{'\n'}Roadmap
              </Text>
              <Text style={[styles.roadmapHeroSubtitle, isDark && styles.textMutedDark]}>
                Personalized milestones – kept private to you and your guide.
              </Text>
            </View>
            <Image
              source={
                isDark
                  ? require('../../assets/roadmap_dark.png')
                  : require('../../assets/hd_mountain_summit.png')
              }
              style={{ width: 110, height: 100 }}
              resizeMode="contain"
            />
          </View>

          {/* Stepper Milestones Card */}
          <View style={[styles.stepperCard, isDark && styles.cardDark]}>
            {/* Step 1: Account Initialized */}
            <View style={styles.stepperRow}>
              <View style={styles.stepIndicatorCol}>
                <View style={styles.stepCircleCompleted}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
                <View style={[styles.stepConnectorLine, isDark && styles.connectorLineDark]} />
              </View>
              <View style={styles.stepContentCol}>
                <View style={styles.stepTitleBadgeRow}>
                  <Text style={[styles.stepTitleText, isDark && styles.textWhite]}>
                    Account Initialized
                  </Text>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                </View>
                <Text style={[styles.stepDescText, isDark && styles.textMutedDark]}>
                  Connected with OpenHand learning ecosystem &amp; course library.
                </Text>
              </View>
            </View>

            {/* Step 2: Daily Check-in Rhythm */}
            <View style={styles.stepperRow}>
              <View style={styles.stepIndicatorCol}>
                <View style={styles.stepCircleAction}>
                  <Text style={styles.stepNumberTextAction}>2</Text>
                </View>
                <View style={[styles.stepConnectorLine, isDark && styles.connectorLineDark]} />
              </View>
              <View style={styles.stepContentCol}>
                <View style={styles.stepTitleBadgeRow}>
                  <Text style={[styles.stepTitleText, isDark && styles.textWhite]}>
                    Daily Check-in Rhythm
                  </Text>
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>Action</Text>
                  </View>
                </View>
                <Text style={[styles.stepDescText, isDark && styles.textMutedDark]}>
                  Log your first daily check-in to track your mood and sleep rhythm.
                </Text>
              </View>
            </View>

            {/* Step 3: Live Interactive Sessions */}
            <View style={styles.stepperRow}>
              <View style={styles.stepIndicatorCol}>
                <View style={styles.stepCircleLearning}>
                  <Text style={styles.stepNumberTextLearning}>3</Text>
                </View>
                <View style={[styles.stepConnectorLine, isDark && styles.connectorLineDark]} />
              </View>
              <View style={styles.stepContentCol}>
                <View style={styles.stepTitleBadgeRow}>
                  <Text style={[styles.stepTitleText, isDark && styles.textWhite]}>
                    Live Interactive Sessions
                  </Text>
                  <View style={styles.learningBadge}>
                    <Text style={styles.learningBadgeText}>Live Learning</Text>
                  </View>
                </View>
                <Text style={[styles.stepDescText, isDark && styles.textMutedDark]}>
                  You have 3 live interactive session(s) scheduled.
                </Text>
              </View>
            </View>

            {/* Step 4: Peer Support & Growth Circles */}
            <View style={styles.stepperRow}>
              <View style={styles.stepIndicatorCol}>
                <View style={styles.stepCircleUpcoming}>
                  <Text style={styles.stepNumberTextUpcoming}>4</Text>
                </View>
              </View>
              <View style={styles.stepContentCol}>
                <View style={styles.stepTitleBadgeRow}>
                  <Text style={[styles.stepTitleText, isDark && styles.textWhite]}>
                    Peer Support &amp; Growth Circles
                  </Text>
                  <View style={styles.upcomingBadge}>
                    <Text style={styles.upcomingBadgeText}>Upcoming</Text>
                  </View>
                </View>
                <Text style={[styles.stepDescText, isDark && styles.textMutedDark]}>
                  Join Circles to share reflections, track milestones, and learn alongside peers.
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom CTA Button */}
          <TouchableOpacity
            style={{ marginTop: 20 }}
            onPress={() => navigation.navigate('Community')}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#7C3AED', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryCtaBtn}
            >
              <Text style={styles.primaryCtaBtnText}>Explore &amp; Join Circles →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // ── SUBVIEW: SCREEN 4 - MILESTONES YOU'VE REACHED ─────────────
  // ─────────────────────────────────────────────────────────────
  if (subView === 'milestones') {
    return (
      <LinearGradient
        colors={isDark ? ['#090D1A', '#0D1126', '#141933'] : ['#F6F7FD', '#EEF2FF', '#FFFFFF']}
        style={styles.gradientContainer}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.subviewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with back button */}
          <View style={styles.subviewHeader}>
            <TouchableOpacity
              style={[styles.backNavBtn, isDark && styles.backNavBtnDark]}
              onPress={() => setSubView('dashboard')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={isDark ? '#FFFFFF' : '#1E1B4B'} />
            </TouchableOpacity>
            <Text style={[styles.subviewHeaderTitle, isDark && styles.textWhite]}>My Journey</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Title & Subtitle */}
          <Text style={[styles.milestonesScreenTitle, isDark && styles.textWhite]}>
            Milestones you've reached
          </Text>
          <Text style={[styles.milestonesScreenSubtitle, isDark && styles.textMutedDark]}>
            These milestones are private by default.{'\n'}If you ever want to share one, that's your choice.
          </Text>

          {/* 2x2 Milestones Grid */}
          <View style={styles.milestonesGrid2x2}>
            {/* Card 1: Joined platform (Active Gradient Card) */}
            <LinearGradient
              colors={['#7C3AED', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.milestoneGridCardActive}
            >
              <View style={styles.diamondBoxActive}>
                <Ionicons name="diamond" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.milestoneGridTitleActive}>Joined platform</Text>
              <Text style={styles.milestoneGridSubtitleActive}>12 Oct</Text>
            </LinearGradient>

            {/* Card 2: First check-in */}
            <View style={[styles.milestoneGridCard, isDark && styles.cardDark]}>
              <View style={styles.diamondBoxInactive}>
                <Ionicons name="diamond-outline" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              </View>
              <Text style={[styles.milestoneGridTitle, isDark && styles.textWhite]}>
                First check-in
              </Text>
              <Text style={[styles.milestoneGridSubtitle, isDark && styles.textMutedDark]}>
                {checkInCount > 0 ? 'Completed' : 'Not yet'}
              </Text>
            </View>

            {/* Card 3: First live session */}
            <View style={[styles.milestoneGridCard, isDark && styles.cardDark]}>
              <View style={styles.diamondBoxInactive}>
                <Ionicons name="diamond-outline" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              </View>
              <Text style={[styles.milestoneGridTitle, isDark && styles.textWhite]}>
                First live session
              </Text>
              <Text style={[styles.milestoneGridSubtitle, isDark && styles.textMutedDark]}>
                Not yet
              </Text>
            </View>

            {/* Card 4: Joined a circle */}
            <View style={[styles.milestoneGridCard, isDark && styles.cardDark]}>
              <View style={styles.diamondBoxInactive}>
                <Ionicons name="diamond-outline" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              </View>
              <Text style={[styles.milestoneGridTitle, isDark && styles.textWhite]}>
                Joined a circle
              </Text>
              <Text style={[styles.milestoneGridSubtitle, isDark && styles.textMutedDark]}>
                {joinedCircles.length > 0 ? 'Completed' : 'Not yet'}
              </Text>
            </View>
          </View>

          {/* Your Progress Card */}
          <View style={[styles.progressCard, isDark && styles.cardDark]}>
            <View style={styles.progressHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="bar-chart" size={18} color="#7C3AED" />
                <Text style={[styles.progressTitle, isDark && styles.textWhite]}>Your Progress</Text>
              </View>
              <Text style={[styles.progressCountText, isDark && styles.textWhite]}>1 of 4</Text>
            </View>

            <View style={styles.progressBarTrack}>
              <LinearGradient
                colors={['#7C3AED', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: '25%' }]}
              />
            </View>
            <Text style={styles.progressPercentageText}>25%</Text>
          </View>

          {/* Quote Card */}
          <View style={[styles.quoteCard, isDark && styles.cardDark]}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.quoteMark}>“</Text>
              <Text style={[styles.quoteText, isDark && styles.textWhite]}>
                Every small step counts in your journey.
              </Text>
            </View>
            <Image
              source={require('../../assets/hd_leaf_sprig.png')}
              style={{ width: 55, height: 65 }}
              resizeMode="contain"
            />
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // ── SCREEN 2: MAIN DASHBOARD ("MY JOURNEY") ──────────────────
  // ─────────────────────────────────────────────────────────────
  return (
    <LinearGradient
      colors={isDark ? ['#090D1A', '#0D1126', '#141933'] : ['#F6F7FD', '#EEF2FF', '#FFFFFF']}
      style={styles.gradientContainer}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.brandTitle, isDark && styles.textWhite]}>OpenHand</Text>
            <Text style={[styles.brandSubtitle, isDark && styles.textMutedDark]}>My Journey</Text>
          </View>

          <View style={styles.topBarActions}>
            {/* Theme Toggle Pill (Dark / Light) */}
            <TouchableOpacity
              style={[styles.themePillBtn, isDark && styles.themePillBtnDark]}
              onPress={toggleTheme}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={14}
                color={isDark ? '#FBBF24' : '#7C3AED'}
              />
              <Text style={[styles.themePillText, isDark && styles.themePillTextDark]}>
                {isDark ? 'Light' : 'Dark'}
              </Text>
            </TouchableOpacity>

            {/* Notifications Button with Dot */}
            <TouchableOpacity
              style={[styles.iconBtn, isDark && styles.iconBtnDark]}
              onPress={() => setShowNotificationsModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={isDark ? '#FFFFFF' : '#1E1B4B'}
              />
              {unreadNotificationsCount > 0 && <View style={styles.unreadBadgeDot} />}
            </TouchableOpacity>

            {/* Avatar Pill with Initials */}
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#7C3AED', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Journey Subview Switcher Pills */}
        <View style={[styles.subviewTabsRow, isDark && styles.subviewTabsRowDark]}>
          <TouchableOpacity
            style={[styles.subviewTabBtn, subView === 'dashboard' && styles.subviewTabBtnActive]}
            onPress={() => setSubView('dashboard')}
            activeOpacity={0.8}
          >
            <Ionicons name="home" size={13} color={subView === 'dashboard' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')} />
            <Text style={[styles.subviewTabText, subView === 'dashboard' && styles.subviewTabTextActive, isDark && subView !== 'dashboard' && styles.textMutedDark]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subviewTabBtn, subView === 'roadmap' && styles.subviewTabBtnActive]}
            onPress={() => setSubView('roadmap')}
            activeOpacity={0.8}
          >
            <Ionicons name="map" size={13} color={subView === 'roadmap' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')} />
            <Text style={[styles.subviewTabText, subView === 'roadmap' && styles.subviewTabTextActive, isDark && subView !== 'roadmap' && styles.textMutedDark]}>
              Roadmap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subviewTabBtn, subView === 'milestones' && styles.subviewTabBtnActive]}
            onPress={() => setSubView('milestones')}
            activeOpacity={0.8}
          >
            <Ionicons name="trophy" size={13} color={subView === 'milestones' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')} />
            <Text style={[styles.subviewTabText, subView === 'milestones' && styles.subviewTabTextActive, isDark && subView !== 'milestones' && styles.textMutedDark]}>
              Milestones
            </Text>
          </TouchableOpacity>
        </View>

        {/* 100% Free Access Badge */}
        <View style={styles.badgeRow}>
          <View style={styles.freeBadge}>
            <Ionicons name="sparkles" size={12} color="#0D9488" />
            <Text style={styles.freeBadgeText}>100% Free Access</Text>
          </View>
        </View>

        {/* Welcome Hero Section with Illustration */}
        <View style={styles.heroSection}>
          <View style={styles.heroTextWrap}>
            <Text style={[styles.welcomeTitle, isDark && styles.textWhite]}>
              Welcome back,{'\n'}
              <Text style={styles.welcomeName}>{clientName} 👋</Text>
            </Text>
            <Text style={[styles.welcomeSubtitle, isDark && styles.textMutedDark]}>
              Your private learning journey, supported by OpenHand guides and peer circles.
            </Text>
          </View>
          <View style={styles.heroImageWrap}>
            <Image
              source={
                isDark
                  ? require('../../assets/hero_dark.png')
                  : require('../../assets/hd_hero_desk.png')
              }
              style={{ width: 105, height: 105 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* 3 Key Metrics Cards Row */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, isDark && styles.cardDark]}>
            <Ionicons name="flame" size={20} color="#F97316" />
            <Text style={[styles.metricNumber, isDark && styles.textWhite]}>{streak}</Text>
            <Text style={[styles.metricLabel, isDark && styles.textMutedDark]}>Day Streak</Text>
          </View>

          <View style={[styles.metricCard, isDark && styles.cardDark]}>
            <Ionicons name="disc" size={20} color="#7C3AED" />
            <Text style={[styles.metricNumber, isDark && styles.textWhite]}>{checkInCount}</Text>
            <Text style={[styles.metricLabel, isDark && styles.textMutedDark]}>Check-ins</Text>
          </View>

          <View style={[styles.metricCard, isDark && styles.cardDark]}>
            <Ionicons name="people" size={20} color="#6366F1" />
            <Text style={[styles.metricNumber, isDark && styles.textWhite]}>
              {joinedCircles.length}
            </Text>
            <Text style={[styles.metricLabel, isDark && styles.textMutedDark]}>Circles</Text>
          </View>
        </View>

        {/* 4 Quick Action Tiles Row */}
        <View style={styles.quickGrid}>
          {/* Tile 1: Daily Check-In */}
          <TouchableOpacity
            style={[styles.quickCard, isDark && styles.cardDark]}
            onPress={() => navigation.navigate('CheckIn')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="calendar" size={20} color="#3B82F6" />
            </View>
            <Text style={[styles.quickCardLabel, isDark && styles.textWhite]}>
              Daily{'\n'}Check-In
            </Text>
          </TouchableOpacity>

          {/* Tile 2: AURA Counselor */}
          <TouchableOpacity
            style={[styles.quickCard, isDark && styles.cardDark]}
            onPress={() => navigation.navigate('Aura')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="sparkles" size={20} color="#8B5CF6" />
            </View>
            <Text style={[styles.quickCardLabel, isDark && styles.textWhite]}>
              AURA{'\n'}Counselor
            </Text>
          </TouchableOpacity>

          {/* Tile 3: Courses Library */}
          <TouchableOpacity
            style={[styles.quickCard, isDark && styles.cardDark]}
            onPress={() => navigation.navigate('Courses')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconBox, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="book" size={20} color="#F97316" />
            </View>
            <Text style={[styles.quickCardLabel, isDark && styles.textWhite]}>
              Courses{'\n'}Library
            </Text>
          </TouchableOpacity>

          {/* Tile 4: Growth Circles */}
          <TouchableOpacity
            style={[styles.quickCard, isDark && styles.cardDark]}
            onPress={() => navigation.navigate('Community')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconBox, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="people" size={20} color="#A855F7" />
            </View>
            <Text style={[styles.quickCardLabel, isDark && styles.textWhite]}>
              Growth{'\n'}Circles
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Wellbeing Rhythm Card */}
        <View style={[styles.rhythmCard, isDark && styles.cardDark]}>
          <View style={styles.rhythmHeader}>
            <Text style={[styles.rhythmTitle, isDark && styles.textWhite]}>
              Weekly Wellbeing Rhythm
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CheckIn')}>
              <Text style={styles.rhythmLink}>Full Rhythm →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rhythmTimeline}>
            <View style={[styles.rhythmLine, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]} />

            <View style={styles.rhythmDaysRow}>
              {DAYS_OF_WEEK.map((day, idx) => {
                const isActive = idx === 0;
                return (
                  <View key={day} style={styles.dayCol}>
                    <Text
                      style={[
                        styles.dayName,
                        isDark && styles.dayNameDark,
                        isActive && styles.dayNameActive,
                      ]}
                    >
                      {day}
                    </Text>
                    {isActive ? (
                      <View style={styles.activeHalo}>
                        <View style={styles.activeDot} />
                      </View>
                    ) : (
                      <View style={styles.inactiveHalo}>
                        <View style={[styles.inactiveDot, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.35)' }]} />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Today's Check-In Banner */}
        <View style={[styles.todayCard, isDark && styles.cardDark]}>
          <View style={[styles.todayIconWrap, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="calendar" size={22} color="#3B82F6" />
          </View>
          <View style={styles.todayInfo}>
            <Text style={[styles.todayTitle, isDark && styles.textWhite]}>Today's Check-In</Text>
            <Text style={[styles.todayDate, isDark && styles.textMutedDark]}>
              {todayDateFormatted}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CheckIn')}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#7C3AED', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logNowBtn}
            >
              <Text style={styles.logNowBtnText}>
                {hasCheckedInToday ? 'View Check-In ✓' : 'Log Now →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Small Check-In Affirmation Card */}
        <View style={styles.affirmationCard}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.affirmationText}>
              A small check-in today, a brighter tomorrow. 💜
            </Text>
          </View>
          <Image
            source={require('../../assets/hd_avatar_headphones.png')}
            style={{ width: 52, height: 48, borderRadius: 24 }}
            resizeMode="contain"
          />
        </View>

        {/* Navigation Action to Screen 3 (Roadmap) */}
        <TouchableOpacity
          style={[styles.navActionCard, isDark && styles.cardDark]}
          onPress={() => setSubView('roadmap')}
          activeOpacity={0.85}
        >
          <View style={styles.navActionLeft}>
            <View style={[styles.navIconBox, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="map" size={20} color="#7C3AED" />
            </View>
            <View>
              <Text style={[styles.navActionTitle, isDark && styles.textWhite]}>
                My Journey Roadmap
              </Text>
              <Text style={[styles.navActionSubtitle, isDark && styles.textMutedDark]}>
                View 4 personalized learning milestones
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#7C3AED" />
        </TouchableOpacity>

        {/* Navigation Action to Screen 4 (Milestones) */}
        <TouchableOpacity
          style={[styles.navActionCard, isDark && styles.cardDark]}
          onPress={() => setSubView('milestones')}
          activeOpacity={0.85}
        >
          <View style={styles.navActionLeft}>
            <View style={[styles.navIconBox, { backgroundColor: '#E6FBF5' }]}>
              <Ionicons name="trophy" size={20} color="#0D9488" />
            </View>
            <View>
              <Text style={[styles.navActionTitle, isDark && styles.textWhite]}>
                Milestones you've reached
              </Text>
              <Text style={[styles.navActionSubtitle, isDark && styles.textMutedDark]}>
                Track badges, platform join date &amp; progress
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#0D9488" />
        </TouchableOpacity>
      </ScrollView>

      {/* Notifications Center Modal */}
      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowNotificationsModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.notifModalCard, isDark && styles.cardDark]}
          >
            <View style={styles.notifModalHeader}>
              <View style={styles.notifTitleRow}>
                <Ionicons name="notifications" size={20} color="#7C3AED" />
                <Text style={[styles.notifModalTitle, isDark && styles.textWhite]}>
                  Notifications
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                <Ionicons name="close" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320 }}>
              {notifications.map((item) => (
                <View key={item.id} style={styles.notifItem}>
                  <View style={[styles.notifIconWrap, { backgroundColor: '#F3E8FF' }]}>
                    <Ionicons name={item.icon} size={18} color={item.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notifItemTitle, isDark && styles.textWhite]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.notifItemBody, isDark && styles.textMutedDark]}>
                      {item.body}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 40,
  },
  subviewContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 40,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textMutedDark: {
    color: '#94A3B8',
  },
  cardDark: {
    backgroundColor: '#141933',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  // ── Top Bar ──
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  themePillBtnDark: {
    backgroundColor: '#141933',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  themePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  themePillTextDark: {
    color: '#FFFFFF',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDark: {
    backgroundColor: '#141933',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unreadBadgeDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // ── Journey Subview Switcher Pills ──
  subviewTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 3,
    marginBottom: 14,
    gap: 4,
  },
  subviewTabsRowDark: {
    backgroundColor: '#141933',
  },
  subviewTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: 16,
  },
  subviewTabBtnActive: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  subviewTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  subviewTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // ── 100% Free Access Badge ──
  badgeRow: {
    marginBottom: 10,
  },
  freeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6FBF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  freeBadgeText: {
    color: '#0D9488',
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Welcome Hero Section ──
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1B4B',
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  welcomeName: {
    color: '#1E1B4B',
  },
  welcomeSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 17,
  },
  heroImageWrap: {
    width: 120,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 120,
    height: 100,
  },

  // ── 3 Metrics Cards Row ──
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // ── 4 Quick Actions Grid ──
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  quickIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E1B4B',
    textAlign: 'center',
    lineHeight: 14,
  },

  // ── Weekly Wellbeing Rhythm Card ──
  rhythmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginBottom: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  rhythmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rhythmTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  rhythmLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  rhythmTimeline: {
    position: 'relative',
    paddingVertical: 4,
  },
  rhythmLine: {
    position: 'absolute',
    top: 26,
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  rhythmDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  dayNameDark: {
    color: '#94A3B8',
  },
  dayNameActive: {
    color: '#7C3AED',
    fontWeight: '800',
  },
  activeHalo: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },
  inactiveHalo: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },

  // ── Today's Check-In Banner ──
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginBottom: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  todayIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayInfo: {
    flex: 1,
    marginLeft: 12,
  },
  todayTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  todayDate: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  logNowBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  logNowBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // ── Affirmation Card ──
  affirmationCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    marginBottom: 14,
  },
  affirmationText: {
    color: '#6D28D9',
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 18,
  },
  avatarSmallIllustration: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Nav Action Cards (Roadmap / Milestones) ──
  navActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginBottom: 10,
  },
  navActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navActionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  navActionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // ── Subview Common Header ──
  subviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backNavBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  backNavBtnDark: {
    backgroundColor: '#141933',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  subviewHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
  },

  // ── Screen 3: Roadmap Styles ──
  roadmapHeroSection: {
    marginBottom: 20,
  },
  roadmapHeroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E1B4B',
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  roadmapHeroSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 18,
  },
  mountainIllustration: {
    width: '100%',
    height: 120,
    marginTop: 8,
  },
  stepperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  stepperRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  stepCircleCompleted: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleAction: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  stepNumberTextAction: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3B82F6',
  },
  stepCircleLearning: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
  },
  stepNumberTextLearning: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  stepCircleUpcoming: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6FBF5',
  },
  stepNumberTextUpcoming: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D9488',
  },
  stepConnectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  connectorLineDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  stepContentCol: {
    flex: 1,
  },
  stepTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  completedBadge: {
    backgroundColor: '#E6FBF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  completedBadgeText: {
    color: '#0D9488',
    fontSize: 10.5,
    fontWeight: '700',
  },
  actionBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  actionBadgeText: {
    color: '#8B5CF6',
    fontSize: 10.5,
    fontWeight: '700',
  },
  learningBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  learningBadgeText: {
    color: '#7C3AED',
    fontSize: 10.5,
    fontWeight: '700',
  },
  upcomingBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  upcomingBadgeText: {
    color: '#3B82F6',
    fontSize: 10.5,
    fontWeight: '700',
  },
  stepDescText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  primaryCtaBtn: {
    borderRadius: 18,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // ── Screen 4: Milestones Styles ──
  milestonesScreenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  milestonesScreenSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  milestonesGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  milestoneGridCardActive: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  diamondBoxActive: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  milestoneGridTitleActive: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  milestoneGridSubtitleActive: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11.5,
    marginTop: 4,
  },
  milestoneGridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  diamondBoxInactive: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  milestoneGridTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  milestoneGridSubtitle: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginBottom: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  progressCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
    textAlign: 'right',
    marginTop: 6,
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteMark: {
    fontSize: 28,
    color: '#7C3AED',
    fontWeight: '900',
    lineHeight: 28,
  },
  quoteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E1B4B',
    lineHeight: 19,
  },
  leafIconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Modal Styles ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  notifModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  notifModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  notifItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  notifIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  notifItemBody: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
});

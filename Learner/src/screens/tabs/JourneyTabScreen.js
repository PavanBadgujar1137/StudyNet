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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function JourneyTabScreen({ navigation }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleCopyLearnerId = () => {
    const idToCopy = user?.learnerId || 'LRN-250573';
    Alert.alert(
      'Learner ID',
      `Your unique ID is: ${idToCopy}\n\nShare this ID with your practitioner guide to claim scholarships and personalized course access.`
    );
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

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#040817', '#08112C', '#0E1D45', '#080E24']
          : ['#DCEEFF', '#E8F2FF', '#F4F0FF', '#FFFFFF']
      }
      style={styles.gradientContainer}
    >
      {/* ── Ambient Floating Watercolor Blobs for Bright Mode ── */}
      {!isDark && (
        <>
          <View style={styles.ambientBlobTopRight} />
          <View style={styles.ambientBlobCenter} />
          <View style={styles.ambientBlobLeft} />
        </>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Top App Bar (With Visible Dark/Bright Mode Toggle) ── */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.brandTitle, isDark && styles.textMutedDark]}>OpenHand</Text>
            <Text style={[styles.brandSubtitle, isDark && styles.textWhite]}>My Journey</Text>
          </View>

          <View style={styles.topBarActions}>
            {/* Theme Toggle Button (Light / Dark) */}
            <TouchableOpacity
              style={[styles.themePillBtn, isDark && styles.themePillBtnDark]}
              onPress={toggleTheme}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={14}
                color={isDark ? '#FBBF24' : '#1E64EB'}
              />
              <Text style={[styles.themePillText, isDark && styles.themePillTextDark]}>
                {isDark ? 'Light' : 'Dark'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, isDark && styles.iconBtnDark]}
              onPress={() => Alert.alert('Notifications', 'You have no new notifications.')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={isDark ? '#FFFFFF' : '#0F172A'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.8}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Badges Row (100% Free Access & LRN-250573) ── */}
        <View style={styles.badgesRow}>
          <View style={[styles.freeBadge, isDark && styles.freeBadgeDark]}>
            <Text style={[styles.freeBadgeText, isDark && styles.freeBadgeTextDark]}>
              100% Free Access
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.lrnBadge, isDark && styles.lrnBadgeDark]}
            onPress={handleCopyLearnerId}
            activeOpacity={0.8}
          >
            <Ionicons
              name="document-text-outline"
              size={13}
              color={isDark ? '#60A5FA' : '#1E64EB'}
            />
            <Text style={[styles.lrnBadgeText, isDark && styles.lrnBadgeTextDark]}>
              {learnerId}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Welcome Hero Section (Serif Heading + Transparent Illustration) ── */}
        <View style={styles.heroSection}>
          <View style={styles.heroTextWrap}>
            <Text style={[styles.welcomeTitle, isDark && styles.welcomeTitleDark]}>
              Welcome back,{'\n'}
              <Text style={styles.welcomeName}>
                {clientName} 👋
              </Text>
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
                  : require('../../assets/hero_learner.png')
              }
              style={[styles.heroImage, isDark && styles.heroImageDark]}
            />
          </View>
        </View>

        {/* ── Key Metrics Card (Streak, Check-ins, Circles) ── */}
        <View style={[styles.metricsCard, isDark && styles.cardDark]}>
          <View style={styles.metricItem}>
            <View style={styles.metricIconBox}>
              <Ionicons name="flame" size={22} color="#F97316" />
            </View>
            <Text style={[styles.metricValue, isDark && styles.textWhite]}>{streak}</Text>
            <Text style={[styles.metricLabel, isDark && styles.textMutedDark]}>Day Streak</Text>
          </View>

          <View style={[styles.metricDivider, isDark && styles.metricDividerDark]} />

          <View style={styles.metricItem}>
            <View style={styles.metricIconBox}>
              <Ionicons name="disc" size={22} color={isDark ? '#38BDF8' : '#1E64EB'} />
            </View>
            <Text style={[styles.metricValue, isDark && styles.textWhite]}>{checkInCount}</Text>
            <Text style={[styles.metricLabel, isDark && styles.textMutedDark]}>Check-ins</Text>
          </View>

          <View style={[styles.metricDivider, isDark && styles.metricDividerDark]} />

          <View style={styles.metricItem}>
            <View style={styles.metricIconBox}>
              <Ionicons name="people" size={22} color={isDark ? '#C084FC' : '#9333EA'} />
            </View>
            <Text style={[styles.metricValue, isDark && styles.textWhite]}>
              {joinedCircles.length}
            </Text>
            <Text style={[styles.metricLabel, isDark && styles.textMutedDark]}>Circles</Text>
          </View>
        </View>

        {/* ── 4 Quick Actions Grid (Daily Check-in, AURA, Courses, Growth Circles) ── */}
        <View style={styles.quickGrid}>
          {/* Tile 1: Daily Check-In */}
          <TouchableOpacity
            style={[styles.quickCard, isDark && styles.quickCardDarkDaily]}
            onPress={() => navigation.navigate('CheckIn')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.quickIconWrap,
                { backgroundColor: isDark ? 'transparent' : '#EFF6FF' },
              ]}
            >
              <Ionicons
                name="checkbox"
                size={22}
                color={isDark ? '#3B82F6' : '#1E64EB'}
              />
            </View>
            <View style={styles.quickCardLabelRow}>
              <Text style={[styles.quickCardLabel, isDark && styles.textWhite]}>
                Daily{'\n'}Check-In
              </Text>
              {isDark && (
                <Ionicons name="chevron-forward" size={13} color="#60A5FA" style={styles.chevronIcon} />
              )}
            </View>
          </TouchableOpacity>

          {/* Tile 2: AURA Counselor */}
          <TouchableOpacity
            style={[styles.quickCard, isDark && styles.quickCardDarkAura]}
            onPress={() => navigation.navigate('Aura')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.quickIconWrap,
                { backgroundColor: isDark ? 'transparent' : '#E6FBF5' },
              ]}
            >
              <Ionicons
                name="sparkles"
                size={21}
                color={isDark ? '#14B8A6' : '#0D9488'}
              />
            </View>
            <View style={styles.quickCardLabelRow}>
              <Text style={[styles.quickCardLabel, isDark && styles.textWhite]}>
                AURA{'\n'}Counselor
              </Text>
              {isDark && (
                <Ionicons name="chevron-forward" size={13} color="#2DD4BF" style={styles.chevronIcon} />
              )}
            </View>
          </TouchableOpacity>

          {/* Tile 3: Courses Library */}
          <TouchableOpacity
            style={[styles.quickCard, isDark && styles.quickCardDarkCourses]}
            onPress={() => navigation.navigate('Courses')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.quickIconWrap,
                { backgroundColor: isDark ? 'transparent' : '#FFF7ED' },
              ]}
            >
              <Ionicons
                name="book"
                size={21}
                color={isDark ? '#F59E0B' : '#EA580C'}
              />
            </View>
            <View style={styles.quickCardLabelRow}>
              <Text style={[styles.quickCardLabel, isDark && styles.textWhite]}>
                Courses{'\n'}Library
              </Text>
              {isDark && (
                <Ionicons name="chevron-forward" size={13} color="#FBBF24" style={styles.chevronIcon} />
              )}
            </View>
          </TouchableOpacity>

          {/* Tile 4: Growth Circles */}
          <TouchableOpacity
            style={[styles.quickCard, isDark && styles.quickCardDarkCircles]}
            onPress={() => navigation.navigate('Community')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.quickIconWrap,
                { backgroundColor: isDark ? 'transparent' : '#FAF5FF' },
              ]}
            >
              <Ionicons
                name="people"
                size={23}
                color={isDark ? '#A855F7' : '#9333EA'}
              />
            </View>
            <View style={styles.quickCardLabelRow}>
              <Text style={[styles.quickCardLabel, isDark && styles.textWhite]}>
                Growth{'\n'}Circles
              </Text>
              {isDark && (
                <Ionicons name="chevron-forward" size={13} color="#C084FC" style={styles.chevronIcon} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Weekly Wellbeing Rhythm Card ── */}
        <View style={[styles.rhythmCard, isDark && styles.cardDark]}>
          <View style={styles.rhythmHeader}>
            <Text style={[styles.rhythmTitle, isDark && styles.textWhite]}>
              Weekly Wellbeing Rhythm
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CheckIn')}>
              <Text style={[styles.rhythmLink, isDark && styles.rhythmLinkDark]}>
                Full Rhythm →
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rhythmTimeline}>
            {/* Timeline Connecting Line */}
            <View
              style={[
                styles.rhythmLine,
                isDark && { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
              ]}
            />

            <View style={styles.rhythmDaysRow}>
              {DAYS_OF_WEEK.map((day, idx) => {
                const isActive = idx === 0; // Monday active in mockup
                return (
                  <View key={day} style={styles.dayCol}>
                    <Text
                      style={[
                        styles.dayName,
                        isDark && styles.dayNameDark,
                        isActive && (isDark ? styles.dayNameActiveDark : styles.dayNameActive),
                      ]}
                    >
                      {day}
                    </Text>
                    {isActive ? (
                      <View
                        style={[
                          styles.activeHalo,
                          isDark && { backgroundColor: 'rgba(56, 189, 248, 0.25)' },
                        ]}
                      >
                        <View
                          style={[
                            styles.activeDot,
                            isDark && { backgroundColor: '#38BDF8' },
                          ]}
                        />
                      </View>
                    ) : (
                      <View style={styles.inactiveHalo}>
                        <View
                          style={[
                            styles.inactiveDot,
                            isDark && {
                              backgroundColor: 'rgba(255, 255, 255, 0.35)',
                              borderColor: 'transparent',
                            },
                          ]}
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Dark mode decorative mountain wave silhouette */}
          {isDark && (
            <LinearGradient
              colors={['transparent', 'rgba(124, 58, 237, 0.15)', 'rgba(37, 99, 235, 0.25)']}
              style={styles.rhythmGlowWave}
            />
          )}
        </View>

        {/* ── Today's Check-In Banner Card ── */}
        <View style={[styles.todayCard, isDark && styles.cardDark]}>
          <View
            style={[
              styles.todayIconWrap,
              isDark && {
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
                borderWidth: 1,
              },
            ]}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'calendar'}
              size={24}
              color={isDark ? '#F59E0B' : '#1E64EB'}
            />
          </View>
          <View style={styles.todayInfo}>
            <Text style={[styles.todayTitle, isDark && styles.textWhite]}>
              Today's Check-In
            </Text>
            <Text style={[styles.todayDate, isDark && styles.textMutedDark]}>
              {todayDateFormatted}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.logNowBtn,
              hasCheckedInToday && styles.logNowBtnDone,
              isDark && styles.logNowBtnDark,
            ]}
            onPress={() => navigation.navigate('CheckIn')}
            activeOpacity={0.8}
          >
            <Text style={styles.logNowBtnText}>
              {hasCheckedInToday ? 'View Check-In ✓' : 'Log Now →'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── MY JOURNEY ROADMAP (Adaptive Climber Illustration) ── */}
        <View style={styles.roadmapHeader}>
          <Text style={[styles.roadmapTitle, isDark && styles.roadmapTitleDark]}>
            MY JOURNEY ROADMAP
          </Text>
          <Text style={[styles.roadmapSubtitle, isDark && styles.textMutedDark]}>
            Personalized milestones — kept private to you and your guide.
          </Text>
        </View>

        <View style={[styles.roadmapCard, isDark && styles.cardDark]}>
          {/* Timeline items on left */}
          <View style={styles.stepsColumn}>
            {/* Step 1 */}
            <View style={styles.stepItem}>
              <View style={styles.stepIndicatorCol}>
                <View style={styles.checkCircleDone}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
                <View
                  style={[
                    styles.verticalStepLine,
                    isDark && { backgroundColor: 'rgba(16, 185, 129, 0.35)' },
                  ]}
                />
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, isDark && styles.textWhite]}>
                  Account Initialized
                </Text>
                <Text style={[styles.stepDesc, isDark && styles.textMutedDark]}>
                  Connected with OpenHand learning ecosystem &amp; course library.
                </Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.stepItem}>
              <View style={styles.stepIndicatorCol}>
                <View
                  style={[
                    styles.stepCircleActive,
                    isDark && {
                      backgroundColor: 'transparent',
                      borderColor: '#38BDF8',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumberActive,
                      isDark && { color: '#38BDF8' },
                    ]}
                  >
                    2
                  </Text>
                </View>
                <View
                  style={[
                    styles.verticalStepLine,
                    isDark && { backgroundColor: 'rgba(56, 189, 248, 0.3)' },
                  ]}
                />
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Text style={[styles.stepTitle, isDark && styles.textWhite]}>
                    Daily Check-in Rhythm
                  </Text>
                  <View style={[styles.stepTag, isDark && styles.stepTagDark]}>
                    <Text style={[styles.stepTagText, isDark && styles.stepTagTextDark]}>
                      {checkInCount > 0 ? `${checkInCount} Logged` : 'Action'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.stepDesc, isDark && styles.textMutedDark]}>
                  {checkInCount > 0
                    ? `You have logged ${checkInCount} check-ins so far. Keep up the rhythm!`
                    : 'Log your first daily check-in to track your mood and sleep rhythm.'}
                </Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.stepItem}>
              <View style={styles.stepIndicatorCol}>
                <View
                  style={[
                    styles.stepCircleActive,
                    { borderColor: isDark ? '#A855F7' : '#7C3AED' },
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumberActive,
                      { color: isDark ? '#C084FC' : '#7C3AED' },
                    ]}
                  >
                    3
                  </Text>
                </View>
                <View
                  style={[
                    styles.verticalStepLine,
                    isDark && { backgroundColor: 'rgba(168, 85, 247, 0.3)' },
                  ]}
                />
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Text style={[styles.stepTitle, isDark && styles.textWhite]}>
                    Live Interactive Sessions
                  </Text>
                  <View style={[styles.stepTag, { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.25)' : '#FAF5FF', borderColor: '#E9D5FF' }]}>
                    <Text style={[styles.stepTagText, { color: isDark ? '#C084FC' : '#7C3AED' }]}>
                      Live Learning
                    </Text>
                  </View>
                </View>
                <Text style={[styles.stepDesc, isDark && styles.textMutedDark]}>
                  {dashboardData?.upcomingClasses?.length
                    ? `You have ${dashboardData.upcomingClasses.length} live interactive session(s) scheduled.`
                    : 'Enroll in courses or sessions to join live interactive sessions with your instructor.'}
                </Text>
              </View>
            </View>

            {/* Step 4 */}
            <View style={styles.stepItem}>
              <View style={styles.stepIndicatorCol}>
                <View
                  style={[
                    styles.stepCircleActive,
                    { borderColor: isDark ? '#2DD4BF' : '#0D9488' },
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumberActive,
                      { color: isDark ? '#2DD4BF' : '#0D9488' },
                    ]}
                  >
                    4
                  </Text>
                </View>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Text style={[styles.stepTitle, isDark && styles.textWhite]}>
                    Peer Support &amp; Growth Circles
                  </Text>
                  <View style={[styles.stepTag, { backgroundColor: isDark ? 'rgba(13, 148, 136, 0.25)' : '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <Text style={[styles.stepTagText, { color: isDark ? '#2DD4BF' : '#0D9488' }]}>
                      {joinedCircles.length > 0 ? `${joinedCircles.length} Joined` : 'Ongoing'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.stepDesc, isDark && styles.textMutedDark]}>
                  Join Circles to share reflections, track milestones, and learn alongside peers.
                </Text>
                <TouchableOpacity
                  style={[styles.stepActionBtn, isDark && styles.stepActionBtnDark]}
                  onPress={() => navigation.navigate('Community')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.stepActionBtnText}>Explore &amp; Join Circles →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Mountain Climber Illustration on right */}
          <View style={styles.climberColumn}>
            <Image
              source={
                isDark
                  ? require('../../assets/hero_dark.png')
                  : require('../../assets/roadmap_climber.png')
              }
              style={[styles.climberImage, isDark && styles.climberImageDark]}
            />
          </View>
        </View>

        {/* ── Milestones You've Reached Section ── */}
        <View style={styles.milestonesSection}>
          <Text style={[styles.milestonesHeaderTitle, isDark && styles.textWhite]}>
            Milestones you've reached
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.milestonesScrollRow}>
            {/* Milestone 1: Joined platform */}
            <View style={[styles.milestoneCard, styles.milestoneCardActive]}>
              <Text style={styles.milestoneDiamondActive}>◆</Text>
              <Text style={styles.milestoneTitleActive}>Joined platform</Text>
              <Text style={styles.milestoneDateActive}>12 Oct</Text>
            </View>

            {/* Milestone 2: First check-in */}
            <View style={[styles.milestoneCard, isDark && styles.milestoneCardDark]}>
              <Text style={[styles.milestoneDiamond, isDark && styles.textMutedDark]}>
                {checkInCount > 0 ? '◆' : '◇'}
              </Text>
              <Text style={[styles.milestoneTitle, isDark && styles.textWhite]}>First check-in</Text>
              <Text style={[styles.milestoneDate, isDark && styles.textMutedDark]}>
                {checkInCount > 0 ? 'Achieved' : 'Not yet'}
              </Text>
            </View>

            {/* Milestone 3: Check-in(s) logged */}
            <View style={[styles.milestoneCard, isDark && styles.milestoneCardDark]}>
              <Text style={[styles.milestoneDiamond, isDark && styles.textMutedDark]}>
                {checkInCount >= 5 ? '◆' : '◇'}
              </Text>
              <Text style={[styles.milestoneTitle, isDark && styles.textWhite]}>
                {checkInCount} check-in(s) logged
              </Text>
              <Text style={[styles.milestoneDate, isDark && styles.textMutedDark]}>In progress</Text>
            </View>

            {/* Milestone 4: Joined a circle */}
            <View style={[styles.milestoneCard, isDark && styles.milestoneCardDark]}>
              <Text style={[styles.milestoneDiamond, isDark && styles.textMutedDark]}>
                {joinedCircles.length > 0 ? '◆' : '◇'}
              </Text>
              <Text style={[styles.milestoneTitle, isDark && styles.textWhite]}>Joined a circle</Text>
              <Text style={[styles.milestoneDate, isDark && styles.textMutedDark]}>
                {joinedCircles.length > 0 ? 'Achieved' : 'Not yet'}
              </Text>
            </View>
          </ScrollView>

          <Text style={[styles.milestonesFootnote, isDark && styles.textMutedDark]}>
            Milestones are private by default. If you ever want to share one, that's your choice.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const serifFont = Platform.OS === 'web' ? 'Georgia, "Playfair Display", "Times New Roman", serif' : (Platform.OS === 'ios' ? 'Georgia' : 'serif');

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 52 : 28,
    paddingBottom: 40,
  },
  /* ── Ambient Fluid Blobs for Bright Mode ── */
  ambientBlobTopRight: {
    position: 'absolute',
    top: -20,
    right: -30,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(186, 230, 253, 0.4)',
    pointerEvents: 'none',
  },
  ambientBlobCenter: {
    position: 'absolute',
    top: 140,
    right: 20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(237, 233, 254, 0.45)',
    pointerEvents: 'none',
  },
  ambientBlobLeft: {
    position: 'absolute',
    top: 300,
    left: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(219, 234, 254, 0.35)',
    pointerEvents: 'none',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textMutedDark: {
    color: '#94A3B8',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
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
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
  },
  themePillBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  themePillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E64EB',
  },
  themePillTextDark: {
    color: '#FBBF24',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  iconBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E64EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E64EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  freeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  freeBadgeDark: {
    backgroundColor: 'rgba(6, 78, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  freeBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  freeBadgeTextDark: {
    color: '#34D399',
  },
  lrnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 4,
  },
  lrnBadgeDark: {
    backgroundColor: 'rgba(30, 58, 138, 0.5)',
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  lrnBadgeText: {
    color: '#1E64EB',
    fontSize: 11,
    fontWeight: '700',
  },
  lrnBadgeTextDark: {
    color: '#60A5FA',
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroTextWrap: {
    flex: 1.15,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: serifFont,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  welcomeTitleDark: {
    color: '#FFFFFF',
    fontFamily: undefined,
  },
  welcomeName: {
    fontWeight: '800',
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 8,
  },
  heroImageWrap: {
    flex: 0.85,
    alignItems: 'flex-end',
  },
  heroImage: {
    width: 155,
    height: 155,
    resizeMode: 'contain',
  },
  heroImageDark: {
    borderRadius: 16,
    width: 130,
    height: 130,
  },
  metricsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.7)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 14,
  },
  cardDark: {
    backgroundColor: 'rgba(13, 21, 44, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.09)',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricIconBox: {
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F1F5F9',
  },
  metricDividerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.7)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  quickCardDarkDaily: {
    backgroundColor: 'rgba(12, 30, 74, 0.85)',
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  quickCardDarkAura: {
    backgroundColor: 'rgba(5, 46, 43, 0.85)',
    borderColor: 'rgba(20, 184, 166, 0.35)',
  },
  quickCardDarkCourses: {
    backgroundColor: 'rgba(59, 26, 8, 0.85)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  quickCardDarkCircles: {
    backgroundColor: 'rgba(48, 13, 82, 0.85)',
    borderColor: 'rgba(168, 85, 247, 0.35)',
  },
  quickIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickCardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 13,
  },
  chevronIcon: {
    marginLeft: 2,
    marginTop: 6,
  },
  rhythmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.7)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },
  rhythmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  rhythmTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  rhythmLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E64EB',
  },
  rhythmLinkDark: {
    color: '#38BDF8',
  },
  rhythmTimeline: {
    position: 'relative',
    paddingVertical: 4,
    zIndex: 2,
  },
  rhythmLine: {
    position: 'absolute',
    top: 36,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  rhythmDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 8,
  },
  dayName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  dayNameDark: {
    color: '#94A3B8',
  },
  dayNameActive: {
    color: '#1E64EB',
    fontWeight: '800',
  },
  dayNameActiveDark: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  activeHalo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1E64EB',
  },
  inactiveHalo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#BFDBFE',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rhythmGlowWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 35,
    zIndex: 1,
  },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.7)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 18,
    gap: 12,
  },
  todayIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayInfo: {
    flex: 1,
  },
  todayTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  todayDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  logNowBtn: {
    backgroundColor: '#1E64EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#1E64EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  logNowBtnDark: {
    backgroundColor: '#2563EB',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.45,
  },
  logNowBtnDone: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
  },
  logNowBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  roadmapHeader: {
    marginBottom: 10,
  },
  roadmapTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E64EB',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  roadmapTitleDark: {
    color: '#60A5FA',
  },
  roadmapSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  roadmapCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.7)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  stepsColumn: {
    flex: 1.15,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 10,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  checkCircleDone: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalStepLine: {
    width: 2,
    height: 48,
    backgroundColor: '#A7F3D0',
    marginVertical: 4,
  },
  stepCircleActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#1E64EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberActive: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E64EB',
  },
  stepContent: {
    flex: 1,
    paddingBottom: 12,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 15,
  },
  climberColumn: {
    flex: 0.85,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  climberImage: {
    width: 130,
    height: 150,
    resizeMode: 'contain',
  },
  climberImageDark: {
    borderRadius: 14,
    width: 125,
    height: 145,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
    gap: 8,
  },
  stepTag: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stepTagDark: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  stepTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E64EB',
  },
  stepTagTextDark: {
    color: '#38BDF8',
  },
  stepActionBtn: {
    backgroundColor: '#1E64EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  stepActionBtnDark: {
    backgroundColor: '#2563EB',
  },
  stepActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  milestonesSection: {
    marginTop: 18,
    marginBottom: 24,
  },
  milestonesHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  milestonesScrollRow: {
    gap: 10,
    paddingBottom: 4,
  },
  milestoneCard: {
    width: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  milestoneCardActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  milestoneCardDark: {
    backgroundColor: 'rgba(13, 21, 44, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  milestoneDiamond: {
    fontSize: 18,
    color: '#94A3B8',
    marginBottom: 4,
  },
  milestoneDiamondActive: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  milestoneTitleActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  milestoneDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  milestoneDateActive: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  milestonesFootnote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 10,
    lineHeight: 16,
  },
});

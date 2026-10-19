import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Platform,
  Modal,
  Animated,
  BackHandler,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';

/* ───────────────────────── constants ───────────────────────── */

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BRAND = ['#7C3AED', '#4F46E5'];
// Hero illustration tile. The PNG has a solid background and a few stray pixels of
// text on its left edge, so we crop it: raise shiftX (more negative) to crop more.
const HERO_IMG = { tileW: 150, tileH: 132, size: 200, shiftX: -58, shiftY: -34 };
const LIVE_SESSION_COUNT = 3; // TODO: replace with real value from dashboardData when the API provides it

const QUICK_ACTIONS = [
  { key: 'checkin', label: 'Daily\nCheck-In', icon: 'calendar', color: '#3B82F6', screen: 'CheckIn' },
  { key: 'aura', label: 'AURA\nCounselor', icon: 'sparkles', color: '#8B5CF6', screen: 'Aura' },
  { key: 'courses', label: 'Courses\nLibrary', icon: 'book', color: '#F97316', screen: 'Courses' },
  { key: 'circles', label: 'Growth\nCircles', icon: 'people', color: '#A855F7', screen: 'Community' },
];

const STEP_TONES = {
  done: { circle: '#10B981', text: '#0D9488', bg: 'rgba(16,185,129,0.14)' },
  action: { circle: '#3B82F6', text: '#3B82F6', bg: 'rgba(59,130,246,0.14)' },
  learning: { circle: '#8B5CF6', text: '#7C3AED', bg: 'rgba(139,92,246,0.15)' },
  upcoming: { circle: '#0D9488', text: '#0D9488', bg: 'rgba(13,148,136,0.14)' },
};

/* ───────────────────────── theme ───────────────────────── */

const getTheme = (isDark) => ({
  isDark,
  bg: isDark ? ['#090D1A', '#0D1126', '#141933'] : ['#E9E5FF', '#F1EFFF', '#FBFAFF'],
  card: isDark ? '#141933' : '#FFFFFF',
  cardBorder: isDark ? 'rgba(255,255,255,0.08)' : '#ECE8FB',
  text: isDark ? '#FFFFFF' : '#1E1B4B',
  muted: isDark ? '#94A3B8' : '#64748B',
  divider: isDark ? 'rgba(255,255,255,0.12)' : '#E8E6F5',
  track: isDark ? 'rgba(255,255,255,0.14)' : '#DAD6F0',
  accent: isDark ? '#A78BFA' : '#7C3AED',
  brandHand: isDark ? '#A78BFA' : '#6D28D9',
  shadow: isDark ? '#000000' : '#7C3AED',
  blobA: isDark ? 'rgba(124,58,237,0.22)' : 'rgba(124,58,237,0.16)',
  blobB: isDark ? 'rgba(59,130,246,0.14)' : 'rgba(99,102,241,0.14)',
});

/* ───────────────────────── small building blocks ───────────────────────── */

// Single entrance animation (fade + slide) used for the whole screen's sections.
function FadeInUp({ delay = 0, style, children }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 450, delay, useNativeDriver: true }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Pressable with a subtle scale response.
function Press({ onPress, style, wrapStyle, children, scaleTo = 0.97 }) {
  const s = useRef(new Animated.Value(1)).current;
  const to = (value) =>
    Animated.spring(s, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => to(scaleTo)}
      onPressOut={() => to(1)}
      style={wrapStyle}
    >
      <Animated.View style={[style, { transform: [{ scale: s }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

function Shell({ t, styles, refreshControl, contentStyle, children }) {
  return (
    <LinearGradient colors={t.bg} style={styles.flex}>
      <View pointerEvents="none" style={[styles.blob, styles.blobTop]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobLeft]} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </LinearGradient>
  );
}

function SubHeader({ t, styles, title, onBack }) {
  return (
    <View style={styles.subHeader}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={22} color={t.text} />
      </TouchableOpacity>
      <Text style={styles.subHeaderTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

/* ───────────────────────── screen ───────────────────────── */

export default function JourneyTabScreen({ navigation }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();
  const t = useMemo(() => getTheme(isDark), [isDark]);
  const styles = useMemo(() => makeStyles(t), [t]);

  // 'dashboard' (Screen 2) | 'roadmap' (Screen 3) | 'milestones' (Screen 4)
  const [subView, setSubView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
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
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Android hardware back returns to the dashboard from sub screens.
  useEffect(() => {
    if (subView === 'dashboard') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setSubView('dashboard');
      return true;
    });
    return () => sub.remove();
  }, [subView]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  /* ── derived data ── */
  const clientName = user?.firstName || 'Aryan';
  const checkInCount = dashboardData?.checkInCount || 0;
  const streak = dashboardData?.streak || 0;
  const joinedCircles = dashboardData?.joinedCircles || [];
  const learnerId = user?.learnerId || 'LRN-250573';
  const initials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'M'}`.toUpperCase();
  const checkIns = dashboardData?.checkIns || [];

  const hasCheckedInToday =
    checkIns.some((c) => new Date(c.createdAt).toDateString() === new Date().toDateString()) ||
    !!dashboardData?.hasCheckedInToday;

  const todayDateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Week (Mon–Sun) state for the rhythm timeline.
  const now = new Date();
  const todayIdx = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayIdx);
  const checkedDays = new Set();
  checkIns.forEach((c) => {
    const d = new Date(c.createdAt);
    if (Number.isNaN(d.getTime())) return;
    const diff = Math.round(
      (new Date(d.getFullYear(), d.getMonth(), d.getDate()) - monday) / 86400000,
    );
    if (diff >= 0 && diff < 7) checkedDays.add(diff);
  });
  if (hasCheckedInToday) checkedDays.add(todayIdx);
  const lastChecked = checkedDays.size ? Math.max(...checkedDays) : -1;
  const fillPct = lastChecked > 0 ? (lastChecked / 6) * 100 : 0;

  const joinedLabel = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '12 Oct';

  const milestones = [
    { key: 'joined', title: 'Joined platform', sub: joinedLabel, done: true },
    { key: 'checkin', title: 'First check-in', done: checkInCount > 0 },
    { key: 'live', title: 'First live session', done: false },
    { key: 'circle', title: 'Joined a circle', done: joinedCircles.length > 0 },
  ];
  const doneCount = milestones.filter((m) => m.done).length;
  const progressPct = Math.round((doneCount / milestones.length) * 100);
  const nextStep =
    checkInCount === 0
      ? 'Log your first check-in'
      : joinedCircles.length === 0
        ? 'Join a growth circle'
        : 'Keep your rhythm going';

  const notifications = [
    {
      id: 'notif_checkin',
      title: hasCheckedInToday ? 'Daily check-in completed' : 'Daily check-in pending',
      body: hasCheckedInToday
        ? 'Great job! Your wellbeing and sleep rhythm for today are logged.'
        : 'Take 60 seconds to log how your mind and body are feeling today.',
      icon: hasCheckedInToday ? 'checkmark-circle' : 'time-outline',
      iconColor: hasCheckedInToday ? '#10B981' : '#F59E0B',
      unread: !hasCheckedInToday,
      actionText: hasCheckedInToday ? 'View check-in' : 'Check in now',
      onPress: () => {
        setShowNotificationsModal(false);
        navigation.navigate('CheckIn');
      },
    },
    {
      id: 'notif_free',
      title: 'Free learner access is active',
      body: `Your ID ${learnerId} gives you 100% free access to all masterclasses and peer growth circles.`,
      icon: 'sparkles',
      iconColor: '#8B5CF6',
      unread: false,
    },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  const contentBase = {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 54 : 30,
  };

  /* ═════════════ SCREEN 3: ROADMAP ═════════════ */
  if (subView === 'roadmap') {
    const steps = [
      {
        n: 1,
        title: 'Account Initialized',
        badge: 'Completed',
        tone: 'done',
        desc: 'Connected with OpenHand learning ecosystem & course library.',
      },
      {
        n: 2,
        title: 'Daily Check-in Rhythm',
        badge: checkInCount > 0 ? 'Completed' : 'Action',
        tone: checkInCount > 0 ? 'done' : 'action',
        desc:
          checkInCount > 0
            ? 'Your daily check-ins are building a steady mood and sleep rhythm.'
            : 'Log your first daily check-in to track your mood and sleep rhythm.',
      },
      {
        n: 3,
        title: 'Live Interactive Sessions',
        badge: 'Live Learning',
        tone: 'learning',
        desc: `You have ${LIVE_SESSION_COUNT} live interactive session(s) scheduled.`,
      },
      {
        n: 4,
        title: 'Peer Support & Growth Circles',
        badge: joinedCircles.length > 0 ? 'Completed' : 'Upcoming',
        tone: joinedCircles.length > 0 ? 'done' : 'upcoming',
        desc: 'Join Circles to share reflections, track milestones, and learn alongside peers.',
      },
    ];

    return (
      <Shell t={t} styles={styles} contentStyle={[contentBase, { paddingBottom: 40 }]}>
        <SubHeader t={t} styles={styles} title="My Journey" onBack={() => setSubView('dashboard')} />

        <FadeInUp>
          <View style={styles.roadmapHero}>
            <View style={{ width: '62%' }}>
              <Text style={styles.bigTitle}>My Journey{'\n'}Roadmap</Text>
              <Text style={styles.subtitle}>
                Personalized milestones – kept private to you and your guide.
              </Text>
            </View>
            <Image
              source={
                isDark
                  ? require('../../assets/roadmap_dark.png')
                  : require('../../assets/hd_mountain_summit.png')
              }
              style={styles.roadmapImage}
              resizeMode="contain"
            />
          </View>
        </FadeInUp>

        <FadeInUp delay={120}>
          <View style={[styles.card, styles.stepperCard]}>
            {steps.map((s, i) => {
              const tone = STEP_TONES[s.tone];
              const isDone = s.tone === 'done';
              const isLast = i === steps.length - 1;
              return (
                <View key={s.n} style={styles.stepRow}>
                  <View style={styles.stepIndicatorCol}>
                    <View
                      style={[
                        styles.stepCircle,
                        isDone
                          ? { backgroundColor: tone.circle }
                          : { borderColor: tone.circle, backgroundColor: tone.bg, borderWidth: 2 },
                      ]}
                    >
                      {isDone ? (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      ) : (
                        <Text style={[styles.stepNumber, { color: tone.text }]}>{s.n}</Text>
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.stepLine,
                          isDone && { backgroundColor: 'rgba(16,185,129,0.55)' },
                        ]}
                      />
                    )}
                  </View>
                  <View style={[styles.stepContent, !isLast && { paddingBottom: 20 }]}>
                    <View style={styles.stepTitleRow}>
                      <Text style={styles.stepTitle} numberOfLines={2}>
                        {s.title}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: tone.bg }]}>
                        <Text style={[styles.badgeText, { color: tone.text }]}>{s.badge}</Text>
                      </View>
                    </View>
                    <Text style={styles.stepDesc}>{s.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </FadeInUp>

        <FadeInUp delay={220}>
          <Press onPress={() => navigation.navigate('Community')} wrapStyle={{ marginTop: 20 }}>
            <LinearGradient
              colors={BRAND}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Explore & Join Circles</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </LinearGradient>
          </Press>
        </FadeInUp>
      </Shell>
    );
  }

  /* ═════════════ SCREEN 4: MILESTONES ═════════════ */
  if (subView === 'milestones') {
    const rows = [milestones.slice(0, 2), milestones.slice(2)];
    return (
      <Shell t={t} styles={styles} contentStyle={[contentBase, { paddingBottom: 40 }]}>
        <SubHeader t={t} styles={styles} title="My Journey" onBack={() => setSubView('dashboard')} />

        <FadeInUp>
          <Text style={styles.bigTitle}>Milestones you've reached</Text>
          <Text style={[styles.subtitle, { marginBottom: 20 }]}>
            These milestones are private by default.{'\n'}If you ever want to share one, that's your
            choice.
          </Text>
        </FadeInUp>

        <FadeInUp delay={100}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.milestoneRow}>
              {row.map((m) => {
                const inner = (
                  <>
                    <View style={[styles.diamondBox, m.done && styles.diamondBoxDone]}>
                      <Ionicons
                        name={m.done ? 'diamond' : 'diamond-outline'}
                        size={18}
                        color={m.done ? '#FFFFFF' : t.muted}
                      />
                    </View>
                    <Text style={[styles.milestoneTitle, m.done && { color: '#FFFFFF' }]}>
                      {m.title}
                    </Text>
                    <Text
                      style={[
                        styles.milestoneSub,
                        m.done && { color: 'rgba(255,255,255,0.85)' },
                      ]}
                    >
                      {m.sub || (m.done ? 'Completed' : 'Not yet')}
                    </Text>
                  </>
                );
                return m.done ? (
                  <LinearGradient
                    key={m.key}
                    colors={BRAND}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.milestoneCard, styles.milestoneCardDone]}
                  >
                    {inner}
                  </LinearGradient>
                ) : (
                  <View key={m.key} style={[styles.card, styles.milestoneCard]}>
                    {inner}
                  </View>
                );
              })}
            </View>
          ))}
        </FadeInUp>

        <FadeInUp delay={200}>
          <View style={[styles.card, { padding: 18, marginBottom: 14 }]}>
            <View style={styles.progressHeader}>
              <View style={styles.row}>
                <Ionicons name="bar-chart" size={18} color={t.accent} />
                <Text style={styles.cardTitle}>Your Progress</Text>
              </View>
              <Text style={styles.cardTitle}>
                {doneCount} of {milestones.length}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={BRAND}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progressPct}%` }]}
              />
            </View>
            <Text style={styles.progressPct}>{progressPct}%</Text>
          </View>

          <View style={[styles.card, styles.quoteCard]}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.quoteMark}>“</Text>
              <Text style={styles.quoteText}>Every small step counts in your journey.</Text>
            </View>
            <Image
              source={require('../../assets/hd_leaf_sprig.png')}
              style={{ width: 60, height: 70 }}
              resizeMode="contain"
            />
          </View>
        </FadeInUp>
      </Shell>
    );
  }

  /* ═════════════ SCREEN 2: DASHBOARD ═════════════ */
  return (
    <>
      <Shell
        t={t}
        styles={styles}
        contentStyle={[contentBase, { paddingBottom: 120 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />
        }
      >
        {/* Top bar */}
        <FadeInUp>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.brandTitle}>
                Open<Text style={{ color: t.brandHand }}>Hand</Text>
              </Text>
              <Text style={styles.brandSubtitle}>My Journey</Text>
            </View>

            <View style={styles.row}>
              <Press onPress={toggleTheme} style={styles.themePill} scaleTo={0.94}>
                <Ionicons
                  name={isDark ? 'sunny' : 'moon'}
                  size={14}
                  color={isDark ? '#FBBF24' : '#7C3AED'}
                />
                <Text style={styles.themePillText}>{isDark ? 'Light' : 'Dark'}</Text>
              </Press>

              <Press
                onPress={() => setShowNotificationsModal(true)}
                style={styles.iconBtn}
                scaleTo={0.92}
              >
                <Ionicons name="notifications-outline" size={20} color={t.text} />
                {unreadCount > 0 && <View style={styles.unreadDot} />}
              </Press>

              <Press
                onPress={() => navigation.navigate('Profile')}
                style={styles.avatarBtn}
                scaleTo={0.92}
              >
                <LinearGradient
                  colors={['#3B82F6', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>{initials}</Text>
                </LinearGradient>
              </Press>
            </View>
          </View>

          <View style={styles.freeBadge}>
            <Ionicons name="sparkles" size={12} color="#0D9488" />
            <Text style={styles.freeBadgeText}>100% Free Access</Text>
          </View>
        </FadeInUp>

        {/* Hero */}
        <FadeInUp delay={80}>
          <View style={styles.hero}>
            <Text style={styles.welcomeTitle}>
              Welcome back,{'\n'}
              {clientName} 👋
            </Text>
            <View style={styles.heroRow}>
              <Text style={styles.heroSubtitle}>
                Your private learning journey, supported by OpenHand guides and peer circles.
              </Text>
              <View style={styles.heroImageTile}>
                <Image
                  source={
                    isDark
                      ? require('../../assets/hero_dark.png')
                      : require('../../assets/hd_hero_desk.png')
                  }
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>
        </FadeInUp>

        {/* Metrics */}
        <FadeInUp delay={150}>
          <View style={[styles.card, styles.metricsCard]}>
            {[
              { icon: 'flame', color: '#F97316', value: streak, label: 'Day Streak' },
              { icon: 'disc', color: '#7C3AED', value: checkInCount, label: 'Check-ins' },
              { icon: 'people', color: '#6366F1', value: joinedCircles.length, label: 'Circles' },
            ].map((m, i) => (
              <View key={m.label} style={[styles.metric, i > 0 && styles.metricDivider]}>
                <Ionicons name={m.icon} size={22} color={m.color} />
                <Text style={styles.metricNumber}>{m.value}</Text>
                <Text style={styles.metricLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </FadeInUp>

        {/* Quick actions */}
        <FadeInUp delay={210}>
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map((q) => (
              <Press
                key={q.key}
                onPress={() => navigation.navigate(q.screen)}
                wrapStyle={{ flex: 1 }}
                style={[styles.card, styles.quickCard]}
              >
                <View style={[styles.quickIcon, { backgroundColor: `${q.color}1F` }]}>
                  <Ionicons name={q.icon} size={22} color={q.color} />
                </View>
                <Text style={styles.quickLabel}>{q.label}</Text>
              </Press>
            ))}
          </View>
        </FadeInUp>

        {/* Weekly rhythm */}
        <FadeInUp delay={270}>
          <View style={[styles.card, styles.rhythmCard]}>
            <View style={styles.rhythmHeader}>
              <Text style={styles.cardTitle}>Weekly Wellbeing Rhythm</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CheckIn')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.link}>Full Rhythm →</Text>
              </TouchableOpacity>
            </View>

            <View>
              <View style={styles.rhythmTrack}>
                {fillPct > 0 && (
                  <LinearGradient
                    colors={BRAND}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: `${fillPct}%`, height: 2 }}
                  />
                )}
              </View>

              <View style={styles.rhythmDays}>
                {DAYS_OF_WEEK.map((day, idx) => {
                  const isToday = idx === todayIdx;
                  const isChecked = checkedDays.has(idx);
                  return (
                    <View key={day} style={styles.dayCol}>
                      <Text style={[styles.dayName, isToday && styles.dayNameActive]}>{day}</Text>
                      <View style={styles.dayNode}>
                        {isChecked ? (
                          <LinearGradient colors={BRAND} style={styles.dayChecked}>
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          </LinearGradient>
                        ) : isToday ? (
                          <View style={styles.dayHalo}>
                            <View style={styles.dayDotToday} />
                          </View>
                        ) : (
                          <View style={styles.dayDot} />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </FadeInUp>

        {/* Today's check-in */}
        <FadeInUp delay={330}>
          <View style={[styles.card, styles.todayCard]}>
            <View style={[styles.todayIcon, { backgroundColor: 'rgba(59,130,246,0.14)' }]}>
              <Ionicons name="calendar" size={22} color="#3B82F6" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardTitle}>Today's Check-In</Text>
              <Text style={styles.todayDate}>{todayDateFormatted}</Text>
              <View
                style={[
                  styles.statusPill,
                  hasCheckedInToday ? styles.statusDone : styles.statusPending,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: hasCheckedInToday ? '#10B981' : '#F59E0B' },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: hasCheckedInToday ? '#0D9488' : isDark ? '#FBBF24' : '#B45309',
                    },
                  ]}
                >
                  {hasCheckedInToday ? 'Logged' : 'Not logged yet'}
                </Text>
              </View>
            </View>
            <Press onPress={() => navigation.navigate('CheckIn')} scaleTo={0.94}>
              <LinearGradient
                colors={BRAND}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logNowBtn}
              >
                <Text style={styles.logNowText}>{hasCheckedInToday ? 'View' : 'Log Now'}</Text>
                <Ionicons
                  name={hasCheckedInToday ? 'checkmark' : 'arrow-forward'}
                  size={14}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </Press>
          </View>
        </FadeInUp>

        {/* Banner */}
        <FadeInUp delay={380}>
          <Press
            onPress={() => navigation.navigate('CheckIn')}
            scaleTo={0.98}
            style={styles.bannerWrap}
          >
            <LinearGradient
              colors={isDark ? ['#5B21B6', '#3730A3'] : ['#8B5CF6', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              <View style={styles.bannerCircleA} />
              <View style={styles.bannerCircleB} />
              <Ionicons
                name="sparkles"
                size={14}
                color="rgba(255,255,255,0.8)"
                style={{ position: 'absolute', top: 14, right: 18 }}
              />
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.bannerText}>
                  {hasCheckedInToday
                    ? 'You showed up today. That counts. 💜'
                    : 'A small check-in today, a brighter tomorrow. 💜'}
                </Text>
                <View style={styles.bannerCta}>
                  <Text style={styles.bannerCtaText}>
                    {hasCheckedInToday ? 'See your check-in' : 'Check in now'}
                  </Text>
                  <Ionicons name="arrow-forward" size={13} color="#4C1D95" />
                </View>
              </View>
              <View style={styles.bannerAvatarRing}>
                <View style={styles.bannerAvatar}>
                  <Ionicons name="headset" size={34} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </Press>
        </FadeInUp>

        {/* Your journey */}
        <FadeInUp delay={430}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your journey</Text>
            <Text style={styles.sectionMeta}>
              {doneCount} of {milestones.length} milestones
            </Text>
          </View>

          <Press
            onPress={() => setSubView('roadmap')}
            style={[styles.card, styles.navCard]}
            wrapStyle={{ marginBottom: 10 }}
          >
            <View style={styles.navRow}>
              <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.navIcon}>
                <Ionicons name="map" size={20} color="#FFFFFF" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.navTitle}>My Journey Roadmap</Text>
                <Text style={styles.navSub} numberOfLines={1}>
                  Next: {nextStep}
                </Text>
              </View>
              <View style={styles.navChevron}>
                <Ionicons name="chevron-forward" size={16} color={t.accent} />
              </View>
            </View>
          </Press>

          <Press onPress={() => setSubView('milestones')} style={[styles.card, styles.navCard]}>
            <View style={styles.navRow}>
              <LinearGradient colors={['#14B8A6', '#0D9488']} style={styles.navIcon}>
                <Ionicons name="trophy" size={20} color="#FFFFFF" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.navTitle}>Milestones you've reached</Text>
                <Text style={styles.navSub}>Badges, join date and progress</Text>
              </View>
              <View style={styles.navChevron}>
                <Ionicons name="chevron-forward" size={16} color="#0D9488" />
              </View>
            </View>
            <View style={styles.navBarWrap}>
              <View style={styles.navTrack}>
                <LinearGradient
                  colors={['#14B8A6', '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.navFill, { width: `${progressPct}%` }]}
                />
              </View>
              <Text style={styles.navPct}>{progressPct}%</Text>
            </View>
          </Press>
        </FadeInUp>
      </Shell>

      {/* Notifications */}
      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setShowNotificationsModal(false)}>
          <Pressable style={[styles.card, styles.notifCard]} onPress={() => { }}>
            <View style={styles.notifHeader}>
              <View style={styles.row}>
                <Ionicons name="notifications" size={20} color={t.accent} />
                <Text style={styles.notifTitle}>Notifications</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowNotificationsModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={t.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {notifications.map((n) => (
                <View key={n.id} style={styles.notifItem}>
                  <View style={[styles.notifIcon, { backgroundColor: `${n.iconColor}22` }]}>
                    <Ionicons name={n.icon} size={18} color={n.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <Text style={styles.notifItemTitle}>{n.title}</Text>
                      {n.unread && <View style={styles.notifUnread} />}
                    </View>
                    <Text style={styles.notifItemBody}>{n.body}</Text>
                    {n.onPress && (
                      <TouchableOpacity onPress={n.onPress} style={{ marginTop: 8 }}>
                        <Text style={styles.link}>{n.actionText} →</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/* ───────────────────────── styles ───────────────────────── */

const makeStyles = (t) => {
  const shadow = {
    shadowColor: t.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: t.isDark ? 0.3 : 0.09,
    shadowRadius: 16,
    elevation: t.isDark ? 0 : 3,
  };

  return StyleSheet.create({
    flex: { flex: 1 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    // background decoration
    blob: { position: 'absolute', borderRadius: 999 },
    blobTop: { width: 260, height: 260, top: -90, right: -80, backgroundColor: t.blobA },
    blobLeft: { width: 220, height: 220, top: 260, left: -120, backgroundColor: t.blobB },

    // shared card
    card: {
      backgroundColor: t.card,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: t.cardBorder,
      ...shadow,
    },
    cardTitle: { fontSize: 14.5, fontWeight: '800', color: t.text },
    link: { fontSize: 12.5, fontWeight: '700', color: t.accent },

    // top bar
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    brandTitle: { fontSize: 27, fontWeight: '800', color: t.text, letterSpacing: -0.6 },
    brandSubtitle: { fontSize: 13, color: t.muted, marginTop: 1 },
    themePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.cardBorder,
      borderRadius: 20,
      paddingHorizontal: 11,
      paddingVertical: 7,
      ...shadow,
      shadowOpacity: t.isDark ? 0 : 0.06,
    },
    themePillText: { fontSize: 11.5, fontWeight: '700', color: t.text },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow,
      shadowOpacity: t.isDark ? 0 : 0.06,
    },
    unreadDot: {
      position: 'absolute',
      top: 8,
      right: 9,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#7C3AED',
      borderWidth: 1.5,
      borderColor: t.card,
    },
    avatarBtn: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', ...shadow },
    avatarGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' },

    freeBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.isDark ? 'rgba(13,148,136,0.18)' : '#E3FAF3',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(45,212,191,0.3)' : '#9DF1E0',
    },
    freeBadgeText: { color: '#0D9488', fontSize: 11.5, fontWeight: '700' },

    // hero
    hero: { marginTop: 12, marginBottom: 14 },
    welcomeTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: t.text,
      lineHeight: 34,
      letterSpacing: -0.7,
    },
    heroRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    heroSubtitle: { flex: 1, fontSize: 13, color: t.muted, lineHeight: 19, paddingRight: 12 },
    heroImageTile: {
      width: HERO_IMG.tileW,
      height: HERO_IMG.tileH,
      borderRadius: 26,
      overflow: 'hidden',
      backgroundColor: t.isDark ? '#141933' : '#EEEBFF',
      borderWidth: 1,
      borderColor: t.cardBorder,
    },
    heroImage: {
      width: HERO_IMG.size,
      height: HERO_IMG.size,
      marginLeft: HERO_IMG.shiftX,
      marginTop: HERO_IMG.shiftY,
    },

    // metrics
    metricsCard: { flexDirection: 'row', paddingVertical: 16, marginBottom: 14 },
    metric: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    metricDivider: { borderLeftWidth: 1, borderLeftColor: t.divider },
    metricNumber: { fontSize: 21, fontWeight: '800', color: t.text, marginTop: 6 },
    metricLabel: { fontSize: 11.5, color: t.muted, marginTop: 2 },

    // quick actions
    quickRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    quickCard: {
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 4,
      alignItems: 'center',
    },
    quickIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    quickLabel: {
      fontSize: 11.5,
      fontWeight: '700',
      color: t.text,
      textAlign: 'center',
      lineHeight: 15,
    },

    // rhythm
    rhythmCard: { padding: 16, marginBottom: 14 },
    rhythmHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    rhythmTrack: {
      position: 'absolute',
      top: 36,
      left: '7.14%',
      right: '7.14%',
      height: 2,
      borderRadius: 1,
      backgroundColor: t.track,
      overflow: 'hidden',
    },
    rhythmDays: { flexDirection: 'row' },
    dayCol: { flex: 1, alignItems: 'center' },
    dayName: {
      fontSize: 11.5,
      lineHeight: 16,
      fontWeight: '600',
      color: t.muted,
      marginBottom: 10,
    },
    dayNameActive: { color: t.accent, fontWeight: '800' },
    dayNode: { height: 22, alignItems: 'center', justifyContent: 'center' },
    dayDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: t.track },
    dayHalo: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: 'rgba(124,58,237,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayDotToday: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#7C3AED' },
    dayChecked: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // today
    todayCard: { padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    todayIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    todayDate: { fontSize: 12, color: t.muted, marginTop: 2 },
    statusPill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    statusPending: { backgroundColor: t.isDark ? 'rgba(251,191,36,0.16)' : '#FEF3C7' },
    statusDone: { backgroundColor: t.isDark ? 'rgba(16,185,129,0.18)' : '#D1FAE5' },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 10.5, fontWeight: '700' },
    logNowBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 14,
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 4,
    },
    logNowText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

    // banner
    bannerWrap: {
      borderRadius: 24,
      marginBottom: 22,
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6,
    },
    banner: {
      borderRadius: 24,
      padding: 18,
      minHeight: 116,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
    },
    bannerCircleA: {
      position: 'absolute',
      width: 170,
      height: 170,
      borderRadius: 85,
      right: -50,
      top: -70,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    bannerCircleB: {
      position: 'absolute',
      width: 110,
      height: 110,
      borderRadius: 55,
      right: 70,
      bottom: -60,
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    bannerText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
      lineHeight: 22,
      letterSpacing: -0.2,
    },
    bannerCta: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    bannerCtaText: { color: '#4C1D95', fontSize: 12, fontWeight: '800' },
    bannerAvatarRing: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bannerAvatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // your journey section
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
      paddingHorizontal: 2,
    },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: t.text, letterSpacing: -0.3 },
    sectionMeta: { fontSize: 12, color: t.muted, fontWeight: '600' },
    navCard: { padding: 14, borderRadius: 20 },
    navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    navIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navTitle: { fontSize: 14.5, fontWeight: '800', color: t.text },
    navSub: { fontSize: 12, color: t.muted, marginTop: 2 },
    navChevron: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : '#F4F2FD',
    },
    navBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
    navTrack: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.1)' : '#EEECF8',
      overflow: 'hidden',
    },
    navFill: { height: '100%', borderRadius: 3 },
    navPct: { fontSize: 11, fontWeight: '800', color: '#0D9488' },

    // sub screens
    subHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.cardBorder,
    },
    subHeaderTitle: { fontSize: 16, fontWeight: '700', color: t.text },
    bigTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: t.text,
      lineHeight: 34,
      letterSpacing: -0.6,
      marginBottom: 6,
    },
    subtitle: { fontSize: 13, color: t.muted, lineHeight: 19 },

    // roadmap
    roadmapHero: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    roadmapImage: { position: 'absolute', right: -6, top: -6, width: 130, height: 120 },
    stepperCard: { padding: 20, borderRadius: 24 },
    stepRow: { flexDirection: 'row' },
    stepIndicatorCol: { alignItems: 'center', width: 28, marginRight: 12 },
    stepCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumber: { fontSize: 12.5, fontWeight: '800' },
    stepLine: { width: 2, flex: 1, backgroundColor: t.track, marginVertical: 4, borderRadius: 1 },
    stepContent: { flex: 1 },
    stepTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 4,
    },
    stepTitle: { flex: 1, fontSize: 14.5, fontWeight: '800', color: t.text },
    badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
    badgeText: { fontSize: 10.5, fontWeight: '700' },
    stepDesc: { fontSize: 12.5, color: t.muted, lineHeight: 18 },
    primaryBtn: {
      flexDirection: 'row',
      gap: 8,
      borderRadius: 18,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.38,
      shadowRadius: 12,
      elevation: 5,
    },
    primaryBtnText: { color: '#FFFFFF', fontSize: 15.5, fontWeight: '800' },

    // milestones
    milestoneRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    milestoneCard: { flex: 1, padding: 16, borderRadius: 20 },
    milestoneCardDone: {
      borderWidth: 0,
      shadowColor: '#7C3AED',
      shadowOpacity: 0.35,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 5,
    },
    diamondBox: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : '#F5F4FC',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },
    diamondBoxDone: { backgroundColor: 'rgba(255,255,255,0.22)' },
    milestoneTitle: { fontSize: 14.5, fontWeight: '800', color: t.text },
    milestoneSub: { fontSize: 12, color: t.muted, marginTop: 4 },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    progressTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.1)' : '#EEECF8',
      overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 4 },
    progressPct: {
      fontSize: 11.5,
      fontWeight: '700',
      color: t.accent,
      textAlign: 'right',
      marginTop: 6,
    },
    quoteCard: { padding: 18, flexDirection: 'row', alignItems: 'center', borderRadius: 20 },
    quoteMark: { fontSize: 30, color: t.accent, fontWeight: '900', lineHeight: 30 },
    quoteText: { fontSize: 14, fontWeight: '600', color: t.muted, lineHeight: 21 },

    // notifications modal
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(8,6,25,0.5)',
      justifyContent: 'center',
      padding: 20,
    },
    notifCard: { padding: 20, borderRadius: 26, maxHeight: '80%' },
    notifHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: t.divider,
    },
    notifTitle: { fontSize: 17, fontWeight: '800', color: t.text },
    notifItem: { flexDirection: 'row', gap: 12, marginBottom: 18 },
    notifIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notifItemTitle: { flexShrink: 1, fontSize: 13.5, fontWeight: '700', color: t.text },
    notifUnread: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#7C3AED' },
    notifItemBody: { fontSize: 12, color: t.muted, marginTop: 3, lineHeight: 17 },
  });
};
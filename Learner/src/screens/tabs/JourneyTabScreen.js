import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { theme } from '../../theme';

const MOODS = [
  { key: 'low', label: 'Heavy', symbol: '◯', color: '#EF4444' },
  { key: 'challenged', label: 'Stretched', symbol: '◑', color: '#F97316' },
  { key: 'steady', label: 'Steady', symbol: '◐', color: '#EAB308' },
  { key: 'energetic', label: 'Lighter', symbol: '◕', color: '#22C55E' },
  { key: 'peaceful', label: 'Good', symbol: '●', color: '#0D9488' },
];

export default function JourneyTabScreen({ navigation }) {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check-in form state
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState('steady');
  const [sleepScore, setSleepScore] = useState('7');
  const [checkInNote, setCheckInNote] = useState('');
  const [savingCheckIn, setSavingCheckIn] = useState(false);

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

  const handleCheckInSave = async () => {
    const numSleep = Number(sleepScore);
    if (isNaN(numSleep) || numSleep < 0 || numSleep > 10) {
      Alert.alert('Validation', 'Sleep score must be between 0 and 10.');
      return;
    }
    setSavingCheckIn(true);
    try {
      const res = await apiClient.post(ENDPOINTS.LEARNER.CHECKINS, {
        mood: selectedMood,
        sleepScore: numSleep,
        note: checkInNote.slice(0, 500),
        isPrivate: false,
      });
      if (res.data?.success) {
        setCheckInOpen(false);
        setCheckInNote('');
        setSleepScore('7');
        setSelectedMood('steady');
        Alert.alert('✓ Saved', res.data.message || 'Check-in logged successfully!');
        fetchDashboard();
      } else {
        Alert.alert('Error', res.data?.message || 'Failed to save check-in.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not save check-in.');
    } finally {
      setSavingCheckIn(false);
    }
  };

  const clientName = user?.firstName || 'Learner';
  const checkInCount = dashboardData?.checkInCount || 0;
  const streak = dashboardData?.streak || 0;
  const practitioner = dashboardData?.practitioner;

  // Check if today's check-in already done
  const checkIns = dashboardData?.checkIns || [];
  const todayStr = new Date().toDateString();
  const todayCheckIn = checkIns.find(
    (c) => new Date(c.createdAt).toDateString() === todayStr
  );

  const todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={theme.colors.blue} />
        <Text style={styles.loadingText}>Loading your journey…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* ── Top Banner Card ── */}
      <View style={styles.topCard}>
        <View style={styles.badgeRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>100% Free Access</Text>
          </View>
          {user?.learnerId ? (
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>{user.learnerId}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.greeting}>Welcome back, {clientName} 👋</Text>
        <Text style={styles.subGreeting}>
          Your private learning journey, supported by OpenHand guides and peer circles.
        </Text>

        <View style={styles.statsStrip}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{checkInCount}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {dashboardData?.joinedCircles?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Circles</Text>
          </View>
        </View>
      </View>

      {/* ── Daily Check-In Card ── */}
      <View style={styles.checkInCard}>
        <View style={styles.checkInHeader}>
          <View>
            <Text style={styles.checkInTitle}>Daily Check-In</Text>
            <Text style={styles.checkInDate}>{todayDate}</Text>
          </View>
          {todayCheckIn ? (
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>✓ Done</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.logButton}
              onPress={() => setCheckInOpen(!checkInOpen)}
            >
              <Text style={styles.logButtonText}>
                {checkInOpen ? 'Cancel' : 'Log Now'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {todayCheckIn && !checkInOpen && (
          <View style={styles.todaySummary}>
            <Text style={styles.todaySummaryText}>
              Mood: <Text style={{ fontWeight: '700' }}>{todayCheckIn.mood}</Text>
              {'  '}Sleep: <Text style={{ fontWeight: '700' }}>{todayCheckIn.sleepScore}/10</Text>
            </Text>
          </View>
        )}

        {checkInOpen && (
          <View style={styles.checkInForm}>
            {/* Mood Picker */}
            <Text style={styles.formLabel}>How are you feeling?</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.moodBtn,
                    selectedMood === m.key && { borderColor: m.color, borderWidth: 2, backgroundColor: m.color + '15' },
                  ]}
                  onPress={() => setSelectedMood(m.key)}
                >
                  <Text style={[styles.moodSymbol, { color: m.color }]}>{m.symbol}</Text>
                  <Text style={styles.moodLabel}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sleep Score */}
            <Text style={styles.formLabel}>Sleep quality (0–10)</Text>
            <TextInput
              style={styles.sleepInput}
              value={sleepScore}
              onChangeText={setSleepScore}
              keyboardType="decimal-pad"
              placeholder="7"
              placeholderTextColor={theme.colors.textLight}
              maxLength={4}
            />

            {/* Private Note */}
            <Text style={styles.formLabel}>Private note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              value={checkInNote}
              onChangeText={setCheckInNote}
              placeholder="How is your body and spirit today?"
              placeholderTextColor={theme.colors.textLight}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
            <Text style={styles.charCount}>{checkInNote.length}/500</Text>

            <TouchableOpacity
              style={[styles.saveCheckInBtn, savingCheckIn && { opacity: 0.7 }]}
              onPress={handleCheckInSave}
              disabled={savingCheckIn}
            >
              {savingCheckIn ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveCheckInBtnText}>Save Check-In</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Assigned Practitioner Guide ── */}
      {practitioner ? (
        <View style={styles.guideCard}>
          <View style={styles.guideAvatar}>
            <Text style={styles.guideAvatarText}>
              {practitioner.firstName?.slice(0, 1)}
              {practitioner.lastName?.slice(0, 1)}
            </Text>
          </View>
          <View style={styles.guideInfo}>
            <Text style={styles.guideTag}>Assigned Practitioner Guide</Text>
            <Text style={styles.guideName}>{practitioner.name || `${practitioner.firstName} ${practitioner.lastName}`}</Text>
          </View>
        </View>
      ) : null}

      {/* ── Journey Roadmap ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MY JOURNEY ROADMAP</Text>
        <Text style={styles.sectionSubtitle}>
          Personalized milestones — kept private to you and your guide.
        </Text>
      </View>

      <View style={styles.roadmap}>
        {/* Step 1 — Always done */}
        <RoadmapStep
          number="1"
          title="Account Initialized"
          desc="Connected with OpenHand learning ecosystem & course library."
          done={true}
          last={false}
        />
        {/* Step 2 — Check-in */}
        <RoadmapStep
          number="2"
          title="Daily Check-in Rhythm"
          desc={
            checkInCount > 0
              ? `${checkInCount} check-in(s) recorded. Rhythm active.`
              : 'Log your daily wellbeing and sleep score above.'
          }
          done={checkInCount > 0}
          active={checkInCount === 0}
          last={false}
        />
        {/* Step 3 — Live Sessions */}
        <RoadmapStep
          number="3"
          title="Live Interactive Sessions"
          desc="Join upcoming group classes or 1-on-1 consultations with your guide."
          done={false}
          last={false}
        />
        {/* Step 4 — Circles */}
        <RoadmapStep
          number="4"
          title="Peer Growth Circles"
          desc="Collaborate and share reflections in cohort growth circles."
          done={(dashboardData?.joinedCircles?.length || 0) > 0}
          last={true}
        />
      </View>
    </ScrollView>
  );
}

function RoadmapStep({ number, title, desc, done, active, last }) {
  return (
    <View style={[stepStyles.item, last && stepStyles.lastItem]}>
      <View
        style={[
          stepStyles.ring,
          done && stepStyles.ringDone,
          active && !done && stepStyles.ringActive,
        ]}
      >
        <Text style={[stepStyles.ringText, done && stepStyles.ringTextDone]}>
          {done ? '✓' : number}
        </Text>
      </View>
      <View style={stepStyles.content}>
        <Text style={stepStyles.title}>{title}</Text>
        <Text style={stepStyles.desc}>{desc}</Text>
      </View>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceSubtle,
    gap: theme.spacing.md,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  ring: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDone: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
  },
  ringActive: {
    backgroundColor: '#EEF2FF',
    borderColor: theme.colors.indigo,
  },
  ringText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  ringTextDone: {
    color: theme.colors.success,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  desc: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.base,
    paddingBottom: 48,
  },
  loadingCenter: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
  },
  // ── Top Card ──
  topCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: theme.spacing.base,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statusBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.spacing.borderRadiusPill,
  },
  statusBadgeText: {
    fontSize: theme.typography.xs,
    color: theme.colors.indigo,
    fontWeight: theme.typography.bold,
  },
  idBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.spacing.borderRadiusSm,
  },
  idBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: theme.typography.bold,
    color: theme.colors.textSecondary,
  },
  greeting: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.heavy,
    color: theme.colors.text,
  },
  subGreeting: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.spacing.borderRadiusMd,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.base,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
  },
  statNumber: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.heavy,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  // ── Check-In Card ──
  checkInCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.base,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkInTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  checkInDate: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  logButton: {
    backgroundColor: theme.colors.blue,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.spacing.borderRadiusPill,
  },
  logButtonText: {
    color: '#FFF',
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
  },
  doneBadge: {
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.spacing.borderRadiusPill,
  },
  doneBadgeText: {
    color: theme.colors.successText,
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
  },
  todaySummary: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.spacing.borderRadiusSm,
    padding: theme.spacing.sm,
  },
  todaySummaryText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
  },
  // ── Check-In Form ──
  checkInForm: {
    marginTop: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceSubtle,
    paddingTop: theme.spacing.base,
  },
  formLabel: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  moodRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: theme.spacing.borderRadiusMd,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  moodSymbol: {
    fontSize: 18,
    fontWeight: '900',
  },
  moodLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 3,
    fontWeight: '600',
  },
  sleepInput: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadiusSm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    width: 90,
  },
  noteInput: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadiusSm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    color: theme.colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  saveCheckInBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.spacing.borderRadiusSm,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: theme.spacing.base,
  },
  saveCheckInBtnText: {
    color: '#FFF',
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
  },
  // ── Guide Card ──
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.base,
    gap: theme.spacing.md,
  },
  guideAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideAvatarText: {
    color: '#FFF',
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
  },
  guideInfo: { flex: 1 },
  guideTag: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.medium,
  },
  guideName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginTop: 2,
  },
  // ── Section Header ──
  sectionHeader: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.heavy,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  // ── Roadmap ──
  roadmap: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

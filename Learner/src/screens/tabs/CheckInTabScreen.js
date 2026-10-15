import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { theme } from '../../theme';

const MOODS = [
  { key: 'low', label: 'Heavy', symbol: '◯', color: '#EF4444' },
  { key: 'challenged', label: 'Stretched', symbol: '◑', color: '#F97316' },
  { key: 'steady', label: 'Steady', symbol: '◐', color: '#EAB308' },
  { key: 'energetic', label: 'Lighter', symbol: '◕', color: '#22C55E' },
  { key: 'peaceful', label: 'Good', symbol: '●', color: '#0D9488' },
];

export default function CheckInTabScreen() {
  const { user } = useAuth();
  const { isDark } = useAppTheme();
  const [activeSubTab, setActiveSubTab] = useState('checkin'); // 'checkin' | 'reflections'

  // ── Check-in State ──
  const [selectedMood, setSelectedMood] = useState('steady');
  const [sleepScore, setSleepScore] = useState('7');
  const [note, setNote] = useState('');
  const [savingCheckIn, setSavingCheckIn] = useState(false);
  const [checkIns, setCheckIns] = useState([]);
  const [loadingCheckIns, setLoadingCheckIns] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Reflections State ──
  const [prompts, setPrompts] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loadingReflections, setLoadingReflections] = useState(false);
  const [submittingPromptId, setSubmittingPromptId] = useState(null);

  // Load Checkins
  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.LEARNER.CLIENT_DASHBOARD);
      if (res.data?.success && res.data?.data) {
        setCheckIns(res.data.data.checkIns || []);
      }
    } catch (e) {
      console.warn('Error fetching check-ins:', e.message);
    } finally {
      setLoadingCheckIns(false);
      setRefreshing(false);
    }
  }, []);

  // Load Reflections
  const fetchReflections = useCallback(async () => {
    setLoadingReflections(true);
    try {
      const res = await apiClient.get(ENDPOINTS.LEARNER.REFLECTIONS);
      if (res.data?.success) {
        setPrompts(res.data.prompts || res.data.data || []);
      }
    } catch (e) {
      console.warn('Error fetching reflections:', e.message);
    } finally {
      setLoadingReflections(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchReflections();
  }, [fetchDashboardData, fetchReflections]);

  const onRefresh = () => {
    setRefreshing(true);
    if (activeSubTab === 'checkin') {
      fetchDashboardData();
    } else {
      fetchReflections();
    }
  };

  // Submit Check-In
  const handleSaveCheckIn = async () => {
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
        note: note.slice(0, 500),
        isPrivate: false,
      });

      if (res.data?.success) {
        Alert.alert('✓ Check-In Saved', 'Your wellbeing and sleep rhythm have been logged.');
        setNote('');
        fetchDashboardData();
      } else {
        Alert.alert('Notice', res.data?.message || 'Could not save check-in.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to record check-in.');
    } finally {
      setSavingCheckIn(false);
    }
  };

  // Submit Reflection Answer
  const handleAnswerReflection = async (promptId, action = 'answer') => {
    const answerText = answers[promptId] || '';
    if (action === 'answer' && !answerText.trim()) {
      Alert.alert('Validation', 'Please enter your reflection before saving.');
      return;
    }

    setSubmittingPromptId(promptId);
    try {
      const res = await apiClient.post(ENDPOINTS.LEARNER.ANSWER_REFLECTION, {
        promptId,
        answerText,
        action,
        isPrivate: false,
      });

      if (res.data?.success) {
        Alert.alert('✓ Reflection Saved', res.data.message || 'Reflection saved successfully.');
        fetchReflections();
      }
    } catch (e) {
      Alert.alert('Notice', e.response?.data?.message || 'Failed to submit reflection.');
    } finally {
      setSubmittingPromptId(null);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const todayDateOnly = new Date().toDateString();
  const todayCheckIn = checkIns.find(
    (c) => new Date(c.createdAt).toDateString() === todayDateOnly
  );

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#040817', '#08112C', '#0E1D45', '#080E24']
          : ['#DCEEFF', '#E8F2FF', '#F4F0FF', '#FFFFFF']
      }
      style={{ flex: 1 }}
    >
      {/* ── Sub-tab Switcher: Daily Check-in | Reflections Journal ── */}
      <View style={[styles.tabBar, isDark && { backgroundColor: 'rgba(13, 21, 44, 0.75)', borderBottomColor: 'rgba(255, 255, 255, 0.1)' }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeSubTab === 'checkin' && styles.tabBtnActive]}
          onPress={() => setActiveSubTab('checkin')}
        >
          <Ionicons
            name="checkbox-outline"
            size={18}
            color={activeSubTab === 'checkin' ? '#1E64EB' : (isDark ? '#94A3B8' : theme.colors.textMuted)}
          />
          <Text
            style={[
              styles.tabBtnText,
              isDark && { color: '#94A3B8' },
              activeSubTab === 'checkin' && styles.tabBtnTextActive,
            ]}
          >
            Daily Check-In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeSubTab === 'reflections' && styles.tabBtnActive]}
          onPress={() => setActiveSubTab('reflections')}
        >
          <Ionicons
            name="journal-outline"
            size={18}
            color={activeSubTab === 'reflections' ? '#1E64EB' : (isDark ? '#94A3B8' : theme.colors.textMuted)}
          />
          <Text
            style={[
              styles.tabBtnText,
              isDark && { color: '#94A3B8' },
              activeSubTab === 'reflections' && styles.tabBtnTextActive,
            ]}
          >
            Reflections Journal
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeSubTab === 'checkin' ? (
          <>
            {/* ── Header ── */}
            <View style={styles.pageHeader}>
              <Text style={[styles.pageSub, isDark && { color: '#38BDF8' }]}>DAILY WELLBEING & SLEEP</Text>
              <Text style={[styles.pageTitle, isDark && { color: '#FFFFFF' }]}>{todayStr}</Text>
              <Text style={[styles.pageDesc, isDark && { color: '#94A3B8' }]}>
                Take a moment to listen to your body. There's no right or wrong score.
              </Text>
            </View>

            {/* ── Check-in Card ── */}
            <View style={[styles.card, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <Text style={[styles.sectionLabel, isDark && { color: '#F8FAFC' }]}>How does your nervous system feel?</Text>
              <View style={styles.moodRow}>
                {MOODS.map((m) => {
                  const selected = selectedMood === m.key;
                  return (
                    <TouchableOpacity
                      key={m.key}
                      style={[
                        styles.moodBtn,
                        isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' },
                        selected && { borderColor: m.color, borderWidth: 2, backgroundColor: m.color + (isDark ? '35' : '15') },
                      ]}
                      onPress={() => setSelectedMood(m.key)}
                    >
                      <Text style={[styles.moodSymbol, { color: m.color }]}>{m.symbol}</Text>
                      <Text style={[styles.moodLabel, isDark && { color: '#94A3B8' }, selected && { fontWeight: '700', color: m.color }]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Sleep Score */}
              <View style={styles.fieldWrap}>
                <View style={styles.fieldHeader}>
                  <Text style={[styles.fieldLabel, isDark && { color: '#F8FAFC' }]}>Sleep Quality</Text>
                  <Text style={[styles.fieldValue, isDark && { color: '#38BDF8' }]}>{sleepScore} / 10</Text>
                </View>
                <View style={styles.scoreRow}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.scorePill,
                        isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' },
                        Number(sleepScore) === num && styles.scorePillActive,
                      ]}
                      onPress={() => setSleepScore(String(num))}
                    >
                      <Text
                        style={[
                          styles.scorePillText,
                          isDark && { color: '#94A3B8' },
                          Number(sleepScore) === num && styles.scorePillTextActive,
                        ]}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Private Reflection Note */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, isDark && { color: '#F8FAFC' }]}>Private Reflection Note</Text>
                <TextInput
                  style={[styles.noteInput, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }]}
                  value={note}
                  onChangeText={setNote}
                  placeholder="How is your body and spirit feeling right now? (Optional)"
                  placeholderTextColor={isDark ? '#64748B' : theme.colors.textLight}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
                <Text style={[styles.charCount, isDark && { color: '#64748B' }]}>{note.length}/500</Text>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveBtn, savingCheckIn && styles.saveBtnDisabled]}
                onPress={handleSaveCheckIn}
                disabled={savingCheckIn}
              >
                {savingCheckIn ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                    <Text style={styles.saveBtnText}>
                      {todayCheckIn ? 'Update Today’s Check-In' : 'Save Check-In'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Check-in History ── */}
            <View style={styles.historySection}>
              <Text style={[styles.historyTitle, isDark && { color: '#FFFFFF' }]}>Recent Check-In Rhythm</Text>
              {checkIns.length === 0 ? (
                <View style={[styles.emptyHistory, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <Ionicons name="calendar-outline" size={32} color={isDark ? '#64748B' : theme.colors.textLight} />
                  <Text style={[styles.emptyHistoryText, isDark && { color: '#94A3B8' }]}>
                    Your check-ins will build your personalized wellbeing rhythm here.
                  </Text>
                </View>
              ) : (
                checkIns.slice(0, 7).map((item, i) => {
                  const moodObj = MOODS.find((m) => m.key === item.mood) || MOODS[2];
                  const dateFormatted = new Date(item.createdAt).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  });
                  return (
                    <View key={item._id || i} style={[styles.historyRow, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                      <View style={[styles.historyDot, { backgroundColor: moodObj.color }]} />
                      <View style={{ flex: 1 }}>
                        <View style={styles.historyMeta}>
                          <Text style={[styles.historyDate, isDark && { color: '#FFFFFF' }]}>{dateFormatted}</Text>
                          <Text style={[styles.historyMood, { color: moodObj.color }]}>
                            {moodObj.label} · Sleep {item.sleepScore}/10
                          </Text>
                        </View>
                        {item.note ? (
                          <Text style={[styles.historyNote, isDark && { color: '#94A3B8' }]} numberOfLines={2}>
                            "{item.note}"
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        ) : (
          /* ── Reflections Journal Tab ── */
          <>
            <View style={styles.pageHeader}>
              <Text style={[styles.pageSub, isDark && { color: '#38BDF8' }]}>PROMPTED JOURNAL</Text>
              <Text style={[styles.pageTitle, isDark && { color: '#FFFFFF' }]}>Reflections</Text>
              <Text style={[styles.pageDesc, isDark && { color: '#94A3B8' }]}>
                Thoughtful prompts written by your practitioner guide. Take your time — answer when ready, or skip.
              </Text>
            </View>

            {loadingReflections ? (
              <View style={styles.loadingCenter}>
                <ActivityIndicator size="large" color="#1E64EB" />
                <Text style={[styles.loadingText, isDark && { color: '#94A3B8' }]}>Loading reflection prompts…</Text>
              </View>
            ) : prompts.length === 0 ? (
              <View style={[styles.card, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <View style={styles.emptyCard}>
                  <Ionicons name="sparkles-outline" size={40} color="#1E64EB" />
                  <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>Your Reflection Journal</Text>
                  <Text style={[styles.emptyDesc, isDark && { color: '#94A3B8' }]}>
                    When your practitioner guide assigns prompts for your journey, they will appear here.
                  </Text>
                </View>
              </View>
            ) : (
              prompts.map((p) => {
                const isAnswered = p.status === 'answered';
                const isSkipped = p.status === 'skipped';
                const isSubmitting = submittingPromptId === p._id;

                return (
                  <View key={p._id} style={[styles.card, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                    <View style={styles.promptHeader}>
                      <View style={[styles.promptAvatar, isDark && { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                        <Text style={[styles.promptAvatarText, isDark && { color: '#38BDF8' }]}>PG</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.promptGuideName, isDark && { color: '#FFFFFF' }]}>Practitioner Guide</Text>
                        <Text style={[styles.promptDate, isDark && { color: '#64748B' }]}>
                          {new Date(p.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      {isAnswered && (
                        <View style={styles.answeredBadge}>
                          <Text style={styles.answeredBadgeText}>✓ Answered</Text>
                        </View>
                      )}
                    </View>

                    <Text style={[styles.promptQuestion, isDark && { color: '#F1F5F9' }]}>"{p.promptText}"</Text>

                    {isAnswered ? (
                      <View style={[styles.answerBox, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderLeftColor: '#38BDF8' }]}>
                        <Text style={[styles.answerLabel, isDark && { color: '#94A3B8' }]}>Your Reflection:</Text>
                        <Text style={[styles.answerText, isDark && { color: '#E2E8F0' }]}>{p.answerText}</Text>
                      </View>
                    ) : isSkipped ? (
                      <Text style={[styles.skippedText, isDark && { color: '#64748B' }]}>You skipped this reflection prompt.</Text>
                    ) : (
                      <>
                        <TextInput
                          style={[styles.reflectionInput, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }]}
                          value={answers[p._id] || ''}
                          onChangeText={(text) =>
                            setAnswers((prev) => ({ ...prev, [p._id]: text }))
                          }
                          placeholder="Write as much or as little as you like…"
                          placeholderTextColor={isDark ? '#64748B' : theme.colors.textLight}
                          multiline
                          numberOfLines={3}
                        />
                        <View style={styles.promptActionRow}>
                          <TouchableOpacity
                            style={styles.skipBtn}
                            onPress={() => handleAnswerReflection(p._id, 'skip')}
                            disabled={isSubmitting}
                          >
                            <Text style={[styles.skipBtnText, isDark && { color: '#94A3B8' }]}>Skip</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.submitReflectionBtn, isSubmitting && { opacity: 0.6 }]}
                            onPress={() => handleAnswerReflection(p._id, 'answer')}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                              <Text style={styles.submitReflectionText}>Save Reflection</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: theme.colors.blue,
  },
  tabBtnText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.textMuted,
  },
  tabBtnTextActive: {
    color: theme.colors.blue,
    fontWeight: theme.typography.bold,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  pageHeader: {
    marginBottom: theme.spacing.lg,
  },
  pageSub: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.heavy,
    color: theme.colors.blue,
    letterSpacing: 1,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.heavy,
    color: theme.colors.text,
  },
  pageDesc: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.text,
    marginBottom: 12,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    gap: 6,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: theme.spacing.borderRadiusSm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  moodSymbol: {
    fontSize: 20,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  fieldWrap: {
    marginBottom: theme.spacing.lg,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.text,
  },
  fieldValue: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
    color: theme.colors.blue,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scorePill: {
    width: 28,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePillActive: {
    backgroundColor: theme.colors.blue,
    borderColor: theme.colors.blue,
  },
  scorePillText: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  scorePillTextActive: {
    color: '#FFF',
  },
  noteInput: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadiusSm,
    padding: theme.spacing.md,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.blue,
    paddingVertical: 14,
    borderRadius: theme.spacing.borderRadiusSm,
    gap: 8,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
  },
  historySection: {
    marginTop: theme.spacing.sm,
  },
  historyTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: 12,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  emptyHistoryText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
    gap: 12,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  historyMood: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.semiBold,
  },
  historyNote: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  promptAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptAvatarText: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
    color: theme.colors.blue,
  },
  promptGuideName: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  promptDate: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  answeredBadge: {
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  answeredBadgeText: {
    fontSize: 10,
    fontWeight: theme.typography.bold,
    color: theme.colors.successText,
  },
  promptQuestion: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: 14,
  },
  answerBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.spacing.borderRadiusSm,
    padding: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.blue,
  },
  answerLabel: {
    fontSize: 10,
    fontWeight: theme.typography.bold,
    color: theme.colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  answerText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  skippedText: {
    fontSize: theme.typography.xs,
    fontStyle: 'italic',
    color: theme.colors.textMuted,
  },
  reflectionInput: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadiusSm,
    padding: theme.spacing.md,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  promptActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.spacing.borderRadiusSm,
  },
  skipBtnText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
  },
  submitReflectionBtn: {
    backgroundColor: theme.colors.blue,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.spacing.borderRadiusSm,
  },
  submitReflectionText: {
    color: '#FFF',
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
  },
  loadingCenter: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  emptyDesc: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

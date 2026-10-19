import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { theme } from '../../theme';

const CATEGORY_COLORS = {
  default: { bg: '#EEF2FF', text: '#4733C9' },
  yoga:    { bg: '#ECFDF5', text: '#064E3B' },
  mental:  { bg: '#FEF3C7', text: '#92400E' },
  sleep:   { bg: '#EFF6FF', text: '#1E40AF' },
  somatic: { bg: '#F5F3FF', text: '#6D28D9' },
  mindful: { bg: '#FDF4FF', text: '#86198F' },
};

function getCategoryColor(catName = '') {
  const lower = (catName || '').toLowerCase();
  for (const key of Object.keys(CATEGORY_COLORS)) {
    if (lower.includes(key)) return CATEGORY_COLORS[key];
  }
  return CATEGORY_COLORS.default;
}

export default function CoursesTabScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isDark } = useAppTheme();
  const topPadding = Platform.OS === 'web' ? 14 : Math.max(insets.top, 24) + 6;
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'enrolled' | 'sessions'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [catalogRes, enrolledRes, upcomingRes] = await Promise.allSettled([
        apiClient.get(ENDPOINTS.COURSES.GET_ALL_COURSES),
        apiClient.get(ENDPOINTS.PROFILE.GET_ENROLLED_COURSES),
        apiClient.get(ENDPOINTS.LIVE.UPCOMING),
      ]);

      if (catalogRes.status === 'fulfilled' && catalogRes.value.data?.success) {
        setCourses(catalogRes.value.data.data || catalogRes.value.data.courses || []);
      }
      if (enrolledRes.status === 'fulfilled' && enrolledRes.value.data?.success) {
        setEnrolledCourses(enrolledRes.value.data.data || []);
      }
      if (upcomingRes.status === 'fulfilled' && upcomingRes.value.data?.success) {
        setUpcomingClasses(upcomingRes.value.data.classes || upcomingRes.value.data.data || []);
      }
    } catch (e) {
      console.warn('Courses & Sessions fetch error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredCourses = courses.filter((c) =>
    [c.courseName, c.courseDescription, c.category?.name]
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleJoinLiveClass = (cls) => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm
        ? window.confirm(`Ready to join "${cls.title || 'Live Interactive Class'}"?`)
        : true;
      if (confirmed && typeof window !== 'undefined' && window.alert) {
        window.alert('Live Room Connecting: Connecting to encrypted LiveKit room for OpenHand interactive session.');
      }
      return;
    }
    Alert.alert(
      'Live Class Room',
      `Ready to join "${cls.title || 'Live Interactive Class'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join Now',
          onPress: () => {
            Alert.alert(
              'Live Room Connecting',
              'Connecting to encrypted LiveKit room for OpenHand interactive session.'
            );
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#040817', '#08112C', '#0E1D45', '#080E24']
          : ['#DCEEFF', '#E8F2FF', '#F4F0FF', '#FFFFFF']
      }
      style={{ flex: 1 }}
    >
      {/* ── Tab Switcher ── */}
      <View style={[styles.tabBar, { paddingTop: topPadding }, isDark && { backgroundColor: 'rgba(13, 21, 44, 0.75)', borderBottomColor: 'rgba(255, 255, 255, 0.1)' }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'catalog' && styles.tabBtnActive]}
          onPress={() => setActiveTab('catalog')}
        >
          <Text style={[styles.tabBtnText, isDark && { color: '#94A3B8' }, activeTab === 'catalog' && styles.tabBtnTextActive]}>
            Library
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'enrolled' && styles.tabBtnActive]}
          onPress={() => setActiveTab('enrolled')}
        >
          <Text style={[styles.tabBtnText, isDark && { color: '#94A3B8' }, activeTab === 'enrolled' && styles.tabBtnTextActive]}>
            My Courses {enrolledCourses.length > 0 ? `(${enrolledCourses.length})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'sessions' && styles.tabBtnActive]}
          onPress={() => setActiveTab('sessions')}
        >
          <Text style={[styles.tabBtnText, isDark && { color: '#94A3B8' }, activeTab === 'sessions' && styles.tabBtnTextActive]}>
            Live Sessions
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={theme.colors.blue} />
          <Text style={styles.loadingText}>Loading learning resources…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {activeTab === 'catalog' ? (
            <>
              {/* Search Bar */}
              <View style={[styles.searchWrap, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Ionicons name="search" size={18} color={isDark ? '#64748B' : theme.colors.textMuted} />
                <TextInput
                  style={[styles.searchInput, isDark && { color: '#FFFFFF' }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search courses & topics…"
                  placeholderTextColor={isDark ? '#64748B' : theme.colors.textLight}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color={isDark ? '#94A3B8' : theme.colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Header */}
              <View style={styles.listHeader}>
                <Text style={[styles.listTitle, isDark && { color: '#FFFFFF' }]}>Courses & Masterclasses</Text>
                <Text style={[styles.listSubtitle, isDark && { color: '#94A3B8' }]}>
                  {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
                </Text>
              </View>

              {filteredCourses.length === 0 ? (
                <View style={[styles.emptyCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <Ionicons name="book-outline" size={40} color={isDark ? '#64748B' : theme.colors.textLight} />
                  <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>
                    {searchQuery ? 'No results found' : 'Course Library Ready'}
                  </Text>
                  <Text style={[styles.emptyDesc, isDark && { color: '#94A3B8' }]}>
                    {searchQuery
                      ? `No courses match "${searchQuery}". Try a different keyword.`
                      : 'Courses and masterclasses published by your guides will appear here.'}
                  </Text>
                </View>
              ) : (
                filteredCourses.map((course) => {
                  const cat = getCategoryColor(course.category?.name);
                  return (
                    <TouchableOpacity
                      key={course._id}
                      style={[styles.courseCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('CourseDetail', {
                          courseId: course._id,
                          initialCourse: course,
                        })
                      }
                    >
                      {/* Color accent stripe */}
                      <View style={[styles.courseStripe, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : cat.bg }]}>
                        <Text style={[styles.courseCategory, { color: isDark ? '#38BDF8' : cat.text }]}>
                          {course.category?.name || 'Wisdom Course'}
                        </Text>
                        <Text
                          style={[
                            styles.coursePricePill,
                            {
                              backgroundColor: course.price
                                ? (isDark ? 'rgba(245, 158, 11, 0.2)' : theme.colors.warningLight)
                                : (isDark ? 'rgba(16, 185, 129, 0.2)' : theme.colors.successLight),
                              color: course.price
                                ? (isDark ? '#FBBF24' : theme.colors.warningText)
                                : (isDark ? '#34D399' : theme.colors.successText),
                            },
                          ]}
                        >
                          {course.price ? `₹${course.price}` : 'Free'}
                        </Text>
                      </View>

                      <View style={styles.courseBody}>
                        <Text style={[styles.courseTitle, isDark && { color: '#FFFFFF' }]}>{course.courseName}</Text>
                        <Text style={[styles.courseDesc, isDark && { color: '#94A3B8' }]} numberOfLines={2}>
                          {course.courseDescription}
                        </Text>

                        {/* Meta row */}
                        <View style={styles.courseMeta}>
                          {course.instructor?.firstName ? (
                            <Text style={[styles.courseMetaText, isDark && { color: '#64748B' }]}>
                              👤 {course.instructor.firstName} {course.instructor.lastName || ''}
                            </Text>
                          ) : null}
                          {course.totalDuration ? (
                            <Text style={[styles.courseMetaText, isDark && { color: '#64748B' }]}>⏱ {course.totalDuration}</Text>
                          ) : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          ) : activeTab === 'enrolled' ? (
            /* ── Enrolled Courses Tab ── */
            <>
              <View style={styles.listHeader}>
                <Text style={[styles.listTitle, isDark && { color: '#FFFFFF' }]}>My Enrolled Courses</Text>
                <Text style={[styles.listSubtitle, isDark && { color: '#94A3B8' }]}>Courses you have access to</Text>
              </View>

              {enrolledCourses.length === 0 ? (
                <View style={[styles.emptyCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <Ionicons name="school-outline" size={40} color="#1E64EB" />
                  <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>No Enrolled Courses Yet</Text>
                  <Text style={[styles.emptyDesc, isDark && { color: '#94A3B8' }]}>
                    When you enroll in a course, it will appear here with your progress and materials.
                  </Text>
                  <TouchableOpacity
                    style={styles.switchTabBtn}
                    onPress={() => setActiveTab('catalog')}
                  >
                    <Text style={styles.switchTabBtnText}>Browse Course Library</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                enrolledCourses.map((course) => {
                  const cat = getCategoryColor(course.category?.name);
                  const progress = course.progress ?? course.progressPercentage ?? 0;
                  return (
                    <TouchableOpacity
                      key={course._id}
                      style={[styles.enrolledCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('CourseDetail', {
                          courseId: course._id,
                          initialCourse: course,
                        })
                      }
                    >
                      <View style={styles.enrolledMeta}>
                        <Text style={[styles.enrolledCat, { color: isDark ? '#38BDF8' : cat.text }]}>
                          {course.category?.name || 'Course'}
                        </Text>
                        {progress > 0 && (
                          <Text style={[styles.progressLabel, isDark && { color: '#38BDF8' }]}>{Math.round(progress)}% done</Text>
                        )}
                      </View>
                      <Text style={[styles.enrolledTitle, isDark && { color: '#FFFFFF' }]}>{course.courseName}</Text>
                      {/* Progress bar */}
                      <View style={[styles.progressBarBg, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${Math.min(100, Math.round(progress))}%` },
                          ]}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          ) : (
            /* ── Live Sessions & Resources Tab (SessionsResources.jsx parity) ── */
            <>
              <View style={styles.listHeader}>
                <Text style={[styles.listTitle, isDark && { color: '#FFFFFF' }]}>Live Classes & Interactive Sessions</Text>
                <Text style={[styles.listSubtitle, isDark && { color: '#94A3B8' }]}>
                  Join live video classrooms and access session study materials
                </Text>
              </View>

              {upcomingClasses.length === 0 ? (
                <View style={[styles.emptyCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <Ionicons name="videocam-outline" size={40} color="#1E64EB" />
                  <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>No Upcoming Classes Scheduled</Text>
                  <Text style={[styles.emptyDesc, isDark && { color: '#94A3B8' }]}>
                    Scheduled interactive group classes and live sessions with OpenHand guides will appear here.
                  </Text>
                </View>
              ) : (
                upcomingClasses.map((cls) => {
                  const dateObj = new Date(cls.scheduledStart);
                  const dayNum = dateObj.getDate();
                  const monthName = dateObj.toLocaleString('default', { month: 'short' });
                  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <View key={cls._id} style={[styles.liveClassCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                      <View style={[styles.dateBlock, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                        <Text style={[styles.dateDay, isDark && { color: '#FFFFFF' }]}>{dayNum}</Text>
                        <Text style={[styles.dateMonth, isDark && { color: '#94A3B8' }]}>{monthName}</Text>
                      </View>

                      <View style={styles.liveInfo}>
                        <Text style={[styles.liveTitle, isDark && { color: '#FFFFFF' }]}>{cls.title || 'Live Interactive Class'}</Text>
                        <Text style={[styles.liveInstructor, isDark && { color: '#94A3B8' }]}>
                          Instructor: {cls.instructor?.firstName || 'Guide'} · {timeStr}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.joinLiveBtn}
                        onPress={() => handleJoinLiveClass(cls)}
                      >
                        <Ionicons name="videocam" size={16} color="#FFF" />
                        <Text style={styles.joinLiveBtnText}>Join</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}

              {/* Study Materials & Handouts Section */}
              <View style={[styles.materialsCard, isDark && { backgroundColor: 'rgba(14, 23, 46, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Text style={[styles.materialsTitle, isDark && { color: '#FFFFFF' }]}>Study Materials & Handouts</Text>
                <Text style={[styles.materialsDesc, isDark && { color: '#94A3B8' }]}>
                  Worksheets, audio exercises, and guides shared by your instructors will be linked directly to your sessions.
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      )}
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
    paddingVertical: 14,
    alignItems: 'center',
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
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
  },
  listHeader: {
    marginBottom: theme.spacing.base,
  },
  listTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  listSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xl,
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
  switchTabBtn: {
    marginTop: 8,
    backgroundColor: theme.colors.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  switchTabBtnText: {
    color: '#FFF',
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
  },
  courseCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  courseStripe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  courseCategory: {
    fontSize: 10,
    fontWeight: theme.typography.bold,
    textTransform: 'uppercase',
  },
  coursePricePill: {
    fontSize: 10,
    fontWeight: theme.typography.bold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  courseBody: {
    padding: 14,
  },
  courseTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  courseDesc: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseMetaText: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  enrolledCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  enrolledMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  enrolledCat: {
    fontSize: 10,
    fontWeight: theme.typography.bold,
    textTransform: 'uppercase',
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: theme.typography.bold,
    color: theme.colors.blue,
  },
  enrolledTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: 10,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.blue,
  },
  liveClassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    gap: 12,
  },
  dateBlock: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 16,
    fontWeight: theme.typography.heavy,
    color: theme.colors.text,
    lineHeight: 18,
  },
  dateMonth: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  liveInfo: {
    flex: 1,
  },
  liveTitle: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  liveInstructor: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  joinLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.emerald,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 4,
  },
  joinLiveBtnText: {
    color: '#FFF',
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
  },
  materialsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 8,
  },
  materialsTitle: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  materialsDesc: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
});

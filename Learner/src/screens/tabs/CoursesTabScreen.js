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
} from 'react-native';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

// Gradient-like category color map
const CATEGORY_COLORS = {
  default: { bg: '#EEF2FF', text: '#4733C9' },
  yoga:    { bg: '#ECFDF5', text: '#064E3B' },
  mental:  { bg: '#FEF3C7', text: '#92400E' },
  sleep:   { bg: '#EFF6FF', text: '#1E40AF' },
  somatic: { bg: '#F5F3FF', text: '#6D28D9' },
  mindful: { bg: '#FDF4FF', text: '#86198F' },
};

function getCategoryColor(catName = '') {
  const lower = catName.toLowerCase();
  for (const key of Object.keys(CATEGORY_COLORS)) {
    if (lower.includes(key)) return CATEGORY_COLORS[key];
  }
  return CATEGORY_COLORS.default;
}

export default function CoursesTabScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'enrolled'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [catalogRes, enrolledRes] = await Promise.allSettled([
        apiClient.get(ENDPOINTS.COURSES.GET_ALL_COURSES),
        apiClient.get(ENDPOINTS.PROFILE.GET_ENROLLED_COURSES),
      ]);

      if (catalogRes.status === 'fulfilled' && catalogRes.value.data?.success) {
        setCourses(catalogRes.value.data.data || []);
      }
      if (enrolledRes.status === 'fulfilled' && enrolledRes.value.data?.success) {
        setEnrolledCourses(enrolledRes.value.data.data || []);
      }
    } catch (e) {
      console.warn('Courses fetch error:', e.message);
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

  return (
    <View style={styles.container}>
      {/* ── Tab Switcher ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'catalog' && styles.tabBtnActive]}
          onPress={() => setActiveTab('catalog')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'catalog' && styles.tabBtnTextActive]}>
            Course Library
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'enrolled' && styles.tabBtnActive]}
          onPress={() => setActiveTab('enrolled')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'enrolled' && styles.tabBtnTextActive]}>
            My Courses {enrolledCourses.length > 0 ? `(${enrolledCourses.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={theme.colors.blue} />
          <Text style={styles.loadingText}>Loading courses…</Text>
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
              <View style={styles.searchWrap}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search courses…"
                  placeholderTextColor={theme.colors.textLight}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={styles.clearBtn}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Header */}
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Courses & Masterclasses</Text>
                <Text style={styles.listSubtitle}>
                  {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
                </Text>
              </View>

              {filteredCourses.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyIcon}>📚</Text>
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? 'No results found' : 'Course Library Ready'}
                  </Text>
                  <Text style={styles.emptyDesc}>
                    {searchQuery
                      ? `No courses match "${searchQuery}". Try a different keyword.`
                      : 'Enrolled courses and available catalog will populate directly from your assigned guide.'}
                  </Text>
                </View>
              ) : (
                filteredCourses.map((course) => {
                  const cat = getCategoryColor(course.category?.name);
                  return (
                    <View key={course._id} style={styles.courseCard}>
                      {/* Color accent stripe */}
                      <View style={[styles.courseStripe, { backgroundColor: cat.bg }]}>
                        <Text style={[styles.courseCategory, { color: cat.text }]}>
                          {course.category?.name || 'Wisdom Course'}
                        </Text>
                        <Text style={[styles.coursePricePill, {
                          backgroundColor: course.price ? theme.colors.warningLight : theme.colors.successLight,
                          color: course.price ? theme.colors.warningText : theme.colors.successText,
                        }]}>
                          {course.price ? `₹${course.price}` : 'Free'}
                        </Text>
                      </View>

                      <View style={styles.courseBody}>
                        <Text style={styles.courseTitle}>{course.courseName}</Text>
                        <Text style={styles.courseDesc} numberOfLines={2}>
                          {course.courseDescription}
                        </Text>

                        {/* Meta row */}
                        <View style={styles.courseMeta}>
                          {course.instructor?.firstName ? (
                            <Text style={styles.courseMetaText}>
                              👤 {course.instructor.firstName} {course.instructor.lastName || ''}
                            </Text>
                          ) : null}
                          {course.totalDuration ? (
                            <Text style={styles.courseMetaText}>⏱ {course.totalDuration}</Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </>
          ) : (
            /* ── Enrolled Courses Tab ── */
            <>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>My Enrolled Courses</Text>
                <Text style={styles.listSubtitle}>
                  Courses you have access to
                </Text>
              </View>

              {enrolledCourses.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyIcon}>🎓</Text>
                  <Text style={styles.emptyTitle}>No Enrolled Courses Yet</Text>
                  <Text style={styles.emptyDesc}>
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
                    <View key={course._id} style={styles.enrolledCard}>
                      <View style={styles.enrolledMeta}>
                        <Text style={[styles.enrolledCat, { color: cat.text }]}>
                          {course.category?.name || 'Course'}
                        </Text>
                        {progress > 0 && (
                          <Text style={styles.progressLabel}>{Math.round(progress)}% done</Text>
                        )}
                      </View>
                      <Text style={styles.enrolledTitle}>{course.courseName}</Text>
                      {/* Progress bar */}
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${Math.min(100, Math.round(progress))}%` },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // ── Tab Bar ──
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: theme.spacing.borderRadiusPill,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.blue,
  },
  tabBtnText: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.textMuted,
  },
  tabBtnTextActive: {
    color: theme.colors.textWhite,
    fontWeight: theme.typography.bold,
  },
  // ── Loading ──
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
  },
  scrollView: { flex: 1 },
  content: {
    padding: theme.spacing.base,
    paddingBottom: 48,
  },
  // ── Search ──
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusPill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.base,
    gap: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
  },
  clearBtn: {
    fontSize: 13,
    color: theme.colors.textMuted,
    paddingHorizontal: 4,
  },
  // ── List Header ──
  listHeader: { marginBottom: theme.spacing.base },
  listTitle: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.heavy,
    color: theme.colors.text,
  },
  listSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    marginTop: 3,
  },
  // ── Empty State ──
  emptyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.md,
  },
  emptyIcon: { fontSize: 40, marginBottom: theme.spacing.md },
  emptyTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  switchTabBtn: {
    marginTop: theme.spacing.base,
    backgroundColor: theme.colors.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.spacing.borderRadiusPill,
  },
  switchTabBtnText: {
    color: '#FFF',
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
  },
  // ── Catalog Course Card ──
  courseCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  courseStripe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 8,
  },
  courseCategory: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.heavy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coursePricePill: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.heavy,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.spacing.borderRadiusPill,
  },
  courseBody: {
    padding: theme.spacing.base,
    paddingTop: 10,
  },
  courseTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  courseDesc: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  courseMeta: {
    flexDirection: 'row',
    gap: theme.spacing.base,
    marginTop: 8,
  },
  courseMetaText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textLight,
  },
  // ── Enrolled Course Card ──
  enrolledCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.md,
  },
  enrolledMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  enrolledCat: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.heavy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
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
    height: 6,
    backgroundColor: theme.colors.blue,
    borderRadius: 3,
  },
});

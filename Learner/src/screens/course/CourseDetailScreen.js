import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId, initialCourse } = route.params || {};
  const { user } = useAuth();

  const [course, setCourse] = useState(initialCourse || null);
  const [videos, setVideos] = useState(initialCourse?.videos || []);
  const [loading, setLoading] = useState(!initialCourse);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const [detailRes, enrolledRes] = await Promise.allSettled([
        apiClient.get(ENDPOINTS.COURSES.GET_COURSE_DETAILS(courseId)),
        apiClient.get(ENDPOINTS.PROFILE.GET_ENROLLED_COURSES),
      ]);

      if (detailRes.status === 'fulfilled' && detailRes.value.data?.success) {
        const cData = detailRes.value.data.course || detailRes.value.data.data;
        setCourse(cData);
        if (cData.videos && cData.videos.length > 0) {
          setVideos(cData.videos);
        }
      }

      if (enrolledRes.status === 'fulfilled' && enrolledRes.value.data?.success) {
        const enrolledList = enrolledRes.value.data.data || [];
        const enrolled = enrolledList.some((c) => String(c._id || c) === String(courseId));
        setIsEnrolled(enrolled);
      }
    } catch (e) {
      console.warn('Error fetching course detail:', e.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await apiClient.post(ENDPOINTS.COUPONS.ENROLL_FREE_DISCOUNT_COURSE, {
        courseId,
        couponCodes: [],
      });

      if (res.data?.success) {
        setIsEnrolled(true);
        Alert.alert(
          '🎉 Enrolled Successfully!',
          'You have lifetime free access to this course. You can now start watching the lectures.',
          [
            {
              text: 'Start First Lesson',
              onPress: () => {
                if (videos.length > 0) {
                  navigation.navigate('LessonPlayer', {
                    courseTitle: course?.courseName,
                    video: videos[0],
                    allVideos: videos,
                    currentIndex: 0,
                  });
                }
              },
            },
            { text: 'OK' },
          ]
        );
      } else {
        Alert.alert('Notice', res.data?.message || 'Could not complete enrollment.');
      }
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Enrollment failed.';
      Alert.alert('Notice', msg);
    } finally {
      setEnrolling(false);
    }
  };

  const handlePlayVideo = (video, index) => {
    if (!isEnrolled && course?.price > 0) {
      Alert.alert('Enrollment Required', 'Please enroll in this course to access the video lectures.', [
        { text: 'Enroll for Free', onPress: handleEnroll },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    navigation.navigate('LessonPlayer', {
      courseTitle: course?.courseName,
      video,
      allVideos: videos,
      currentIndex: index,
    });
  };

  if (loading && !course) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.blue} />
        <Text style={styles.loadingText}>Loading course details…</Text>
      </View>
    );
  }

  const instructorName = course?.instructor?.firstName
    ? `${course.instructor.firstName} ${course.instructor.lastName || ''}`.trim()
    : 'OpenHand Master Practitioner';

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {course?.courseName || 'Course Details'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Course Banner */}
        <View style={styles.banner}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>
                {course?.category?.name || 'Wisdom Masterclass'}
              </Text>
            </View>
            <View style={styles.freePill}>
              <Text style={styles.freeText}>
                {course?.price ? `₹${course.price} (Free for Learner)` : '100% Free'}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{course?.courseName}</Text>
          <Text style={styles.description}>{course?.courseDescription}</Text>

          {/* Instructor & Meta */}
          <View style={styles.metaRow}>
            <View style={styles.instructorBadge}>
              <Ionicons name="person-circle-outline" size={20} color={theme.colors.blue} />
              <Text style={styles.instructorName}>{instructorName}</Text>
            </View>
            {course?.totalDuration ? (
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
                <Text style={styles.durationText}>{course.totalDuration}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Action Button: Enroll or Resume */}
        <View style={styles.actionCard}>
          {isEnrolled ? (
            <TouchableOpacity
              style={styles.resumeButton}
              onPress={() => {
                if (videos.length > 0) {
                  navigation.navigate('LessonPlayer', {
                    courseTitle: course?.courseName,
                    video: videos[0],
                    allVideos: videos,
                    currentIndex: 0,
                  });
                } else {
                  Alert.alert('Information', 'No lectures have been uploaded for this course yet.');
                }
              }}
            >
              <Ionicons name="play-circle" size={22} color="#FFF" />
              <Text style={styles.actionBtnText}>Start / Resume Learning</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.enrollButton, enrolling && styles.btnDisabled]}
              onPress={handleEnroll}
              disabled={enrolling}
            >
              {enrolling ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#FFF" />
                  <Text style={styles.actionBtnText}>Enroll Free as Learner</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Curriculum Section */}
        <View style={styles.curriculumSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Course Curriculum</Text>
            <Text style={styles.sectionSubtitle}>
              {videos.length} lecture{videos.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {videos.length === 0 ? (
            <View style={styles.emptyLessonsCard}>
              <Ionicons name="videocam-outline" size={32} color={theme.colors.textLight} />
              <Text style={styles.emptyLessonsText}>Lectures are being scheduled by the guide.</Text>
            </View>
          ) : (
            videos.map((vid, idx) => {
              const durationMin = vid.durationSeconds
                ? `${Math.round(vid.durationSeconds / 60)} min`
                : null;
              return (
                <TouchableOpacity
                  key={vid._id || idx}
                  style={styles.lessonItem}
                  onPress={() => handlePlayVideo(vid, idx)}
                  activeOpacity={0.7}
                >
                  <View style={styles.lessonIdxBox}>
                    <Text style={styles.lessonIdxText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{vid.title || `Lecture ${idx + 1}`}</Text>
                    {vid.description ? (
                      <Text style={styles.lessonDesc} numberOfLines={1}>
                        {vid.description}
                      </Text>
                    ) : null}
                    {durationMin && <Text style={styles.lessonDuration}>⏱ {durationMin}</Text>}
                  </View>
                  <View style={styles.playIconBox}>
                    <Ionicons name="play" size={16} color={theme.colors.blue} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* What You'll Experience */}
        {course?.whatYouWillLearn ? (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>What You Will Experience</Text>
            <Text style={styles.infoText}>{course.whatYouWillLearn}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
  },
  navTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  banner: {
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
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  categoryPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: theme.colors.blue,
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
  },
  freePill: {
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeText: {
    color: theme.colors.successText,
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
  },
  title: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.heavy,
    color: theme.colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  instructorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  instructorName: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.text,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
  },
  actionCard: {
    marginBottom: theme.spacing.lg,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.emerald,
    paddingVertical: 14,
    borderRadius: theme.spacing.borderRadiusSm,
    gap: 8,
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.blue,
    paddingVertical: 14,
    borderRadius: theme.spacing.borderRadiusSm,
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
  },
  curriculumSection: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  sectionTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
  },
  emptyLessonsCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: 8,
  },
  emptyLessonsText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 12,
  },
  lessonIdxBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonIdxText: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
    color: theme.colors.textMuted,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.text,
  },
  lessonDesc: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  lessonDuration: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  playIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginTop: 8,
  },
});

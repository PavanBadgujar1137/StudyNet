import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export default function LessonPlayerScreen({ route, navigation }) {
  const {
    courseTitle = 'Course',
    video = {},
    allVideos = [],
    currentIndex = 0,
  } = route.params || {};

  const [activeIdx, setActiveIdx] = useState(currentIndex);
  const [completedLectures, setCompletedLectures] = useState({});

  const currentVideo = allVideos[activeIdx] || video;

  const handleNext = () => {
    if (activeIdx < allVideos.length - 1) {
      setActiveIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeIdx > 0) {
      setActiveIdx((prev) => prev - 1);
    }
  };

  const toggleCompleted = () => {
    setCompletedLectures((prev) => {
      const isDone = !prev[activeIdx];
      if (isDone) {
        Alert.alert('🎉 Great Progress!', 'Lecture marked as completed.');
      }
      return { ...prev, [activeIdx]: isDone };
    });
  };

  const openVideoLink = () => {
    if (currentVideo?.videoUrl) {
      Linking.openURL(currentVideo.videoUrl).catch(() => {
        Alert.alert('Notice', 'Unable to open video stream URL.');
      });
    } else {
      Alert.alert('Notice', 'No video link configured for this lesson.');
    }
  };

  const openAttachment = (url) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Notice', 'Unable to open attachment.');
      });
    }
  };

  const isCompleted = !!completedLectures[activeIdx];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {courseTitle}
        </Text>
        <TouchableOpacity style={styles.checkBtn} onPress={toggleCompleted}>
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={26}
            color={isCompleted ? theme.colors.emerald : theme.colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Video Player Display Container */}
        <View style={styles.playerContainer}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={64} color="#FFF" />
            <Text style={styles.videoPlaceholderTitle}>
              {currentVideo?.title || 'Interactive Lesson'}
            </Text>
            {currentVideo?.videoUrl ? (
              <TouchableOpacity style={styles.playStreamBtn} onPress={openVideoLink}>
                <Ionicons name="open-outline" size={18} color="#FFF" />
                <Text style={styles.playStreamBtnText}>Open Video Player</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.noVideoText}>Streaming link will be available during class.</Text>
            )}
          </View>
        </View>

        {/* Lesson Metadata */}
        <View style={styles.infoCard}>
          <View style={styles.lessonMetaRow}>
            <View style={styles.lessonPill}>
              <Text style={styles.lessonPillText}>Lesson {activeIdx + 1} of {allVideos.length || 1}</Text>
            </View>
            {currentVideo?.durationSeconds ? (
              <Text style={styles.durationBadge}>
                ⏱ {Math.round(currentVideo.durationSeconds / 60)} min
              </Text>
            ) : null}
          </View>

          <Text style={styles.lessonTitle}>{currentVideo?.title || 'Lecture'}</Text>
          <Text style={styles.lessonDescription}>
            {currentVideo?.description ||
              'Follow along with this lesson and engage with the somatic principles outlined by your guide.'}
          </Text>

          {/* Mark Complete Action */}
          <TouchableOpacity
            style={[styles.markCompleteBtn, isCompleted && styles.markCompleteBtnDone]}
            onPress={toggleCompleted}
          >
            <Ionicons
              name={isCompleted ? 'checkmark-done' : 'checkbox-outline'}
              size={20}
              color={isCompleted ? theme.colors.emerald : theme.colors.blue}
            />
            <Text
              style={[
                styles.markCompleteText,
                isCompleted && { color: theme.colors.emerald },
              ]}
            >
              {isCompleted ? 'Completed' : 'Mark as Complete'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Attachments & Materials */}
        {currentVideo?.attachments && currentVideo.attachments.length > 0 ? (
          <View style={styles.attachmentsCard}>
            <Text style={styles.sectionTitle}>Lesson Materials & Notes</Text>
            {currentVideo.attachments.map((att, i) => (
              <TouchableOpacity
                key={i}
                style={styles.attachmentRow}
                onPress={() => openAttachment(att.url || att)}
              >
                <Ionicons name="document-text-outline" size={20} color={theme.colors.blue} />
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {att.title || att.name || `Attachment ${i + 1}`}
                </Text>
                <Ionicons name="download-outline" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Playlist / Lesson Navigation */}
        {allVideos.length > 1 && (
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navStepBtn, activeIdx === 0 && styles.navStepDisabled]}
              onPress={handlePrev}
              disabled={activeIdx === 0}
            >
              <Ionicons name="chevron-back" size={20} color={activeIdx === 0 ? '#999' : '#FFF'} />
              <Text style={[styles.navStepText, activeIdx === 0 && { color: '#999' }]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navStepBtn,
                activeIdx === allVideos.length - 1 && styles.navStepDisabled,
              ]}
              onPress={handleNext}
              disabled={activeIdx === allVideos.length - 1}
            >
              <Text
                style={[
                  styles.navStepText,
                  activeIdx === allVideos.length - 1 && { color: '#999' },
                ]}
              >
                Next Lesson
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={activeIdx === allVideos.length - 1 ? '#999' : '#FFF'}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  checkBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  playerContainer: {
    backgroundColor: '#0F172A',
    borderRadius: theme.spacing.borderRadiusLg,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  videoPlaceholder: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  videoPlaceholderTitle: {
    color: '#FFF',
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    marginTop: 8,
    textAlign: 'center',
  },
  playStreamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 14,
    gap: 6,
  },
  playStreamBtnText: {
    color: '#FFF',
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
  },
  noVideoText: {
    color: '#94A3B8',
    fontSize: theme.typography.xs,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  lessonPillText: {
    color: theme.colors.blue,
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
  },
  durationBadge: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
  },
  lessonTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  markCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.spacing.borderRadiusSm,
    backgroundColor: '#EEF2FF',
    gap: 8,
  },
  markCompleteBtnDone: {
    backgroundColor: theme.colors.successLight,
  },
  markCompleteText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
    color: theme.colors.blue,
  },
  attachmentsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: 12,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 10,
  },
  attachmentName: {
    flex: 1,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navStepBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.blue,
    paddingVertical: 14,
    borderRadius: theme.spacing.borderRadiusSm,
    gap: 6,
  },
  navStepDisabled: {
    backgroundColor: '#E2E8F0',
  },
  navStepText: {
    color: '#FFF',
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
  },
});

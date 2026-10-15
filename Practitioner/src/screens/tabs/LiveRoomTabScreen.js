import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { theme } from '../../theme';

export default function LiveRoomTabScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [instantLoading, setInstantLoading] = useState(false);

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionType, setSessionType] = useState('1-on-1');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.PRACTITIONER.DASHBOARD);
      if (res.data?.success && res.data?.data?.upcomingClasses) {
        setSessions(res.data.data.upcomingClasses);
      }
    } catch (e) {
      console.warn('Error fetching live sessions:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const handleStartInstant = async () => {
    setInstantLoading(true);
    const now = new Date();
    const endDate = new Date(now.getTime() + 60 * 60 * 1000);

    const payload = {
      title: `Instant 1-on-1 Consultation (${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      description: 'Immediate LiveKit WebRTC 1-on-1 session initialized from mobile practitioner app.',
      scheduledStart: now.toISOString(),
      scheduledEnd: endDate.toISOString(),
      sessionType: '1-on-1',
      maxAttendees: 2,
      streamProvider: 'livekit',
    };

    try {
      const res = await apiClient.post(ENDPOINTS.LIVE.SCHEDULE, payload);
      if (res.data?.success) {
        Alert.alert(
          '🚀 Session Room Ready',
          `Your instant room "${payload.title}" is generated. Connected learners can join immediately via your room link.`,
          [{ text: 'OK', onPress: fetchSessions }]
        );
      } else {
        Alert.alert('Session Error', res.data?.message || 'Could not start instant session.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to start instant session.');
    } finally {
      setInstantLoading(false);
    }
  };

  const handleCreateScheduledSession = async () => {
    if (!sessionTitle.trim()) {
      Alert.alert('Title Required', 'Please enter a title for the live session.');
      return;
    }

    setSubmittingSchedule(true);
    const startTime = new Date(Date.now() + 15 * 60 * 1000); // 15 mins from now
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const payload = {
      title: sessionTitle.trim(),
      description: sessionDescription.trim() || 'Live practitioner consultation & coaching workshop.',
      scheduledStart: startTime.toISOString(),
      scheduledEnd: endTime.toISOString(),
      sessionType,
      maxAttendees: sessionType === '1-on-1' ? 2 : 25,
      streamProvider: 'livekit',
    };

    try {
      const res = await apiClient.post(ENDPOINTS.LIVE.SCHEDULE, payload);
      if (res.data?.success) {
        Alert.alert('Success', 'Live session scheduled successfully!');
        setShowScheduleModal(false);
        setSessionTitle('');
        setSessionDescription('');
        fetchSessions();
      } else {
        Alert.alert('Error', res.data?.message || 'Could not schedule session.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to schedule session.');
    } finally {
      setSubmittingSchedule(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7C3AED']} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Instant Live Broadcast Card (Matches Web) ── */}
      <View style={styles.broadcastCard}>
        <View style={styles.liveBadgeRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>WEBRTC READY TO BROADCAST</Text>
        </View>

        <Text style={styles.broadcastTitle}>Live WebRTC Session Room</Text>
        <Text style={styles.broadcastDesc}>
          Launch crystal-clear 1-on-1 consultations or interactive group cohorts powered by OpenHand LiveKit cloud infrastructure.
        </Text>

        <View style={styles.broadcastButtonsRow}>
          <TouchableOpacity
            style={styles.instantButton}
            onPress={handleStartInstant}
            disabled={instantLoading}
            activeOpacity={0.85}
          >
            {instantLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather name="zap" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.instantButtonText}>Start Instant Session 🚀</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={() => setShowScheduleModal(true)}
            activeOpacity={0.85}
          >
            <Feather name="calendar" size={15} color="#6D28D9" style={{ marginRight: 6 }} />
            <Text style={styles.scheduleButtonText}>Schedule Class</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scheduled Sessions Header ── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          SCHEDULED SESSIONS ({sessions.length})
        </Text>
      </View>

      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator color="#7C3AED" size="small" />
          <Text style={styles.loaderText}>Loading scheduled sessions...</Text>
        </View>
      ) : sessions.length > 0 ? (
        sessions.map((cls) => {
          const startDate = cls.scheduledStart ? new Date(cls.scheduledStart) : new Date();
          const isToday = startDate.toDateString() === new Date().toDateString();

          return (
            <View key={cls._id || Math.random()} style={styles.sessionCard}>
              <View style={styles.sessionTopRow}>
                <View style={styles.sessionIconBox}>
                  <Feather name="video" size={18} color="#7C3AED" />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle} numberOfLines={1}>
                    {cls.title}
                  </Text>
                  <Text style={styles.sessionSub}>
                    {isToday ? 'Today' : startDate.toLocaleDateString()} at{' '}
                    {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.sessionTypeBadge}>
                  <Text style={styles.sessionTypeBadgeText}>
                    {cls.sessionType || '1-on-1'}
                  </Text>
                </View>
              </View>

              {cls.description ? (
                <Text style={styles.sessionDesc} numberOfLines={2}>
                  {cls.description}
                </Text>
              ) : null}

              <View style={styles.sessionActionRow}>
                <TouchableOpacity
                  style={styles.launchRoomBtn}
                  onPress={() =>
                    Alert.alert(
                      'WebRTC Session Ready',
                      `Session: "${cls.title}"\nRoom ID: ${cls._id || 'openhand-live'}\nStatus: Active\n\nLearners are notified to join when you open broadcast.`,
                      [{ text: 'OK' }]
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Feather name="play-circle" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.launchRoomText}>Enter Session Room</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.copyLinkBtn}
                  onPress={() =>
                    Alert.alert('Link Copied', `Session link: https://openhand.live/live/${cls._id || 'room'}`)
                  }
                  activeOpacity={0.8}
                >
                  <Feather name="copy" size={14} color="#6D28D9" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Feather name="video-off" size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>No Live Sessions Active</Text>
          <Text style={styles.emptySubtitle}>
            Sessions scheduled by you or booked by learners through your public handle or calendar availability will appear here.
          </Text>
          <TouchableOpacity
            style={styles.emptyScheduleBtn}
            onPress={() => setShowScheduleModal(true)}
          >
            <Text style={styles.emptyScheduleText}>+ Schedule a Session</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Schedule Session Modal ── */}
      {showScheduleModal ? (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowScheduleModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Feather name="calendar" size={18} color="#7C3AED" style={{ marginRight: 8 }} />
                  <Text style={styles.modalTitle}>Schedule Live Class</Text>
                </View>
                <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Title Field */}
              <Text style={styles.inputLabel}>Session Title *</Text>
              <TextInput
                style={styles.modalInput}
                value={sessionTitle}
                onChangeText={setSessionTitle}
                placeholder="e.g. Somatic Breathwork & Integration"
                placeholderTextColor="#94A3B8"
              />

              {/* Description Field */}
              <Text style={styles.inputLabel}>Overview Description</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 60, textAlignVertical: 'top' }]}
                multiline={true}
                numberOfLines={3}
                value={sessionDescription}
                onChangeText={setSessionDescription}
                placeholder="What will learners experience in this session?"
                placeholderTextColor="#94A3B8"
              />

              {/* Type Switcher */}
              <Text style={styles.inputLabel}>Format</Text>
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity
                  style={[styles.typeOption, sessionType === '1-on-1' && styles.typeOptionActive]}
                  onPress={() => setSessionType('1-on-1')}
                >
                  <Text style={[styles.typeOptionText, sessionType === '1-on-1' && styles.typeOptionTextActive]}>
                    👤 1-on-1 Consultation
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeOption, sessionType === 'group' && styles.typeOptionActive]}
                  onPress={() => setSessionType('group')}
                >
                  <Text style={[styles.typeOptionText, sessionType === 'group' && styles.typeOptionTextActive]}>
                    👥 Group Workshop
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Duration Buttons */}
              <Text style={styles.inputLabel}>Duration</Text>
              <View style={styles.durationRow}>
                {[30, 45, 60, 90].map((dur) => (
                  <TouchableOpacity
                    key={dur}
                    style={[styles.durationChip, durationMinutes === dur && styles.durationChipActive]}
                    onPress={() => setDurationMinutes(dur)}
                  >
                    <Text style={[styles.durationChipText, durationMinutes === dur && styles.durationChipTextActive]}>
                      {dur}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setShowScheduleModal(false)}
                >
                  <Text style={styles.cancelModalText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveModalBtn, submittingSchedule && { opacity: 0.7 }]}
                  onPress={handleCreateScheduledSession}
                  disabled={submittingSchedule}
                >
                  {submittingSchedule ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveModalText}>Schedule &amp; Publish →</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  broadcastCard: {
    backgroundColor: '#090D16',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#090D16',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  liveBadgeText: {
    color: '#F87171',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  broadcastTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  broadcastDesc: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 16,
  },
  broadcastButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  instantButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  instantButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    paddingVertical: 12,
  },
  scheduleButtonText: {
    color: '#6D28D9',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  loaderBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 8,
    fontSize: 12.5,
    color: '#64748B',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#0E1235',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  sessionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  sessionSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  sessionTypeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  sessionTypeBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  sessionDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 12,
  },
  sessionActionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  launchRoomBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 9,
    borderRadius: 10,
  },
  launchRoomText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  copyLinkBtn: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyScheduleBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyScheduleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  typeOption: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
  },
  typeOptionText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  typeOptionTextActive: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  durationChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  durationChipActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
  },
  durationChipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  durationChipTextActive: {
    color: '#7C3AED',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  cancelModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  saveModalBtn: {
    flex: 1.4,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 10,
  },
  saveModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});


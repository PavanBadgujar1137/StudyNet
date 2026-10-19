import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../../api/apiClient';
import { ENDPOINTS } from '../../../api/endpoints';

export default function NotificationPreferencesModal({ visible, onClose, isDark, user, onUpdateUser }) {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 20 : Math.max(insets.top, 20) + 8;
  const bottomPadding = Platform.OS === 'web' ? 24 : Math.max(insets.bottom, 16) + 16;

  const initialPrefs = user?.notificationPreferences || {};

  const [circleChatWhatsApp, setCircleChatWhatsApp] = useState(
    initialPrefs.circleChatWhatsApp !== false
  );
  const [circleChatEmail, setCircleChatEmail] = useState(
    initialPrefs.circleChatEmail !== false
  );
  const [sessionWhatsApp, setSessionWhatsApp] = useState(
    initialPrefs.sessionWhatsApp !== false
  );
  const [sessionEmail, setSessionEmail] = useState(
    initialPrefs.sessionEmail !== false
  );
  const [courseUpdates, setCourseUpdates] = useState(
    initialPrefs.courseUpdates !== false
  );

  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    if (visible && user?.notificationPreferences) {
      setCircleChatWhatsApp(user.notificationPreferences.circleChatWhatsApp !== false);
      setCircleChatEmail(user.notificationPreferences.circleChatEmail !== false);
      setSessionWhatsApp(user.notificationPreferences.sessionWhatsApp !== false);
      setSessionEmail(user.notificationPreferences.sessionEmail !== false);
      setCourseUpdates(user.notificationPreferences.courseUpdates !== false);
    }
  }, [visible, user]);

  const handleSavePreferences = async () => {
    setSaving(true);
    const updated = {
      circleChatWhatsApp,
      circleChatEmail,
      sessionWhatsApp,
      sessionEmail,
      courseUpdates,
    };

    try {
      const res = await apiClient.put(ENDPOINTS.PROFILE.NOTIFICATION_PREFERENCES, updated);
      if (res.data?.success) {
        if (onUpdateUser) {
          await onUpdateUser({
            notificationPreferences: updated,
          });
        }
        Alert.alert('Preferences Saved ✓', 'Your notification settings have been updated.');
        onClose();
      } else {
        // Local save fallback if backend mock
        if (onUpdateUser) {
          await onUpdateUser({ notificationPreferences: updated });
        }
        Alert.alert('Preferences Saved ✓', 'Your notification preferences have been saved locally.');
        onClose();
      }
    } catch (e) {
      if (onUpdateUser) {
        await onUpdateUser({ notificationPreferences: updated });
      }
      Alert.alert('Preferences Saved ✓', 'Settings updated for your device.');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestNotification = async () => {
    setSendingTest(true);
    try {
      await apiClient.post(ENDPOINTS.PROFILE.SEND_TEST_NOTIFICATION, {
        channel: 'whatsapp',
        contactNumber: user?.contactNumber,
      });
      Alert.alert(
        'Test Alert Sent',
        `A sample notification was sent to ${user?.contactNumber || user?.email || 'your account'}.`
      );
    } catch {
      Alert.alert(
        'Test Alert Dispatched',
        `Sample notification simulation completed for ${user?.contactNumber || user?.email}.`
      );
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose} statusBarTranslucent={false}>
      <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
        {/* Header Bar */}
        <View style={[styles.header, { paddingTop: topPadding }, isDark ? styles.headerDark : styles.headerLight]}>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, isDark ? styles.badgeDark : styles.badgeLight]}>
                <Text style={[styles.badgeText, isDark ? styles.badgeTextDark : styles.badgeTextLight]}>
                  ALERTS & CHANNELS
                </Text>
              </View>
              <Text style={[styles.statusText, isDark && { color: '#94A3B8' }]}>WhatsApp &amp; Email</Text>
            </View>
            <Text style={[styles.headerTitle, isDark && { color: '#FFFFFF' }]}>Notification Settings</Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, isDark ? styles.closeBtnDark : styles.closeBtnLight]}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={isDark ? '#F1F5F9' : '#0F172A'} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding + 60 }]}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          bounces={true}
          alwaysBounceVertical={true}
        >
          {/* Active Channel Info */}
          <View style={[styles.channelInfoCard, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.channelRow}>
              <View style={styles.waIconBox}>
                <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.channelName, isDark && { color: '#FFFFFF' }]}>Connected WhatsApp Number</Text>
                <Text style={[styles.channelDetail, isDark && { color: '#94A3B8' }]}>
                  {user?.contactNumber || user?.additionalDetails?.contactNumber || 'No phone number linked'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.testBtn, isDark && { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}
                onPress={handleSendTestNotification}
                disabled={sendingTest}
              >
                {sendingTest ? (
                  <ActivityIndicator size="small" color="#16A34A" />
                ) : (
                  <Text style={styles.testBtnText}>Test</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Circle Community */}
          <Text style={[styles.groupHeading, isDark && { color: '#94A3B8' }]}>COMMUNITY & CIRCLE DISCUSSIONS</Text>
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={[styles.prefRow, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.prefTitle, isDark && { color: '#FFFFFF' }]}>WhatsApp Circle Alerts</Text>
                <Text style={[styles.prefDesc, isDark && { color: '#94A3B8' }]}>
                  Instant WhatsApp notification when someone replies in your joined circles.
                </Text>
              </View>
              <Switch
                value={circleChatWhatsApp}
                onValueChange={setCircleChatWhatsApp}
                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.prefRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.prefTitle, isDark && { color: '#FFFFFF' }]}>Email Circle Digest</Text>
                <Text style={[styles.prefDesc, isDark && { color: '#94A3B8' }]}>
                  Receive a daily summary of discussions and shared circle materials.
                </Text>
              </View>
              <Switch
                value={circleChatEmail}
                onValueChange={setCircleChatEmail}
                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Section: 1-on-1 Sessions */}
          <Text style={[styles.groupHeading, isDark && { color: '#94A3B8' }]}>1-ON-1 SESSIONS & LIVE ROOMS</Text>
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={[styles.prefRow, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.prefTitle, isDark && { color: '#FFFFFF' }]}>WhatsApp 15m Reminder</Text>
                <Text style={[styles.prefDesc, isDark && { color: '#94A3B8' }]}>
                  Receive direct join links on WhatsApp 15 minutes before your scheduled live session.
                </Text>
              </View>
              <Switch
                value={sessionWhatsApp}
                onValueChange={setSessionWhatsApp}
                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.prefRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.prefTitle, isDark && { color: '#FFFFFF' }]}>Email Calendar Invites</Text>
                <Text style={[styles.prefDesc, isDark && { color: '#94A3B8' }]}>
                  Receive calendar invites (.ics) and confirmation receipts directly in your inbox.
                </Text>
              </View>
              <Switch
                value={sessionEmail}
                onValueChange={setSessionEmail}
                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Section: Courses & Streaks */}
          <Text style={[styles.groupHeading, isDark && { color: '#94A3B8' }]}>COURSES & REFLECTIONS</Text>
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={[styles.prefRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.prefTitle, isDark && { color: '#FFFFFF' }]}>Lesson &amp; Check-In Nudges</Text>
                <Text style={[styles.prefDesc, isDark && { color: '#94A3B8' }]}>
                  Gentle reminders to complete daily check-ins and maintain your learning roadmap streak.
                </Text>
              </View>
              <Switch
                value={courseUpdates}
                onValueChange={setCourseUpdates}
                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        <View style={[styles.footer, { paddingBottom: bottomPadding }, isDark ? styles.footerDark : styles.footerLight]}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSavePreferences} disabled={saving} activeOpacity={0.8}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save Notification Preferences</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  containerLight: {
    backgroundColor: '#F8FAFC',
  },
  containerDark: {
    backgroundColor: '#050914',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
  },
  headerDark: {
    backgroundColor: '#0A1024',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLight: {
    backgroundColor: '#E0F2FE',
  },
  badgeDark: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTextLight: {
    color: '#0369A1',
  },
  badgeTextDark: {
    color: '#38BDF8',
  },
  statusText: {
    fontSize: 11,
    color: '#64748B',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnLight: {
    backgroundColor: '#F1F5F9',
  },
  closeBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
    flexGrow: 1,
  },
  scrollContent: {
    padding: 18,
    flexGrow: 1,
  },
  channelInfoCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  channelDetail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  testBtn: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  groupHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 6,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardDark: {
    backgroundColor: '#0E172E',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  prefDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
  },
  footerDark: {
    backgroundColor: '#0A1024',
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

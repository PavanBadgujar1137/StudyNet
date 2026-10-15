import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';

export default function LiveRoomTabScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Instant Live Broadcast Card */}
      <View style={styles.broadcastCard}>
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>● READY TO BROADCAST</Text>
        </View>
        <Text style={styles.broadcastTitle}>Live WebRTC Session Room</Text>
        <Text style={styles.broadcastDesc}>
          Launch high-definition 1-on-1 consultations or interactive group workshops powered by OpenHand LiveKit cloud.
        </Text>

        <TouchableOpacity style={styles.instantButton}>
          <Text style={styles.instantButtonText}>Start Instant Session 🚀</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Class Schedule */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>UPCOMING SESSIONS &amp; BOOKINGS</Text>
      </View>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>🎥</Text>
        <Text style={styles.emptyTitle}>No Live Sessions Active</Text>
        <Text style={styles.emptySubtitle}>
          Sessions booked by learners through your public handle or calendar availability will appear here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.base,
    paddingBottom: 40,
  },
  broadcastCard: {
    backgroundColor: theme.colors.slateDark,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.base,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.spacing.borderRadiusPill,
    marginBottom: theme.spacing.sm,
  },
  liveBadgeText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: theme.typography.heavy,
    letterSpacing: 0.5,
  },
  broadcastTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.heavy,
    color: '#FFF',
  },
  broadcastDesc: {
    fontSize: theme.typography.sm,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 18,
  },
  instantButton: {
    backgroundColor: '#10B981',
    borderRadius: theme.spacing.borderRadiusSm,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: theme.spacing.base,
  },
  instantButtonText: {
    color: '#FFF',
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
  },
  sectionHeader: {
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.heavy,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  emptyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { theme } from '../../theme';

export default function OverviewTabScreen({ navigation }) {
  const { user } = useAuth();
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.PRACTITIONER.DASHBOARD);
      if (res.data?.success && res.data?.data) {
        setTelemetry(res.data.data);
      }
    } catch (e) {
      console.warn('Error fetching practitioner telemetry:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTelemetry();
  };

  const practitionerName = user?.firstName ? `Dr. ${user.firstName} ${user.lastName || ''}`.trim() : 'Practitioner';
  const stats = telemetry?.stats || {
    monthlyEarnings: 0,
    totalEarnings: 0,
    activeClientsCount: 0,
    clearingThisWeek: 0,
    circleSeatsFilled: 0,
    totalCircleCapacity: 0,
    avgWellbeing: 0,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Banner */}
      <View style={styles.topCard}>
        <View style={styles.badgeRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Open Plan (Free Access)</Text>
          </View>
        </View>

        <Text style={styles.greeting}>Hello, {practitionerName} 👋</Text>
        <Text style={styles.subGreeting}>
          {telemetry?.upcomingClasses?.length || 0} session(s) scheduled for today.
        </Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Live')}
        >
          <Text style={styles.actionButtonText}>Start next Live session 🎥</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>PRACTICE OVERVIEW</Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Monthly Net</Text>
          <Text style={styles.metricValue}>₹{stats.monthlyEarnings || 0}</Text>
          <Text style={styles.metricSub}>Current Month</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Volume</Text>
          <Text style={styles.metricValue}>₹{stats.totalEarnings || 0}</Text>
          <Text style={styles.metricSub}>Lifetime</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Active Learners</Text>
          <Text style={styles.metricValue}>{stats.activeClientsCount || 0}</Text>
          <Text style={styles.metricSub}>Connected Roster</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Avg Wellbeing</Text>
          <Text style={styles.metricValue}>
            {stats.avgWellbeing ? `${stats.avgWellbeing}%` : 'N/A'}
          </Text>
          <Text style={styles.metricSub}>Learner Check-ins</Text>
        </View>
      </View>

      {/* Circle Capacity Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Circle Cohort Capacity</Text>
        <Text style={styles.cardDesc}>
          {stats.circleSeatsFilled || 0} seats filled of {stats.totalCircleCapacity || 0} capacity across all active cohorts.
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
  topCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.base,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.spacing.borderRadiusPill,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusBadgeText: {
    fontSize: theme.typography.xs,
    color: '#1D4ED8',
    fontWeight: theme.typography.bold,
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
  },
  actionButton: {
    backgroundColor: '#10B981',
    borderRadius: theme.spacing.borderRadiusSm,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  actionButtonText: {
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.base,
  },
  metricCard: {
    width: '47.5%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.medium,
  },
  metricValue: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.heavy,
    color: theme.colors.text,
    marginVertical: 4,
  },
  metricSub: {
    fontSize: 10,
    color: theme.colors.textLight,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  cardDesc: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});

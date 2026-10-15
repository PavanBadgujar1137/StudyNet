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
import { Feather } from '@expo/vector-icons';
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

  const practitionerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Practitioner';

  const stats = telemetry?.stats || {
    monthlyEarnings: 0,
    totalEarnings: 0,
    activeClientsCount: 0,
    clearingThisWeek: 0,
    circleSeatsFilled: 0,
    totalCircleCapacity: 0,
    avgWellbeing: 0,
  };

  const upcomingClasses = telemetry?.upcomingClasses || [];
  const monthlyHistory = telemetry?.monthlyHistory || [
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    { month: 'Mar', amount: 0 },
    { month: 'Apr', amount: 0 },
    { month: 'May', amount: 0 },
    { month: 'Jun', amount: 0 },
    { month: 'Jul', amount: 0 },
    { month: 'Aug', amount: 0 },
    { month: 'Sep', amount: 0 },
    { month: 'Oct', amount: 0 },
    { month: 'Nov', amount: 0 },
    { month: 'Dec', amount: 0 },
  ];

  const maxEarnings = Math.max(...monthlyHistory.map((m) => m.amount), 1);
  const hasEarnings = monthlyHistory.some((m) => m.amount > 0);
  const pendingNotes = telemetry?.pendingNotes || [];
  const clients = telemetry?.clients || [];

  if (loading && !telemetry) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading practice dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7C3AED']} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Top Header Greeting Banner ── */}
      <View style={styles.topCard}>
        <View style={styles.badgeRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>Open Plan (Free Access)</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedBadgeText}>Verified Guide</Text>
          </View>
        </View>

        <Text style={styles.greeting}>Hello, {practitionerName} 👋</Text>
        <Text style={styles.subGreeting}>
          {upcomingClasses.length} session(s) scheduled for today.
        </Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Live')}
          activeOpacity={0.85}
        >
          <Feather name="video" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.actionButtonText}>Start next Live session</Text>
        </TouchableOpacity>
      </View>

      {/* ── Practitioner Honors & Badges Showcase Banner (Matches Web) ── */}
      <View style={styles.badgesBanner}>
        <View style={styles.badgesBannerHeader}>
          <View style={styles.badgesIconWrap}>
            <Feather name="award" size={14} color="#FCD34D" />
          </View>
          <Text style={styles.badgesPretitle}>ACTIVE PLATFORM REWARDS</Text>
        </View>
        <Text style={styles.badgesTitle}>Practitioner Honors &amp; Badges</Text>
        <Text style={styles.badgesDesc}>
          Achievement badges appear on your public profile, reinforcing clinical mastery and trust.
        </Text>

        <View style={styles.badgePillsContainer}>
          <View style={styles.rewardPill}>
            <Text style={styles.rewardPillEmoji}>🎖️</Text>
            <Text style={styles.rewardPillText}>Verified Practitioner</Text>
          </View>
          <View style={styles.rewardPill}>
            <Text style={styles.rewardPillEmoji}>⭐</Text>
            <Text style={styles.rewardPillText}>Top Rated 5.0</Text>
          </View>
          <View style={styles.rewardPill}>
            <Text style={styles.rewardPillEmoji}>⚡</Text>
            <Text style={styles.rewardPillText}>Fast Responder</Text>
          </View>
          <View style={styles.rewardPill}>
            <Text style={styles.rewardPillEmoji}>🌿</Text>
            <Text style={styles.rewardPillText}>Somatic Master</Text>
          </View>
        </View>
      </View>

      {/* ── Practice Overview Section Title ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>PRACTICE PERFORMANCE &amp; KPIS</Text>
      </View>

      {/* ── 4 Key Stat Cards (Matches Web Overview g4) ── */}
      <View style={styles.statsGrid}>
        {/* Card 1: Earned This Month */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Earned This Month</Text>
          <Text style={styles.statValue} numberOfLines={1}>
            ₹{stats.monthlyEarnings?.toLocaleString('en-IN') || 0}
          </Text>
          <View style={styles.statFooterRow}>
            <Feather name="trending-up" size={12} color="#15803D" style={{ marginRight: 4 }} />
            <Text style={[styles.statDelta, { color: '#15803D' }]}>Admin payout ledger</Text>
          </View>
        </View>

        {/* Card 2: Pending Admin Payout */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pending Payout</Text>
          <Text style={styles.statValue} numberOfLines={1}>
            ₹{stats.clearingThisWeek?.toLocaleString('en-IN') || 0}
          </Text>
          <View style={styles.statFooterRow}>
            <Feather name="clock" size={12} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.statDelta}>Scheduled payout</Text>
          </View>
        </View>

        {/* Card 3: Active Learners */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Learners</Text>
          <Text style={styles.statValue}>{stats.activeClientsCount || 0}</Text>
          <View style={styles.statFooterRow}>
            <Feather name="users" size={12} color="#15803D" style={{ marginRight: 4 }} />
            <Text style={[styles.statDelta, { color: '#15803D' }]}>Enrolled roster</Text>
          </View>
        </View>

        {/* Card 4: Circle Seats Filled */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Circle Seats Filled</Text>
          <Text style={styles.statValue}>
            {stats.circleSeatsFilled || 0} / {stats.totalCircleCapacity || 0}
          </Text>
          <View style={styles.statFooterRow}>
            <Feather name="disc" size={12} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.statDelta}>Active Circles</Text>
          </View>
        </View>
      </View>

      {/* ── Earnings & Payout Overview (Monthly History Bar Chart) ── */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Earnings &amp; Payout Overview</Text>
          <TouchableOpacity onPress={() => navigation.navigate('More')}>
            <Text style={styles.cardHeaderLink}>Full report →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.barsRow}>
            {monthlyHistory.map((item, idx) => {
              const heightPct = hasEarnings ? Math.max((item.amount / maxEarnings) * 100, 10) : 10;
              const isCurrentMonth = idx === new Date().getMonth();
              return (
                <View key={idx} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPct}%`,
                          backgroundColor:
                            hasEarnings && item.amount > 0
                              ? '#7C3AED'
                              : isCurrentMonth
                              ? '#DDD6FE'
                              : '#E2E8F0',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barMonthText, isCurrentMonth && styles.barMonthCurrent]}>
                    {item.month}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.cardFooterNote}>
          Total lifetime volume recorded: ₹{stats.totalEarnings?.toLocaleString('en-IN') || 0}
        </Text>
      </View>

      {/* ── Scheduled Live Sessions List ── */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>
            Scheduled Live Sessions ({upcomingClasses.length})
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Live')}>
            <Text style={styles.cardHeaderLink}>Manage →</Text>
          </TouchableOpacity>
        </View>

        {upcomingClasses.length > 0 ? (
          upcomingClasses.slice(0, 3).map((cls) => (
            <View key={cls._id || Math.random()} style={styles.sessionRow}>
              <View style={styles.sessionIconWrap}>
                <Feather name="video" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle} numberOfLines={1}>
                  {cls.title || '1-on-1 Consultation'}
                </Text>
                <Text style={styles.sessionTime}>
                  Live Session · {cls.scheduledStart ? new Date(cls.scheduledStart).toLocaleDateString() : 'Today'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.openSessionBtn}
                onPress={() => navigation.navigate('Live')}
              >
                <Text style={styles.openSessionText}>Open</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptySessionBox}>
            <Feather name="calendar" size={24} color="#94A3B8" style={{ marginBottom: 6 }} />
            <Text style={styles.emptySessionText}>No live classes scheduled for today.</Text>
            <TouchableOpacity
              style={styles.scheduleMiniBtn}
              onPress={() => navigation.navigate('Live')}
            >
              <Text style={styles.scheduleMiniBtnText}>+ Schedule Live Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Needs Attention & Care Review ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Needs Your Attention</Text>

        <TouchableOpacity
          style={styles.attentionRow}
          onPress={() => navigation.navigate('Aura')}
          activeOpacity={0.7}
        >
          <View style={styles.attentionIconWrap}>
            <Feather name="edit-3" size={14} color="#6D28D9" />
          </View>
          <View style={styles.attentionInfo}>
            <Text style={styles.attentionTitle}>
              Session notes &amp; drafts ({pendingNotes.length})
            </Text>
            <Text style={styles.attentionSub}>Review clinical notes &amp; SOAP drafts in AURA</Text>
          </View>
          <Feather name="chevron-right" size={16} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.attentionRow, { borderBottomWidth: 0 }]}
          onPress={() => navigation.navigate('Learners')}
          activeOpacity={0.7}
        >
          <View style={[styles.attentionIconWrap, { backgroundColor: '#ECFDF5' }]}>
            <Feather name="users" size={14} color="#059669" />
          </View>
          <View style={styles.attentionInfo}>
            <Text style={styles.attentionTitle}>Active Learner Roster</Text>
            <Text style={styles.attentionSub}>
              {clients.length} learner(s) currently connected in care platform
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F8FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0E1235',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '700',
  },
  verifiedBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  verifiedBadgeText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '700',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subGreeting: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  badgesBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  badgesBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgesIconWrap: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 999,
    padding: 4,
    marginRight: 6,
  },
  badgesPretitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FCD34D',
    letterSpacing: 0.5,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  badgesDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 12,
  },
  badgePillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rewardPillEmoji: {
    fontSize: 11,
    marginRight: 4,
  },
  rewardPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionHeader: {
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0E1235',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  statFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDelta: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0E1235',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardHeaderLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  chartContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 14,
    height: '80%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barMonthText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 4,
  },
  barMonthCurrent: {
    color: '#7C3AED',
    fontWeight: '800',
  },
  cardFooterNote: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 10,
    fontWeight: '500',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sessionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  sessionTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  openSessionBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  openSessionText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  emptySessionBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptySessionText: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 8,
  },
  scheduleMiniBtn: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scheduleMiniBtnText: {
    color: '#6D28D9',
    fontSize: 11.5,
    fontWeight: '700',
  },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  attentionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  attentionInfo: {
    flex: 1,
  },
  attentionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  attentionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});


import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { theme } from '../../theme';

export default function LearnersTabScreen() {
  const [learnerIdInput, setLearnerIdInput] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLookup = async () => {
    if (!learnerIdInput.trim()) return;
    setLoading(true);
    setMessage('');
    setLookupResult(null);

    try {
      const res = await apiClient.post(ENDPOINTS.COUPONS.LOOKUP_LEARNER, {
        learnerId: learnerIdInput.trim().toUpperCase(),
      });

      if (res.data?.success && res.data?.learner) {
        setLookupResult(res.data.learner);
      } else {
        setMessage('No learner found with that ID.');
      }
    } catch (e) {
      setMessage(e.response?.data?.message || 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Lookup Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Learner ID Lookup</Text>
        <Text style={styles.cardSubtitle}>
          Enter an official Learner ID (e.g. LRN-102938) to verify identity or grant scholarships.
        </Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={learnerIdInput}
            onChangeText={setLearnerIdInput}
            placeholder="LRN-XXXXXX"
            placeholderTextColor={theme.colors.textLight}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleLookup} disabled={loading}>
            <Text style={styles.searchButtonText}>{loading ? '...' : 'Search'}</Text>
          </TouchableOpacity>
        </View>

        {message ? <Text style={styles.messageText}>{message}</Text> : null}

        {lookupResult ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultName}>{lookupResult.name}</Text>
            <Text style={styles.resultEmail}>{lookupResult.email}</Text>
            <Text style={styles.resultId}>ID: {lookupResult.learnerId}</Text>
          </View>
        ) : null}
      </View>

      {/* Roster Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>CLIENT ROSTER &amp; CARE</Text>
      </View>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={styles.emptyTitle}>Learner Management Hub</Text>
        <Text style={styles.emptySubtitle}>
          Learners connected via session bookings and circle cohorts appear here for care tracking and reflection prompt assignment.
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
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.base,
  },
  cardTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  cardSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  searchRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.spacing.borderRadiusSm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    fontSize: theme.typography.sm,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  searchButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.spacing.borderRadiusSm,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
  },
  messageText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.xs,
    color: theme.colors.warningText,
  },
  resultBox: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.accentLight,
    borderRadius: theme.spacing.borderRadiusSm,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
  },
  resultName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.accentDark,
  },
  resultEmail: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  resultId: {
    fontSize: 11,
    fontWeight: theme.typography.heavy,
    color: theme.colors.accent,
    marginTop: 4,
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

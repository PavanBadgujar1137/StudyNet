import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export default function PractitionerDetailScreen({ route, navigation }) {
  const { practitioner = {} } = route.params || {};

  const [connected, setConnected] = useState(false);

  const fullName = `${practitioner.firstName || 'OpenHand'} ${practitioner.lastName || 'Guide'}`.trim();
  const initials = `${practitioner.firstName?.[0] || 'G'}${practitioner.lastName?.[0] || 'U'}`.toUpperCase();

  const handleMessageGuide = () => {
    navigation.navigate('Community', {
      initialChannel: 'direct',
      targetPractitioner: practitioner,
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          Guide Profile
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={theme.colors.emerald} />
              <Text style={styles.verifiedText}>Verified Guide</Text>
            </View>
            {practitioner.credentials ? (
              <View style={styles.credBadge}>
                <Text style={styles.credText}>{practitioner.credentials}</Text>
              </View>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.messageBtn} onPress={handleMessageGuide}>
              <Ionicons name="chatbubble-ellipses" size={18} color="#FFF" />
              <Text style={styles.messageBtnText}>Direct Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About the Practitioner</Text>
          <Text style={styles.bioText}>
            {practitioner.bio ||
              `${fullName} is a dedicated OpenHand wisdom practitioner guiding learners through somatic regulation, mindfulness practices, and nervous system harmony.`}
          </Text>
        </View>

        {/* Holistic Specializations */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Areas of Focus</Text>
          <View style={styles.tagsWrap}>
            {['Somatic Grounding', 'Mindful Regulation', 'Breathwork', 'Stress Release', 'Peer Circles'].map(
              (tag, i) => (
                <View key={i} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              )
            )}
          </View>
        </View>
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
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: theme.typography.bold,
  },
  name: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.heavy,
    color: theme.colors.text,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedText: {
    color: theme.colors.successText,
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.semiBold,
  },
  credBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  credText: {
    color: theme.colors.blue,
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.semiBold,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.blue,
    paddingVertical: 12,
    borderRadius: theme.spacing.borderRadiusSm,
    gap: 6,
  },
  messageBtnText: {
    color: '#FFF',
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.bold,
  },
  sectionCard: {
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
    marginBottom: 10,
  },
  bioText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
});

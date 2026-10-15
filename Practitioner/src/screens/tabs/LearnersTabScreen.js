import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { theme } from '../../theme';

export default function LearnersTabScreen({ navigation }) {
  // Learner ID Lookup State
  const [learnerIdInput, setLearnerIdInput] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');

  // Client Roster State
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Reflection Prompt Modal State
  const [selectedClientForPrompt, setSelectedClientForPrompt] = useState(null);
  const [promptText, setPromptText] = useState('');
  const [sendingPrompt, setSendingPrompt] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      // First fetch connected clients
      const res = await apiClient.get(ENDPOINTS.PRACTITIONER.CONNECTED_CLIENTS);
      if (res.data?.success && res.data?.connectedClients) {
        setClients(res.data.connectedClients);
      } else {
        // Fallback to practitioner dashboard telemetry
        const dashRes = await apiClient.get(ENDPOINTS.PRACTITIONER.DASHBOARD);
        if (dashRes.data?.success && dashRes.data?.data?.clients) {
          setClients(dashRes.data.data.clients);
        }
      }
    } catch (e) {
      // If error, try dashboard
      try {
        const dashRes = await apiClient.get(ENDPOINTS.PRACTITIONER.DASHBOARD);
        if (dashRes.data?.success && dashRes.data?.data?.clients) {
          setClients(dashRes.data.data.clients);
        }
      } catch (err) {
        console.warn('Error fetching clients:', err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClients();
  };

  const handleLookup = async () => {
    const trimmed = learnerIdInput.trim().toUpperCase();
    if (!trimmed) {
      setLookupMessage('Please enter a Learner ID (e.g. LRN-102938).');
      return;
    }

    setLookupLoading(true);
    setLookupMessage('');
    setLookupResult(null);

    try {
      const res = await apiClient.post(ENDPOINTS.COUPONS.LOOKUP_LEARNER, {
        learnerId: trimmed,
      });

      if (res.data?.success && res.data?.learner) {
        setLookupResult(res.data.learner);
      } else {
        setLookupMessage('No registered learner found with that ID.');
      }
    } catch (e) {
      setLookupMessage(e.response?.data?.message || 'Lookup failed.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSendPrompt = async () => {
    if (!promptText.trim()) {
      Alert.alert('Prompt Required', 'Please enter a reflection prompt for the learner.');
      return;
    }

    setSendingPrompt(true);
    try {
      const res = await apiClient.post(ENDPOINTS.REFLECTIONS.CREATE, {
        client: selectedClientForPrompt._id || selectedClientForPrompt.id,
        prompt: promptText.trim(),
      });

      if (res.data?.success) {
        Alert.alert('Success', `Reflection prompt assigned to ${selectedClientForPrompt.firstName || 'Learner'}!`);
        setSelectedClientForPrompt(null);
        setPromptText('');
      } else {
        Alert.alert('Error', res.data?.message || 'Failed to assign reflection prompt.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to assign reflection prompt.');
    } finally {
      setSendingPrompt(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const lrn = (c.learnerId || '').toLowerCase();
    return name.includes(term) || email.includes(term) || lrn.includes(term);
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7C3AED']} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Learner ID Lookup Card (Matches Web) ── */}
      <View style={styles.card}>
        <View style={styles.cardBadge}>
          <Feather name="search" size={12} color="#6D28D9" style={{ marginRight: 4 }} />
          <Text style={styles.cardBadgeText}>IDENTITY VERIFICATION &amp; CARE</Text>
        </View>

        <Text style={styles.cardTitle}>Learner ID Lookup</Text>
        <Text style={styles.cardSubtitle}>
          Enter an official Learner ID (e.g. LRN-102938) to verify identity, review care notes, or grant personal session scholarships.
        </Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={learnerIdInput}
            onChangeText={(t) => {
              setLearnerIdInput(t);
              if (lookupMessage) setLookupMessage('');
            }}
            placeholder="LRN-XXXXXX"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleLookup}
            disabled={lookupLoading}
            activeOpacity={0.8}
          >
            {lookupLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>

        {lookupMessage ? <Text style={styles.messageText}>{lookupMessage}</Text> : null}

        {lookupResult ? (
          <View style={styles.resultBox}>
            <View style={styles.resultAvatarWrap}>
              <Text style={styles.resultAvatarText}>
                {(lookupResult.name?.[0] || 'L').toUpperCase()}
              </Text>
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{lookupResult.name}</Text>
              <Text style={styles.resultEmail}>{lookupResult.email}</Text>
              <View style={styles.resultIdBadge}>
                <Text style={styles.resultIdText}>ID: {lookupResult.learnerId}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.resultPromptBtn}
              onPress={() => setSelectedClientForPrompt(lookupResult)}
            >
              <Feather name="feather" size={14} color="#6D28D9" />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* ── Client Roster Section ── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          CONNECTED LEARNERS ({filteredClients.length})
        </Text>
      </View>

      {/* Search Input for Roster */}
      <View style={styles.filterWrap}>
        <Feather name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.filterInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Filter learners by name, email, or ID..."
          placeholderTextColor="#94A3B8"
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Feather name="x" size={16} color="#64748B" />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator color="#7C3AED" size="small" />
          <Text style={styles.loaderText}>Loading learner roster...</Text>
        </View>
      ) : filteredClients.length > 0 ? (
        filteredClients.map((client) => {
          const name = `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.name || 'Learner';
          const initials = `${client.firstName?.[0] || 'L'}${client.lastName?.[0] || 'R'}`.toUpperCase();
          const lrnId = client.learnerId || `LRN-${client._id?.slice(-6).toUpperCase() || 'CLIENT'}`;

          return (
            <View key={client._id || client.id || Math.random()} style={styles.clientCard}>
              <View style={styles.clientTopRow}>
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientAvatarText}>{initials}</Text>
                </View>
                <View style={styles.clientMeta}>
                  <Text style={styles.clientName}>{name}</Text>
                  <Text style={styles.clientEmail}>{client.email || 'No email registered'}</Text>
                  <View style={styles.lrnBadgeRow}>
                    <View style={styles.lrnBadge}>
                      <Text style={styles.lrnBadgeText}>{lrnId}</Text>
                    </View>
                    <Text style={styles.enrolledTag}>● Active Care</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons for Client */}
              <View style={styles.clientActionRow}>
                <TouchableOpacity
                  style={styles.assignPromptBtn}
                  onPress={() => setSelectedClientForPrompt(client)}
                  activeOpacity={0.8}
                >
                  <Feather name="feather" size={13} color="#6D28D9" style={{ marginRight: 6 }} />
                  <Text style={styles.assignPromptText}>Assign Reflection</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.startLiveBtn}
                  onPress={() => navigation.navigate('Live')}
                  activeOpacity={0.8}
                >
                  <Feather name="video" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.startLiveText}>Live Session</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Feather name="users" size={32} color="#94A3B8" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>Learner Management Hub</Text>
          <Text style={styles.emptySubtitle}>
            Learners who book 1-on-1 consultations or join your circle cohorts will appear here automatically for care tracking and reflection assignments.
          </Text>
          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={() => navigation.navigate('More')}
          >
            <Text style={styles.emptyActionText}>Share Public Booking Link</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Assign Reflection Prompt Modal ── */}
      {selectedClientForPrompt ? (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedClientForPrompt(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Feather name="feather" size={18} color="#6D28D9" style={{ marginRight: 8 }} />
                  <Text style={styles.modalTitle}>Assign Reflection Prompt</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedClientForPrompt(null)}>
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSub}>
                Assigning to:{' '}
                <Text style={{ fontWeight: '700', color: '#0F172A' }}>
                  {selectedClientForPrompt.firstName || selectedClientForPrompt.name || 'Learner'}
                </Text>
              </Text>

              <TextInput
                style={styles.promptInput}
                multiline={true}
                numberOfLines={4}
                value={promptText}
                onChangeText={setPromptText}
                placeholder="e.g. In today's session we discussed somatic boundary awareness. Reflect on one moment this week when your body signaled a need to slow down..."
                placeholderTextColor="#94A3B8"
              />

              {/* Quick Template Chips */}
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={styles.templateChip}
                  onPress={() =>
                    setPromptText(
                      'Notice three moments this week when your breath became shallow. What triggered it, and how did you return to center?'
                    )
                  }
                >
                  <Text style={styles.templateChipText}>🌬️ Somatic Breath</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.templateChip}
                  onPress={() =>
                    setPromptText(
                      'Write down one boundary you held with compassion today, and how your nervous system responded.'
                    )
                  }
                >
                  <Text style={styles.templateChipText}>🛡️ Boundaries</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setSelectedClientForPrompt(null)}
                >
                  <Text style={styles.cancelModalText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sendModalBtn, sendingPrompt && { opacity: 0.7 }]}
                  onPress={handleSendPrompt}
                  disabled={sendingPrompt}
                >
                  {sendingPrompt ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.sendModalText}>Send to Learner →</Text>
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
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 1,
  },
  searchButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  messageText: {
    marginTop: 8,
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  resultBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultAvatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  resultAvatarText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  resultEmail: {
    fontSize: 11.5,
    color: '#64748B',
  },
  resultIdBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
  },
  resultIdText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
  },
  resultPromptBtn: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
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
  filterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  filterInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
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
  clientCard: {
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
  clientTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  clientAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6D28D9',
  },
  clientMeta: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  clientEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  lrnBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  lrnBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lrnBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  enrolledTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  clientActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  assignPromptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingVertical: 8,
    borderRadius: 8,
  },
  assignPromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D28D9',
  },
  startLiveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
  },
  startLiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
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
  emptyActionBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyActionText: {
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
    marginBottom: 10,
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
  modalSub: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 12,
  },
  promptInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13.5,
    color: '#0F172A',
    textAlignVertical: 'top',
    minHeight: 90,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    marginBottom: 16,
  },
  templateChip: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  templateChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6D28D9',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
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
  sendModalBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 10,
  },
  sendModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});


import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IntentCard } from '@/components/intent-card';
import { api, type Intent } from '@/lib/api';

export default function HistoryScreen() {
  const [intentId, setIntentId] = useState('');
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async () => {
    if (!intentId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const intent = await api.getIntent(intentId.trim());
      if (intent) setIntents((prev) => [intent, ...prev.filter((i) => i.id !== intent.id)]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Not found');
    } finally {
      setLoading(false);
    }
  }, [intentId]);

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.heading}>
        History
      </ThemedText>

      <ThemedView style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={intentId}
          onChangeText={setIntentId}
          placeholder="Lookup intent by ID…"
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={lookup}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator style={{ marginLeft: 8 }} />}
      </ThemedView>

      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      <ScrollView contentContainerStyle={styles.list}>
        {intents.length === 0 ? (
          <ThemedText style={styles.empty}>No intents yet. Submit one from Send.</ThemedText>
        ) : (
          intents.map((item) => <IntentCard key={item.id} intent={item} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  heading: { marginBottom: 16 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 15 },
  error: { color: '#ef4444', marginBottom: 12 },
  list: { paddingBottom: 24 },
  empty: { opacity: 0.5, textAlign: 'center', marginTop: 40 },
});

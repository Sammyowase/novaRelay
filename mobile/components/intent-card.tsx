import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Intent } from '@/lib/api';

const STATUS_COLOR: Record<Intent['status'], string> = {
  pending: '#f59e0b',
  routing: '#3b82f6',
  executing: '#8b5cf6',
  completed: '#10b981',
  failed: '#ef4444',
};

interface Props {
  intent: Intent;
}

export function IntentCard({ intent }: Props) {
  return (
    <ThemedView style={styles.card}>
      <View style={styles.row}>
        <ThemedText type="defaultSemiBold">
          {intent.amount} {intent.asset}
        </ThemedText>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR[intent.status] }]}>
          <ThemedText style={styles.badgeText}>{intent.status}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.sub}>
        {intent.fromChain} → {intent.toChain}
      </ThemedText>
      <ThemedText style={styles.sub} numberOfLines={1}>
        To: {intent.recipient}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  sub: {
    opacity: 0.6,
    fontSize: 13,
  },
});

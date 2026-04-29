import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api, type Chain, type CreateIntentDto } from '@/lib/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const CHAINS: Chain[] = ['stellar', 'solana'];

export default function SendScreen() {
  const scheme = useColorScheme() ?? 'light';
  const tint = Colors[scheme].tint;

  const [form, setForm] = useState<CreateIntentDto>({
    fromChain: 'stellar',
    toChain: 'solana',
    amount: '',
    asset: 'XLM',
    recipient: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof CreateIntentDto) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  async function submit() {
    if (!form.amount || !form.recipient) {
      Alert.alert('Missing fields', 'Please fill in amount and recipient.');
      return;
    }
    setLoading(true);
    try {
      const intent = await api.createIntent(form);
      Alert.alert('Intent submitted', `ID: ${intent.id}\nStatus: ${intent.status}`);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title" style={styles.heading}>
          Send Intent
        </ThemedText>

        <Label>From chain</Label>
        <View style={styles.row}>
          {CHAINS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, form.fromChain === c && { backgroundColor: tint }]}
              onPress={() => set('fromChain')(c)}>
              <ThemedText style={form.fromChain === c && styles.chipActive}>{c}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <Label>To chain</Label>
        <View style={styles.row}>
          {CHAINS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, form.toChain === c && { backgroundColor: tint }]}
              onPress={() => set('toChain')(c)}>
              <ThemedText style={form.toChain === c && styles.chipActive}>{c}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <Label>Asset</Label>
        <ThemedView style={styles.input}>
          <TextInput
            value={form.asset}
            onChangeText={set('asset')}
            placeholder="XLM"
            placeholderTextColor="#888"
            style={styles.inputText}
            autoCapitalize="characters"
          />
        </ThemedView>

        <Label>Amount</Label>
        <ThemedView style={styles.input}>
          <TextInput
            value={form.amount}
            onChangeText={set('amount')}
            placeholder="0.00"
            placeholderTextColor="#888"
            style={styles.inputText}
            keyboardType="decimal-pad"
          />
        </ThemedView>

        <Label>Recipient address</Label>
        <ThemedView style={styles.input}>
          <TextInput
            value={form.recipient}
            onChangeText={set('recipient')}
            placeholder="G... or wallet address"
            placeholderTextColor="#888"
            style={styles.inputText}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </ThemedView>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: tint }]}
          onPress={submit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Submit Intent</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ children }: { children: string }) {
  return <ThemedText style={styles.label}>{children}</ThemedText>;
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8 },
  heading: { marginBottom: 16 },
  label: { fontSize: 13, opacity: 0.6, marginTop: 12, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  chipActive: { color: '#fff', fontWeight: '600' },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  inputText: { fontSize: 16 },
  button: {
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function SettingsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const tint = Colors[scheme].tint;

  const [apiUrl, setApiUrl] = useState('http://localhost:3000');
  const [stellarRpc, setStellarRpc] = useState('https://soroban-testnet.stellar.org');
  const [solanaRpc, setSolanaRpc] = useState('https://api.devnet.solana.com');

  function save() {
    // TODO: persist to AsyncStorage / SecureStore
    Alert.alert('Saved', 'Settings saved (in-memory only for now).');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.heading}>
        Settings
      </ThemedText>

      <Section title="Backend">
        <Field label="API URL" value={apiUrl} onChangeText={setApiUrl} />
      </Section>

      <Section title="Stellar">
        <Field label="RPC URL" value={stellarRpc} onChangeText={setStellarRpc} />
      </Section>

      <Section title="Solana">
        <Field label="RPC URL" value={solanaRpc} onChangeText={setSolanaRpc} />
      </Section>

      <TouchableOpacity style={[styles.button, { backgroundColor: tint }]} onPress={save}>
        <ThemedText style={styles.buttonText}>Save Settings</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedView style={styles.input}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.inputText}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8 },
  heading: { marginBottom: 16 },
  section: { borderRadius: 12, padding: 16, marginBottom: 16, gap: 4 },
  sectionTitle: { marginBottom: 8 },
  label: { fontSize: 12, opacity: 0.6, marginTop: 8, marginBottom: 2 },
  input: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  inputText: { fontSize: 14 },
  button: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

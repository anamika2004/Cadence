import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useCadence } from '../state/CadenceContext';
import { color, font } from '../theme/tokens';

export function SettingsScreen({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile, exportData, deleteAllData } = useCadence();
  const [cycleLength, setCycleLength] = useState(profile.typicalCycleLength);
  const [periodLength, setPeriodLength] = useState(profile.typicalPeriodLength);
  const [busy, setBusy] = useState(false);

  async function onSaveEstimates() {
    await updateProfile({ typicalCycleLength: cycleLength, typicalPeriodLength: periodLength });
    Alert.alert('Saved', 'Your cycle estimates were updated.');
  }

  async function onExport() {
    setBusy(true);
    try {
      const json = await exportData();
      const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!dir) throw new Error('No writable directory available on this platform.');
      const path = dir + `cadence-export-${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(path, json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'application/json' });
      } else {
        Alert.alert('Export ready', `Saved to ${path}`);
      }
    } finally {
      setBusy(false);
    }
  }

  function onDelete() {
    Alert.alert(
      'Delete all data',
      'This permanently deletes every logged period, symptom and energy entry on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete everything', style: 'destructive', onPress: () => deleteAllData() },
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Settings</Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <Text style={styles.close}>Done</Text>
        </Pressable>
      </View>

      <View style={{ gap: 12 }}>
        <Text style={styles.h6}>Cycle estimates</Text>
        <Text style={styles.helper}>Used until Cadence has enough logged cycles to compute these for you.</Text>
        <Stepper label="Typical cycle length" value={cycleLength} min={15} max={60} onChange={setCycleLength} suffix=" days" />
        <Stepper label="Typical period length" value={periodLength} min={1} max={14} onChange={setPeriodLength} suffix=" days" />
        <Pressable style={styles.saveBtn} onPress={onSaveEstimates}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={styles.h6}>Your data</Text>
        <Text style={styles.helper}>
          Cadence stores everything only on this device. Nothing is uploaded, and there are no analytics or ad SDKs
          in this app.
        </Text>
        <Pressable style={styles.rowBtn} onPress={onExport} disabled={busy}>
          <Text style={styles.rowBtnText}>{busy ? 'Preparing export…' : 'Export my data (JSON)'}</Text>
        </Pressable>
        <Pressable style={[styles.rowBtn, styles.dangerBtn]} onPress={onDelete}>
          <Text style={[styles.rowBtnText, styles.dangerText]}>Delete all data</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>
        Cadence is not a diagnostic or clinical tool. Suggestions on Today, Move and Fuel are drawn from your own
        logs, not medical advice.
      </Text>
    </ScrollView>
  );
}

function Stepper({ label, value, min, max, onChange, suffix }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void; suffix?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepperRow}>
        <Pressable style={styles.stepperBtn} onPress={() => onChange(Math.max(min, value - 1))} hitSlop={8}>
          <Text style={styles.stepperBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepperValue}>{value}{suffix}</Text>
        <Pressable style={styles.stepperBtn} onPress={() => onChange(Math.min(max, value + 1))} hitSlop={8}>
          <Text style={styles.stepperBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 64, paddingBottom: 40, gap: 26, backgroundColor: color.bg, flexGrow: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily: font.heading, fontSize: 24, color: color.text },
  close: { fontSize: 14, color: color.accent },
  h6: { fontFamily: font.bodySemiBold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: color.neutral700 },
  helper: { fontSize: 12, lineHeight: 17, color: color.neutral600 },
  label: { fontSize: 12, color: color.neutral700 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center' },
  stepperBtnText: { fontSize: 18, color: color.text },
  stepperValue: { fontSize: 14, color: color.text, minWidth: 64 },
  saveBtn: { alignSelf: 'flex-start', backgroundColor: color.accent, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 18 },
  saveBtnText: { fontFamily: font.heading, fontSize: 13, color: color.bg },
  rowBtn: { backgroundColor: color.surface, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 16 },
  rowBtnText: { fontSize: 14, color: color.text },
  dangerBtn: { backgroundColor: color.accent100 },
  dangerText: { color: color.accent700 },
  footer: { fontSize: 11, lineHeight: 16, color: color.neutral600, marginTop: 8 },
});

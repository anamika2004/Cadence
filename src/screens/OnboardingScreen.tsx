import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCadence } from '../state/CadenceContext';
import { color, font } from '../theme/tokens';
import { addDays, formatMonthDay, todayISO } from '../lib/date';

export function OnboardingScreen() {
  const { completeOnboarding } = useCadence();
  const [lastPeriod, setLastPeriod] = useState(todayISO());
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [previousDates, setPreviousDates] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState<'last' | number | null>(null);

  function addPrevious() {
    const base = previousDates.length > 0 ? previousDates[previousDates.length - 1] : lastPeriod;
    setPreviousDates([...previousDates, addDays(base, -cycleLength)]);
  }

  function removePrevious(i: number) {
    setPreviousDates(previousDates.filter((_, idx) => idx !== i));
  }

  function onSave() {
    const periodStarts = Array.from(new Set([lastPeriod, ...previousDates])).sort();
    completeOnboarding({ periodStarts, typicalCycleLength: cycleLength, typicalPeriodLength: periodLength });
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Let's set up Cadence</Text>
      <Text style={styles.subtitle}>
        A few starting numbers so Cadence can estimate your phase and next period. Everything is stored only on this
        device — nothing is sent anywhere.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Last period started</Text>
        <Pressable style={styles.dateButton} onPress={() => setShowPicker('last')}>
          <Text style={styles.dateButtonText}>{formatMonthDay(lastPeriod)}</Text>
        </Pressable>
        {showPicker === 'last' && (
          <DateTimePicker
            value={new Date(lastPeriod)}
            mode="date"
            maximumDate={new Date()}
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, d) => {
              setShowPicker(null);
              if (d) setLastPeriod(toISO(d));
            }}
          />
        )}
      </View>

      <View style={styles.row}>
        <Stepper label="Typical cycle length" value={cycleLength} min={15} max={60} onChange={setCycleLength} suffix=" days" />
      </View>
      <View style={styles.row}>
        <Stepper label="Typical period length" value={periodLength} min={1} max={14} onChange={setPeriodLength} suffix=" days" />
      </View>

      <View style={{ gap: 10 }}>
        <Text style={styles.label}>Previous periods (optional — improves early predictions)</Text>
        {previousDates.map((d, i) => (
          <View key={i} style={styles.prevRow}>
            <Pressable style={[styles.dateButton, { flex: 1 }]} onPress={() => setShowPicker(i)}>
              <Text style={styles.dateButtonText}>{formatMonthDay(d)}</Text>
            </Pressable>
            <Pressable hitSlop={8} onPress={() => removePrevious(i)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>Remove</Text>
            </Pressable>
            {showPicker === i && (
              <DateTimePicker
                value={new Date(d)}
                mode="date"
                maximumDate={new Date()}
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(_, nd) => {
                  setShowPicker(null);
                  if (nd) {
                    const copy = [...previousDates];
                    copy[i] = toISO(nd);
                    setPreviousDates(copy);
                  }
                }}
              />
            )}
          </View>
        ))}
        <Pressable style={styles.addBtn} onPress={addPrevious}>
          <Text style={styles.addBtnText}>+ Add a previous period</Text>
        </Pressable>
      </View>

      <Pressable style={styles.cta} onPress={onSave}>
        <Text style={styles.ctaText}>Get started</Text>
      </Pressable>
    </ScrollView>
  );
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function Stepper({ label, value, min, max, onChange, suffix }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void; suffix?: string }) {
  return (
    <View style={{ flex: 1, gap: 6 }}>
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
  scroll: { padding: 20, paddingTop: 64, paddingBottom: 40, gap: 22, backgroundColor: color.bg, flexGrow: 1 },
  title: { fontFamily: font.heading, fontSize: 28, color: color.text },
  subtitle: { fontSize: 13, lineHeight: 19, color: color.neutral700 },
  field: { gap: 8 },
  label: { fontSize: 12, color: color.neutral700 },
  dateButton: { backgroundColor: color.surface, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start' },
  dateButtonText: { fontSize: 14, color: color.text },
  row: { flexDirection: 'row' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center' },
  stepperBtnText: { fontSize: 18, color: color.text },
  stepperValue: { fontSize: 14, color: color.text, minWidth: 64 },
  prevRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  removeBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  removeBtnText: { fontSize: 12, color: color.accent700 },
  addBtn: { alignSelf: 'flex-start', paddingVertical: 6 },
  addBtnText: { fontSize: 13, color: color.accent, fontFamily: font.bodySemiBold },
  cta: { backgroundColor: color.accent, borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  ctaText: { fontFamily: font.heading, fontSize: 15, color: color.bg },
});

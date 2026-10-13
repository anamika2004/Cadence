import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCadence } from '../state/CadenceContext';
import { syncConfigured } from '../lib/supabase';
import { DailyLog } from '../lib/cycle';
import { color, font } from '../theme/tokens';
import { addDays, formatMonthDay, todayISO } from '../lib/date';

const MAX_PREVIOUS_PERIODS = 3;

type PreviousPeriod = { date: string; lengthDays: number };

export function OnboardingScreen() {
  const { completeOnboarding } = useCadence();
  const [lastPeriod, setLastPeriod] = useState(todayISO());
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [previousPeriods, setPreviousPeriods] = useState<PreviousPeriod[]>([]);
  const [showPicker, setShowPicker] = useState<'last' | number | null>(null);
  const [shareData, setShareData] = useState(false);

  function addPrevious() {
    if (previousPeriods.length >= MAX_PREVIOUS_PERIODS) return;
    const base = previousPeriods.length > 0 ? previousPeriods[previousPeriods.length - 1].date : lastPeriod;
    setPreviousPeriods([...previousPeriods, { date: addDays(base, -cycleLength), lengthDays: periodLength }]);
  }

  function removePrevious(i: number) {
    setPreviousPeriods(previousPeriods.filter((_, idx) => idx !== i));
  }

  function updatePrevious(i: number, patch: Partial<PreviousPeriod>) {
    const copy = [...previousPeriods];
    copy[i] = { ...copy[i], ...patch };
    setPreviousPeriods(copy);
  }

  function onSave() {
    const periodStarts = Array.from(new Set([lastPeriod, ...previousPeriods.map((p) => p.date)])).sort();

    // Seed flow logs for previous periods so period-length averages (and
    // anything else that reads real logs) have real data from day one,
    // instead of staying empty until future cycles are logged.
    const seedLogs: Record<string, DailyLog> = {};
    for (const p of previousPeriods) {
      for (let i = 0; i < p.lengthDays; i++) {
        const d = addDays(p.date, i);
        seedLogs[d] = { date: d, symptoms: [], flow: 'Medium' };
      }
    }

    completeOnboarding(
      {
        periodStarts,
        typicalCycleLength: cycleLength,
        typicalPeriodLength: periodLength,
        shareDataConsent: syncConfigured && shareData,
      },
      seedLogs
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Let's set up Cadence</Text>
      <Text style={styles.subtitle}>
        A few starting numbers so Cadence can estimate your phase and next period. Everything is stored only on this
        device by default — the option below is the only way any of it leaves your phone.
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

      <View style={{ gap: 12 }}>
        <View>
          <Text style={styles.label}>Previous periods (optional — improves early predictions)</Text>
          <Text style={styles.helperNote}>
            Irregular or unsure? Just add what you remember — up to {MAX_PREVIOUS_PERIODS}, and you can always correct
            any of this later from the Cycle tab.
          </Text>
        </View>
        {previousPeriods.map((p, i) => (
          <View key={i} style={styles.prevCard}>
            <View style={styles.prevRow}>
              <Pressable style={[styles.dateButton, { flex: 1 }]} onPress={() => setShowPicker(i)}>
                <Text style={styles.dateButtonText}>{formatMonthDay(p.date)}</Text>
              </Pressable>
              <Pressable hitSlop={8} onPress={() => removePrevious(i)} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>Remove</Text>
              </Pressable>
            </View>
            {showPicker === i && (
              <DateTimePicker
                value={new Date(p.date)}
                mode="date"
                maximumDate={new Date()}
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(_, nd) => {
                  setShowPicker(null);
                  if (nd) updatePrevious(i, { date: toISO(nd) });
                }}
              />
            )}
            <Stepper
              label="Lasted about"
              value={p.lengthDays}
              min={1}
              max={14}
              onChange={(n) => updatePrevious(i, { lengthDays: n })}
              suffix=" days"
              compact
            />
          </View>
        ))}
        {previousPeriods.length < MAX_PREVIOUS_PERIODS ? (
          <Pressable style={styles.addBtn} onPress={addPrevious}>
            <Text style={styles.addBtnText}>+ Add a previous period</Text>
          </Pressable>
        ) : (
          <Text style={styles.helperNote}>That's enough to start with — add more anytime from the Cycle tab.</Text>
        )}
      </View>

      {syncConfigured && (
        <View style={styles.consentCard}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.consentTitle}>Help improve Cadence</Text>
            <Text style={styles.consentBody}>
              Optionally sync your logged cycle, symptom and energy data to a private research database so we can
              see whether Cadence is actually helping. Off by default; you can turn it on or off anytime in
              Settings, and delete everything synced whenever you want.
            </Text>
          </View>
          <Switch
            value={shareData}
            onValueChange={setShareData}
            trackColor={{ false: color.neutral300, true: color.accent2_500 }}
            thumbColor={color.neutral100}
          />
        </View>
      )}

      <Pressable style={styles.cta} onPress={onSave}>
        <Text style={styles.ctaText}>Get started</Text>
      </Pressable>
    </ScrollView>
  );
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
  compact,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  suffix?: string;
  compact?: boolean;
}) {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepperRow}>
        <Pressable style={[styles.stepperBtn, compact && styles.stepperBtnCompact]} onPress={() => onChange(Math.max(min, value - 1))} hitSlop={8}>
          <Text style={styles.stepperBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepperValue}>{value}{suffix}</Text>
        <Pressable style={[styles.stepperBtn, compact && styles.stepperBtnCompact]} onPress={() => onChange(Math.min(max, value + 1))} hitSlop={8}>
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
  helperNote: { fontSize: 11, lineHeight: 15, color: color.neutral600, marginTop: 3 },
  dateButton: { backgroundColor: color.surface, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start' },
  dateButtonText: { fontSize: 14, color: color.text },
  row: { flexDirection: 'row' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center' },
  stepperBtnCompact: { width: 30, height: 30, borderRadius: 15 },
  stepperBtnText: { fontSize: 18, color: color.text },
  stepperValue: { fontSize: 14, color: color.text, minWidth: 64 },
  prevCard: { backgroundColor: color.neutral100, borderRadius: 16, padding: 12, gap: 10 },
  prevRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  removeBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  removeBtnText: { fontSize: 12, color: color.accent700 },
  addBtn: { alignSelf: 'flex-start', paddingVertical: 6 },
  addBtnText: { fontSize: 13, color: color.accent, fontFamily: font.bodySemiBold },
  consentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: color.accent2_100,
    borderRadius: 20,
    padding: 14,
  },
  consentTitle: { fontFamily: font.heading, fontSize: 15, color: color.text },
  consentBody: { fontSize: 12, lineHeight: 17, color: color.accent2_800 },
  cta: { backgroundColor: color.accent, borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  ctaText: { fontFamily: font.heading, fontSize: 15, color: color.bg },
});

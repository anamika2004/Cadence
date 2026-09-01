import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useCadence } from '../state/CadenceContext';
import { useCycleData } from '../state/useCycleData';
import { phaseKeyForDay } from '../lib/cycle';
import { MOVE } from '../lib/content';
import { color, font } from '../theme/tokens';
import { addDays, weekdayIndex } from '../lib/date';

const SWAP_LABELS = ['Lighter option', 'Heavier option', 'Reset'];
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MoveScreen() {
  const { today, day, cycleLength, boundaries, phaseKey } = useCycleData();
  const { getLog, setSessionLogged } = useCadence();
  const [swap, setSwap] = useState(0);

  const swappedKey = swap === 1 ? 'menstrual' : swap === 2 ? 'ovulatory' : phaseKey;
  const move = MOVE[swappedKey];
  const log = getLog(today);

  const heights: Record<string, number> = { menstrual: 30, follicular: 64, ovulatory: 72, luteal: 44 };
  const week = Array.from({ length: 7 }, (_, i) => {
    const label = WEEKDAY_SHORT[weekdayIndex(addDays(today, i))];
    const cd = ((day - 1 + i) % cycleLength) + 1;
    const k = phaseKeyForDay(cd, boundaries);
    return { label, key: k, height: heights[k] ?? 40, isToday: i === 0 };
  });

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={{ gap: 4 }}>
        <Text style={styles.h6}>Movement · day {day}</Text>
        <Text style={styles.h3}>{move.title}</Text>
        <Text style={styles.meta}>{move.meta}</Text>
      </View>

      <View style={styles.whyCard}>
        <Text style={[styles.h6, { color: color.accent2_700 }]}>Why this today</Text>
        <Text style={styles.whyText}>{move.why}</Text>
        {move.evidence ? (
          <View style={styles.evidenceList}>
            {move.evidence.map((e) => (
              <View key={e.label} style={styles.evidenceRow}>
                <Text style={styles.evidenceLabel}>{e.label}</Text>
                <Text style={styles.evidenceValue}>{e.value}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={styles.h6}>Session outline</Text>
        <View style={{ gap: 6 }}>
          {move.blocks.map((b) => (
            <View key={b.time} style={styles.blockRow}>
              <Text style={styles.blockTime}>{b.time}</Text>
              <Text style={styles.blockText}>{b.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={styles.h6}>Planned load, next 7 days</Text>
        <View style={styles.weekRow}>
          {week.map((w, i) => (
            <View key={i} style={styles.weekCol}>
              <View style={{ flex: 1, justifyContent: 'flex-end', width: '100%' }}>
                <View style={{ height: w.height, borderRadius: 10, backgroundColor: colorForPhase(w.key), opacity: w.isToday ? 1 : 0.55 }} />
              </View>
              <Text style={styles.weekLabel}>{w.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => setSessionLogged(today, !log.sessionLogged)}
        >
          <Text style={styles.btnPrimaryText}>{log.sessionLogged ? 'Session logged ✓' : 'Log this session'}</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => setSwap((s) => (s + 1) % 3)}>
          <Text style={styles.btnSecondaryText}>{SWAP_LABELS[swap]}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function colorForPhase(k: string): string {
  const map: Record<string, string> = {
    menstrual: color.accent600,
    follicular: color.accent2_500,
    ovulatory: color.accent400,
    luteal: color.accent2_700,
  };
  return map[k] ?? color.accent2_700;
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12, gap: 16 },
  h6: { fontFamily: font.bodySemiBold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: color.neutral700 },
  h3: { fontFamily: font.heading, fontSize: 24, color: color.text },
  meta: { fontSize: 13, color: color.neutral700 },
  whyCard: { backgroundColor: color.accent2_100, borderRadius: 20, padding: 14, gap: 12 },
  whyText: { fontSize: 13, lineHeight: 20, color: color.text },
  evidenceList: { gap: 8, borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,0.1)', paddingTop: 10 },
  evidenceRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  evidenceLabel: { fontSize: 12, color: color.accent2_800 },
  evidenceValue: { fontSize: 12, color: color.text },
  blockRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: color.surface, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16 },
  blockTime: { fontFamily: font.heading, fontSize: 12, width: 46, color: color.accent700 },
  blockText: { fontSize: 13, flex: 1, color: color.text },
  weekRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 96 },
  weekCol: { flex: 1, height: '100%', alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  weekLabel: { fontSize: 10, color: color.neutral700 },
  actions: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  btn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 999, minHeight: 44 },
  btnPrimary: { backgroundColor: color.accent },
  btnPrimaryText: { fontFamily: font.heading, fontSize: 14, color: color.bg },
  btnSecondary: { borderWidth: 1, borderColor: color.divider },
  btnSecondaryText: { fontFamily: font.heading, fontSize: 14, color: color.text },
});

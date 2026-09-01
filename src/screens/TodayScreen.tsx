import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Card, CardKicker, CardTitle, CardBody } from '../components/Card';
import { EnergyDots } from '../components/EnergyDots';
import { SymptomChips, SingleChips } from '../components/Chips';
import { RingHeader } from '../components/RingHeader';
import { useCadence } from '../state/CadenceContext';
import { useCycleData } from '../state/useCycleData';
import { MOVE, FUEL, SYMPTOMS, FLOW_LEVELS } from '../lib/content';
import { color, font, space } from '../theme/tokens';
import { formatShort, formatTime } from '../lib/date';
import { TabId } from '../components/TabBar';

export function TodayScreen({ onNavigate, onOpenSettings }: { onNavigate: (t: TabId) => void; onOpenSettings: () => void }) {
  const { today, day, cycleLength, boundaries, phaseKey, phase, phaseDayWithinPhase, prediction, pattern, cyclesLogged, todayLog } = useCycleData();
  const { setEnergy, toggleSymptom, setFlow } = useCadence();

  const move = MOVE[phaseKey];
  const fuel = FUEL[phaseKey];

  const periodInLabel = prediction ? `Next period in ${Math.max(0, daysUntil(today, prediction.nextPeriodDate))} days` : 'Log your first period to start';
  const confidenceLabel = prediction ? `±${prediction.confidenceDays}d` : '';

  const symptomCount = todayLog.symptoms.length;
  const statusLine = todayLog.loggedAt
    ? `Saved ${formatTime(todayLog.loggedAt)} · ${symptomCount || 'no'} symptom${symptomCount === 1 ? '' : 's'} today`
    : 'Not logged yet today';

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.headerTopRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Settings" hitSlop={10} onPress={onOpenSettings} style={styles.gear}>
          <Text style={styles.gearIcon}>⚙</Text>
        </Pressable>
      </View>
      <RingHeader
        day={day}
        cycleLength={cycleLength}
        boundaries={boundaries}
        phaseColor={phase.color}
        phaseLine={`${phase.label} · day ${phaseDayWithinPhase}`}
        dateLabel={formatShort(today)}
        periodInLabel={periodInLabel}
        confidenceLabel={confidenceLabel}
      />

      <View style={styles.body}>
        <View style={styles.sectionHeader}>
          <Text style={styles.h6}>Today, from your data</Text>
          <Text style={styles.caveat}>Suggestions, not rules</Text>
        </View>

        <Card onPress={() => onNavigate('move')} style={{ gap: 10 }}>
          <View style={styles.rowBetween}>
            <CardKicker>Movement</CardKicker>
            <Text style={styles.confidence}>{cyclesLogged > 0 ? `${cyclesLogged} cycle${cyclesLogged === 1 ? '' : 's'} of data` : 'First cycle — still learning'}</Text>
          </View>
          <View style={styles.moveRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <CardTitle>{move.title}</CardTitle>
              <Text style={styles.meta}>{move.meta}</Text>
            </View>
            <View style={styles.loadBadge}>
              <Text style={styles.loadWord}>{move.load}</Text>
              <Text style={styles.loadLabel}>LOAD</Text>
            </View>
          </View>
          <CardBody>{move.why}</CardBody>
        </Card>

        <Card onPress={() => onNavigate('fuel')} style={{ gap: 10 }}>
          <CardKicker>Nutrients</CardKicker>
          <CardTitle>{fuel.headline}</CardTitle>
          <View style={styles.chipRow}>
            {fuel.increase.slice(0, 2).map((n) => (
              <View key={n.name} style={styles.tagAccent2}>
                <Text style={styles.tagAccent2Text}>↑ {n.name}</Text>
              </View>
            ))}
            {fuel.reduce.slice(0, 2).map((n) => (
              <View key={n.name} style={styles.tagAccent}>
                <Text style={styles.tagAccentText}>↓ {n.name}</Text>
              </View>
            ))}
          </View>
          <CardBody>{fuel.why}</CardBody>
        </Card>

        <Card elevated style={{ gap: 10, backgroundColor: color.neutral100 }}>
          <CardKicker>Log for today</CardKicker>
          <View style={{ gap: 10 }}>
            <View style={styles.logRow}>
              <Text style={styles.logLabel}>Energy</Text>
              <EnergyDots value={todayLog.energy ?? 3} onChange={(n) => setEnergy(today, n as 1 | 2 | 3 | 4 | 5)} />
            </View>
            <View style={[styles.logRow, { alignItems: 'flex-start' }]}>
              <Text style={[styles.logLabel, { paddingTop: 5 }]}>Symptoms</Text>
              <SymptomChips options={SYMPTOMS} selected={todayLog.symptoms} onToggle={(s) => toggleSymptom(today, s)} />
            </View>
            <View style={[styles.logRow, { alignItems: 'flex-start' }]}>
              <Text style={[styles.logLabel, { paddingTop: 5 }]}>Period</Text>
              <SingleChips
                options={FLOW_LEVELS}
                value={todayLog.flow}
                onSelect={(v) => setFlow(today, todayLog.flow === v ? undefined : (v as any))}
              />
            </View>
          </View>
          <Text style={styles.statusLine}>{statusLine}</Text>
        </Card>

        {pattern ? (
          <View style={styles.patternRow}>
            <View style={styles.patternDot} />
            <Text style={styles.patternText}>{pattern}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function daysUntil(fromISO: string, toISO: string): number {
  const a = new Date(fromISO).getTime();
  const b = new Date(toISO).getTime();
  return Math.round((b - a) / 86400000);
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 12, gap: 18 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20 },
  gear: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  gearIcon: { fontSize: 16, color: color.neutral600 },
  body: { paddingHorizontal: 20, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  h6: { fontFamily: font.bodySemiBold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: color.neutral700 },
  caveat: { fontSize: 11, color: color.neutral600 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  confidence: { fontSize: 11, color: color.neutral600 },
  moveRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  meta: { fontSize: 13, opacity: 0.8, color: color.text },
  loadBadge: { width: 56, height: 56, borderRadius: 28, backgroundColor: color.accent200, alignItems: 'center', justifyContent: 'center' },
  loadWord: { fontFamily: font.heading, fontSize: 20, color: color.accent800, lineHeight: 22 },
  loadLabel: { fontSize: 9, letterSpacing: 0.8, color: color.accent800, opacity: 0.75 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagAccent2: { backgroundColor: color.accent2_100, borderRadius: 12, paddingVertical: 3, paddingHorizontal: 10 },
  tagAccent2Text: { fontSize: 11, color: color.accent2_800 },
  tagAccent: { backgroundColor: color.accent100, borderRadius: 12, paddingVertical: 3, paddingHorizontal: 10 },
  tagAccentText: { fontSize: 11, color: color.accent800 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logLabel: { fontSize: 12, width: 64, color: color.neutral700 },
  statusLine: { fontSize: 11, color: color.neutral600 },
  patternRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingHorizontal: 4 },
  patternDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: color.accent2_600, marginTop: 6 },
  patternText: { flex: 1, fontSize: 12, lineHeight: 18, color: color.neutral700 },
});

import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Card } from '../components/Card';
import { useCadence } from '../state/CadenceContext';
import { useCycleData } from '../state/useCycleData';
import { cycleDayFor, phaseKeyForDay } from '../lib/cycle';
import { MOVE, FUEL } from '../lib/content';
import { PHASES } from '../theme/tokens';
import { color, font } from '../theme/tokens';
import { daysInMonth, leadingBlanks, todayISO } from '../lib/date';

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function CycleScreen() {
  const { profile, logs } = useCadence();
  const { cycleLength, boundaries, cyclesLogged, cycleLengthAvg, periodLengthAvg, energyAvg } = useCycleData();
  const today = todayISO();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(today);

  const cells = useMemo(() => {
    const blanks = leadingBlanks(viewYear, viewMonth);
    const total = daysInMonth(viewYear, viewMonth);
    const out: { iso: string | null; date: number }[] = [];
    for (let i = 0; i < blanks; i++) out.push({ iso: null, date: 0 });
    for (let d = 1; d <= total; d++) {
      const iso = isoFor(viewYear, viewMonth, d);
      out.push({ iso, date: d });
    }
    return out;
  }, [viewYear, viewMonth]);

  const hasHistory = profile.periodStarts.length > 0;

  function goMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  const selCycleDay = hasHistory ? cycleDayFor(selected, profile, cycleLength) : 1;
  const selPhaseKey = phaseKeyForDay(((selCycleDay - 1) % cycleLength) + 1, boundaries);
  const selLog = logs[selected];
  const loggedValue = selLog
    ? [selLog.flow ? `Flow: ${selLog.flow.toLowerCase()}` : null, selLog.energy ? `Energy ${selLog.energy}/5` : null, selLog.symptoms.length ? selLog.symptoms.join(', ') : null]
        .filter(Boolean)
        .join(' · ') || 'Logged, no details'
    : 'Nothing logged';

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View style={styles.monthNav}>
          <Pressable onPress={() => goMonth(-1)} hitSlop={10} style={styles.chevron}>
            <Text style={styles.chevronText}>‹</Text>
          </Pressable>
          <Text style={styles.h3}>{MONTH_NAMES_LONG[viewMonth]} {viewYear}</Text>
          <Pressable onPress={() => goMonth(1)} hitSlop={10} style={styles.chevron}>
            <Text style={styles.chevronText}>›</Text>
          </Pressable>
        </View>
        <Text style={styles.cyclesLoggedLabel}>{cyclesLogged} cycle{cyclesLogged === 1 ? '' : 's'} logged</Text>
      </View>

      <View style={styles.grid}>
        {WEEKDAY_INITIALS.map((w, i) => (
          <View key={`wd${i}`} style={styles.cellSlot}>
            <Text style={styles.weekday}>{w}</Text>
          </View>
        ))}
        {cells.map((c, i) => {
          if (!c.iso) return <View key={`b${i}`} style={styles.cellSlot} />;
          const cd = hasHistory ? cycleDayFor(c.iso, profile, cycleLength) : null;
          const phaseKey = cd != null ? phaseKeyForDay(((cd - 1) % cycleLength) + 1, boundaries) : null;
          const isFlow = !!logs[c.iso]?.flow;
          const isFertile = phaseKey === 'ovulatory';
          const isFuture = c.iso > today;
          const isSelected = c.iso === selected;
          const isToday = c.iso === today;
          return (
            <Pressable key={c.iso} onPress={() => setSelected(c.iso!)} style={styles.cellSlot}>
              <View
                style={[
                  styles.cell,
                  isFlow ? { backgroundColor: color.accent200 } : isFertile ? { backgroundColor: color.accent2_200 } : null,
                  isSelected && styles.cellSelected,
                ]}
              >
                <Text style={[styles.cellDate, isToday && { fontFamily: font.bodyBold }]}>{c.date}</Text>
                {phaseKey ? <View style={[styles.dot, { backgroundColor: PHASES[phaseKey].color, opacity: isFuture ? 0.35 : 1 }]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <LegendItem swatch={<View style={[styles.legendSwatch, { backgroundColor: color.accent200 }]} />} label="Flow logged" />
        <LegendItem swatch={<View style={[styles.legendSwatch, { backgroundColor: color.accent2_200 }]} />} label="Fertile window" />
        <LegendItem swatch={<View style={[styles.legendSwatch, styles.legendTodaySwatch]} />} label="Today" />
        <LegendItem swatch={<View style={styles.legendDot} />} label="Phase" />
      </View>

      <Card style={{ gap: 8 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{formatSelected(selected)}</Text>
          <View style={styles.tagNeutral}>
            <Text style={styles.tagNeutralText}>Day {selCycleDay}</Text>
          </View>
        </View>
        <View style={{ gap: 6 }}>
          <DetailRow label="Phase" value={hasHistory ? PHASES[selPhaseKey].label : 'Log a period to begin'} />
          <DetailRow label="Logged" value={hasHistory ? loggedValue : '—'} />
          <DetailRow label="Movement" value={hasHistory ? MOVE[selPhaseKey].title.split(',')[0] : '—'} />
          <DetailRow label="Nutrient focus" value={hasHistory ? `${FUEL[selPhaseKey].increase[0].name} · ${FUEL[selPhaseKey].reduce[0].name.toLowerCase()}` : '—'} />
        </View>
      </Card>

      <View style={{ gap: 6, paddingBottom: 4 }}>
        <Text style={styles.h6}>Your averages</Text>
        <View style={styles.statsRow}>
          <StatTile value={cycleLengthAvg.sampleSize > 0 ? cycleLengthAvg.value.toString() : '—'} label="Cycle length, days" />
          <StatTile value={periodLengthAvg.sampleSize > 0 ? periodLengthAvg.value.toString() : '—'} label="Period length, days" />
          <StatTile value={energyAvg.sampleSize > 0 ? energyAvg.value.toString() : '—'} label="Energy, avg / 5" />
        </View>
      </View>
    </ScrollView>
  );
}

function isoFor(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function formatSelected(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTH_NAMES_LONG[m - 1]} ${y}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LegendItem({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <View style={styles.legendItem}>
      {swatch}
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const CELL = 44;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chevron: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  chevronText: { fontSize: 18, color: color.neutral700 },
  h3: { fontFamily: font.heading, fontSize: 24, color: color.text },
  cyclesLoggedLabel: { fontSize: 12, color: color.neutral700 },
  // 7 equal slots sized by width%, with the gap simulated as margin on the
  // *inner* box — mixing percentage widths with a flex `gap` on the row
  // would push the 7th column onto a new line (the browser and Yoga both
  // resolve percentage widths against the pre-gap content box).
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cellSlot: { width: `${100 / 7}%`, marginBottom: 6, alignItems: 'center' },
  weekday: { textAlign: 'center', fontSize: 10, letterSpacing: 0.6, color: color.neutral600 },
  cell: { width: CELL - 4, height: CELL, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 3, borderWidth: 1.5, borderColor: 'transparent' },
  cellSelected: { borderColor: color.text },
  cellDate: { fontSize: 13, color: color.text },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, rowGap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 14, height: 14, borderRadius: 5 },
  legendTodaySwatch: { borderWidth: 1.5, borderColor: color.text },
  legendDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: color.accent2_700 },
  legendLabel: { fontSize: 11, color: color.neutral700 },
  rowBetween: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  cardTitle: { fontFamily: font.heading, fontSize: 17, color: color.text },
  tagNeutral: { backgroundColor: color.neutral100, borderRadius: 12, paddingVertical: 3, paddingHorizontal: 10 },
  tagNeutralText: { fontSize: 11, color: color.neutral800 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  detailLabel: { fontSize: 13, color: color.neutral700 },
  detailValue: { fontSize: 13, color: color.text, textAlign: 'right', flexShrink: 1 },
  h6: { fontFamily: font.bodySemiBold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: color.neutral700 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statTile: { flex: 1, backgroundColor: color.neutral100, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 10, gap: 2 },
  statValue: { fontFamily: font.heading, fontSize: 22, color: color.text },
  statLabel: { fontSize: 10, letterSpacing: 0.4, color: color.neutral700 },
});

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useCadence } from '../state/CadenceContext';
import { useCycleData } from '../state/useCycleData';
import { FUEL } from '../lib/content';
import { fuelEvidenceLine } from '../lib/evidenceCopy';
import { color, font } from '../theme/tokens';

export function FuelScreen() {
  const { today, phase, phaseDayWithinPhase, phaseKey, phaseEvidence, todayLog } = useCycleData();
  const { toggleNutrientCheck } = useCadence();
  const fuel = FUEL[phaseKey];
  const evidenceLine = fuelEvidenceLine(phaseEvidence);
  const checks = todayLog.nutrientChecks ?? [];
  const totalItems = fuel.increase.length + fuel.reduce.length;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={{ gap: 4 }}>
        <Text style={styles.h6}>Nutrients · {phase.label} day {phaseDayWithinPhase}</Text>
        <Text style={styles.h3}>{fuel.headline}</Text>
        <Text style={styles.meta}>{fuel.rationale}</Text>
        {evidenceLine ? <Text style={styles.evidenceLine}>{evidenceLine}</Text> : null}
      </View>

      <View style={{ gap: 10 }}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.h6, { color: color.accent2_700 }]}>Increase</Text>
          <Text style={styles.checkedOf}>{checks.length} of {totalItems} checked off today</Text>
        </View>
        {fuel.increase.map((n) => {
          const checked = checks.includes(n.name);
          return (
            <View key={n.name} style={styles.increaseCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{n.name}</Text>
                <View style={styles.targetRow}>
                  <Text style={styles.increaseTarget}>{n.target}</Text>
                  <CheckCircle checked={checked} onPress={() => toggleNutrientCheck(today, n.name)} onColor={color.accent2_600} />
                </View>
              </View>
              <Text style={styles.rationale}>{n.rationale}</Text>
              <Text style={styles.foods}>{n.foods}</Text>
              <Text style={styles.tip}>{n.tip}</Text>
            </View>
          );
        })}
      </View>

      <View style={{ gap: 10 }}>
        <Text style={[styles.h6, { color: color.accent700 }]}>Ease off</Text>
        {fuel.reduce.map((n) => {
          const checked = checks.includes(n.name);
          return (
            <View key={n.name} style={styles.reduceCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{n.name}</Text>
                <View style={styles.targetRow}>
                  <Text style={styles.reduceTarget}>{n.target}</Text>
                  <CheckCircle checked={checked} onPress={() => toggleNutrientCheck(today, n.name)} onColor={color.accent600} />
                </View>
              </View>
              <Text style={styles.rationale}>{n.rationale}</Text>
              <Text style={styles.tip}>{n.tip}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.disclaimer}>Nutrient ranges are general guidance, not a clinical plan. Cadence does not diagnose.</Text>
    </ScrollView>
  );
}

function CheckCircle({ checked, onPress, onColor }: { checked: boolean; onPress: () => void; onColor: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={checked ? 'Marked done today' : 'Mark done today'}
      hitSlop={10}
      onPress={onPress}
      style={[styles.checkCircle, checked && { backgroundColor: onColor, borderColor: onColor }]}
    >
      {checked ? <Text style={styles.checkMark}>✓</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12, gap: 16 },
  h6: { fontFamily: font.bodySemiBold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: color.neutral700 },
  h3: { fontFamily: font.heading, fontSize: 24, color: color.text },
  meta: { fontSize: 13, color: color.neutral700 },
  evidenceLine: { fontSize: 12, lineHeight: 17, color: color.accent2_700, fontFamily: font.bodySemiBold },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  checkedOf: { fontSize: 11, color: color.neutral600 },
  rowBetween: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontFamily: font.heading, fontSize: 17, color: color.text },
  increaseCard: { backgroundColor: color.accent2_100, borderRadius: 20, padding: 13, gap: 6 },
  increaseTarget: { fontSize: 12, color: color.accent2_800 },
  reduceCard: { backgroundColor: color.surface, borderRadius: 20, padding: 13, gap: 6 },
  reduceTarget: { fontSize: 12, color: color.accent700 },
  rationale: { fontSize: 12.5, lineHeight: 18, opacity: 0.85, color: color.text },
  foods: { fontSize: 11.5, color: color.accent2_800 },
  tip: { fontSize: 11.5, lineHeight: 16, color: color.neutral700, fontStyle: 'italic' },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: color.divider, alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontSize: 13, color: color.neutral100, fontFamily: font.bodySemiBold },
  disclaimer: { fontSize: 11, lineHeight: 16, color: color.neutral600, marginBottom: 4 },
});

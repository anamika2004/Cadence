import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useCycleData } from '../state/useCycleData';
import { FUEL } from '../lib/content';
import { color, font } from '../theme/tokens';

export function FuelScreen() {
  const { phase, phaseDayWithinPhase, phaseKey } = useCycleData();
  const fuel = FUEL[phaseKey];

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={{ gap: 4 }}>
        <Text style={styles.h6}>Nutrients · {phase.label} day {phaseDayWithinPhase}</Text>
        <Text style={styles.h3}>{fuel.headline}</Text>
        <Text style={styles.meta}>{fuel.why}</Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={[styles.h6, { color: color.accent2_700 }]}>Increase</Text>
        {fuel.increase.map((n) => (
          <View key={n.name} style={styles.increaseCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{n.name}</Text>
              <Text style={styles.increaseTarget}>{n.target}</Text>
            </View>
            <Text style={styles.rationale}>{n.why}</Text>
            <Text style={styles.foods}>{n.foods}</Text>
          </View>
        ))}
      </View>

      <View style={{ gap: 10 }}>
        <Text style={[styles.h6, { color: color.accent700 }]}>Ease off</Text>
        {fuel.reduce.map((n) => (
          <View key={n.name} style={styles.reduceCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{n.name}</Text>
              <Text style={styles.reduceTarget}>{n.target}</Text>
            </View>
            <Text style={styles.rationale}>{n.why}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.disclaimer}>Nutrient ranges are general guidance, not a clinical plan. Cadence does not diagnose.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12, gap: 16 },
  h6: { fontFamily: font.bodySemiBold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: color.neutral700 },
  h3: { fontFamily: font.heading, fontSize: 24, color: color.text },
  meta: { fontSize: 13, color: color.neutral700 },
  rowBetween: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  cardTitle: { fontFamily: font.heading, fontSize: 17, color: color.text },
  increaseCard: { backgroundColor: color.accent2_100, borderRadius: 20, padding: 13, gap: 6 },
  increaseTarget: { fontSize: 12, color: color.accent2_800 },
  reduceCard: { backgroundColor: color.surface, borderRadius: 20, padding: 13, gap: 6 },
  reduceTarget: { fontSize: 12, color: color.accent700 },
  rationale: { fontSize: 12.5, lineHeight: 18, opacity: 0.85, color: color.text },
  foods: { fontSize: 11.5, color: color.accent2_800 },
  disclaimer: { fontSize: 11, lineHeight: 16, color: color.neutral600, marginBottom: 4 },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { color, font, PHASE_ORDER, PhaseKey } from '../theme/tokens';
import { PhaseBoundaries } from '../lib/cycle';

const SIZE = 236;
const VB = 100;
const R = 42;
const CIRC = 2 * Math.PI * R;

type Props = {
  day: number;
  cycleLength: number;
  boundaries: PhaseBoundaries;
  phaseColor: string;
  phaseLine: string;
  dateLabel: string;
  periodInLabel: string;
  confidenceLabel: string;
};

export function RingHeader({ day, cycleLength, boundaries, phaseColor, phaseLine, dateLabel, periodInLabel, confidenceLabel }: Props) {
  let acc = 0;
  const arcs = PHASE_ORDER.map((k: PhaseKey) => {
    const b = boundaries[k];
    const len = ((b.end - b.start + 1) / cycleLength) * CIRC;
    const dasharray = `${Math.max(0, len - 1.2)} ${CIRC - len + 1.2}`;
    const offset = -acc;
    acc += len;
    return { key: k, strokeColor: phaseStrokeColor(k), dasharray, offset };
  });

  const markerLen = CIRC / cycleLength;
  const markerDash = `${Math.max(0, markerLen - 1)} ${CIRC - markerLen + 1}`;
  const markerOffset = -(((day - 1) / cycleLength) * CIRC);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.wordmark}>Cadence</Text>
        <Text style={styles.date}>{dateLabel}</Text>
      </View>
      <View style={{ width: SIZE, height: SIZE, marginTop: 4 }}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${VB} ${VB}`} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={50} cy={50} r={R} fill="none" stroke={color.neutral200} strokeWidth={9} />
          {arcs.map((a) => (
            <Circle
              key={a.key}
              cx={50}
              cy={50}
              r={R}
              fill="none"
              stroke={a.strokeColor}
              strokeWidth={9}
              strokeDasharray={a.dasharray}
              strokeDashoffset={a.offset}
            />
          ))}
          <Circle
            cx={50}
            cy={50}
            r={R}
            fill="none"
            stroke={color.text}
            strokeWidth={13}
            strokeLinecap="round"
            strokeDasharray={markerDash}
            strokeDashoffset={markerOffset}
          />
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.kicker}>CYCLE DAY</Text>
          <Text style={styles.day}>{day}</Text>
          <Text style={[styles.phaseLine, { color: phaseColor }]}>{phaseLine}</Text>
        </View>
      </View>
      <View style={styles.pillRow}>
        <View style={styles.pillNeutral}>
          <Text style={styles.pillNeutralText}>{periodInLabel}</Text>
        </View>
        <View style={styles.pillOutline}>
          <Text style={styles.pillOutlineText}>{confidenceLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function phaseStrokeColor(k: PhaseKey): string {
  switch (k) {
    case 'menstrual':
      return color.accent600;
    case 'follicular':
      return color.accent2_500;
    case 'ovulatory':
      return color.accent400;
    case 'luteal':
      return color.accent2_700;
  }
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 6, alignItems: 'center', gap: 10 },
  headerRow: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  wordmark: { fontFamily: font.heading, fontSize: 19, color: color.text },
  date: { fontSize: 12, color: color.neutral700 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 2 },
  kicker: { fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase', color: color.neutral700 },
  day: { fontFamily: font.heading, fontSize: 64, lineHeight: 64, color: color.text },
  phaseLine: { fontSize: 13 },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  pillNeutral: { backgroundColor: color.neutral100, borderRadius: 12, paddingVertical: 3, paddingHorizontal: 10 },
  pillNeutralText: { fontSize: 11, color: color.neutral800 },
  pillOutline: { borderWidth: 1, borderColor: color.accent, borderRadius: 12, paddingVertical: 3, paddingHorizontal: 10 },
  pillOutlineText: { fontSize: 11, color: color.accent },
});

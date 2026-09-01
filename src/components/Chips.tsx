import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font } from '../theme/tokens';

// Multi-select toggle chips (symptoms) and single-select chips (flow level)
// share the same visual language as the design's `.tag` chips, with a
// hitSlop so the 30px-tall chip still meets a 44px touch target.

export function SymptomChips({ options, selected, onToggle }: { options: readonly string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <View style={styles.wrap}>
      {options.map((label) => {
        const on = selected.includes(label);
        return (
          <Pressable key={label} hitSlop={7} onPress={() => onToggle(label)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
            <Text style={[styles.chipLabel, on ? styles.chipLabelOn : styles.chipLabelOff]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SingleChips({ options, value, onSelect }: { options: readonly string[]; value?: string; onSelect: (v: string) => void }) {
  return (
    <View style={styles.wrap}>
      {options.map((label) => {
        const on = value === label;
        return (
          <Pressable key={label} hitSlop={7} onPress={() => onSelect(label)} style={[styles.chip, on ? styles.chipOnAccent2 : styles.chipOff]}>
            <Text style={[styles.chipLabel, on ? styles.chipLabelOn : styles.chipLabelOff]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  chip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999, minHeight: 30, justifyContent: 'center' },
  chipOn: { backgroundColor: color.accent600 },
  chipOnAccent2: { backgroundColor: color.accent2_600 },
  chipOff: { borderWidth: 1, borderColor: color.divider },
  chipLabel: { fontFamily: font.body, fontSize: 12 },
  chipLabelOn: { color: color.accent100 },
  chipLabelOff: { color: color.text },
});

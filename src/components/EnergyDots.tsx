import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font } from '../theme/tokens';

export function EnergyDots({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= value;
        return (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`Energy ${n} of 5`}
            hitSlop={7}
            onPress={() => onChange(n)}
            style={[styles.dot, on ? styles.dotOn : styles.dotOff]}
          >
            <Text style={[styles.label, on ? styles.labelOn : styles.labelOff]}>{n}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOn: { backgroundColor: color.accent2_500, borderWidth: 1, borderColor: color.accent2_500 },
  dotOff: { borderWidth: 1, borderColor: color.divider },
  label: { fontFamily: font.body, fontSize: 12 },
  labelOn: { color: color.neutral100 },
  labelOff: { color: color.neutral700 },
});

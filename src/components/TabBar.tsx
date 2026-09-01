import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { color, font } from '../theme/tokens';

export type TabId = 'today' | 'cycle' | 'move' | 'fuel';

const TABS: { id: TabId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'cycle', label: 'Cycle' },
  { id: 'move', label: 'Move' },
  { id: 'fuel', label: 'Fuel' },
];

export function TabBar({ active, onChange, bottomInset }: { active: TabId; onChange: (t: TabId) => void; bottomInset: number }) {
  return (
    <BlurView intensity={30} tint="light" style={[styles.wrap, { paddingBottom: Math.max(bottomInset, 12) }]}>
      <View style={styles.row}>
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <Pressable
              key={t.id}
              accessibilityRole="button"
              accessibilityLabel={t.label}
              onPress={() => onChange(t.id)}
              style={[styles.pill, on && styles.pillOn]}
            >
              <Text style={[styles.label, on ? styles.labelOn : styles.labelOff, on && { fontFamily: font.heading }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: color.divider,
    backgroundColor: Platform.select({ ios: 'transparent', default: 'rgba(245,234,216,0.92)' }),
  },
  row: { flexDirection: 'row', gap: 4 },
  pill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderRadius: 999,
    minHeight: 44,
  },
  pillOn: { backgroundColor: color.accent },
  label: { fontSize: 11, letterSpacing: 0.3 },
  labelOn: { color: color.bg },
  labelOff: { color: color.neutral700 },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { color, font, radius, space, shadowSm } from '../theme/tokens';

export function Card({
  children,
  onPress,
  style,
  elevated = true,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}) {
  const content = <View style={[styles.card, elevated && shadowSm, style]}>{children}</View>;
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
      {content}
    </Pressable>
  );
}

export function CardKicker({ children, color: c }: { children: React.ReactNode; color?: string }) {
  return <Text style={[styles.kicker, c ? { color: c } : null]}>{children}</Text>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: space[3],
    gap: space[2],
  },
  kicker: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: color.accent, fontFamily: font.bodySemiBold },
  title: { fontFamily: font.heading, fontSize: 17, lineHeight: 20, color: color.text },
  body: { fontSize: 13, opacity: 0.8, color: color.text, lineHeight: 18 },
});

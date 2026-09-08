import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { submitFeedback } from '../lib/sync';
import { color, font } from '../theme/tokens';

const LABELS: Record<number, string> = {
  1: 'Not helpful',
  2: 'A little',
  3: 'Somewhat',
  4: 'Very',
  5: 'Extremely',
};

export function FeedbackScreen({ onClose }: { onClose: () => void }) {
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit() {
    if (!rating) return;
    setStatus('sending');
    const result = await submitFeedback(rating, comments.trim());
    if (result.ok) {
      setStatus('sent');
    } else {
      setStatus('error');
      setError(result.reason ?? 'Something went wrong. Try again in a moment.');
    }
  }

  if (status === 'sent') {
    return (
      <View style={[styles.scroll, styles.centered]}>
        <Text style={styles.title}>Thank you</Text>
        <Text style={styles.subtitle}>Your feedback was sent — genuinely appreciated.</Text>
        <Pressable style={styles.cta} onPress={onClose}>
          <Text style={styles.ctaText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Feedback</Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <Text style={styles.close}>Close</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>How helpful has Cadence been for you so far?</Text>

      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((n) => {
          const on = rating === n;
          return (
            <Pressable key={n} hitSlop={6} onPress={() => setRating(n)} style={[styles.ratingDot, on && styles.ratingDotOn]}>
              <Text style={[styles.ratingNum, on && styles.ratingNumOn]}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
      {rating != null && <Text style={styles.ratingLabel}>{LABELS[rating]}</Text>}

      <View style={styles.field}>
        <Text style={styles.label}>Anything you'd add? (optional)</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={5}
          placeholder="What's working, what's not, what you wish it did..."
          placeholderTextColor={color.neutral500}
          value={comments}
          onChangeText={setComments}
          textAlignVertical="top"
        />
      </View>

      {status === 'error' && <Text style={styles.errorText}>{error}</Text>}

      <Pressable style={[styles.cta, !rating && styles.ctaDisabled]} onPress={onSubmit} disabled={!rating || status === 'sending'}>
        {status === 'sending' ? <ActivityIndicator color={color.bg} /> : <Text style={styles.ctaText}>Send feedback</Text>}
      </Pressable>

      <Text style={styles.footer}>Feedback is tied to your anonymous device only — never shared with other testers.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 64, paddingBottom: 40, gap: 20, backgroundColor: color.bg, flexGrow: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily: font.heading, fontSize: 24, color: color.text },
  close: { fontSize: 14, color: color.accent },
  subtitle: { fontSize: 14, lineHeight: 20, color: color.neutral700, textAlign: 'center' },
  ratingRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  ratingDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.divider,
  },
  ratingDotOn: { backgroundColor: color.accent2_500, borderColor: color.accent2_500 },
  ratingNum: { fontFamily: font.heading, fontSize: 17, color: color.neutral700 },
  ratingNumOn: { color: color.neutral100 },
  ratingLabel: { textAlign: 'center', fontSize: 13, color: color.accent2_700 },
  field: { gap: 8 },
  label: { fontSize: 12, color: color.neutral700 },
  input: {
    backgroundColor: color.surface,
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: color.text,
    minHeight: 120,
  },
  errorText: { fontSize: 12, color: color.accent700, textAlign: 'center' },
  cta: { backgroundColor: color.accent, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  ctaDisabled: { opacity: 0.45 },
  ctaText: { fontFamily: font.heading, fontSize: 15, color: color.bg },
  footer: { fontSize: 11, lineHeight: 16, color: color.neutral600, textAlign: 'center' },
});

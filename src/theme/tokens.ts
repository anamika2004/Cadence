// Ported 1:1 from the "Organic" design system (design-system/styles.css)
// in the Cadence design handoff. Keep this file as the single source of
// truth for color/type/space/radius values — screens should not hard-code
// hex values or px numbers that live here.

export const color = {
  bg: '#f5ead8',
  surface: '#ebddc5',
  text: '#201e1d',
  accent: '#c67139',
  accent2: '#7a8a5e',
  divider: 'rgba(32,30,29,0.16)',

  neutral100: '#f9f4ed',
  neutral200: '#eee7db',
  neutral300: '#dcd3c4',
  neutral400: '#c0b6a5',
  neutral500: '#a19786',
  neutral600: '#82796a',
  neutral700: '#645c50',
  neutral800: '#474238',
  neutral900: '#2e2b25',

  accent100: '#fff2eb',
  accent200: '#ffe1d0',
  accent300: '#ffc6a5',
  accent400: '#f6a06b',
  accent500: '#d67f48',
  accent600: '#b2622d',
  accent700: '#8c491a',
  accent800: '#643312',
  accent900: '#402310',

  accent2_100: '#f0fae1',
  accent2_200: '#e1eecc',
  accent2_300: '#ccdbb2',
  accent2_400: '#aebf92',
  accent2_500: '#8fa073',
  accent2_600: '#728157',
  accent2_700: '#56633f',
  accent2_800: '#3d472b',
  accent2_900: '#272e1b',
};

export const font = {
  heading: 'Caprasimo_400Regular',
  body: 'Figtree_400Regular',
  bodySemiBold: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
};

// The design's px scale maps 1:1 to RN's density-independent points.
export const space = {
  1: 4.4,
  2: 8.8,
  3: 13.2,
  4: 17.6,
  6: 26.4,
  8: 35.2,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 28,
  pill: 999,
};

// RN shadow props (iOS) — Android uses `elevation` alongside these.
export const shadowSm = {
  shadowColor: '#2e2b25',
  shadowOpacity: 0.14,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 1 },
  elevation: 2,
};

// Phase colors and boundary shape, mirrored from the prototype's PH table.
export type PhaseKey = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export const PHASES: Record<PhaseKey, { label: string; color: string }> = {
  menstrual: { label: 'Menstrual', color: color.accent600 },
  follicular: { label: 'Follicular', color: color.accent2_500 },
  ovulatory: { label: 'Ovulatory', color: color.accent400 },
  luteal: { label: 'Luteal', color: color.accent2_700 },
};

export const PHASE_ORDER: PhaseKey[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];

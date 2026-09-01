// Movement and nutrition content, ported verbatim from the design handoff's
// prototype (design/CadencePhone.dc.html — the MOVE and FUEL constants).
// This copy is intentionally static per phase; only cycle day, phase,
// predictions and the pattern line are computed from the user's own data.
import { PhaseKey } from '../theme/tokens';

export type MoveBlock = { time: string; text: string };
export type EvidenceRow = { label: string; value: string };

export type MoveContent = {
  title: string;
  meta: string;
  load: 'Low' | 'Mid' | 'High';
  why: string;
  evidence?: EvidenceRow[];
  blocks: MoveBlock[];
};

export type NutrientIncrease = { name: string; target: string; why: string; foods: string };
export type NutrientReduce = { name: string; target: string; why: string };

export type FuelContent = {
  headline: string;
  why: string;
  increase: NutrientIncrease[];
  reduce: NutrientReduce[];
};

export const MOVE: Record<PhaseKey, MoveContent> = {
  menstrual: {
    title: 'Low-load mobility, 25 min',
    meta: 'Walk or flow · RPE 3–4',
    load: 'Low',
    why: 'You logged cramps on days 1–2 in three of your last four cycles, and rated energy 2.1/5 on average.',
    blocks: [
      { time: "0–6'", text: 'Easy walk or bike, nasal breathing' },
      { time: "6–18'", text: 'Hip and low-back mobility flow' },
      { time: "18–25'", text: 'Box breathing, legs up the wall' },
    ],
  },
  follicular: {
    title: 'Progressive strength, 45 min',
    meta: 'Lower body focus · RPE 7',
    load: 'High',
    why: 'Your energy ratings climb from day 7 and peak around day 11 — this is where your logged lifts have been heaviest.',
    blocks: [
      { time: "0–8'", text: 'Warm-up: bike, banded hips' },
      { time: "8–30'", text: 'Squat 4×6, hinge 3×8' },
      { time: "30–40'", text: 'Split squat, row supersets' },
      { time: "40–45'", text: 'Cooldown walk' },
    ],
  },
  ovulatory: {
    title: 'Intervals, 35 min',
    meta: 'Bike or run · RPE 8 peaks',
    load: 'High',
    why: 'Days 13–16 carry your highest logged energy (4.3/5) and your fastest recorded pace.',
    blocks: [
      { time: "0–8'", text: 'Build-up warm-up' },
      { time: "8–26'", text: '6 × 90s hard / 90s easy' },
      { time: "26–35'", text: 'Easy spin, mobility' },
    ],
  },
  luteal: {
    title: 'Moderate strength, 40 min',
    meta: 'Full body · RPE 6, longer rests',
    load: 'Mid',
    why: 'Across your last four cycles, energy on days 15–19 averaged 3.4/5 — near your overall mean of 3.5. No reason to back off yet; you tend to drop from day 23.',
    evidence: [
      { label: 'Energy, days 15–19', value: '3.4 / 5 avg' },
      { label: 'Sessions completed here', value: '9 of 11 planned' },
      { label: 'Resting HR vs baseline', value: '+2 bpm' },
      { label: 'Sleep, last 3 nights', value: '7h 05m avg' },
    ],
    blocks: [
      { time: "0–8'", text: 'Warm-up: row, banded shoulders' },
      { time: "8–24'", text: 'Goblet squat 3×8, press 3×8' },
      { time: "24–34'", text: 'Hinge 3×8, carries 3×40m' },
      { time: "34–40'", text: 'Slow breathing, calf stretch' },
    ],
  },
};

export const FUEL: Record<PhaseKey, FuelContent> = {
  menstrual: {
    headline: 'Iron and fluids, gentle on the gut',
    why: 'Iron losses peak with flow; your logged fatigue tracks days 1–3.',
    increase: [
      { name: 'Iron', target: '+ ~5 mg/day', why: 'Replaces flow losses; pair with vitamin C to raise absorption.', foods: 'Lentils, beef, tofu, pumpkin seeds + citrus' },
      { name: 'Vitamin C', target: '~90 mg/day', why: 'Raises non-heme iron absorption by up to 3×.', foods: 'Peppers, kiwi, strawberries' },
      { name: 'Fluids + electrolytes', target: '2.2–2.6 L', why: 'Blood volume dips; low intake tracks your headache logs.', foods: 'Water, broth, salted snack' },
    ],
    reduce: [
      { name: 'Alcohol', target: 'Skip days 1–2', why: 'Worsens sleep fragmentation, which you log most in this window.' },
    ],
  },
  follicular: {
    headline: 'Protein and carbohydrate to build on',
    why: 'Rising oestrogen and your heaviest training land in the same days.',
    increase: [
      { name: 'Protein', target: '1.6–1.8 g/kg', why: 'Supports the heavier lifts planned days 7–12.', foods: 'Eggs, yoghurt, fish, tempeh' },
      { name: 'Complex carbs', target: '3–4 g/kg', why: 'Fuels higher training volume and glycogen refill.', foods: 'Oats, rice, potatoes, fruit' },
      { name: 'Fermented foods', target: 'Daily', why: 'Supports oestrogen clearance via the gut.', foods: 'Kefir, kimchi, live yoghurt' },
    ],
    reduce: [
      { name: 'Ultra-processed snacks', target: 'Where easy', why: 'Displace the carbohydrate quality your sessions need.' },
    ],
  },
  ovulatory: {
    headline: 'Antioxidants and steady hydration',
    why: 'Highest training load of your cycle sits here.',
    increase: [
      { name: 'Antioxidant-rich produce', target: '5+ servings', why: 'Offsets oxidative load from interval work.', foods: 'Berries, leafy greens, beets' },
      { name: 'Fibre', target: '28–30 g', why: 'Supports hormone clearance at the oestrogen peak.', foods: 'Beans, oats, chia, veg' },
      { name: 'Zinc', target: '8–10 mg', why: 'Supports the luteal transition.', foods: 'Oysters, seeds, cashews' },
    ],
    reduce: [
      { name: 'Very high-fat meals pre-session', target: 'Within 3h', why: 'Slows gastric emptying before hard intervals.' },
    ],
  },
  luteal: {
    headline: 'Magnesium up, sodium and caffeine down',
    why: 'Progesterone raises resting energy use ~5–10% and your bloating and sleep logs cluster from day 19.',
    increase: [
      { name: 'Magnesium', target: '~360 mg/day', why: 'Associated with lower cramp and mood-symptom scores; your worst PMS logs follow low-magnesium weeks.', foods: 'Pumpkin seeds, dark chocolate, spinach, black beans' },
      { name: 'Complex carbs', target: '+150–250 kcal', why: 'Covers the small rise in resting energy use and steadies the cravings you log from day 22.', foods: 'Oats, quinoa, sweet potato' },
      { name: 'Calcium', target: '~1000 mg/day', why: 'Trialled for premenstrual symptom relief; easiest to hit with two servings a day.', foods: 'Yoghurt, tinned sardines, fortified soy' },
    ],
    reduce: [
      { name: 'Sodium', target: 'Under 2 g/day', why: 'You logged bloating on 6 of the last 8 late-luteal days; salt load makes it more noticeable.' },
      { name: 'Caffeine', target: 'One cup, before 12:00', why: 'Your sleep-quality logs drop most in this window with afternoon coffee.' },
    ],
  },
};

export const SYMPTOMS = ['Cramps', 'Bloating', 'Headache', 'Cravings', 'Low mood'] as const;
export type Symptom = (typeof SYMPTOMS)[number];

export const FLOW_LEVELS = ['Light', 'Medium', 'Heavy'] as const;
export type FlowLevel = (typeof FLOW_LEVELS)[number];

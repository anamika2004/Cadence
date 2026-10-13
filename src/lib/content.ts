// Movement and nutrition content for all four phases.
//
// Important: this copy must never claim to reference "your" logs — it's
// static content shown to every user, including someone who opened the
// app five minutes ago with zero history. `rationale` fields are general
// phase physiology, true regardless of what anyone has logged. Anything
// that claims a personal pattern (an energy average, a symptom
// frequency) is instead computed for real from the user's own data — see
// computePhaseEvidence in cycle.ts — and simply doesn't render if there
// isn't enough data to support it honestly.
import { PhaseKey } from '../theme/tokens';

export type Venue = 'gym' | 'home';

export type MoveBlock = { time: string; text: string; homeText?: string };
export function blockText(block: MoveBlock, venue: Venue): string {
  return venue === 'home' && block.homeText ? block.homeText : block.text;
}

export type MoveContent = {
  title: string;
  meta: string;
  load: 'Low' | 'Mid' | 'High';
  rationale: string;
  blocks: MoveBlock[];
};

export type NutrientIncrease = { name: string; target: string; rationale: string; foods: string; tip: string };
export type NutrientReduce = { name: string; target: string; rationale: string; tip: string };

export type FuelContent = {
  headline: string;
  rationale: string;
  increase: NutrientIncrease[];
  reduce: NutrientReduce[];
};

export const MOVE: Record<PhaseKey, MoveContent> = {
  menstrual: {
    title: 'Low-load mobility, 25 min',
    meta: 'Walk or flow · RPE 3–4',
    load: 'Low',
    rationale:
      'Cramping and fatigue are most common in the first few days of flow, and resting energy needs tick up slightly — low, steady movement tends to feel better than pushing hard here.',
    blocks: [
      { time: "0–6'", text: 'Easy walk or bike, nasal breathing', homeText: 'Easy walk around the block or in place, nasal breathing' },
      { time: "6–18'", text: 'Hip and low-back mobility flow' },
      { time: "18–25'", text: 'Box breathing, legs up the wall' },
    ],
  },
  follicular: {
    title: 'Progressive strength, 45 min',
    meta: 'Lower body focus · RPE 7',
    load: 'High',
    rationale:
      'Rising oestrogen through the follicular phase is linked to better strength and power output for many people — a natural window to push your heaviest lifts of the cycle.',
    blocks: [
      { time: "0–8'", text: 'Warm-up: bike, banded hips', homeText: 'Warm-up: jog in place or jumping jacks, leg swings' },
      { time: "8–30'", text: 'Squat 4×6, hinge 3×8', homeText: 'Bodyweight or loaded-backpack squat 4×15, glute bridge 3×12' },
      { time: "30–40'", text: 'Split squat, row supersets', homeText: 'Reverse lunge + towel-row supersets' },
      { time: "40–45'", text: 'Cooldown walk' },
    ],
  },
  ovulatory: {
    title: 'Intervals, 35 min',
    meta: 'Bike or run · RPE 8 peaks',
    load: 'High',
    rationale:
      'Oestrogen peaks just before ovulation, often coinciding with some of the best-reported energy and aerobic output of the cycle — a good window for higher-intensity work.',
    blocks: [
      { time: "0–8'", text: 'Build-up warm-up' },
      { time: "8–26'", text: '6 × 90s hard / 90s easy', homeText: '6 × 90s hard (fast march, jump rope or burpees) / 90s easy' },
      { time: "26–35'", text: 'Easy spin, mobility', homeText: 'Easy walk, mobility' },
    ],
  },
  luteal: {
    title: 'Moderate strength, 40 min',
    meta: 'Full body · RPE 6, longer rests',
    load: 'Mid',
    rationale:
      'Progesterone raises resting energy use and core temperature slightly in the luteal phase, which commonly makes a given effort feel harder — moderate load with longer rests tends to sit better than chasing a new max.',
    blocks: [
      { time: "0–8'", text: 'Warm-up: row, banded shoulders', homeText: 'Warm-up: marching in place, towel or band shoulder rotations' },
      { time: "8–24'", text: 'Goblet squat 3×8, press 3×8', homeText: 'Loaded-backpack squat 3×12, push-up (knees down if needed) 3×8' },
      { time: "24–34'", text: 'Hinge 3×8, carries 3×40m', homeText: 'Glute bridge 3×12, suitcase carry with heavy bags 3×40m' },
      { time: "34–40'", text: 'Slow breathing, calf stretch' },
    ],
  },
};

export const FUEL: Record<PhaseKey, FuelContent> = {
  menstrual: {
    headline: 'Iron and fluids, gentle on the gut',
    rationale: 'Iron losses peak with menstrual flow, and fatigue and headaches are commonly reported in the first few days.',
    increase: [
      {
        name: 'Iron',
        target: '+ ~5 mg/day',
        rationale: 'Replaces flow losses; pairing with vitamin C raises non-heme iron absorption.',
        foods: 'Lentils, beef, tofu, pumpkin seeds, dark leafy greens, dried apricots',
        tip: 'Add a squeeze of lemon or a side of peppers to iron-rich meals to boost absorption.',
      },
      {
        name: 'Vitamin C',
        target: '~90 mg/day',
        rationale: 'Raises non-heme (plant-based) iron absorption by up to 3×.',
        foods: 'Peppers, kiwi, strawberries, citrus, broccoli',
        tip: 'Have fruit alongside your main iron source rather than with coffee or tea, which block absorption.',
      },
      {
        name: 'Fluids + electrolytes',
        target: '2.2–2.6 L',
        rationale: 'Blood volume dips slightly during flow, which can contribute to headaches and low energy.',
        foods: 'Water, broth, coconut water, a salted snack',
        tip: 'Keep a bottle visible on your desk — most people under-drink simply from not noticing thirst.',
      },
    ],
    reduce: [
      {
        name: 'Alcohol',
        target: 'Skip days 1–2',
        rationale: 'Alcohol fragments sleep, which is already more variable during flow for many people.',
        tip: 'If skipping fully feels like a lot, start by alternating alcoholic and non-alcoholic drinks.',
      },
    ],
  },
  follicular: {
    headline: 'Protein and carbohydrate to build on',
    rationale: 'Rising oestrogen and, for many people, their heaviest training land in the same days.',
    increase: [
      {
        name: 'Protein',
        target: '1.6–1.8 g/kg',
        rationale: 'Supports muscle repair for heavier training days.',
        foods: 'Eggs, yoghurt, fish, tempeh, chicken, cottage cheese, lentils',
        tip: 'Split protein across 3–4 meals rather than one big serving — the body uses it more efficiently that way.',
      },
      {
        name: 'Complex carbs',
        target: '3–4 g/kg',
        rationale: 'Fuels higher training volume and replenishes glycogen.',
        foods: 'Oats, rice, potatoes, fruit, quinoa, whole-grain bread',
        tip: 'Eat a carb-containing meal within 2 hours of training to speed recovery.',
      },
      {
        name: 'Fermented foods',
        target: 'Daily',
        rationale: 'May support a healthy gut, which plays a role in oestrogen metabolism.',
        foods: 'Kefir, kimchi, live-culture yoghurt, sauerkraut, miso',
        tip: "A spoonful of kimchi or sauerkraut as a side is an easy daily habit — you don't need a full serving.",
      },
    ],
    reduce: [
      {
        name: 'Ultra-processed snacks',
        target: 'Where easy',
        rationale: 'Displaces the carbohydrate quality that supports higher training volume.',
        tip: "Keep one ready-to-eat whole food — fruit, yoghurt, nuts — wherever you'd normally reach for a packaged snack.",
      },
    ],
  },
  ovulatory: {
    headline: 'Antioxidants and steady hydration',
    rationale: "This phase usually carries the highest training load of the cycle, which raises the body's oxidative and hydration demands.",
    increase: [
      {
        name: 'Antioxidant-rich produce',
        target: '5+ servings',
        rationale: 'Helps offset oxidative stress from higher-intensity training.',
        foods: 'Berries, leafy greens, beets, cherries, red cabbage, pomegranate',
        tip: 'Frozen berries work just as well as fresh and are easy to keep stocked.',
      },
      {
        name: 'Fibre',
        target: '28–30 g',
        rationale: 'Supports hormone clearance around the oestrogen peak.',
        foods: 'Beans, oats, chia, lentils, vegetables, raspberries',
        tip: 'A spoon of chia or ground flax on breakfast adds 3–5 g without changing your meal.',
      },
      {
        name: 'Zinc',
        target: '8–10 mg',
        rationale: 'Supports the shift into the luteal phase that follows ovulation.',
        foods: 'Oysters, pumpkin seeds, cashews, chickpeas, beef',
        tip: 'A small handful of pumpkin seeds covers a meaningful share of daily zinc.',
      },
    ],
    reduce: [
      {
        name: 'Very high-fat meals pre-session',
        target: 'Within 3h',
        rationale: 'Slows gastric emptying, which can feel uncomfortable before hard intervals.',
        tip: 'A banana or plain toast sits better than a heavy meal in the hour before hard intervals.',
      },
    ],
  },
  luteal: {
    headline: 'Magnesium up, sodium and caffeine down',
    rationale:
      'Progesterone raises resting energy use by roughly 5–10%, and bloating, cravings and sleep disruption are among the most commonly reported symptoms in the days before a period.',
    increase: [
      {
        name: 'Magnesium',
        target: '~360 mg/day',
        rationale: 'Associated with lower cramp and mood-symptom scores in several small trials.',
        foods: 'Pumpkin seeds, dark chocolate (70%+), spinach, black beans, almonds',
        tip: 'A square or two of dark chocolate in the afternoon is a genuinely evidence-friendly way to hit this.',
      },
      {
        name: 'Complex carbs',
        target: '+150–250 kcal',
        rationale: 'Covers the small rise in resting energy use typical of this phase.',
        foods: 'Oats, quinoa, sweet potato, brown rice',
        tip: 'A small extra portion at your usual meals is simpler than adding a new snack.',
      },
      {
        name: 'Calcium',
        target: '~1000 mg/day',
        rationale: 'Trialled for premenstrual symptom relief; easiest to hit with two servings a day.',
        foods: 'Yoghurt, tinned sardines, fortified soy milk, calcium-set tofu, kale',
        tip: 'Pair a calcium source with breakfast and dinner rather than trying to get it all at once.',
      },
    ],
    reduce: [
      {
        name: 'Sodium',
        target: 'Under 2 g/day',
        rationale: 'High sodium intake is a common contributor to the bloating many people notice late in this phase.',
        tip: "Check sauces and condiments — they're often the biggest hidden source, more than the salt shaker.",
      },
      {
        name: 'Caffeine',
        target: 'One cup, before 12:00',
        rationale: 'Afternoon caffeine is one of the more common disruptors of sleep quality, which is already more fragile in this window for many people.',
        tip: 'Herbal tea or decaf in the afternoon keeps the ritual without the sleep cost.',
      },
    ],
  },
};

export const SYMPTOMS = ['Cramps', 'Bloating', 'Headache', 'Cravings', 'Low mood'] as const;
export type Symptom = (typeof SYMPTOMS)[number];

export const FLOW_LEVELS = ['Light', 'Medium', 'Heavy'] as const;
export type FlowLevel = (typeof FLOW_LEVELS)[number];

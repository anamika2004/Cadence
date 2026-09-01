// Real cycle math, replacing the hardcoded "day 17 of 29" shim in the
// design prototype. Phase boundaries scale with the user's own average
// cycle length: luteal stays a fixed ~13 days (the stable phase) and
// ovulatory a fixed 4-day window; follicular absorbs whatever is left.
// See design_handoff_cadence/README.md, "State" section.
import { PhaseKey, PHASE_ORDER } from '../theme/tokens';
import { addDays, diffDays } from './date';
import { FlowLevel } from './content';

export type DailyLog = {
  date: string; // ISO yyyy-MM-dd
  energy?: 1 | 2 | 3 | 4 | 5;
  symptoms: string[];
  flow?: FlowLevel;
  sessionLogged?: boolean;
  loggedAt?: string; // ISO timestamp of the last edit, for the "Saved HH:MM" status line
};

export type CycleProfile = {
  // Ascending, oldest first. Each date is the first day of a period.
  periodStarts: string[];
  // User-entered starting estimates (editable in Settings); used until
  // enough real cycles are logged to compute these directly.
  typicalCycleLength: number;
  typicalPeriodLength: number;
};

const OVULATORY_LEN = 4;
const LUTEAL_LEN = 13;
const MIN_CYCLES_FOR_CONFIDENCE = 3;
const MIN_CYCLES_FOR_PATTERN = 2;

export function sortedStarts(profile: CycleProfile): string[] {
  return [...profile.periodStarts].sort();
}

export function cycleLengthIntervals(profile: CycleProfile): number[] {
  const s = sortedStarts(profile);
  const intervals: number[] = [];
  for (let i = 1; i < s.length; i++) intervals.push(diffDays(s[i - 1], s[i]));
  return intervals.slice(-6);
}

export type AverageResult = { value: number; stdDev?: number; sampleSize: number };

export function averageCycleLength(profile: CycleProfile): AverageResult {
  const intervals = cycleLengthIntervals(profile);
  if (intervals.length === 0) {
    return { value: profile.typicalCycleLength, sampleSize: 0 };
  }
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  let stdDev: number | undefined;
  if (intervals.length >= 2) {
    const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / (intervals.length - 1);
    stdDev = Math.sqrt(variance);
  }
  return { value: Math.round(mean * 10) / 10, stdDev, sampleSize: intervals.length };
}

function periodLengthForCycle(start: string, next: string | undefined, logs: DailyLog[]): number | undefined {
  const byDate = new Map(logs.map((l) => [l.date, l]));
  let count = 0;
  let d = start;
  while (!next || d < next) {
    const log = byDate.get(d);
    if (!log?.flow) break;
    count++;
    d = addDays(d, 1);
  }
  return count > 0 ? count : undefined;
}

export function averagePeriodLength(profile: CycleProfile, logs: DailyLog[]): AverageResult {
  const s = sortedStarts(profile);
  const lengths: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const len = periodLengthForCycle(s[i], s[i + 1], logs);
    if (len) lengths.push(len);
  }
  if (lengths.length === 0) return { value: profile.typicalPeriodLength, sampleSize: 0 };
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  return { value: Math.round(mean * 10) / 10, sampleSize: lengths.length };
}

export type PhaseBoundaries = Record<PhaseKey, { start: number; end: number }>;

export function phaseBoundaries(cycleLength: number, periodLength: number): PhaseBoundaries {
  const luteal = Math.min(LUTEAL_LEN, Math.max(8, cycleLength - periodLength - 5));
  const ovulatory = Math.min(OVULATORY_LEN, Math.max(2, cycleLength - periodLength - luteal));
  const follicular = Math.max(1, cycleLength - periodLength - ovulatory - luteal);
  const mEnd = periodLength;
  const fEnd = mEnd + follicular;
  const oEnd = fEnd + ovulatory;
  return {
    menstrual: { start: 1, end: mEnd },
    follicular: { start: mEnd + 1, end: fEnd },
    ovulatory: { start: fEnd + 1, end: oEnd },
    luteal: { start: oEnd + 1, end: cycleLength },
  };
}

export function phaseKeyForDay(day: number, boundaries: PhaseBoundaries): PhaseKey {
  for (const k of PHASE_ORDER) if (day >= boundaries[k].start && day <= boundaries[k].end) return k;
  return 'luteal';
}

// Cycle day for any date, given the user's logged period starts. Dates
// before the first logged period are extrapolated backward using the
// average cycle length (used sparingly — mainly for calendar edges).
export function cycleDayFor(dateISO: string, profile: CycleProfile, avgCycleLength: number): number {
  const s = sortedStarts(profile);
  if (s.length === 0) return 1;
  let latest: string | undefined;
  for (const start of s) {
    if (start <= dateISO) latest = start;
    else break;
  }
  if (latest) return diffDays(latest, dateISO) + 1;
  const first = s[0];
  const diff = diffDays(dateISO, first);
  const mod = diff % avgCycleLength;
  return mod === 0 ? avgCycleLength : avgCycleLength - mod + 1;
}

export type Prediction = {
  nextPeriodDate: string;
  confidenceDays: number;
  lowData: boolean;
  fertileStart: string;
  fertileEnd: string;
  fertilePassed: boolean;
  sampleSize: number;
};

export function predict(profile: CycleProfile, logs: DailyLog[], todayISO: string): Prediction {
  const s = sortedStarts(profile);
  const last = s[s.length - 1];
  const cycleLen = averageCycleLength(profile);
  const periodLen = averagePeriodLength(profile, logs);
  const nextPeriodDate = addDays(last, Math.round(cycleLen.value));
  const lowData = cycleLen.sampleSize < MIN_CYCLES_FOR_CONFIDENCE;
  const confidenceDays = lowData ? 5 : Math.max(1, Math.round(cycleLen.stdDev ?? 2));

  const bounds = phaseBoundaries(Math.round(cycleLen.value), Math.round(periodLen.value));
  const fertileStart = addDays(last, bounds.ovulatory.start - 1);
  const fertileEnd = addDays(last, bounds.ovulatory.end - 1);

  return {
    nextPeriodDate,
    confidenceDays,
    lowData,
    fertileStart,
    fertileEnd,
    fertilePassed: todayISO > fertileEnd,
    sampleSize: cycleLen.sampleSize,
  };
}

// Real, honest pattern insight: only speaks when at least two cycles of
// logged energy overlap on the same cycle-day. Returns null otherwise —
// per the handoff, "if there isn't enough data... show nothing."
export function computePatternInsight(profile: CycleProfile, logs: DailyLog[]): string | null {
  const s = sortedStarts(profile);
  if (s.length < MIN_CYCLES_FOR_PATTERN) return null;

  const byDay = new Map<number, number[]>();
  for (let i = 0; i < s.length; i++) {
    const start = s[i];
    const end = s[i + 1];
    for (const log of logs) {
      if (log.energy == null) continue;
      if (log.date < start) continue;
      if (end && log.date >= end) continue;
      const day = diffDays(start, log.date) + 1;
      const arr = byDay.get(day) ?? [];
      arr.push(log.energy);
      byDay.set(day, arr);
    }
  }

  const covered = [...byDay.entries()]
    .filter(([, vals]) => vals.length >= MIN_CYCLES_FOR_PATTERN)
    .map(([day, vals]) => ({ day, mean: vals.reduce((a, b) => a + b, 0) / vals.length }))
    .sort((a, b) => a.day - b.day);

  if (covered.length < 5) return null;

  const overallMean = covered.reduce((a, b) => a + b.mean, 0) / covered.length;
  for (let i = 0; i < covered.length - 1; i++) {
    if (covered[i].mean < overallMean - 0.4 && covered[i + 1].mean < overallMean - 0.4) {
      return `In your logs so far, energy tends to fall from around day ${covered[i].day}. Cadence eases load from there.`;
    }
  }
  return null;
}

export function averageEnergy(logs: DailyLog[]): AverageResult {
  const vals: number[] = [];
  for (const l of logs) if (l.energy != null) vals.push(l.energy);
  if (vals.length === 0) return { value: 0, sampleSize: 0 };
  return { value: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10, sampleSize: vals.length };
}

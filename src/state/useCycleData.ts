import { useMemo } from 'react';
import { useCadence } from './CadenceContext';
import { todayISO } from '../lib/date';
import {
  averageCycleLength,
  averagePeriodLength,
  averageEnergy,
  cycleDayFor,
  phaseBoundaries,
  phaseKeyForDay,
  predict,
  computePatternInsight,
} from '../lib/cycle';
import { PHASES } from '../theme/tokens';

export function useCycleData() {
  const { profile, logs } = useCadence();
  const today = todayISO();
  const logList = useMemo(() => Object.values(logs), [logs]);

  return useMemo(() => {
    const cycleLengthAvg = averageCycleLength(profile);
    const periodLengthAvg = averagePeriodLength(profile, logList);
    const roundedCycleLen = Math.max(15, Math.round(cycleLengthAvg.value));
    const boundaries = phaseBoundaries(roundedCycleLen, Math.round(periodLengthAvg.value));
    const day = profile.periodStarts.length > 0 ? cycleDayFor(today, profile, roundedCycleLen) : 1;
    const dayClamped = ((day - 1) % roundedCycleLen) + 1;
    const phaseKey = phaseKeyForDay(dayClamped, boundaries);
    const phaseDayWithinPhase = dayClamped - boundaries[phaseKey].start + 1;
    const phase = PHASES[phaseKey];

    const prediction = profile.periodStarts.length > 0 ? predict(profile, logList, today) : null;
    const pattern = computePatternInsight(profile, logList);
    const cyclesLogged = Math.max(0, profile.periodStarts.length - 1);
    const energyAvg = averageEnergy(logList);

    return {
      today,
      day: dayClamped,
      cycleLength: roundedCycleLen,
      cycleLengthAvg,
      periodLengthAvg,
      boundaries,
      phaseKey,
      phase,
      phaseDayWithinPhase,
      prediction,
      pattern,
      cyclesLogged,
      energyAvg,
      todayLog: logs[today] ?? { date: today, symptoms: [] },
    };
  }, [profile, logs, logList, today]);
}

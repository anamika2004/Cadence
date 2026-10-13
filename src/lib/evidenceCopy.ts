// Turns a computed PhaseEvidence into a sentence — the only place in the
// app allowed to say "your data" about Move/Fuel, and only when there's
// real data behind it. Returns null when there isn't, so callers can
// simply omit the line rather than show something generic.
import { PhaseEvidence } from './cycle';

export function movementEvidenceLine(ev: PhaseEvidence | null): string | null {
  if (!ev) return null;
  const parts: string[] = [];
  if (ev.avgEnergy != null) parts.push(`energy here has averaged ${ev.avgEnergy}/5`);
  if (ev.sessionsLogged) parts.push(`${ev.sessionsLogged} session${ev.sessionsLogged === 1 ? '' : 's'} logged`);
  if (ev.commonSleep) parts.push(`sleep has most often logged as ${ev.commonSleep.bucket.toLowerCase()} here`);
  if (parts.length === 0) return null;
  return `Across ${ev.cyclesOfData} logged cycle${ev.cyclesOfData === 1 ? '' : 's'}, ${parts.join(' · ')}.`;
}

export function fuelEvidenceLine(ev: PhaseEvidence | null): string | null {
  if (!ev) return null;
  const parts: string[] = [];
  if (ev.topSymptom) {
    parts.push(`you've logged ${ev.topSymptom.name.toLowerCase()} in ${ev.topSymptom.cyclesWithIt} of your last ${ev.cyclesOfData} cycles here`);
  }
  if (ev.commonSleep) parts.push(`sleep has most often logged as ${ev.commonSleep.bucket.toLowerCase()} here`);
  if (ev.avgEnergy != null && !ev.topSymptom) parts.push(`energy here has averaged ${ev.avgEnergy}/5`);
  if (parts.length === 0) return null;
  return `From your data: ${parts.join(' · ')}.`;
}

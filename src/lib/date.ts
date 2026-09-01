// All dates in this app are plain "yyyy-MM-dd" strings compared/added at
// noon UTC, so day-arithmetic never trips over DST or timezone edges.

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function weekdayIndex(iso: string): number {
  return parseNoonUTC(iso).getUTCDay();
}

function parseNoonUTC(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function addDays(iso: string, n: number): string {
  const d = parseNoonUTC(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toISODate(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// b - a, in whole days
export function diffDays(a: string, b: string): number {
  const da = parseNoonUTC(a).getTime();
  const db = parseNoonUTC(b).getTime();
  return Math.round((db - da) / 86400000);
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "Mon 31 Aug" — locale-independent so it matches across devices.
export function formatShort(iso: string): string {
  const d = parseNoonUTC(iso);
  return `${WEEKDAY_NAMES[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]}`;
}

const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatMonthDay(iso: string): string {
  const d = parseNoonUTC(iso);
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function formatMonthYear(iso: string): string {
  const d = parseNoonUTC(iso);
  return `${MONTH_NAMES_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatTime(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

// 0 = Sunday leading blanks for a calendar grid
export function leadingBlanks(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0, 1).getDay();
}

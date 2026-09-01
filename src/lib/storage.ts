import AsyncStorage from '@react-native-async-storage/async-storage';
import { CycleProfile, DailyLog } from './cycle';

const KEYS = {
  profile: '@cadence/profile',
  logs: '@cadence/logs',
} as const;

export async function loadProfile(): Promise<CycleProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.profile);
  return raw ? JSON.parse(raw) : null;
}

export async function saveProfile(profile: CycleProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

// Logs are keyed by ISO date for O(1) lookups.
export async function loadLogs(): Promise<Record<string, DailyLog>> {
  const raw = await AsyncStorage.getItem(KEYS.logs);
  return raw ? JSON.parse(raw) : {};
}

export async function saveLogs(logs: Record<string, DailyLog>): Promise<void> {
  await AsyncStorage.setItem(KEYS.logs, JSON.stringify(logs));
}

export async function deleteAllData(): Promise<void> {
  await AsyncStorage.removeMany([KEYS.profile, KEYS.logs]);
}

export async function exportAllData(): Promise<string> {
  const [profile, logs] = await Promise.all([loadProfile(), loadLogs()]);
  return JSON.stringify({ exportedAt: new Date().toISOString(), profile, logs }, null, 2);
}

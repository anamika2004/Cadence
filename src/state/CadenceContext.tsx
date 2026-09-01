import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CycleProfile, DailyLog } from '../lib/cycle';
import * as storage from '../lib/storage';
import { todayISO } from '../lib/date';
import { FlowLevel } from '../lib/content';

type CadenceContextValue = {
  ready: boolean;
  onboarded: boolean;
  profile: CycleProfile;
  logs: Record<string, DailyLog>;
  completeOnboarding: (profile: CycleProfile) => Promise<void>;
  updateProfile: (patch: Partial<CycleProfile>) => Promise<void>;
  addPeriodStart: (date: string) => Promise<void>;
  removePeriodStart: (date: string) => Promise<void>;
  getLog: (date: string) => DailyLog;
  setEnergy: (date: string, energy: DailyLog['energy']) => Promise<void>;
  toggleSymptom: (date: string, symptom: string) => Promise<void>;
  setFlow: (date: string, flow: FlowLevel | undefined) => Promise<void>;
  setSessionLogged: (date: string, done: boolean) => Promise<void>;
  deleteAllData: () => Promise<void>;
  exportData: () => Promise<string>;
};

const EMPTY_PROFILE: CycleProfile = { periodStarts: [], typicalCycleLength: 28, typicalPeriodLength: 5 };

const CadenceContext = createContext<CadenceContextValue | null>(null);

export function CadenceProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<CycleProfile | null>(null);
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});

  useEffect(() => {
    (async () => {
      const [p, l] = await Promise.all([storage.loadProfile(), storage.loadLogs()]);
      setProfile(p);
      setLogs(l);
      setReady(true);
    })();
  }, []);

  const completeOnboarding = useCallback(async (p: CycleProfile) => {
    await storage.saveProfile(p);
    setProfile(p);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<CycleProfile>) => {
      const next = { ...(profile ?? EMPTY_PROFILE), ...patch };
      await storage.saveProfile(next);
      setProfile(next);
    },
    [profile]
  );

  const addPeriodStart = useCallback(
    async (date: string) => {
      const current = profile ?? EMPTY_PROFILE;
      if (current.periodStarts.includes(date)) return;
      const next = { ...current, periodStarts: [...current.periodStarts, date].sort() };
      await storage.saveProfile(next);
      setProfile(next);
    },
    [profile]
  );

  const removePeriodStart = useCallback(
    async (date: string) => {
      const current = profile ?? EMPTY_PROFILE;
      const next = { ...current, periodStarts: current.periodStarts.filter((d) => d !== date) };
      await storage.saveProfile(next);
      setProfile(next);
    },
    [profile]
  );

  const persistLog = useCallback(
    async (date: string, patch: Partial<Omit<DailyLog, 'date'>>) => {
      setLogs((prev) => {
        const existing = prev[date] ?? { date, symptoms: [] };
        const next = { ...prev, [date]: { ...existing, ...patch, loggedAt: new Date().toISOString() } };
        storage.saveLogs(next);
        return next;
      });
    },
    []
  );

  const getLog = useCallback((date: string): DailyLog => logs[date] ?? { date, symptoms: [] }, [logs]);

  const setEnergy = useCallback(
    async (date: string, energy: DailyLog['energy']) => persistLog(date, { energy }),
    [persistLog]
  );

  const toggleSymptom = useCallback(
    async (date: string, symptom: string) => {
      const current = getLog(date);
      const on = current.symptoms.includes(symptom);
      const symptoms = on ? current.symptoms.filter((s) => s !== symptom) : [...current.symptoms, symptom];
      await persistLog(date, { symptoms });
    },
    [getLog, persistLog]
  );

  const setFlow = useCallback(
    async (date: string, flow: FlowLevel | undefined) => {
      await persistLog(date, { flow });
      // A flow day with no flow logged the day before starts a new
      // logged period; a flow day right after another one is a
      // continuation of the same period.
      if (flow) {
        const yesterday = addDaysLocal(date, -1);
        const isContinuation = !!logs[yesterday]?.flow;
        if (!isContinuation) await addPeriodStart(date);
      }
    },
    [persistLog, logs, addPeriodStart]
  );

  const setSessionLogged = useCallback(
    async (date: string, done: boolean) => persistLog(date, { sessionLogged: done }),
    [persistLog]
  );

  const deleteAllData = useCallback(async () => {
    await storage.deleteAllData();
    setProfile(null);
    setLogs({});
  }, []);

  const exportData = useCallback(() => storage.exportAllData(), []);

  const value = useMemo<CadenceContextValue>(
    () => ({
      ready,
      onboarded: !!profile,
      profile: profile ?? EMPTY_PROFILE,
      logs,
      completeOnboarding,
      updateProfile,
      addPeriodStart,
      removePeriodStart,
      getLog,
      setEnergy,
      toggleSymptom,
      setFlow,
      setSessionLogged,
      deleteAllData,
      exportData,
    }),
    [ready, profile, logs, completeOnboarding, updateProfile, addPeriodStart, removePeriodStart, getLog, setEnergy, toggleSymptom, setFlow, setSessionLogged, deleteAllData, exportData]
  );

  return <CadenceContext.Provider value={value}>{children}</CadenceContext.Provider>;
}

function addDaysLocal(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export function useCadence(): CadenceContextValue {
  const ctx = useContext(CadenceContext);
  if (!ctx) throw new Error('useCadence must be used within CadenceProvider');
  return ctx;
}

export { todayISO };

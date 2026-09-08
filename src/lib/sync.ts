// Best-effort mirror of local data to Supabase, for testers who opt in.
// Every function here swallows its own errors — sync is a bonus layer on
// top of the local-first app, never a dependency. Offline, unconfigured,
// or a flaky connection must never break logging or reading data locally.
import { supabase, ensureAnonSession } from './supabase';
import { CycleProfile, DailyLog } from './cycle';

async function currentUserId(): Promise<string | null> {
  try {
    return await ensureAnonSession();
  } catch (e) {
    console.warn('Cadence sync: could not establish session', e);
    return null;
  }
}

export async function syncProfile(profile: CycleProfile): Promise<void> {
  if (!supabase || !profile.shareDataConsent) return;
  const userId = await currentUserId();
  if (!userId) return;
  try {
    await supabase.from('profiles').upsert({
      user_id: userId,
      typical_cycle_length: profile.typicalCycleLength,
      typical_period_length: profile.typicalPeriodLength,
      period_starts: profile.periodStarts,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Cadence sync: profile push failed', e);
  }
}

export async function syncLog(log: DailyLog, consented: boolean): Promise<void> {
  if (!supabase || !consented) return;
  const userId = await currentUserId();
  if (!userId) return;
  try {
    await supabase.from('daily_logs').upsert(
      {
        user_id: userId,
        log_date: log.date,
        energy: log.energy ?? null,
        symptoms: log.symptoms,
        flow: log.flow ?? null,
        session_logged: log.sessionLogged ?? null,
        logged_at: log.loggedAt ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,log_date' }
    );
  } catch (e) {
    console.warn('Cadence sync: log push failed', e);
  }
}

// Full reconciliation push — called once when consent turns on, and on
// app start while consented, to catch anything missed while offline.
export async function syncAll(profile: CycleProfile, logs: Record<string, DailyLog>): Promise<void> {
  if (!supabase || !profile.shareDataConsent) return;
  await syncProfile(profile);
  for (const log of Object.values(logs)) {
    await syncLog(log, true);
  }
}

export async function submitFeedback(helpfulness: number, comments: string): Promise<{ ok: boolean; reason?: string }> {
  if (!supabase) return { ok: false, reason: 'Sync isn’t configured for this build.' };
  const userId = await currentUserId();
  if (!userId) return { ok: false, reason: 'Could not connect right now — check your internet connection and try again.' };
  try {
    const { error } = await supabase.from('feedback').insert({ user_id: userId, helpfulness, comments });
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'Something went wrong.' };
  }
}

// Best-effort deletion of a device's synced rows, called from Settings'
// "Delete all data" so opting out is honored on the server too.
export async function deleteRemoteData(): Promise<void> {
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return;
    await supabase.from('daily_logs').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('user_id', userId);
  } catch (e) {
    console.warn('Cadence sync: remote delete failed', e);
  }
}

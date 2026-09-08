import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Sync is optional: without credentials the app runs fully local, exactly
// as before. See supabase/README.md to provision a project and enable it.
export const syncConfigured = !!url && !!anonKey;

export const supabase: SupabaseClient | null = syncConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Every device gets its own silent, anonymous Supabase auth session — no
// login screen, no email. Row Level Security (see supabase/schema.sql)
// keys every table off this session's user id, so one tester's data is
// never readable or writable by another.
export async function ensureAnonSession(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  if (data.session?.user.id) return data.session.user.id;
  const { data: signed, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.warn('Cadence sync: anonymous sign-in failed', error.message);
    return null;
  }
  return signed.session?.user.id ?? null;
}

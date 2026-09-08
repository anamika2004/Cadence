# Cadence research sync — Supabase setup

This gives you a live, private database of every tester's cycle data
(for those who opt in) and their feedback, so you can see real usage and
ask "is this actually helping." Nobody but you can see it — see the RLS
notes in `schema.sql`.

## One-time setup

1. **Create a project** at [supabase.com](https://supabase.com) (free tier
   is plenty for 50 testers). Note the project's **Project URL** and
   **anon public key** — Settings -> API in the dashboard.

2. **Enable Anonymous Sign-Ins.** In the dashboard: Authentication ->
   Sign In / Providers -> enable "Allow anonymous sign-ins." This is off
   by default and the app won't be able to sync without it — testers
   never see a login screen; the app silently creates an anonymous
   identity per install so Row Level Security can tell devices apart.

3. **Run the schema.** Dashboard -> SQL Editor -> New query -> paste the
   entire contents of `schema.sql` -> Run.

4. **Add the credentials to the app.** In the project root, copy
   `.env.example` to `.env` and fill in the two values from step 1:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
   `.env` is git-ignored — never commit it. Anyone building or publishing
   the app (`npm start`, `eas update`) needs this file present locally.

## Viewing what testers send back

Dashboard -> Table Editor -> `feedback` shows every submission (rating +
comments). `profiles` and `daily_logs` hold the synced cycle data for
anyone who opted in during onboarding or Settings.

A couple of useful SQL Editor queries:

```sql
-- Average helpfulness rating and how many people responded
select round(avg(helpfulness), 2) as avg_helpfulness, count(*) as responses
from feedback;

-- Everyone's latest comment, newest first
select created_at, helpfulness, comments
from feedback
order by created_at desc;

-- How many testers are actively logging (at least one entry in the last 7 days)
select count(distinct user_id) as active_last_7_days
from daily_logs
where updated_at > now() - interval '7 days';
```

## What is and isn't protected

The anon key embedded in the app is meant to be public — it's not a
secret, and by itself grants nothing. Every table has Row Level Security
scoped to `auth.uid()`, which only exists after Supabase's own anonymous
sign-in issues a session, so one tester's app can never read or write
another tester's rows. Anonymous auth sessions aren't tied to a real
identity (no email, no name) — Supabase just remembers "this device has
signed in before" via a token stored on the phone, similar to a cookie.
If a tester deletes and reinstalls the app (or clears app data), they get
a fresh anonymous identity and their old synced rows become orphaned
(still yours to see in the dashboard, just no longer linked to a live
device) — that's an inherent tradeoff of skipping real login for 50
casual testers, not a bug.

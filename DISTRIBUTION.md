# Sharing Cadence with testers (EAS Update + Expo Go)

This publishes the app to Expo's servers so testers can open it via a
link/QR code in the free Expo Go app — no App Store, no cost, and no
need to keep your own computer running. Whenever you change the code,
republish and everyone's copy updates automatically next time they open
Expo Go.

## One-time setup

```cmd
npm install -g eas-cli
eas login
```
Sign in with the same account you're already using (`candenceapp`).

```cmd
eas update:configure
```
This links the project to your Expo account and fills in the required
`extra.eas.projectId` / `updates.url` fields in `app.json` — nothing to
edit by hand.

## Publish an update

```cmd
eas update --branch preview --message "Describe what changed"
```
This uploads the current code and prints a QR code / link.

## Give it to testers

Share the printed link (or its QR code) with your 50 people. They need
the free **Expo Go** app installed (same one used for local dev), then
open the link — no Expo account required on their end. Opening it once
is enough; from then on Expo Go remembers it, and the next time you run
`eas update`, their app picks up the new version automatically the next
time they open it.

## After changing anything

Just re-run the publish command:
```cmd
eas update --branch preview --message "What changed this time"
```
No need to reconfigure — testers get the new version automatically.

## Note on Supabase sync

If you want the synced-data / feedback features live for testers, make
sure your `.env` (see `supabase/README.md`) is present and filled in
*before* running `eas update` — the credentials get baked into the
published bundle at publish time, not read from the phone at runtime.

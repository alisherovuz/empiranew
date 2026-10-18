# Empira launch changes

This branch keeps the existing 45 grade-7 and 43 grade-8 labs and Build Mode.
It adds a searchable student dashboard, per-account saved experiments, real Continue,
honest teacher feature labels, profile-error recovery, lab recovery screens,
scanner authentication/limits, and protected Telegram OTP exchange.

## Required deployment steps (before merging to main)

1. Run `supabase/migrations/20261018_launch_readiness.sql` in the existing Supabase
   project after the earlier profile/auth migrations. This is additive. It creates
   private rate counters, service-only Telegram RPCs, and own-account RLS for
   `lab_progress`. Check that the existing `telegram_codes.code` column is text.
2. Add a random `TELEGRAM_WEBHOOK_SECRET` (32+ characters, Telegram's allowed
   alphabet A-Z/a-z/0-9/_/-) to Vercel. Keep the same value in Telegram's
   `setWebhook.secret_token`. Telegram endpoints fail closed if configuration
   or the RPC migration is missing.
3. Configure the existing bot's webhook with the helper below, **only when the
   corresponding deployment is ready**. A bot has one webhook: do not point
   the production bot at a temporary preview. For preview testing, use a separate
   test bot/environment or plan the production cutover together.
4. Ensure Google OAuth allows the selected preview URL if testing sign-in there.
5. Validate real Google and Telegram logins, two different users on one phone,
   reload/Continue, another device, camera scanning, and low-end-phone WebGL.
6. Merge only after preview and CI pass and the database/environment steps are
   complete. Production deploys automatically when main changes.

Webhook helper (reads secrets from the local process; never put tokens in source):
`TELEGRAM_WEBHOOK_URL=https://test.empira.uz/api/telegram/bot node scripts/configure-telegram-webhook.cjs`
Supply TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET through your secure environment.

### Existing Telegram passwords and secret rotation
APP_SECRET currently falls back to SUPABASE_SERVICE_KEY. Changing either effective
password secret without migrating existing Supabase Auth passwords locks those
Telegram users out. Do not introduce a new APP_SECRET blindly.
Verify whether the previously exposed service key was rotated. If rotation remains
necessary, migrate Telegram passwords and deploy the matching new APP_SECRET in a
coordinated cutover; do not keep an exposed signing/password secret as the solution.
No live secrets have been read or changed by this branch.

## Behaviour and limits

- The student dashboard itself is the lab catalogue. Teachers keep their tools;
  the presentation entry offers the working Ohm's-law example, and reports clearly
  remain a sample. This does not implement AI slide generation or real class reports.
- Each account has separate local progress. Build drafts include equipment,
  validated wires, measurement controls/results, and best stars. Ready experiments
  also resume. Old anonymous/device-wide stars are deliberately not assigned to a user.
- Progress syncs to Supabase after changes. If sync fails, local progress remains
  and the UI says so. Cross-device resume requires the SQL migration and successful
  sync; the first device must have saved before the second opens the experiment.
  Concurrent editing on multiple devices uses the last saved version.
- Hints do not reduce practice stars. Restart confirms before clearing a draft.
- Page session checks guide access; they are NOT a substitute for database RLS.
  Scanner API validates the Supabase token server-side.
- Rate limits are stored in Postgres, shared by Vercel instances. Telegram verify:
  10 attempts / 5 minutes / source IP, plus 300 / minute globally. A shared school
  connection shares this IP allowance; monitor legitimate limits and adjust with
  care. OTP issue: 3 / 5 minutes / Telegram account. Scanner: 10 / minute / account
  and 120 / minute globally. The source-IP helper assumes Vercel/trusted proxy headers.
- Scanner demonstration mode is explicit `?taqdimot=1` and shows a DEMO notice.
- Current-week suggestions require an explicit `?hafta=`; no demo week is presented
  as the actual current week.
- Mobile rendering uses a lower pixel ratio, and hidden tabs skip scene rendering.
  Per-lab code splitting and a true offline/PWA mode are future work.

## Verification

`npm install --ignore-scripts && npm test`
`npx playwright install chromium && npm run test:ui`

GitHub Actions also runs the migration on an isolated PostgreSQL 16 database,
checks RLS, concurrent OTP consumption and concurrent rate limiting, and runs
Chromium browser tests with mocked authentication. These tests never contact the
live Supabase project, Telegram bot or Gemini. Live provider tests and physical
phone testing remain required before launch.

# Membership reliability and deployment

The code changes are accompanied by a production database release applied on 2026-10-26. No hosted Auth accounts were created or deleted during the release.

## Identity rules
- Emails are trimmed and case-normalized. Supabase Auth owns authentication identity; an obfuscated repeated-signup response is never treated as a new persisted account.
- Profiles have unique canonical emails from Auth. Each user has one application and one issued membership ID.
- PostgreSQL enforces verified email, actual profile completion, published universities, administrator privileges and review transitions.
- Membership changes, notifications, audit events and certificate snapshots commit together.
- Issued certificate details are immutable even if the current profile changes.
- PDF downloads require the owner or an administrator; public previews and QR verification remain available.
- The repair migration publishes Albukhary International University using a real directory record.

## Production rollout
1. Back up the database and identify which migrations are already applied. Never replay the initial bootstrap over an existing database.
2. Apply missing prerequisites in order, then supabase/migrations/20261026055339_membership_reliability.sql.
3. The repair refuses duplicate canonical member emails. Resolve reported duplicates through reviewed account recovery; it never deletes or merges people automatically.
4. Deploy the application after the migration succeeds. Reapplying the repair preserves IDs and snapshots and never rewinds the sequence.
5. Verify Supabase email confirmation, SMTP, Google OAuth and allowed callback URLs in staging. Do not expose service-role secrets to browsers.

Production ASAM Platform (qvxoshmrlsuullbulfty) was updated through the connected Supabase administrator on 2026-10-26. The database originally had no migration history. After inspecting the schema, the missing member portal tables, certificate number helper, and membership reliability repair were applied together as `membership_portal_reliability_release` in one transaction. Do not blindly run all historical migrations against this database; reconcile its baseline before a future CLI db push.

Post-release checks preserved eight profiles and eight applications, including seven approved memberships with seven certificate snapshots. Albukhary International University is published. Local affected-record snapshots and prior function/policy definitions are stored under the Git-ignored `artifacts/release-backup/` directory; these are not a complete disaster-recovery database backup.

## Verification
Run npm test, npm run lint, npm run typecheck, npm run build, and npm audit.
The embedded PostgreSQL suite replays every migration and tests real roles/RLS, forged completion, canonical email uniqueness, review/reject/resubmit/approve, snapshots, notifications, events, rollback, throttles and pagination over 1,000 records.
It does not emulate GoTrue, SMTP, Google or the deployment's Chromium runtime. In staging, repeat signup with email case/whitespace variations; confirm one persisted Auth user/profile/application and one member ID. Verify confirmation, Google identity linking, recovery and a real PDF download.

## Limits and retention
Contacts: three messages per normalized email per ten minutes; shared ceiling 300 per ten minutes. Database-controlled timestamps prevent direct-API backdating.
Downloads: five per account per minute; shared ceiling 60 per minute. Each process permits at most two Chromium renderers with explicit timeouts. Deployment IP/firewall protections and Supabase Auth abuse controls are still separate settings.
Approved snapshots use restrictive foreign keys. Deleting an approved Auth account requires an explicit retention workflow.
Historical approved snapshots use data available when the repair runs; earlier overwritten profile values cannot be reconstructed.

## Read-only database verification
Expected: one published Albukhary entry; no duplicate normalized profile emails; no duplicate application user IDs; no approved applications without snapshots.
Suggested queries are intentionally read-only:
~~~sql
select name,status from public.universities where lower(btrim(name))='albukhary international university';
select lower(btrim(email)),count(*) from public.member_profiles group by lower(btrim(email)) having count(*)>1;
select user_id,count(*) from public.membership_applications group by user_id having count(*)>1;
select a.member_id from public.membership_applications a left join public.membership_certificates c on c.application_id=a.id where a.status='approved' and c.application_id is null;
~~~

## Browser check
Start the production build on port 3100, then run npm run test:browser. Set MEMBERSHIP_TEST_ORIGIN for a different local URL and CHROME_PATH if Chrome/Edge is not installed at a standard path. The check validates 12 responsive screens, an invalid registration server action without creating an account, protected-route redirects and anonymous PDF denial. Screenshots are saved under artifacts/.

The framework is pinned to Next.js 15.5.28 with React 19. Patched PostCSS and selector-parser overrides remove transitive advisories; the production build verifies their compatibility with the existing Tailwind theme.

# DataDiction MVP

DataDiction MVP is a standalone Next.js application for validating the first product flow of DataDiction / SceneContext Engine. It provides a dashboard-style interface for B2B AI data diagnostics, dataset registry review, scene-context analysis, risk diagnostics, reports, settings, and audit logs.

The app is deployed on Vercel and reads seeded MVP data from Supabase when the required server environment variables are available. When Supabase cannot be reached, the app falls back to built-in demo data and shows that state in the UI.

## Deployment URL

- Production: https://datadiction-mvp.vercel.app/

## Verified Routes

The following Vercel routes have been confirmed to open successfully:

- https://datadiction-mvp.vercel.app/
- https://datadiction-mvp.vercel.app/analysis
- https://datadiction-mvp.vercel.app/datasets
- https://datadiction-mvp.vercel.app/diagnostics
- https://datadiction-mvp.vercel.app/reports
- https://datadiction-mvp.vercel.app/settings
- https://datadiction-mvp.vercel.app/audit-logs

## Supabase Integration

The MVP currently reads from these Supabase resources:

| App area | Query function | Supabase resource |
| --- | --- | --- |
| Datasets | `getDataDictionDatasetsResult` | `datadiction_datasets` table |
| Audit logs | `getDataDictionAuditEventsResult` | `datadiction_audit_events` table |
| Analysis / diagnostics / scene data | `getDataDictionScenesResult` | `datadiction_scene_overview` view |

The SQL setup files are:

- `supabase/migrations/202605280001_datadiction_mvp.sql`
- `supabase/seed/datadiction_mvp_seed.sql`

## Environment Variables

Set these in Vercel Project Settings > Environment Variables and in local `.env.local` when running against Supabase.

| Variable | Purpose | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Public project URL only, not a secret. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key | Public browser-safe key for future client-side features. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase access | Secret. Never expose in client code and never commit the value. |
| `ADMIN_PASSWORD` | Admin/demo gate value | Secret. Never commit the value. |

Do not write real environment variable values in this README. Do not commit `.env.local` or any service role key.

Because the current Supabase migration enables RLS and does not yet define public read policies, server-side data loading relies on `SUPABASE_SERVICE_ROLE_KEY`.

## Local Development

Install dependencies:

```bash
npm install
```

Create a local environment file from the example, then fill in values locally only:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000.

If Supabase environment variables are missing, the app still runs with built-in demo fallback data.

## Build And Lint

```bash
npm run build
npm run lint
```

Optional deployment readiness check:

```bash
npm run datadiction:check
```

## Data Source Badge

Pages that read Supabase data show a data-source badge:

- `Live Supabase`: the page successfully loaded data from Supabase.
- `Demo fallback`: Supabase was not available, returned no rows, or produced a query error, so the page is showing built-in demo data.

When fallback mode is active, the page also shows a short notice explaining the reason, such as missing environment variables or a failed Supabase query.

## Current MVP Scope

The current MVP includes:

- B2B AI data diagnostics dashboard UI.
- Dataset registry and review coverage view.
- SceneContext analysis workspace with ingestion form, processing pipeline, scene preview, and selected inference panel.
- Rights, ethics, and context-risk diagnostics screen.
- Report list and report generation entry points.
- Settings screen for organization and model policy configuration.
- Audit log timeline for traceability.
- Supabase-backed MVP data reads with demo fallback behavior.
- Vercel production deployment.

## Next Development Tasks

Recommended next tasks:

- Connect video upload to Supabase Storage.
- Implement an analysis route handler or background job for SceneContext inference.
- Persist reviewer label edits and approvals to `datadiction_reviews`.
- Add Supabase Auth and role-based access for reviewers and admins.
- Add read policies or API boundaries if moving away from service-role-only server reads.
- Generate downloadable reports as PDF, CSV, or Excel files.
- Add automated smoke tests for the verified production routes.
- Expand seed data to cover more dataset, scene, and audit scenarios.

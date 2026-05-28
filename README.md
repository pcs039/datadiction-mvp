# DataDiction MVP

DataDiction MVP is a standalone Next.js application for validating the first product flow of DataDiction / SceneContext Engine. It is a first-pass operations-console PoC for B2B AI data diagnostics, dataset registry review, scene-context analysis, risk diagnostics, report drafting, video upload intake, settings, and audit logs.

The app is deployed on Vercel and reads MVP data from Supabase when the required server environment variables are available. When Supabase cannot be reached, the app falls back to built-in demo data and shows that state in the UI.

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
| Uploaded videos queue | `getDataDictionUploadedVideosResult` | `datadiction_videos` + `datadiction_datasets` tables |
| Audit logs | `getDataDictionAuditEventsResult` | `datadiction_audit_events` table |
| Analysis / diagnostics / scene data | `getDataDictionScenesResult` | `datadiction_scene_overview` view |

Server route handlers also write to:

- `datadiction_datasets`
- `datadiction_videos`
- `datadiction_reviews`
- `datadiction_audit_events`
- Supabase Storage bucket `datadiction-assets`

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

- Supabase-backed B2B AI data diagnostics dashboard.
- Dataset registry, dataset detail pages, and review coverage view.
- Scene detail pages backed by `datadiction_scene_overview`.
- Review Decision actions that update `datadiction_scenes.review_status`.
- Review history inserts into `datadiction_reviews`.
- Audit log inserts into `datadiction_audit_events`.
- SceneContext analysis workspace with video ingestion form, uploaded videos queue, processing pipeline, scene preview, and selected inference panel.
- Video upload Stub to Supabase Storage.
- Uploaded Videos / Not processed queue for recently uploaded files.
- Clear separation between Scene Package Preview and the upload queue.
- Rights, ethics, and context-risk diagnostics screen.
- Data Suitability Statement draft generation from current Supabase data.
- Report list and report generation entry points.
- Settings screen for organization and model policy configuration.
- Audit log timeline for traceability.
- Audit event timestamp display in KST.
- Supabase-backed MVP data reads with demo fallback behavior and Live Supabase / Demo fallback badges.
- Legacy `/datadiction` route redirects to root-based routes.
- Vercel production deployment.

## Video Upload Stub

The MVP supports a first-pass video upload Stub from `/analysis`.

What it does:

- Uploads the selected video file to Supabase Storage bucket `datadiction-assets`.
- Creates a new `datadiction_datasets` row with status `UPLOADED`.
- Creates a linked `datadiction_videos` row with `file_name`, `file_format`, `source_type`, `rights_note`, and `storage_path`.
- Writes an upload event to `datadiction_audit_events`.
- Shows the uploaded item in `/analysis` under `Uploaded Videos / Not processed queue`.
- Reflects uploaded datasets in the Dashboard as analysis-pending data.

What it does not do yet:

- Uploaded videos are registered as pre-analysis assets only.
- No `datadiction_scenes` rows are created by the upload Stub.
- No `datadiction_scene_overview` rows are created by the upload Stub.
- Uploaded videos therefore do not appear in Scene Package Preview until a later preprocessing and inference pipeline creates scene-level records.

Large video files are not recommended yet because Vercel and Supabase request/storage limits may apply. Use small sample files for MVP checks.

## Not Yet Implemented

The following are intentionally outside the current MVP scope:

- Scene segmentation.
- STT.
- Frame extraction.
- AI auto-analysis.
- Video playback.
- Signed URL preview or download flow.
- Background job queue.
- Production-grade upload processing, retry, and cleanup workflow.

During the cooperation period, AI engineering talent is expected to connect the preprocessing and inference pipeline that turns uploaded videos into scene-level records, inference outputs, and review candidates.

## Next Development Tasks

Recommended next tasks:

- Connect preprocessing outputs so uploaded videos create `datadiction_scenes` and `datadiction_scene_overview` records.
- Implement an analysis route handler or background job for SceneContext inference.
- Add upload retry/cleanup handling for partial Storage or DB failures.
- Add Supabase Auth and role-based access for reviewers and admins.
- Add read policies or API boundaries if moving away from service-role-only server reads.
- Generate downloadable reports as PDF, CSV, or Excel files.
- Add automated smoke tests for the verified production routes.
- Expand seed data to cover more dataset, scene, and audit scenarios.

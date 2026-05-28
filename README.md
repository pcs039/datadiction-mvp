# DataDiction MVP

Standalone Next.js MVP for DataDiction / SceneContext Engine.

## Local

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Supabase

Run the SQL files in order:

1. `supabase/migrations/202605280001_datadiction_mvp.sql`
2. `supabase/seed/datadiction_mvp_seed.sql`

## Deploy

Set these environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `ADMIN_PASSWORD`
- `SUPABASE_SERVICE_ROLE_KEY`

Then deploy this folder as its own Vercel project.

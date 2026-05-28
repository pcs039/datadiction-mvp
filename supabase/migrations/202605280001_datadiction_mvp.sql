create extension if not exists pgcrypto;

create table if not exists public.datadiction_datasets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  owner_org text not null,
  source_type text not null,
  videos_count integer not null default 0,
  scenes_count integer not null default 0,
  review_rate integer not null default 0 check (review_rate between 0 and 100),
  suitability_grade text not null default 'B',
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.datadiction_videos (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.datadiction_datasets(id) on delete cascade,
  code text not null unique,
  file_name text not null,
  file_format text not null,
  duration_text text,
  resolution text,
  source_type text,
  rights_note text,
  storage_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.datadiction_scenes (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.datadiction_videos(id) on delete cascade,
  scene_code text not null unique,
  start_time text not null,
  end_time text not null,
  duration_sec numeric(10, 3),
  segmentation_confidence numeric(4, 3),
  scene_summary text not null,
  visual_summary text,
  speech_summary text,
  representative_frame_path text,
  review_status text not null default 'REVIEW_REQUIRED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.datadiction_scene_inference (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null unique references public.datadiction_scenes(id) on delete cascade,
  speech_screen_relation text not null,
  scene_function_primary text not null,
  scene_function_secondary text not null,
  emotion_tags text[] not null default '{}',
  narrative_roles text[] not null default '{}',
  context_dependency_score numeric(4, 3) not null default 0,
  confidence_score integer not null default 0 check (confidence_score between 0 and 100),
  suitability_score integer not null default 0 check (suitability_score between 0 and 100),
  review_priority text not null default 'MEDIUM',
  reasoning_evidence text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.datadiction_risk_candidates (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.datadiction_scenes(id) on delete cascade,
  tag text not null,
  confidence numeric(4, 3) not null default 0,
  reason text,
  priority text not null default 'MEDIUM',
  created_at timestamptz not null default now()
);

create table if not exists public.datadiction_reviews (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.datadiction_scenes(id) on delete cascade,
  reviewer_name text not null,
  field_name text not null,
  before_value text,
  after_value text,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.datadiction_audit_events (
  id uuid primary key default gen_random_uuid(),
  event_time timestamptz not null default now(),
  actor text not null,
  action text not null,
  target text not null,
  detail text not null,
  tone text not null default 'blue'
);

create index if not exists datadiction_videos_dataset_id_idx
  on public.datadiction_videos(dataset_id);

create index if not exists datadiction_scenes_video_id_idx
  on public.datadiction_scenes(video_id);

create index if not exists datadiction_scene_inference_scene_id_idx
  on public.datadiction_scene_inference(scene_id);

create index if not exists datadiction_risk_candidates_scene_id_idx
  on public.datadiction_risk_candidates(scene_id);

create or replace view public.datadiction_scene_overview as
select
  s.scene_code as id,
  s.start_time || '-' || s.end_time as time,
  s.scene_summary as summary,
  i.scene_function_secondary as function_label,
  i.speech_screen_relation as relation,
  i.emotion_tags as emotion,
  i.narrative_roles as narrative,
  i.context_dependency_score as cds,
  i.confidence_score as confidence,
  i.suitability_score as suitability,
  i.review_priority as risk,
  s.review_status as status,
  coalesce(i.reasoning_evidence, '') as evidence,
  coalesce(array_remove(array_agg(r.tag order by r.tag), null), '{}'::text[]) as tags
from public.datadiction_scenes s
join public.datadiction_scene_inference i on i.scene_id = s.id
left join public.datadiction_risk_candidates r on r.scene_id = s.id
group by
  s.scene_code,
  s.start_time,
  s.end_time,
  s.scene_summary,
  i.scene_function_secondary,
  i.speech_screen_relation,
  i.emotion_tags,
  i.narrative_roles,
  i.context_dependency_score,
  i.confidence_score,
  i.suitability_score,
  i.review_priority,
  s.review_status,
  i.reasoning_evidence;

alter table public.datadiction_datasets enable row level security;
alter table public.datadiction_videos enable row level security;
alter table public.datadiction_scenes enable row level security;
alter table public.datadiction_scene_inference enable row level security;
alter table public.datadiction_risk_candidates enable row level security;
alter table public.datadiction_reviews enable row level security;
alter table public.datadiction_audit_events enable row level security;

insert into storage.buckets (id, name, public)
values ('datadiction-assets', 'datadiction-assets', false)
on conflict (id) do nothing;

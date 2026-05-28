insert into public.datadiction_datasets (
  id,
  code,
  name,
  owner_org,
  source_type,
  videos_count,
  scenes_count,
  review_rate,
  suitability_grade,
  status
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'VIDSET-001',
    '지역 기록 영상 PoC',
    '○○문화재단',
    '지역 기록',
    4,
    184,
    68,
    'B+',
    'Active'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'VIDSET-002',
    '공공 홍보 영상 샘플',
    '공공기관 홍보팀',
    '홍보·정책',
    7,
    312,
    42,
    'B',
    'Ingesting'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'VIDSET-003',
    '교육 행사 아카이브',
    '지역 교육센터',
    '교육·행사',
    3,
    96,
    81,
    'A-',
    'Reviewed'
  )
on conflict (code) do update set
  name = excluded.name,
  owner_org = excluded.owner_org,
  source_type = excluded.source_type,
  videos_count = excluded.videos_count,
  scenes_count = excluded.scenes_count,
  review_rate = excluded.review_rate,
  suitability_grade = excluded.suitability_grade,
  status = excluded.status,
  updated_at = now();

insert into public.datadiction_videos (
  id,
  dataset_id,
  code,
  file_name,
  file_format,
  duration_text,
  resolution,
  source_type,
  rights_note
) values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  'VID-LOCAL-001',
  'local_archive_sample_01.mp4',
  'mp4',
  '00:42:18',
  '1920x1080',
  '지역 기록',
  '내부 촬영본. 일부 외부 자료화면 포함 가능성 있음.'
)
on conflict (code) do update set
  file_name = excluded.file_name,
  duration_text = excluded.duration_text,
  rights_note = excluded.rights_note;

insert into public.datadiction_scenes (
  id,
  video_id,
  scene_code,
  start_time,
  end_time,
  duration_sec,
  segmentation_confidence,
  scene_summary,
  visual_summary,
  speech_summary,
  review_status
) values
  (
    '00000001-0001-4001-8001-000000000001',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'SCN_0001',
    '00:01:10',
    '00:01:42',
    32,
    0.84,
    '농촌 마을 길을 걷는 고령 주민과 공동체 회상 발화',
    '시골길, 주택, 논밭, 고령 주민',
    '마을 공동체의 오래된 기억과 상호부조 설명',
    'REVIEW_REQUIRED'
  ),
  (
    '00000008-0008-4008-8008-000000000008',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'SCN_0008',
    '00:04:18',
    '00:04:51',
    33,
    0.81,
    '정책 담당자 인터뷰와 현장 지원 사업 설명',
    '사무실 인터뷰, 정책 자료, 현장 인서트',
    '정책 담당자가 지원 사업의 핵심 목적을 설명',
    'IN_REVIEW'
  ),
  (
    '00000017-0017-4017-8017-000000000017',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'SCN_0017',
    '00:09:32',
    '00:09:58',
    26,
    0.89,
    '행사장 전경, 참가자 이동, 현장 분위기 스케치',
    '행사장 전경, 참가자 이동, 부스',
    '발화 없음 또는 배경음 중심',
    'CONFIRMED'
  ),
  (
    '00000024-0024-4024-8024-000000000024',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'SCN_0024',
    '00:13:04',
    '00:13:46',
    42,
    0.77,
    '아동 체험 활동과 교육 효과를 설명하는 내레이션',
    '아동 체험 활동, 교육 공간, 교구',
    '교육 효과를 설명하는 내레이션',
    'REVIEW_REQUIRED'
  )
on conflict (scene_code) do update set
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  scene_summary = excluded.scene_summary,
  visual_summary = excluded.visual_summary,
  speech_summary = excluded.speech_summary,
  review_status = excluded.review_status,
  updated_at = now();

insert into public.datadiction_scene_inference (
  scene_id,
  speech_screen_relation,
  scene_function_primary,
  scene_function_secondary,
  emotion_tags,
  narrative_roles,
  context_dependency_score,
  confidence_score,
  suitability_score,
  review_priority,
  reasoning_evidence
) values
  (
    '00000001-0001-4001-8001-000000000001',
    'EMOTIONAL_REINFORCEMENT',
    'BROLL',
    'EMOTIONAL_BROLL',
    array['NOSTALGIA','WARMTH'],
    array['RECOLLECTION','CONTEXT_BRIDGE'],
    0.72,
    82,
    61,
    'HIGH',
    '발화는 마을 공동체의 기억을 설명하고, 화면은 노부부와 시골길을 보여주어 향수와 공동체 정서를 보강합니다.'
  ),
  (
    '00000008-0008-4008-8008-000000000008',
    'EXPLANATORY_INSERT',
    'INTERVIEW',
    'CORE_INTERVIEW',
    array['GRAVITY'],
    array['EXPLANATION','EVIDENCE'],
    0.38,
    89,
    78,
    'MEDIUM',
    '담당자 발화가 핵심 정보를 전달하며, 현장 화면은 정책 설명의 근거로 붙어 있습니다.'
  ),
  (
    '00000017-0017-4017-8017-000000000017',
    'BACKGROUND_BROLL',
    'TRANSITION',
    'TRANSITION_CUT',
    array['ACTIVITY'],
    array['TRANSITION'],
    0.18,
    93,
    86,
    'LOW',
    '발화 의존도가 낮고 행사 분위기 전달에 적합해 독립 재사용 가능성이 높습니다.'
  ),
  (
    '00000024-0024-4024-8024-000000000024',
    'DIRECT_MATCH',
    'INSERT',
    'EVIDENCE_INSERT',
    array['JOY','HOPE'],
    array['EVIDENCE','EMOTIONAL_BUILDUP'],
    0.51,
    77,
    54,
    'HIGH',
    '화면과 내레이션은 직접 대응하지만 미성년자 등장 후보로 권리·동의 범위 검수가 필요합니다.'
  )
on conflict (scene_id) do update set
  speech_screen_relation = excluded.speech_screen_relation,
  scene_function_primary = excluded.scene_function_primary,
  scene_function_secondary = excluded.scene_function_secondary,
  emotion_tags = excluded.emotion_tags,
  narrative_roles = excluded.narrative_roles,
  context_dependency_score = excluded.context_dependency_score,
  confidence_score = excluded.confidence_score,
  suitability_score = excluded.suitability_score,
  review_priority = excluded.review_priority,
  reasoning_evidence = excluded.reasoning_evidence,
  updated_at = now();

delete from public.datadiction_risk_candidates
where scene_id in (
  '00000001-0001-4001-8001-000000000001',
  '00000008-0008-4008-8008-000000000008',
  '00000017-0017-4017-8017-000000000017',
  '00000024-0024-4024-8024-000000000024'
);

insert into public.datadiction_risk_candidates (
  scene_id,
  tag,
  confidence,
  reason,
  priority
) values
  (
    '00000001-0001-4001-8001-000000000001',
    'ELDERLY_OR_DECEASED_REVIEW',
    0.76,
    '고령자로 보이는 일반인이 식별 가능한 방식으로 등장합니다.',
    'HIGH'
  ),
  (
    '00000001-0001-4001-8001-000000000001',
    'CONTEXT_DISTORTION_RISK',
    0.68,
    '고향 회상 맥락과 분리해 다른 정책 홍보 맥락으로 사용할 경우 원래 취지가 달라질 수 있습니다.',
    'HIGH'
  ),
  (
    '00000008-0008-4008-8008-000000000008',
    'SPEECH_ISOLATION_RISK',
    0.55,
    '발언만 단독 재사용할 경우 정책 취지가 축약될 수 있습니다.',
    'MEDIUM'
  ),
  (
    '00000017-0017-4017-8017-000000000017',
    'LOW_CONTEXT_DEPENDENCY',
    0.88,
    '단독 사용 가능성이 높은 전환 장면입니다.',
    'LOW'
  ),
  (
    '00000024-0024-4024-8024-000000000024',
    'MINOR_APPEARANCE',
    0.81,
    '미성년자 등장 가능성이 있어 사용 전 동의 범위 검토가 필요합니다.',
    'HIGH'
  ),
  (
    '00000024-0024-4024-8024-000000000024',
    'PORTRAIT_RIGHT_REVIEW',
    0.74,
    '인물 식별 가능성이 있어 초상권 검토가 필요합니다.',
    'HIGH'
  );

insert into public.datadiction_audit_events (
  event_time,
  actor,
  action,
  target,
  detail,
  tone
) values
  (
    '2026-05-27T17:42:00+09:00',
    'AI Pipeline',
    'Generated inference labels',
    'VIDSET-001 / 184 scenes',
    'Scene function, relation, CDS, risk candidates generated.',
    'blue'
  ),
  (
    '2026-05-27T18:05:00+09:00',
    'Reviewer',
    'Changed scene function',
    'SCN_0001',
    'BACKGROUND_BROLL에서 EMOTIONAL_BROLL로 수정했습니다.',
    'violet'
  ),
  (
    '2026-05-27T18:22:00+09:00',
    'Reviewer',
    'Confirmed rights flag',
    'SCN_0024',
    'MINOR_APPEARANCE 후보를 검수 필요 상태로 유지했습니다.',
    'rose'
  ),
  (
    '2026-05-27T18:49:00+09:00',
    'Report Bot',
    'Drafted suitability statement',
    'VIDSET-001',
    'B+ 등급의 데이터 적합성 명세서 초안을 생성했습니다.',
    'gold'
  );

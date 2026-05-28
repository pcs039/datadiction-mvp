# DataDiction MVP Deployment

## 역할 분리

- Vercel: Next.js 앱 호스팅
- Supabase: DataDiction DB, 향후 Auth, Storage, 영상/프레임 파일 관리
- 현재 앱: Supabase 테이블이 있으면 DB 데이터를 읽고, 없으면 내장 데모 데이터로 fallback

## Vercel 환경변수

Vercel Project Settings > Environment Variables에 다음 값을 Production, Preview에 등록한다.

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ADMIN_PASSWORD
SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버 전용이다. 절대 `NEXT_PUBLIC_` 접두어를 붙이지 않는다.

## Supabase 적용 순서

1. Supabase SQL Editor에서 `supabase/migrations/202605280001_datadiction_mvp.sql` 실행
2. Supabase SQL Editor에서 `supabase/seed/datadiction_mvp_seed.sql` 실행
3. Vercel에 환경변수 등록
4. Vercel 재배포
5. `/`, `/analysis`, `/datasets`, `/scenes/SCN_0001` 확인

## 배포 전 로컬 점검

```bash
npm run datadiction:check
npm run build
```

`datadiction:check`는 SQL 파일, 환경변수 이름, Supabase/Vercel CLI 설치 여부, `.vercel` 링크 상태를 확인한다.

## CLI로 진행하는 경우

Supabase CLI와 Vercel CLI가 설치되어 있고 로그인되어 있다면 다음 흐름을 사용한다.

```bash
supabase link --project-ref <SUPABASE_PROJECT_REF>
supabase db push
```

Seed SQL은 Supabase CLI 환경에 따라 직접 SQL Editor에서 실행하거나, DB 접속 문자열을 가진 환경에서 `psql`로 실행한다.

```bash
psql "$SUPABASE_DB_URL" -f supabase/seed/datadiction_mvp_seed.sql
```

Vercel CLI 배포 흐름:

```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
vercel env add ADMIN_PASSWORD production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel deploy --prod
```

GitHub 연동 배포를 쓰는 경우에는 이 독립 폴더를 별도 GitHub 저장소로 push한 뒤 Vercel 대시보드에서 해당 저장소를 import하고 같은 환경변수를 등록한다.

## 추가된 테이블

- `datadiction_datasets`
- `datadiction_videos`
- `datadiction_scenes`
- `datadiction_scene_inference`
- `datadiction_risk_candidates`
- `datadiction_reviews`
- `datadiction_audit_events`

## 추가된 View

- `datadiction_scene_overview`

대시보드와 장면 상세 화면은 이 view를 우선 읽는다.

## Storage

마이그레이션은 비공개 bucket `datadiction-assets`를 생성한다. 향후 원본 영상, 대표 프레임, 리포트 파일 저장에 사용한다.

## 다음 구현 후보

- 영상 업로드를 Supabase Storage에 연결
- 분석 실행 버튼을 route handler 또는 background job으로 연결
- `reviews` 테이블에 라벨 수정/확정 action 저장
- 리포트 PDF/Excel 생성
- Supabase Auth 기반 reviewer/admin 권한 분리

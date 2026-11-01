-- ==============================================================================
-- 🎓 강의 진도 체크용 테이블 (강사 전용, 학생 실습과 무관)
-- Supabase 대시보드 > SQL Editor에 복사 후 [RUN]을 누르세요! (여러 번 실행해도 안전)
-- ==============================================================================

-- 1. 강의 상태 (항상 id=1 한 줄만 사용)
create table if not exists class_session (
  id int primary key default 1 check (id = 1),
  total_students int not null default 0,
  current_step int not null default 1,
  updated_at timestamptz not null default now()
);

insert into class_session (id) values (1) on conflict (id) do nothing;

-- 2. 학생 완료 체크 (단계별 · 기기별 1개)
create table if not exists class_checks (
  step int not null,
  client_id text not null,
  created_at timestamptz not null default now(),
  primary key (step, client_id)
);

-- 3. RLS + 공개 정책 (강의장 전용 간이 도구)
alter table class_session enable row level security;
alter table class_checks enable row level security;

drop policy if exists "Public Access for class_session" on class_session;
create policy "Public Access for class_session"
  on class_session for all using (true) with check (true);

drop policy if exists "Public Access for class_checks" on class_checks;
create policy "Public Access for class_checks"
  on class_checks for all using (true) with check (true);

-- 4. 실시간(Realtime) 변경 알림 켜기
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'class_session'
  ) then
    alter publication supabase_realtime add table class_session;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'class_checks'
  ) then
    alter publication supabase_realtime add table class_checks;
  end if;
end $$;

-- =============================================================================
-- myportfolio — initial schema
-- Run this once in Supabase -> SQL Editor -> New query -> Run
--
-- Design notes
--  * Public content tables are readable by anon only where `published = true`.
--  * Everything else (writes, contact messages, the admin table) is reachable
--    only through the service_role key, which bypasses RLS. The admin UI always
--    goes through the server, never from the browser.
--  * Auth is Supabase Auth; `admins` maps an auth user id to a person.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Profile (single row)
-- -----------------------------------------------------------------------------
create table if not exists public.profile (
  id              uuid primary key default gen_random_uuid(),
  name            text        not null,
  tagline         text        not null default '',
  description     text        not null default '',
  paragraphs      jsonb       not null default '[]'::jsonb,
  email           text        not null default '',
  socials         jsonb       not null default '[]'::jsonb,
  github_username text        not null default '',
  updated_at      timestamptz not null default now()
);
comment on table public.profile is 'Single-row table holding the homepage hero content.';

-- -----------------------------------------------------------------------------
-- 2. Projects
-- -----------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text        not null unique,
  title       text        not null,
  summary     text        not null default '',
  badges      jsonb       not null default '[]'::jsonb,
  icon_url    text,
  links       jsonb       not null default '[]'::jsonb,
  featured_in jsonb       not null default '[]'::jsonb,
  tags        jsonb       not null default '[]'::jsonb,
  video_url   text,
  sort_order  int         not null default 0,
  published   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists projects_sort_idx on public.projects (sort_order);

-- Compact "project stack" list at the bottom of /projects
create table if not exists public.project_stack (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  href        text        not null default '#',
  category    text        not null default '',
  description text        not null default '',
  sort_order  int         not null default 0,
  published   boolean     not null default true
);
create index if not exists project_stack_sort_idx on public.project_stack (sort_order);

-- -----------------------------------------------------------------------------
-- 3. Experience (organisations + nested roles)
-- -----------------------------------------------------------------------------
create table if not exists public.experience_orgs (
  id         uuid primary key default gen_random_uuid(),
  monogram   text        not null default '',
  name       text        not null,
  employment text        not null default '',
  meta       text        not null default '',
  location   text        not null default '',
  sort_order int         not null default 0,
  published  boolean     not null default true
);
create index if not exists experience_orgs_sort_idx on public.experience_orgs (sort_order);

create table if not exists public.experience_roles (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid        not null references public.experience_orgs (id) on delete cascade,
  period     text        not null default '',
  title      text        not null,
  summary    text        not null default '',
  bullets    jsonb       not null default '[]'::jsonb,
  sort_order int         not null default 0
);
create index if not exists experience_roles_org_idx on public.experience_roles (org_id, sort_order);

-- -----------------------------------------------------------------------------
-- 4. Skills (grouped, powers both the homepage chips and /stack)
-- -----------------------------------------------------------------------------
create table if not exists public.skill_groups (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  sort_order int  not null default 0
);
create table if not exists public.skills (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid references public.skill_groups (id) on delete cascade,
  name       text not null,
  sort_order int  not null default 0,
  published  boolean not null default true
);
create index if not exists skills_group_idx on public.skills (group_id, sort_order);

-- -----------------------------------------------------------------------------
-- 5. Certifications
-- -----------------------------------------------------------------------------
create table if not exists public.certifications (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  issuer     text        not null default '',
  logo_url   text,
  verify_url text,
  group_title text       not null default 'Certifications',
  sort_order int         not null default 0,
  published  boolean     not null default true
);
create index if not exists certifications_sort_idx on public.certifications (sort_order);

-- -----------------------------------------------------------------------------
-- 6. Affiliations
-- -----------------------------------------------------------------------------
create table if not exists public.affiliations (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  role       text        not null default '',
  logo_url   text,
  emoji      text,
  href       text        not null default '#',
  summary    text        not null default '',
  sort_order int         not null default 0,
  published  boolean     not null default true
);
create index if not exists affiliations_sort_idx on public.affiliations (sort_order);

-- -----------------------------------------------------------------------------
-- 7. Blog posts
-- -----------------------------------------------------------------------------
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text        not null unique,
  title        text        not null,
  excerpt      text        not null default '',
  body         text        not null default '',
  cover_url    text,
  tags         jsonb       not null default '[]'::jsonb,
  read_minutes int         not null default 1,
  published_at timestamptz not null default now(),
  published    boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists posts_published_idx on public.posts (published, published_at desc);

-- -----------------------------------------------------------------------------
-- 8. Resources
-- -----------------------------------------------------------------------------
create table if not exists public.resource_groups (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  sort_order int  not null default 0
);
create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid references public.resource_groups (id) on delete cascade,
  title       text not null,
  href        text not null default '#',
  description text not null default '',
  sort_order  int  not null default 0
);
create index if not exists resources_group_idx on public.resources (group_id, sort_order);

-- -----------------------------------------------------------------------------
-- 9. Contact messages — anon may insert, nobody may read without service_role
-- -----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null,
  organisation text,
  role         text,
  budget      text,
  timeline    text,
  details     text,
  is_read     boolean     not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

comment on table public.contact_messages is
  'Submissions from /contact. Insert is public; reading is service_role only.';

-- -----------------------------------------------------------------------------
-- 10. Admins — who may reach /admin
-- -----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text        not null,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profile            enable row level security;
alter table public.projects           enable row level security;
alter table public.project_stack      enable row level security;
alter table public.experience_orgs    enable row level security;
alter table public.experience_roles   enable row level security;
alter table public.skill_groups       enable row level security;
alter table public.skills             enable row level security;
alter table public.certifications     enable row level security;
alter table public.affiliations       enable row level security;
alter table public.posts              enable row level security;
alter table public.resource_groups    enable row level security;
alter table public.resources          enable row level security;
alter table public.contact_messages   enable row level security;
alter table public.admins             enable row level security;

-- Helper: is the current request made by a logged-in admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- --- public read: only published rows ---------------------------------------

drop policy if exists profile_read on public.profile;
create policy profile_read on public.profile
  for select using (true);

drop policy if exists projects_read on public.projects;
create policy projects_read on public.projects
  for select using (published);

drop policy if exists project_stack_read on public.project_stack;
create policy project_stack_read on public.project_stack
  for select using (published);

drop policy if exists experience_orgs_read on public.experience_orgs;
create policy experience_orgs_read on public.experience_orgs
  for select using (published);

drop policy if exists experience_roles_read on public.experience_roles;
create policy experience_roles_read on public.experience_roles
  for select using (true);

drop policy if exists skill_groups_read on public.skill_groups;
create policy skill_groups_read on public.skill_groups
  for select using (true);

drop policy if exists skills_read on public.skills;
create policy skills_read on public.skills
  for select using (published);

drop policy if exists certifications_read on public.certifications;
create policy certifications_read on public.certifications
  for select using (published);

drop policy if exists affiliations_read on public.affiliations;
create policy affiliations_read on public.affiliations
  for select using (published);

drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts
  for select using (published);

drop policy if exists resource_groups_read on public.resource_groups;
create policy resource_groups_read on public.resource_groups
  for select using (true);

drop policy if exists resources_read on public.resources;
create policy resources_read on public.resources
  for select using (true);

-- --- public write: contact form only ----------------------------------------

drop policy if exists contact_messages_insert on public.contact_messages;
create policy contact_messages_insert on public.contact_messages
  for insert to anon, authenticated
  with check (true);

-- NOTE: no SELECT policy on contact_messages. Without one, even `authenticated`
-- cannot read it. Only the service_role key can, which the admin server uses.

-- --- admins: self-read only --------------------------------------------------

drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins
  for select to authenticated
  using (user_id = auth.uid());

-- =============================================================================
-- Writes to public content tables
-- There are deliberately NO anon/authenticated write policies.
-- All admin writes go through the service_role key from the Next.js server,
-- after an is_admin() check. That is the single privileged path.
-- =============================================================================

-- =============================================================================
-- Storage buckets
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Public read for project images; nothing else is publicly readable.
drop policy if exists project_images_read on storage.objects;
create policy project_images_read on storage.objects
  for select using (bucket_id = 'project-images');

-- Resumes are never public: readable only by an admin.
drop policy if exists resumes_admin_read on storage.objects;
create policy resumes_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'resumes' and public.is_admin());

-- Writes to both buckets are service_role only (no anon/authenticated policy).

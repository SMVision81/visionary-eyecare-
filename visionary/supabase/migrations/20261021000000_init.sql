-- Visionary Eyecare: initial schema (reviews, Google imports, enquiries, admins).
-- Run once in Supabase: Dashboard → SQL Editor → paste this file → Run.
--
-- Security model: Row Level Security is ON for every table and there are NO policies for the anon/authenticated
-- roles, so browsers can never read or write these tables directly. All access goes through the Next.js server
-- (service-role key, server-only code) after input validation and, for admin actions, requireAdmin().

create extension if not exists pgcrypto;

-- Admin allowlist: a Supabase Auth user can use /admin only if listed here.
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  role       text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

-- Reviews from Google (Takeout import) and from the website form.
create table public.reviews (
  id               uuid primary key default gen_random_uuid(),
  source           text not null check (source in ('google', 'website')),
  google_review_id text unique,                       -- stable Google ID; null for website reviews
  author_name      text not null check (char_length(author_name) between 1 and 120),
  author_photo_url text,
  rating           smallint not null check (rating between 1 and 5),
  original_text    text not null check (char_length(original_text) between 1 and 4000), -- never modified
  review_date      timestamptz not null,
  display_name     text not null check (char_length(display_name) between 1 and 60),
  display_text     text,                              -- website wording: excerpt / light fixes only (see constraint)
  is_edited        boolean not null default false,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'live', 'hidden', 'removed')),
  featured         boolean not null default false,
  sort_order       integer not null default 0 check (sort_order between 0 and 999),
  phone            text,                              -- website reviews only; PRIVATE, never sent to the public site
  synced_at        timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- "Light edits only": the website text may trim or fix typos, never grow beyond the original + 20 characters.
  constraint reviews_display_text_light check (
    display_text is null or char_length(display_text) between 1 and char_length(original_text) + 20
  ),
  constraint reviews_source_shape check (
    (source = 'google' and google_review_id is not null and phone is null)
    or (source = 'website' and google_review_id is null)
  )
);
create index reviews_status_date_idx on public.reviews (status, review_date desc);
create index reviews_source_date_idx on public.reviews (source, review_date desc);
create index reviews_live_order_idx on public.reviews (featured desc, sort_order, review_date desc) where status = 'live';

-- One row per Google Takeout import (audit trail + "last import" time).
create table public.review_import_runs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  total         integer not null check (total >= 0),
  added         integer not null check (added >= 0),
  existing      integer not null check (existing >= 0),
  blocked       integer not null check (blocked >= 0),
  rating        numeric(2, 1) not null check (rating between 0 and 5),
  total_reviews integer not null check (total_reviews >= 0),
  admin_email   text
);

-- The always-shown Google rating + review count (single row). Seeded from the Business Profile on 21 Oct 2026;
-- every import overwrites it with the numbers from the export.
create table public.google_profile_stats (
  id                 smallint primary key default 1 check (id = 1),
  rating             numeric(2, 1) check (rating between 0 and 5),
  total_review_count integer check (total_review_count >= 0),
  fetched_at         timestamptz
);
insert into public.google_profile_stats (id, rating, total_review_count, fetched_at)
values (1, 5.0, 2509, '2026-10-21T00:00:00Z');

-- Enquiries from the Contact form.
create table public.enquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 80),
  phone      text not null check (char_length(phone) between 6 and 30),
  interest   text,
  message    text not null check (char_length(message) between 5 and 1000),
  status     text not null default 'new' check (status in ('new', 'awaiting_reply', 'replied', 'archived')),
  created_at timestamptz not null default now(),
  opened_at  timestamptz,
  replied_at timestamptz
);
create index enquiries_status_created_idx on public.enquiries (status, created_at desc);

create table public.enquiry_replies (
  id          uuid primary key default gen_random_uuid(),
  enquiry_id  uuid not null references public.enquiries (id) on delete cascade,
  body        text not null check (char_length(body) <= 2000),
  channel     text not null default 'whatsapp' check (channel = 'whatsapp'),
  logged_at   timestamptz not null default now(),
  confirmed   boolean not null default false,
  admin_email text
);
create index enquiry_replies_enquiry_idx on public.enquiry_replies (enquiry_id, logged_at);

-- Keep reviews.updated_at correct whatever code path updates a row.
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger reviews_set_updated_at before update on public.reviews
for each row execute function public.set_updated_at();

-- Lock everything down: RLS on, no policies => no direct access for anon/authenticated roles.
alter table public.admins               enable row level security;
alter table public.reviews              enable row level security;
alter table public.review_import_runs   enable row level security;
alter table public.google_profile_stats enable row level security;
alter table public.enquiries            enable row level security;
alter table public.enquiry_replies      enable row level security;

-- Belt and braces: remove the default table grants for the public API roles as well.
revoke all on public.admins, public.reviews, public.review_import_runs, public.google_profile_stats,
  public.enquiries, public.enquiry_replies from anon, authenticated;

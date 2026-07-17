-- Initial schema for couple-travel-album
-- Run in Supabase: SQL Editor → New query → paste → Run

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.app_config (
  key text primary key,
  value text not null
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  city text,
  latitude double precision not null,
  longitude double precision not null,
  status text not null default 'visited' check (status in ('visited', 'planned', 'favorite')),
  description text,
  ideas text,
  start_date date,
  end_date date,
  planned_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date,
  end_date date,
  cover_photo_id uuid,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  url text not null,
  thumbnail_url text,
  title text,
  description text,
  taken_at timestamptz,
  uploaded_at timestamptz not null default timezone('utc', now()),
  sort_order integer not null default 0
);

alter table public.trips
  add constraint trips_cover_photo_id_fkey
  foreign key (cover_photo_id) references public.photos(id) on delete set null;

create table if not exists public.trip_places (
  trip_id uuid not null references public.trips(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  visit_order integer not null default 0,
  primary key (trip_id, place_id)
);

create trigger places_set_updated_at
before update on public.places
for each row execute function public.set_updated_at();

alter table public.app_config enable row level security;
alter table public.places enable row level security;
alter table public.trips enable row level security;
alter table public.photos enable row level security;
alter table public.trip_places enable row level security;

create policy "Authenticated users can read app_config"
on public.app_config for select
to authenticated
using (true);

create policy "Authenticated users can manage app_config"
on public.app_config for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can read places"
on public.places for select
to authenticated
using (true);

create policy "Authenticated users can manage places"
on public.places for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can read trips"
on public.trips for select
to authenticated
using (true);

create policy "Authenticated users can manage trips"
on public.trips for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can read photos"
on public.photos for select
to authenticated
using (true);

create policy "Authenticated users can manage photos"
on public.photos for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can read trip_places"
on public.trip_places for select
to authenticated
using (true);

create policy "Authenticated users can manage trip_places"
on public.trip_places for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

create policy "Authenticated users can read photos bucket"
on storage.objects for select
to authenticated
using (bucket_id = 'photos');

create policy "Authenticated users can upload photos bucket"
on storage.objects for insert
to authenticated
with check (bucket_id = 'photos');

create policy "Authenticated users can update photos bucket"
on storage.objects for update
to authenticated
using (bucket_id = 'photos')
with check (bucket_id = 'photos');

create policy "Authenticated users can delete photos bucket"
on storage.objects for delete
to authenticated
using (bucket_id = 'photos');

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

grant usage, select on all sequences in schema public to authenticated, service_role;

alter default privileges in schema public
grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
grant usage, select on sequences to authenticated, service_role;

insert into public.app_config (key, value)
values ('relationship_start_date', '2020-01-01')
on conflict (key) do nothing;

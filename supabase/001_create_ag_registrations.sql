create extension if not exists pgcrypto;

create table if not exists public.ag_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(btrim(full_name)) between 3 and 120),
  mobile_number text not null check (mobile_number ~ '^[0-9]{10}$'),
  status text not null default 'registered' check (status in ('registered', 'cancelled', 'waitlisted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ag_registrations_mobile_unique_idx
  on public.ag_registrations (mobile_number);

create index if not exists ag_registrations_created_at_idx
  on public.ag_registrations (created_at desc);

alter table public.ag_registrations enable row level security;

drop policy if exists "Allow public registration insert" on public.ag_registrations;
create policy "Allow public registration insert"
on public.ag_registrations
for insert
to anon, authenticated
with check (true);

create or replace function public.set_ag_registrations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ag_registrations_set_updated_at on public.ag_registrations;
create trigger ag_registrations_set_updated_at
before update on public.ag_registrations
for each row
execute function public.set_ag_registrations_updated_at();

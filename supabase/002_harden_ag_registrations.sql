do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ag_registrations'
      and column_name = 'full_name'
  ) then
    alter table public.ag_registrations
      alter column full_name type text,
      alter column full_name set not null;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ag_registrations'
      and column_name = 'mobile_number'
  ) then
    alter table public.ag_registrations
      alter column mobile_number type text,
      alter column mobile_number set not null;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ag_registrations_full_name_check'
  ) then
    alter table public.ag_registrations
      add constraint ag_registrations_full_name_check
      check (char_length(btrim(full_name)) between 3 and 120);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ag_registrations_mobile_number_check'
  ) then
    alter table public.ag_registrations
      add constraint ag_registrations_mobile_number_check
      check (mobile_number ~ '^[0-9]{10}$');
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'ag_registrations_email_format_check'
  ) then
    alter table public.ag_registrations
      drop constraint ag_registrations_email_format_check;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'ag_registrations_email_unique_idx'
  ) then
    drop index public.ag_registrations_email_unique_idx;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ag_registrations'
      and column_name = 'email'
  ) then
    alter table public.ag_registrations
      drop column email;
  end if;
end
$$;

-- Enable extension for UUID generation
create extension if not exists pgcrypto;

-- ===========================
-- Tables
-- ===========================

create table if not exists public.users_profile (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  slug text not null unique,
  is_public boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'live', 'closed')),
  theme jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  label text not null,
  field_type text not null check (
    field_type in (
      'short_text',
      'long_text',
      'email',
      'number',
      'date',
      'select',
      'checkbox',
      'section_title'
    )
  ),
  required boolean not null default true,
  help_text text,
  options jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.form_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  submitted_at timestamptz not null default now(),
  respondent_email text,
  answers jsonb not null check (jsonb_typeof(answers) = 'object')
);

-- ===========================
-- Indexes
-- ===========================

create index if not exists idx_forms_owner_id on public.forms (owner_id);
create index if not exists idx_form_fields_form_id on public.form_fields (form_id);
create index if not exists idx_form_responses_form_id on public.form_responses (form_id);

-- ===========================
-- Triggers
-- ===========================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_forms_set_updated_at on public.forms;
create trigger trg_forms_set_updated_at
before update on public.forms
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users_profile (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ===========================
-- RLS
-- ===========================

alter table public.users_profile enable row level security;
alter table public.forms enable row level security;
alter table public.form_fields enable row level security;
alter table public.form_responses enable row level security;

-- users_profile: authenticated users only manage their own profile

drop policy if exists users_profile_select_own on public.users_profile;
create policy users_profile_select_own
on public.users_profile
for select
to authenticated
using (id = auth.uid());

drop policy if exists users_profile_insert_own on public.users_profile;
create policy users_profile_insert_own
on public.users_profile
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists users_profile_update_own on public.users_profile;
create policy users_profile_update_own
on public.users_profile
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists users_profile_delete_own on public.users_profile;
create policy users_profile_delete_own
on public.users_profile
for delete
to authenticated
using (id = auth.uid());

-- forms: owners manage their own forms; anon can only read public live forms

drop policy if exists forms_select_own on public.forms;
create policy forms_select_own
on public.forms
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists forms_insert_own on public.forms;
create policy forms_insert_own
on public.forms
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists forms_update_own on public.forms;
create policy forms_update_own
on public.forms
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists forms_delete_own on public.forms;
create policy forms_delete_own
on public.forms
for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists forms_select_public_live on public.forms;
create policy forms_select_public_live
on public.forms
for select
to anon
using (is_public = true and status = 'live');

-- form_fields: owners manage fields of their forms; anon can only read public live form fields

drop policy if exists form_fields_select_own on public.form_fields;
create policy form_fields_select_own
on public.form_fields
for select
to authenticated
using (
  exists (
    select 1
    from public.forms f
    where f.id = form_fields.form_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists form_fields_insert_own on public.form_fields;
create policy form_fields_insert_own
on public.form_fields
for insert
to authenticated
with check (
  exists (
    select 1
    from public.forms f
    where f.id = form_fields.form_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists form_fields_update_own on public.form_fields;
create policy form_fields_update_own
on public.form_fields
for update
to authenticated
using (
  exists (
    select 1
    from public.forms f
    where f.id = form_fields.form_id
      and f.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.forms f
    where f.id = form_fields.form_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists form_fields_delete_own on public.form_fields;
create policy form_fields_delete_own
on public.form_fields
for delete
to authenticated
using (
  exists (
    select 1
    from public.forms f
    where f.id = form_fields.form_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists form_fields_select_public_live on public.form_fields;
create policy form_fields_select_public_live
on public.form_fields
for select
to anon
using (
  exists (
    select 1
    from public.forms f
    where f.id = form_fields.form_id
      and f.is_public = true
      and f.status = 'live'
  )
);

-- form_responses: owners can view/manage responses for their forms; anon can only insert to public live forms

drop policy if exists form_responses_select_own on public.form_responses;
create policy form_responses_select_own
on public.form_responses
for select
to authenticated
using (
  exists (
    select 1
    from public.forms f
    where f.id = form_responses.form_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists form_responses_insert_own on public.form_responses;
create policy form_responses_insert_own
on public.form_responses
for insert
to authenticated
with check (
  exists (
    select 1
    from public.forms f
    where f.id = form_responses.form_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists form_responses_update_own on public.form_responses;
create policy form_responses_update_own
on public.form_responses
for update
to authenticated
using (
  exists (
    select 1
    from public.forms f
    where f.id = form_responses.form_id
      and f.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.forms f
    where f.id = form_responses.form_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists form_responses_delete_own on public.form_responses;
create policy form_responses_delete_own
on public.form_responses
for delete
to authenticated
using (
  exists (
    select 1
    from public.forms f
    where f.id = form_responses.form_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists form_responses_insert_public_live on public.form_responses;
create policy form_responses_insert_public_live
on public.form_responses
for insert
to anon
with check (
  exists (
    select 1
    from public.forms f
    where f.id = form_responses.form_id
      and f.is_public = true
      and f.status = 'live'
  )
);

-- Grants (RLS still controls effective access)
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.users_profile to authenticated;
grant select, insert, update, delete on public.forms to authenticated;
grant select, insert, update, delete on public.form_fields to authenticated;
grant select, insert, update, delete on public.form_responses to authenticated;

grant select on public.forms to anon;
grant select on public.form_fields to anon;
grant insert on public.form_responses to anon;

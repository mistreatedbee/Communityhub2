-- License-first onboarding: license_plans, key-based licenses, onboarding_sessions, tenant_licenses
-- Step 1: Create license_plans and backfill from existing licenses (plan definitions)
create table if not exists public.license_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  code text,
  max_members int not null check (max_members >= 0) default 0,
  max_admins int not null check (max_admins >= 0) default 0,
  max_supervisors int not null check (max_supervisors >= 0) default 0,
  max_employees int not null check (max_employees >= 0) default 0,
  feature_flags jsonb not null default '{}'::jsonb,
  price_cents int not null default 0,
  billing_cycle text not null default 'monthly',
  max_storage_mb int not null default 0,
  max_posts int not null default 0,
  max_resources int not null default 0,
  created_at timestamptz not null default now()
);

-- Backfill from existing licenses (same id so organization_licenses.license_id stays valid)
insert into public.license_plans (id, name, description, code, max_members, max_admins, max_supervisors, max_employees, feature_flags, price_cents, billing_cycle, max_storage_mb, max_posts, max_resources)
select id, name, '', code, max_members, max_admins, max_supervisors, max_employees, feature_flags, coalesce(price_cents, 0), coalesce(billing_cycle, 'monthly'), coalesce(max_storage_mb, 0), coalesce(max_posts, 0), coalesce(max_resources, 0)
from public.licenses
on conflict (id) do nothing;

-- Step 2: Point organization_licenses to license_plans instead of licenses
alter table public.organization_licenses
  drop constraint if exists organization_licenses_license_id_fkey;

alter table public.organization_licenses
  add constraint organization_licenses_license_id_fkey
  foreign key (license_id) references public.license_plans(id);

-- Step 3: Update enforce_license_limits to use license_plans
create or replace function public.enforce_license_limits()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  selected_license record;
  active_count int;
begin
  if new.status <> 'active' then return new; end if;

  select lp.max_admins, lp.max_supervisors, lp.max_employees, lp.max_members
  into selected_license
  from public.organization_licenses ol
  join public.license_plans lp on lp.id = ol.license_id
  where ol.organization_id = new.organization_id
    and ol.status in ('trial', 'active')
  limit 1;

  if selected_license is null then
    raise exception 'No active license for organization %', new.organization_id;
  end if;

  select count(*) into active_count
  from public.organization_memberships m
  where m.organization_id = new.organization_id
    and m.status = 'active'
    and m.role = new.role
    and (tg_op <> 'UPDATE' or m.id <> new.id);

  if new.role = 'admin' and active_count >= selected_license.max_admins then
    raise exception 'Admin seat limit reached for organization';
  elsif new.role = 'supervisor' and active_count >= selected_license.max_supervisors then
    raise exception 'Supervisor seat limit reached for organization';
  elsif new.role = 'employee' and active_count >= selected_license.max_employees then
    raise exception 'Employee seat limit reached for organization';
  elsif new.role = 'member' and active_count >= selected_license.max_members then
    raise exception 'Member seat limit reached for organization';
  end if;

  return new;
end;
$$;

-- Step 4: Update bootstrap_tenant_admin to use license_plans
create or replace function public.bootstrap_tenant_admin(
  p_name text,
  p_slug text,
  p_license_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id uuid;
  v_license_id uuid;
  v_slug text := lower(trim(p_slug));
  v_name text := trim(p_name);
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if v_name = '' then
    raise exception 'Tenant name is required';
  end if;

  if v_slug = '' then
    raise exception 'Tenant slug is required';
  end if;

  if v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Tenant slug must use lowercase letters, numbers, and hyphens only';
  end if;

  if p_license_id is not null then
    select id into v_license_id
    from public.license_plans
    where id = p_license_id;
  else
    select id into v_license_id
    from public.license_plans
    order by price_cents asc, created_at asc
    limit 1;
  end if;

  if v_license_id is null then
    raise exception 'No license plan available';
  end if;

  insert into public.organizations (name, slug, status)
  values (v_name, v_slug, 'active')
  returning id into v_org_id;

  insert into public.organization_licenses (organization_id, license_id, status)
  values (v_org_id, v_license_id, 'trial');

  insert into public.organization_memberships (organization_id, user_id, role, status)
  values (v_org_id, v_user_id, 'owner', 'active');

  insert into public.tenant_settings (organization_id)
  values (v_org_id)
  on conflict (organization_id) do nothing;

  return v_org_id;
exception
  when unique_violation then
    raise exception 'Tenant slug is already in use';
end;
$$;

-- Step 5: Drop public read policy on licenses and drop old licenses table
drop policy if exists licenses_read_public on public.licenses;
drop policy if exists licenses_read_authenticated on public.licenses;
drop table if exists public.licenses;

-- Step 6: Create new licenses table (keys for license-first onboarding)
create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  plan_id uuid not null references public.license_plans(id) on delete restrict,
  status text not null check (status in ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'CLAIMED')) default 'ACTIVE',
  expires_at timestamptz,
  single_use boolean not null default true,
  claimed_at timestamptz,
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_tenant_id uuid references public.organizations(id) on delete set null,
  limits_snapshot jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_licenses_key on public.licenses (key);
create index if not exists idx_licenses_status on public.licenses (status);
create index if not exists idx_licenses_plan_id on public.licenses (plan_id);

-- Step 7: Add created_by to organizations for claim flow
alter table public.organizations
  add column if not exists created_by uuid references auth.users(id) on delete set null;

-- Step 8: Onboarding sessions (short-lived token after license verification)
create table public.onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  license_id uuid not null references public.licenses(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists idx_onboarding_sessions_token on public.onboarding_sessions (token);
create index if not exists idx_onboarding_sessions_expires_at on public.onboarding_sessions (expires_at);

-- Step 9: Tenant licenses (links organization to claimed license key)
create table public.tenant_licenses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  license_id uuid not null references public.licenses(id) on delete restrict,
  assigned_to uuid not null references auth.users(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (tenant_id),
  unique (license_id)
);

create index if not exists idx_tenant_licenses_tenant_id on public.tenant_licenses (tenant_id);
create index if not exists idx_tenant_licenses_license_id on public.tenant_licenses (license_id);

-- Enable RLS on new tables
alter table public.license_plans enable row level security;
alter table public.licenses enable row level security;
alter table public.onboarding_sessions enable row level security;
alter table public.tenant_licenses enable row level security;

-- RLS: license_plans and licenses (keys) — super_admin only
create policy license_plans_super_admin_all on public.license_plans
for all using (public.is_platform_super_admin()) with check (public.is_platform_super_admin());

create policy licenses_super_admin_all on public.licenses
for all using (public.is_platform_super_admin()) with check (public.is_platform_super_admin());

-- RLS: onboarding_sessions — no direct client access; validation via RPC only
create policy onboarding_sessions_no_select on public.onboarding_sessions
for select using (false);

-- RLS: tenant_licenses — super_admin all; tenant members can read their tenant's row
create policy tenant_licenses_super_admin_all on public.tenant_licenses
for all using (public.is_platform_super_admin()) with check (public.is_platform_super_admin());

create policy tenant_licenses_tenant_member_select on public.tenant_licenses
for select to authenticated
using (tenant_id in (select public.current_user_org_ids()));

-- RPC: verify_license (anon/authenticated) — returns valid, plan_name, expires_at, token
create or replace function public.verify_license(license_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lic record;
  v_plan record;
  v_token text;
  v_session_id uuid;
  v_key text := trim(lower(license_key));
begin
  if v_key = '' then
    return jsonb_build_object('valid', false, 'error', 'License key is required');
  end if;

  select id, plan_id, status, expires_at, single_use, claimed_at
  into v_lic
  from public.licenses
  where key = v_key
  limit 1;

  if v_lic.id is null then
    return jsonb_build_object('valid', false, 'error', 'Invalid license key');
  end if;

  if v_lic.status <> 'ACTIVE' then
    return jsonb_build_object('valid', false, 'status', v_lic.status, 'error', 'License is not active');
  end if;

  if v_lic.expires_at is not null and v_lic.expires_at <= now() then
    return jsonb_build_object('valid', false, 'error', 'License has expired');
  end if;

  if v_lic.single_use and v_lic.claimed_at is not null then
    return jsonb_build_object('valid', false, 'error', 'License has already been claimed');
  end if;

  select name into v_plan from public.license_plans where id = v_lic.plan_id;

  v_token := encode(gen_random_bytes(32), 'hex');
  insert into public.onboarding_sessions (token, license_id, expires_at)
  values (v_token, v_lic.id, now() + interval '1 hour')
  returning id into v_session_id;

  return jsonb_build_object(
    'valid', true,
    'status', v_lic.status,
    'plan_name', v_plan.name,
    'expires_at', v_lic.expires_at,
    'single_use', v_lic.single_use,
    'claimed', (v_lic.claimed_at is not null),
    'token', v_token
  );
end;
$$;

grant execute on function public.verify_license(text) to anon;
grant execute on function public.verify_license(text) to authenticated;

-- RPC: validate_onboarding_token (anon/authenticated) — for route guards
create or replace function public.validate_onboarding_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session record;
  v_plan_name text;
begin
  if p_token is null or trim(p_token) = '' then
    return jsonb_build_object('valid', false);
  end if;

  select s.id, s.license_id, s.expires_at
  into v_session
  from public.onboarding_sessions s
  where s.token = trim(p_token)
  limit 1;

  if v_session.id is null or v_session.expires_at <= now() then
    return jsonb_build_object('valid', false);
  end if;

  select name into v_plan_name from public.license_plans lp
  join public.licenses l on l.plan_id = lp.id where l.id = v_session.license_id;

  return jsonb_build_object('valid', true, 'plan_name', v_plan_name, 'license_id', v_session.license_id);
end;
$$;

grant execute on function public.validate_onboarding_token(text) to anon;
grant execute on function public.validate_onboarding_token(text) to authenticated;

-- RPC: claim_license_and_create_tenant (authenticated only)
create or replace function public.claim_license_and_create_tenant(
  p_license_key text,
  p_tenant_name text,
  p_tenant_slug text,
  p_logo_url text default null,
  p_category text default null,
  p_location text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_lic record;
  v_plan record;
  v_org_id uuid;
  v_slug text := lower(trim(p_tenant_slug));
  v_name text := trim(p_tenant_name);
  v_key text := trim(lower(p_license_key));
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  if v_name = '' then
    return jsonb_build_object('success', false, 'error', 'Tenant name is required');
  end if;

  if v_slug = '' then
    return jsonb_build_object('success', false, 'error', 'Tenant slug is required');
  end if;

  if v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    return jsonb_build_object('success', false, 'error', 'Slug must use lowercase letters, numbers, and hyphens only');
  end if;

  if v_key = '' then
    return jsonb_build_object('success', false, 'error', 'License key is required');
  end if;

  -- Lock and validate license (in one transaction)
  select id, plan_id, status, expires_at, single_use, claimed_at
  into v_lic
  from public.licenses
  where key = v_key
  for update;

  if v_lic.id is null then
    return jsonb_build_object('success', false, 'error', 'Invalid license key');
  end if;

  if v_lic.status <> 'ACTIVE' then
    return jsonb_build_object('success', false, 'error', 'License is not active');
  end if;

  if v_lic.expires_at is not null and v_lic.expires_at <= now() then
    return jsonb_build_object('success', false, 'error', 'License has expired');
  end if;

  if v_lic.single_use and v_lic.claimed_at is not null then
    return jsonb_build_object('success', false, 'error', 'License has already been claimed');
  end if;

  select id, name, max_members, max_admins, max_supervisors, max_employees, feature_flags
  into v_plan
  from public.license_plans
  where id = v_lic.plan_id;

  if v_plan.id is null then
    return jsonb_build_object('success', false, 'error', 'License plan not found');
  end if;

  insert into public.organizations (name, slug, status, logo_url, category, location, created_by)
  values (v_name, v_slug, 'active', p_logo_url, p_category, p_location, v_user_id)
  returning id into v_org_id;

  insert into public.organization_memberships (organization_id, user_id, role, status)
  values (v_org_id, v_user_id, 'owner', 'active');

  insert into public.organization_licenses (organization_id, license_id, status, limits_snapshot)
  values (v_org_id, v_plan.id, 'trial', jsonb_build_object(
    'max_members', v_plan.max_members,
    'max_admins', v_plan.max_admins,
    'max_supervisors', v_plan.max_supervisors,
    'max_employees', v_plan.max_employees,
    'feature_flags', v_plan.feature_flags
  ));

  insert into public.tenant_licenses (tenant_id, license_id, assigned_to)
  values (v_org_id, v_lic.id, v_user_id);

  update public.licenses
  set
    status = 'CLAIMED',
    claimed_at = now(),
    claimed_by = v_user_id,
    claimed_tenant_id = v_org_id,
    limits_snapshot = jsonb_build_object(
      'max_members', v_plan.max_members,
      'max_admins', v_plan.max_admins,
      'max_supervisors', v_plan.max_supervisors,
      'max_employees', v_plan.max_employees,
      'feature_flags', v_plan.feature_flags
    )
  where id = v_lic.id;

  insert into public.tenant_settings (organization_id)
  values (v_org_id)
  on conflict (organization_id) do nothing;

  insert into public.audit_logs (organization_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (v_org_id, v_user_id, 'license_claimed', 'license', v_lic.id::text, jsonb_build_object('license_key_masked', left(v_key, 4) || '***'));

  return jsonb_build_object('success', true, 'slug', v_slug, 'organization_id', v_org_id);
exception
  when unique_violation then
    return jsonb_build_object('success', false, 'error', 'Tenant slug is already in use');
end;
$$;

grant execute on function public.claim_license_and_create_tenant(text, text, text, text, text, text) to authenticated;

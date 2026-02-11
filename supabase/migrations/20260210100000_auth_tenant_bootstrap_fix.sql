drop policy if exists licenses_read_public on public.licenses;
create policy licenses_read_public on public.licenses
for select to anon, authenticated
using (true);

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
    from public.licenses
    where id = p_license_id;
  else
    select id into v_license_id
    from public.licenses
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

grant execute on function public.bootstrap_tenant_admin(text, text, uuid) to authenticated;

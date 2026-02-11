-- Seed data for local/demo environments only. Do NOT run in production.
--
-- Super admin (email + password only, no license):
-- 1. Create the user first: Supabase Dashboard → Authentication → Users → Add user
--    Email: superadmin_Hil0ph@example.com, set a password, confirm email.
-- 2. Run this seed. It will set that user as super_admin.

update public.profiles
set platform_role = 'super_admin'
where email = 'superadmin_Hil0ph@example.com';

-- Demo tenant (optional)
insert into public.organizations (name, slug, status, is_public, category, location)
values
  ('Demo Community', 'demo-community', 'active', true, 'Tech', 'Remote')
on conflict (slug) do nothing;

insert into public.tenant_settings (organization_id, public_signup, approval_required, registration_fields_enabled)
select id, true, false, true
from public.organizations
where slug = 'demo-community'
on conflict (organization_id) do nothing;

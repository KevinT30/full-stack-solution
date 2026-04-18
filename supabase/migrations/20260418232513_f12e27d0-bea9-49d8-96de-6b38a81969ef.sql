-- Fix privilege escalation: explicit INSERT/UPDATE/DELETE only for admins
drop policy if exists "admins manage roles" on public.user_roles;
create policy "admins insert roles" on public.user_roles
  for insert with check (public.has_role(auth.uid(), 'admin'));
create policy "admins update roles" on public.user_roles
  for update using (public.has_role(auth.uid(), 'admin'));
create policy "admins delete roles" on public.user_roles
  for delete using (public.has_role(auth.uid(), 'admin'));

-- Fix doctor sensitive data exposure
drop policy if exists "auth read doctors" on public.doctors;
create policy "admins read all doctor data" on public.doctors
  for select using (public.has_role(auth.uid(), 'admin'));
create policy "doctor reads self" on public.doctors
  for select using (user_id = auth.uid());

-- Public-safe view of doctors (no email/phone/license)
create or replace view public.doctors_public
with (security_invoker = true) as
select id, full_name, specialty, bio, consultation_duration_min, active
from public.doctors
where active = true;

grant select on public.doctors_public to authenticated, anon;

-- Allow authenticated users to read minimal doctor info needed for booking
create policy "auth reads minimal doctor info" on public.doctors
  for select to authenticated using (active = true);
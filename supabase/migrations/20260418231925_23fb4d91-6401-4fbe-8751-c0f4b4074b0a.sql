-- ENUMS
create type public.app_role as enum ('admin', 'doctor', 'patient');
create type public.appointment_status as enum ('pending', 'confirmed', 'cancelled', 'attended', 'no_show');
create type public.gender as enum ('male', 'female', 'other');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- USER ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- SECURITY DEFINER role check
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.get_user_role(_user_id uuid)
returns app_role language sql stable security definer set search_path = public as $$
  select role from public.user_roles where user_id = _user_id limit 1
$$;

-- DOCTORS
create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  specialty text not null,
  license_number text,
  email text,
  phone text,
  bio text,
  consultation_duration_min int not null default 30,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.doctors enable row level security;

-- PATIENTS
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  date_of_birth date,
  gender gender,
  address text,
  blood_type text,
  allergies text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.patients enable row level security;

-- DOCTOR SCHEDULES
create table public.doctor_schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);
alter table public.doctor_schedules enable row level security;

-- APPOINTMENTS
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status appointment_status not null default 'pending',
  reason text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.appointments enable row level security;

create index idx_appointments_doctor_date on public.appointments(doctor_id, appointment_date);
create index idx_appointments_patient on public.appointments(patient_id);
create index idx_appointments_date on public.appointments(appointment_date);

-- RLS POLICIES
create policy "users view own profile" on public.profiles for select using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "admins all profiles" on public.profiles for all using (public.has_role(auth.uid(), 'admin'));

create policy "users view own roles" on public.user_roles for select using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "admins manage roles" on public.user_roles for all using (public.has_role(auth.uid(), 'admin'));

create policy "auth read doctors" on public.doctors for select to authenticated using (true);
create policy "admins manage doctors" on public.doctors for all using (public.has_role(auth.uid(), 'admin'));
create policy "doctor updates self" on public.doctors for update using (user_id = auth.uid());

create policy "patients view own record" on public.patients for select using (
  user_id = auth.uid() or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'doctor')
);
create policy "insert patients" on public.patients for insert with check (
  public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'doctor') or auth.uid() = user_id
);
create policy "update patients" on public.patients for update using (
  public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'doctor') or user_id = auth.uid()
);
create policy "admins delete patients" on public.patients for delete using (public.has_role(auth.uid(), 'admin'));

create policy "auth read schedules" on public.doctor_schedules for select to authenticated using (true);
create policy "admins manage schedules" on public.doctor_schedules for all using (public.has_role(auth.uid(), 'admin'));
create policy "doctor own schedule" on public.doctor_schedules for all using (
  exists (select 1 from public.doctors d where d.id = doctor_id and d.user_id = auth.uid())
);

create policy "view appointments by role" on public.appointments for select using (
  public.has_role(auth.uid(), 'admin')
  or exists (select 1 from public.doctors d where d.id = doctor_id and d.user_id = auth.uid())
  or exists (select 1 from public.patients p where p.id = patient_id and p.user_id = auth.uid())
);
create policy "insert appointments" on public.appointments for insert with check (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'doctor')
  or exists (select 1 from public.patients p where p.id = patient_id and p.user_id = auth.uid())
);
create policy "update appointments" on public.appointments for update using (
  public.has_role(auth.uid(), 'admin')
  or exists (select 1 from public.doctors d where d.id = doctor_id and d.user_id = auth.uid())
  or exists (select 1 from public.patients p where p.id = patient_id and p.user_id = auth.uid())
);
create policy "delete appointments admin" on public.appointments for delete using (public.has_role(auth.uid(), 'admin'));

-- TRIGGERS
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger appointments_updated_at before update on public.appointments for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_role app_role;
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'phone');
  v_role := coalesce((new.raw_user_meta_data->>'role')::app_role, 'patient');
  insert into public.user_roles (user_id, role) values (new.id, v_role);
  if v_role = 'patient' then
    insert into public.patients (user_id, full_name, email, phone)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.email, new.raw_user_meta_data->>'phone');
  end if;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- SEED DATA
insert into public.doctors (full_name, specialty, email, phone, bio, consultation_duration_min) values
  ('Dr. María González', 'Medicina General', 'maria.gonzalez@medicare.pro', '+1 809 555 0101', 'Médico general con 12 años de experiencia.', 30),
  ('Dr. Carlos Pérez', 'Cardiología', 'carlos.perez@medicare.pro', '+1 809 555 0102', 'Cardiólogo certificado, especialista en hipertensión.', 45),
  ('Dra. Ana Rodríguez', 'Pediatría', 'ana.rodriguez@medicare.pro', '+1 809 555 0103', 'Pediatra con enfoque en desarrollo infantil.', 30),
  ('Dr. Luis Martínez', 'Dermatología', 'luis.martinez@medicare.pro', '+1 809 555 0104', 'Dermatólogo clínico y estético.', 30);

insert into public.doctor_schedules (doctor_id, weekday, start_time, end_time)
select d.id, wd, '09:00'::time, '13:00'::time from public.doctors d cross join generate_series(1, 5) wd;
insert into public.doctor_schedules (doctor_id, weekday, start_time, end_time)
select d.id, wd, '14:00'::time, '18:00'::time from public.doctors d cross join generate_series(1, 5) wd;
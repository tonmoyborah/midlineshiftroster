-- Shift Manager - Initial Schema (v1)
-- Apply this in Supabase SQL Editor (SQL -> New query), run all at once.
-- Safe to re-run due to IF NOT EXISTS and CREATE OR REPLACE usage where possible.

-- Extensions (ensure required functions exist)
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- =============================
-- Tables
-- =============================
create table if not exists public.clinics (
	id uuid primary key default gen_random_uuid(),
	name varchar(255) not null,
	location varchar(255) not null,
	is_active boolean default true,
	created_at timestamptz default now(),
	updated_at timestamptz default now()
);
create index if not exists idx_clinics_active on public.clinics(is_active);

create table if not exists public.staff (
	id uuid primary key default gen_random_uuid(),
	email varchar(255) unique not null,
	name varchar(255) not null,
	role varchar(50) not null check (role in ('doctor','dental_assistant')),
	primary_clinic_id uuid references public.clinics(id) on delete set null,
	weekly_off_day integer check (weekly_off_day >= 0 and weekly_off_day <= 6),
	is_active boolean default true,
	created_at timestamptz default now(),
	updated_at timestamptz default now()
);
create index if not exists idx_staff_role on public.staff(role);
create index if not exists idx_staff_primary_clinic on public.staff(primary_clinic_id);
create index if not exists idx_staff_active on public.staff(is_active);
create index if not exists idx_staff_email on public.staff(email);

create table if not exists public.staff_working_days (
	id uuid primary key default gen_random_uuid(),
	staff_id uuid references public.staff(id) on delete cascade,
	day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
	is_working boolean default true,
	created_at timestamptz default now(),
	unique(staff_id, day_of_week)
);
create index if not exists idx_staff_working_days_staff on public.staff_working_days(staff_id);

create table if not exists public.leave_requests (
	id uuid primary key default gen_random_uuid(),
	staff_id uuid references public.staff(id) on delete cascade,
	start_date date not null,
	end_date date not null,
	leave_type varchar(50) not null check (leave_type in ('planned','emergency')),
	reason text,
	status varchar(50) default 'pending' check (status in ('pending','approved','rejected')),
	approved_by uuid references auth.users(id),
	approved_at timestamptz,
	notes text,
	created_at timestamptz default now(),
	updated_at timestamptz default now(),
	constraint valid_date_range check (end_date >= start_date)
);
create index if not exists idx_leave_requests_staff on public.leave_requests(staff_id);
create index if not exists idx_leave_requests_dates on public.leave_requests(start_date, end_date);
create index if not exists idx_leave_requests_status on public.leave_requests(status);
-- gist index for range queries (requires btree_gist in PG 15? Supabase PG has it)
create extension if not exists btree_gist;
create index if not exists idx_leave_requests_date_range on public.leave_requests using gist (daterange(start_date, end_date, '[]'));

create table if not exists public.shift_assignments (
	id uuid primary key default gen_random_uuid(),
	clinic_id uuid references public.clinics(id) on delete cascade,
	staff_id uuid references public.staff(id) on delete cascade,
	shift_date date not null,
	is_visiting boolean default false,
	notes text,
	created_at timestamptz default now(),
	updated_at timestamptz default now(),
	created_by uuid references auth.users(id),
	unique(clinic_id, staff_id, shift_date)
);
create index if not exists idx_shift_assignments_clinic_date on public.shift_assignments(clinic_id, shift_date);
create index if not exists idx_shift_assignments_staff_date on public.shift_assignments(staff_id, shift_date);
create index if not exists idx_shift_assignments_date on public.shift_assignments(shift_date);

create table if not exists public.unapproved_absences (
	id uuid primary key default gen_random_uuid(),
	staff_id uuid references public.staff(id) on delete cascade,
	absence_date date not null,
	reason varchar(50) check (reason in ('no_show','rejected_leave')),
	notes text,
	marked_by uuid references auth.users(id) not null,
	created_at timestamptz default now(),
	unique(staff_id, absence_date)
);
create index if not exists idx_unapproved_absences_staff on public.unapproved_absences(staff_id);
create index if not exists idx_unapproved_absences_date on public.unapproved_absences(absence_date);

create table if not exists public.admin_users (
	id uuid primary key references auth.users(id) on delete cascade,
	email varchar(255) unique not null,
	name varchar(255) not null,
	is_super_admin boolean default false,
	created_at timestamptz default now(),
	updated_at timestamptz default now()
);
create index if not exists idx_admin_users_email on public.admin_users(email);

-- =============================
-- Triggers: updated_at maintenance
-- =============================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
	new.updated_at = now();
	return new;
end;
$$ language plpgsql;

create or replace trigger update_clinics_updated_at before update on public.clinics
for each row execute function public.update_updated_at_column();
create or replace trigger update_staff_updated_at before update on public.staff
for each row execute function public.update_updated_at_column();
create or replace trigger update_leave_requests_updated_at before update on public.leave_requests
for each row execute function public.update_updated_at_column();
create or replace trigger update_shift_assignments_updated_at before update on public.shift_assignments
for each row execute function public.update_updated_at_column();
create or replace trigger update_admin_users_updated_at before update on public.admin_users
for each row execute function public.update_updated_at_column();

-- =============================
-- Functions (RPC helpers)
-- =============================
create or replace function public.get_staff_status_for_date(
	p_staff_id uuid,
	p_date date
) returns varchar as $$
declare
	v_day_of_week integer;
	v_weekly_off integer;
begin
	v_day_of_week := extract(dow from p_date);
	select weekly_off_day into v_weekly_off from public.staff where id = p_staff_id;
	if v_weekly_off is not null and v_weekly_off = v_day_of_week then
		return 'weekly_off';
	end if;
	if exists (
		select 1 from public.leave_requests
		where staff_id = p_staff_id and status = 'approved'
		and p_date between start_date and end_date
	) then
		return 'approved_leave';
	end if;
	if exists (
		select 1 from public.unapproved_absences
		where staff_id = p_staff_id and absence_date = p_date
	) then
		return 'unapproved_leave';
	end if;
	if exists (
		select 1 from public.shift_assignments
		where staff_id = p_staff_id and shift_date = p_date
	) then
		if exists (
			select 1 from public.shift_assignments sa
			join public.staff s on sa.staff_id = s.id
			where sa.staff_id = p_staff_id and sa.shift_date = p_date and sa.clinic_id <> s.primary_clinic_id
		) then
			return 'visiting';
		end if;
		return 'present';
	end if;
	return 'available';
end;
$$ language plpgsql stable;

create or replace function public.get_clinic_roster_for_date(p_date date)
returns table (
	clinic_id uuid,
	clinic_name varchar,
	doctor_id uuid,
	doctor_name varchar,
	da_id uuid,
	da_name varchar,
	notes text,
	status varchar
) as $$
begin
	return query
	with clinic_assignments as (
		select c.id as clinic_id,
			c.name as clinic_name,
			sa.staff_id,
			s.name as staff_name,
			s.role,
			sa.notes,
			sa.is_visiting
		from public.clinics c
		left join public.shift_assignments sa on c.id = sa.clinic_id and sa.shift_date = p_date
		left join public.staff s on sa.staff_id = s.id
		where c.is_active = true
	)
	select
		ca.clinic_id,
		ca.clinic_name,
		max(case when ca.role = 'doctor' then ca.staff_id end) as doctor_id,
		max(case when ca.role = 'doctor' then ca.staff_name end) as doctor_name,
		max(case when ca.role = 'dental_assistant' then ca.staff_id end) as da_id,
		max(case when ca.role = 'dental_assistant' then ca.staff_name end) as da_name,
		max(ca.notes) as notes,
		case
			when max(case when ca.role = 'doctor' then ca.staff_id end) is null or
				 max(case when ca.role = 'dental_assistant' then ca.staff_id end) is null then 'no_staff'
			when coalesce(max((ca.is_visiting)::int),0) > 0 then 'visiting'
			else 'present'
		end as status
	from clinic_assignments ca
	group by ca.clinic_id, ca.clinic_name;
end;
$$ language plpgsql stable;

-- =============================
-- RLS & Policies
-- =============================
alter table public.clinics enable row level security;
alter table public.staff enable row level security;
alter table public.staff_working_days enable row level security;
alter table public.leave_requests enable row level security;
alter table public.shift_assignments enable row level security;
alter table public.unapproved_absences enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean as $$
begin
	return exists (
		select 1 from public.admin_users where id = auth.uid()
	);
end;
$$ language plpgsql security definer;

-- Admin full access
drop policy if exists "Admins full on clinics" on public.clinics;
drop policy if exists "Admins full on staff" on public.staff;
drop policy if exists "Admins full on staff_working_days" on public.staff_working_days;
drop policy if exists "Admins full on leave_requests" on public.leave_requests;
drop policy if exists "Admins full on shift_assignments" on public.shift_assignments;
drop policy if exists "Admins full on unapproved_absences" on public.unapproved_absences;
drop policy if exists "Admins read admin_users" on public.admin_users;
drop policy if exists "Staff view self" on public.staff;
drop policy if exists "Staff create own leave" on public.leave_requests;
drop policy if exists "Staff view own leave" on public.leave_requests;

-- Admin full access
create policy "Admins full on clinics" on public.clinics for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins full on staff" on public.staff for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins full on staff_working_days" on public.staff_working_days for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins full on leave_requests" on public.leave_requests for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins full on shift_assignments" on public.shift_assignments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins full on unapproved_absences" on public.unapproved_absences for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins read admin_users" on public.admin_users for select to authenticated using (public.is_admin());

-- Staff limited access (view own and create their leaves)
create policy "Staff view self" on public.staff for select to authenticated using (email = auth.jwt() ->> 'email');
create policy "Staff create own leave" on public.leave_requests for insert to authenticated with check (staff_id in (select id from public.staff where email = auth.jwt() ->> 'email'));
create policy "Staff view own leave" on public.leave_requests for select to authenticated using (staff_id in (select id from public.staff where email = auth.jwt() ->> 'email'));

-- =============================
-- Realtime publication
-- =============================
alter publication supabase_realtime add table public.shift_assignments;
alter publication supabase_realtime add table public.leave_requests;
alter publication supabase_realtime add table public.staff;

-- =============================
-- Seed minimal clinics (optional; idempotent)
-- =============================
insert into public.clinics(name, location)
select * from (values ('Central Clinic','Downtown'),('North Branch','Northside'),('East Branch','Eastwood')) as v(name, location)
where not exists (select 1 from public.clinics); 
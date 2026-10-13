-- 001_admin_users.sql
-- Authorization foundation: only users listed in admin_users are admins.
-- Run once in Supabase Dashboard -> SQL Editor.
 
create table if not exists public.admin_users (
    user_id    uuid primary key references auth.users (id) on delete cascade,
    created_at timestamptz not null default now()
);
 
alter table public.admin_users enable row level security;
 
-- A signed-in user may read only their own row.
-- This lets the admin panel ask "am I an admin?" without exposing other admins.
-- No INSERT / UPDATE / DELETE policies exist on purpose:
-- admins can only be added or removed from the SQL Editor (service-level access).
drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own"
    on public.admin_users
    for select
    to authenticated
    using (user_id = (select auth.uid()));
 
-- Helper used by RLS policies on every content table (news, gallery, players...).
-- SECURITY DEFINER so the check works no matter what the caller can read.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.admin_users
        where user_id = (select auth.uid())
    );
$$;
 
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
 
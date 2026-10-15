
-- 004_gallery_items.sql
-- Royaye Aflak: external-image gallery

create table if not exists public.gallery_items (
    id uuid primary key default gen_random_uuid(),

    title text not null
        check (char_length(trim(title)) between 1 and 180),

    description text not null default ''
        check (char_length(description) <= 1000),

    image_url text not null
        check (
            char_length(image_url) between 8 and 2048
            and image_url ~* '^https?://'
        ),

    alt text not null default ''
        check (char_length(alt) <= 300),

    category text not null
        check (category in ('training', 'matches', 'teams', 'events')),

    image_date text not null default ''
        check (char_length(image_date) <= 80),

    created_by uuid references auth.users(id) on delete set null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Indexes for category filtering and sorting
create index if not exists gallery_items_category_idx
    on public.gallery_items (category);

create index if not exists gallery_items_created_at_idx
    on public.gallery_items (created_at desc);

-- Enable Row Level Security
alter table public.gallery_items enable row level security;

-- Remove previous policies if this script is re-run
drop policy if exists "gallery_items_public_read"
    on public.gallery_items;

drop policy if exists "gallery_items_admin_insert"
    on public.gallery_items;

drop policy if exists "gallery_items_admin_update"
    on public.gallery_items;

drop policy if exists "gallery_items_admin_delete"
    on public.gallery_items;

-- Everyone can read gallery records
create policy "gallery_items_public_read"
    on public.gallery_items
    for select
    to anon, authenticated
    using (true);

-- Only admins can insert records, and the creator must be themselves
create policy "gallery_items_admin_insert"
    on public.gallery_items
    for insert
    to authenticated
    with check (
        (select public.is_admin())
        and created_by = (select auth.uid())
    );

-- Only admins can edit records
create policy "gallery_items_admin_update"
    on public.gallery_items
    for update
    to authenticated
    using ((select public.is_admin()))
    with check ((select public.is_admin()));

-- Only admins can delete records
create policy "gallery_items_admin_delete"
    on public.gallery_items
    for delete
    to authenticated
    using ((select public.is_admin()));

-- Table permissions
grant select on public.gallery_items to anon, authenticated;
grant insert, update, delete on public.gallery_items to authenticated;

-- Automatically update updated_at
create or replace function public.set_gallery_items_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_gallery_items_updated_at
    on public.gallery_items;

create trigger set_gallery_items_updated_at
    before update on public.gallery_items
    for each row
    execute function public.set_gallery_items_updated_at();

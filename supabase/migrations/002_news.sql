-- Royaye Aflak: News management
-- Requires migration 001_admin_users.sql (public.is_admin()).

create table if not exists public.news (
    id uuid primary key default gen_random_uuid(),
    title text not null check (char_length(trim(title)) between 3 and 180),
    slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    excerpt text not null default '' check (char_length(excerpt) <= 400),
    body text not null check (char_length(trim(body)) >= 1),
    image_url text not null default '',
    status text not null default 'draft' check (status in ('draft', 'published')),
    published_at timestamptz,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint news_image_url_length check (char_length(image_url) <= 2048)
);

create index if not exists news_status_published_at_idx
    on public.news (status, published_at desc);

create index if not exists news_created_at_idx
    on public.news (created_at desc);

alter table public.news enable row level security;

-- Remove policies by name first, so this migration can be safely re-run.
drop policy if exists "news_read_published_or_admin" on public.news;
drop policy if exists "news_admin_insert" on public.news;
drop policy if exists "news_admin_update" on public.news;
drop policy if exists "news_admin_delete" on public.news;

create policy "news_read_published_or_admin"
    on public.news
    for select
    to anon, authenticated
    using (status = 'published' or (select public.is_admin()));

create policy "news_admin_insert"
    on public.news
    for insert
    to authenticated
    with check ((select public.is_admin()) and created_by = (select auth.uid()));

create policy "news_admin_update"
    on public.news
    for update
    to authenticated
    using ((select public.is_admin()))
    with check ((select public.is_admin()));

create policy "news_admin_delete"
    on public.news
    for delete
    to authenticated
    using ((select public.is_admin()));

grant select on public.news to anon, authenticated;
grant insert, update, delete on public.news to authenticated;

create or replace function public.set_news_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = now();
    if new.status = 'published' and new.published_at is null then
        new.published_at = now();
    elsif new.status = 'draft' then
        new.published_at = null;
    end if;
    return new;
end;
$$;

drop trigger if exists set_news_updated_at on public.news;
create trigger set_news_updated_at
before update on public.news
for each row execute function public.set_news_updated_at();

-- Set published_at on first insert when a new row is published.
create or replace function public.set_news_insert_defaults()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    if new.status = 'published' and new.published_at is null then
        new.published_at = now();
    elsif new.status = 'draft' then
        new.published_at = null;
    end if;
    return new;
end;
$$;

drop trigger if exists set_news_insert_defaults on public.news;
create trigger set_news_insert_defaults
before insert on public.news
for each row execute function public.set_news_insert_defaults();

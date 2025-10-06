create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  locale text not null check (locale in ('pt','en','es')),
  title text not null,
  excerpt text,
  content_html text not null,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz default now(),
  cover_image_url text
);

alter table public.posts enable row level security;
create policy "read published" on public.posts for select
  using (status = 'published');

-- Create public buckets for announcements and debate guides
insert into storage.buckets (id, name, public)
values ('announcements', 'announcements', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('debate-guides', 'debate-guides', true)
on conflict (id) do nothing;

-- Storage policies for announcements assets
create policy if not exists "Public can read announcement assets"
on storage.objects
for select
using (bucket_id = 'announcements');

create policy if not exists "Admins can manage announcement assets"
on storage.objects
for all
using (bucket_id = 'announcements' and has_role(auth.uid(), 'admin'::app_role))
with check (bucket_id = 'announcements' and has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for debate-guides assets
create policy if not exists "Public can read debate guide assets"
on storage.objects
for select
using (bucket_id = 'debate-guides');

create policy if not exists "Admins can manage debate guide assets"
on storage.objects
for all
using (bucket_id = 'debate-guides' and has_role(auth.uid(), 'admin'::app_role))
with check (bucket_id = 'debate-guides' and has_role(auth.uid(), 'admin'::app_role));

-- Debate lessons table
create table if not exists public.debate_lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_path text,
  text_path text,
  is_published boolean not null default false,
  created_by_user_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.debate_lessons enable row level security;

-- RLS policies for debate lessons
create policy if not exists "Published lessons are viewable by everyone"
on public.debate_lessons
for select
using (is_published = true);

create policy if not exists "Admins can view all lessons"
on public.debate_lessons
for select
using (has_role(auth.uid(), 'admin'::app_role));

create policy if not exists "Only admins can insert lessons"
on public.debate_lessons
for insert
with check (has_role(auth.uid(), 'admin'::app_role) and created_by_user_id = auth.uid());

create policy if not exists "Only admins can update lessons"
on public.debate_lessons
for update
using (has_role(auth.uid(), 'admin'::app_role))
with check (has_role(auth.uid(), 'admin'::app_role));

create policy if not exists "Only admins can delete lessons"
on public.debate_lessons
for delete
using (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
create trigger if not exists update_debate_lessons_updated_at
before update on public.debate_lessons
for each row execute function public.update_updated_at_column();
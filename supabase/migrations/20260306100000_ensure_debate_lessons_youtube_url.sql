-- Ensure youtube_url exists on debate_lessons (earlier migration predated table creation)
alter table public.debate_lessons
add column if not exists youtube_url text;

comment on column public.debate_lessons.youtube_url is 'YouTube watch URL for the lesson video';

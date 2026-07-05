-- Add YouTube URL support for debate guide lessons
alter table public.debate_lessons
add column if not exists youtube_url text;

comment on column public.debate_lessons.youtube_url is 'YouTube watch URL for the lesson video';

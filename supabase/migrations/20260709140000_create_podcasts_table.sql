-- Podcast episodes (YouTube + script), admin-managed like debate_lessons
CREATE TABLE IF NOT EXISTS public.podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  script TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published podcasts are viewable by everyone"
ON public.podcasts
FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can view all podcasts"
ON public.podcasts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert podcasts"
ON public.podcasts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND created_by_user_id = auth.uid());

CREATE POLICY "Only admins can update podcasts"
ON public.podcasts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete podcasts"
ON public.podcasts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_podcasts_updated_at
BEFORE UPDATE ON public.podcasts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.podcasts IS 'Podcast episodes with YouTube video and optional script/transcript';
COMMENT ON COLUMN public.podcasts.script IS 'Episode script or show notes for listeners';

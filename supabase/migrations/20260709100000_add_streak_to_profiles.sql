-- Add streak tracking columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_practice_date DATE;

-- Atomically record a practice session and update streak
CREATE OR REPLACE FUNCTION public.record_practice_and_streak(
  p_practice_date date,
  p_topic text,
  p_format text,
  p_duration_seconds integer,
  p_session_type text DEFAULT 'ai',
  p_completed boolean DEFAULT true,
  p_score integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_current_streak integer;
  v_longest_streak integer;
  v_last_date date;
  v_new_streak integer;
  v_extended boolean := false;
  v_celebrate boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT current_streak, longest_streak, last_practice_date
  INTO v_current_streak, v_longest_streak, v_last_date
  FROM public.profiles
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF v_last_date = p_practice_date THEN
    v_new_streak := COALESCE(v_current_streak, 0);
    v_extended := false;
    v_celebrate := false;
  ELSIF v_last_date = p_practice_date - 1 THEN
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
    v_extended := true;
    v_celebrate := true;
  ELSE
    v_new_streak := 1;
    v_extended := false;
    v_celebrate := true;
  END IF;

  IF v_last_date IS DISTINCT FROM p_practice_date THEN
    UPDATE public.profiles
    SET
      current_streak = v_new_streak,
      longest_streak = GREATEST(COALESCE(longest_streak, 0), v_new_streak),
      last_practice_date = p_practice_date,
      updated_at = now()
    WHERE user_id = v_user_id;
  END IF;

  INSERT INTO public.practice_sessions (
    user_id,
    topic,
    format,
    duration_seconds,
    completed,
    score,
    session_type
  )
  VALUES (
    v_user_id,
    p_topic,
    p_format,
    GREATEST(p_duration_seconds, 1),
    p_completed,
    p_score,
    p_session_type
  );

  RETURN jsonb_build_object(
    'current_streak', v_new_streak,
    'longest_streak', GREATEST(COALESCE(v_longest_streak, 0), v_new_streak),
    'extended', v_extended,
    'celebrate', v_celebrate,
    'first_practice_today', v_celebrate
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_practice_and_streak TO authenticated;

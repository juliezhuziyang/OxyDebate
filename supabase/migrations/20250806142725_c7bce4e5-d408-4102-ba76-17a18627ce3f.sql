-- Create functions to increment user wins and losses
CREATE OR REPLACE FUNCTION public.increment_user_wins(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET wins = wins + 1,
      updated_at = now()
  WHERE user_id = $1;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_user_losses(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET losses = losses + 1,
      updated_at = now()
  WHERE user_id = $1;
END;
$$;
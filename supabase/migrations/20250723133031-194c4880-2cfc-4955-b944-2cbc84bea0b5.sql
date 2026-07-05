-- Fix foreign key relationships for practice_matches table
ALTER TABLE public.practice_matches 
ADD CONSTRAINT practice_matches_creator_user_id_fkey 
FOREIGN KEY (creator_user_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.practice_matches 
ADD CONSTRAINT practice_matches_opponent_user_id_fkey 
FOREIGN KEY (opponent_user_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.practice_matches 
ADD CONSTRAINT practice_matches_winner_user_id_fkey 
FOREIGN KEY (winner_user_id) REFERENCES public.profiles(user_id);
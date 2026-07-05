-- Add DELETE policies for admins on tournament tables

-- Allow admins to delete tournament debaters
CREATE POLICY "Admins can delete tournament debaters" 
ON public.tournament_debaters 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete tournament judges  
CREATE POLICY "Admins can delete tournament judges"
ON public.tournament_judges
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
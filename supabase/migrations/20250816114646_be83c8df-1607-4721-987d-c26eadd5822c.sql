-- Add registration control functionality
CREATE TABLE IF NOT EXISTS public.tournament_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tournament_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view tournament settings" 
ON public.tournament_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can update tournament settings" 
ON public.tournament_settings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert tournament settings" 
ON public.tournament_settings 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.tournament_settings (registration_open) VALUES (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tournament_settings_updated_at
BEFORE UPDATE ON public.tournament_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create check-in sessions table
CREATE TABLE public.check_in_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by_user_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create check-ins table to track individual check-ins
CREATE TABLE public.check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.check_in_sessions(id) ON DELETE CASCADE,
  participant_email TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  participant_type TEXT NOT NULL, -- 'debater' or 'judge'
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one check-in per participant per session
  UNIQUE(session_id, participant_email)
);

-- Enable RLS
ALTER TABLE public.check_in_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- Policies for check_in_sessions
CREATE POLICY "Everyone can view check-in sessions" 
ON public.check_in_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create check-in sessions" 
ON public.check_in_sessions 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update check-in sessions" 
ON public.check_in_sessions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for check_ins
CREATE POLICY "Everyone can view check-ins" 
ON public.check_ins 
FOR SELECT 
USING (true);

CREATE POLICY "Users can check in themselves" 
ON public.check_ins 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE TRIGGER update_check_in_sessions_updated_at
BEFORE UPDATE ON public.check_in_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
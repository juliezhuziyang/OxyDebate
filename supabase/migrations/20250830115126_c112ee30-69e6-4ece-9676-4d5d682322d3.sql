-- Create table for join us applications
CREATE TABLE public.applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  application_type text NOT NULL CHECK (application_type IN ('cohost', 'management')),
  name text NOT NULL,
  email text NOT NULL,
  organization_school text NOT NULL,
  message text NOT NULL,
  desired_position text, -- Only for management applications
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create applications"
ON public.applications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own applications"
ON public.applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON public.applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update application status"
ON public.applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- =====================================================
-- Migration: Add Custom Recruitment Pipeline Stages
-- =====================================================
-- Adds support for company-level default recruitment stages
-- and per-job stage overrides, plus candidate stage tracking.
-- =====================================================

-- 1. Add role & team fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'recruiter')),
ADD COLUMN IF NOT EXISTS gmail_connected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gmail_address text;

-- 2. Add custom stages flag to jobs
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS use_custom_stages boolean DEFAULT false;

-- 3. Add stage tracking fields to candidates
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS current_stage_id uuid,
ADD COLUMN IF NOT EXISTS current_stage_name text,
ADD COLUMN IF NOT EXISTS assigned_to_user_id uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS assigned_staff_name text,
ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS interview_status text,
ADD COLUMN IF NOT EXISTS hr_notes text,
ADD COLUMN IF NOT EXISTS evaluation_comments text;

-- Remove hardcoded status CHECK constraint so stages can be dynamic
ALTER TABLE public.candidates DROP CONSTRAINT IF EXISTS candidates_status_check;

-- 4. Create recruitment_stages table (company-level default template)
CREATE TABLE IF NOT EXISTS public.recruitment_stages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  order_index int NOT NULL,
  color text DEFAULT '#6366f1',
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(company_id, order_index)
);

-- 5. Create job_stages table (per-job override, optional)
CREATE TABLE IF NOT EXISTS public.job_stages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  order_index int NOT NULL,
  color text DEFAULT '#6366f1',
  default_assignee_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(job_id, order_index)
);

-- 6. Create candidate_stage_history table (log perpindahan tahapan)
CREATE TABLE IF NOT EXISTS public.candidate_stage_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  from_stage_name text,
  to_stage_name text NOT NULL,
  changed_by_user_id uuid REFERENCES public.profiles(id),
  notes text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create team_invitations table
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'recruiter' CHECK (role IN ('super_admin', 'recruiter')),
  token text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text,
  type text DEFAULT 'system' CHECK (type IN ('mandate', 'interview', 'reschedule', 'stage_advance', 'system')),
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Create google_tokens table
CREATE TABLE IF NOT EXISTS public.google_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_type text NOT NULL CHECK (provider_type IN ('gmail', 'calendar')),
  access_token text NOT NULL,
  refresh_token text,
  scope text,
  email text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, provider_type)
);

-- 10. Create candidate_assignments table (for legacy mandat compatibility)
CREATE TABLE IF NOT EXISTS public.candidate_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  assigned_to_user_id uuid REFERENCES public.profiles(id) NOT NULL,
  assigned_by_user_id uuid REFERENCES public.profiles(id),
  stage_name text,
  scheduled_at timestamptz,
  location text,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'rescheduled', 'cancelled')),
  calendar_event_id text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- Enable RLS on new tables
-- =====================================================

ALTER TABLE public.recruitment_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_assignments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies: recruitment_stages
-- =====================================================
CREATE POLICY "Users can view stages for their company" ON public.recruitment_stages
  FOR SELECT USING (company_id = auth.uid());

CREATE POLICY "Super admins can insert stages" ON public.recruitment_stages
  FOR INSERT WITH CHECK (company_id = auth.uid());

CREATE POLICY "Super admins can update stages" ON public.recruitment_stages
  FOR UPDATE USING (company_id = auth.uid());

CREATE POLICY "Super admins can delete non-system stages" ON public.recruitment_stages
  FOR DELETE USING (company_id = auth.uid() AND is_system = false);

-- =====================================================
-- RLS Policies: job_stages
-- =====================================================
CREATE POLICY "Users can view job stages for their jobs" ON public.job_stages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_stages.job_id AND jobs.user_id = auth.uid())
  );

CREATE POLICY "Users can insert job stages for their jobs" ON public.job_stages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_stages.job_id AND jobs.user_id = auth.uid())
  );

CREATE POLICY "Users can update job stages for their jobs" ON public.job_stages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_stages.job_id AND jobs.user_id = auth.uid())
  );

CREATE POLICY "Users can delete job stages for their jobs" ON public.job_stages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_stages.job_id AND jobs.user_id = auth.uid())
  );

-- =====================================================
-- RLS Policies: candidate_stage_history
-- =====================================================
CREATE POLICY "Users can view stage history of their candidates" ON public.candidate_stage_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.candidates c
      JOIN public.jobs j ON j.id = c.job_id
      WHERE c.id = candidate_stage_history.candidate_id AND j.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert stage history" ON public.candidate_stage_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.candidates c
      JOIN public.jobs j ON j.id = c.job_id
      WHERE c.id = candidate_stage_history.candidate_id AND j.user_id = auth.uid()
    )
  );

-- =====================================================
-- RLS Policies: team_invitations
-- =====================================================
CREATE POLICY "Admins can manage team invitations" ON public.team_invitations
  FOR ALL USING (company_id = auth.uid());

-- =====================================================
-- RLS Policies: notifications
-- =====================================================
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- RLS Policies: google_tokens
-- =====================================================
CREATE POLICY "Users can view their own tokens" ON public.google_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own tokens" ON public.google_tokens
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- RLS Policies: candidate_assignments
-- =====================================================
CREATE POLICY "Users can view assignments for their candidates" ON public.candidate_assignments
  FOR SELECT USING (
    assigned_to_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.candidates c
      JOIN public.jobs j ON j.id = c.job_id
      WHERE c.id = candidate_assignments.candidate_id AND j.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert assignments" ON public.candidate_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.candidates c
      JOIN public.jobs j ON j.id = c.job_id
      WHERE c.id = candidate_assignments.candidate_id AND j.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update assignments" ON public.candidate_assignments
  FOR UPDATE USING (
    assigned_to_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.candidates c
      JOIN public.jobs j ON j.id = c.job_id
      WHERE c.id = candidate_assignments.candidate_id AND j.user_id = auth.uid()
    )
  );

-- =====================================================
-- Helper function: Auto-seed default stages for new users
-- =====================================================
CREATE OR REPLACE FUNCTION public.seed_default_stages()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.recruitment_stages (company_id, name, description, order_index, color, is_system)
  VALUES
    (NEW.id, 'Apply & AI Screening', 'Kandidat mendaftar dan dianalisis otomatis oleh AI', 1, '#6366f1', true),
    (NEW.id, 'Review HR', 'Peninjauan hasil screening oleh tim HR', 2, '#f59e0b', false),
    (NEW.id, 'Diterima', 'Kandidat diterima dan siap onboarding', 3, '#22c55e', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-seed stages when a new profile is created
DROP TRIGGER IF EXISTS on_profile_created_seed_stages ON public.profiles;
CREATE TRIGGER on_profile_created_seed_stages
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_stages();

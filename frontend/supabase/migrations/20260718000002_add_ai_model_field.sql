-- Migration to add ai_model configuration to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ai_model text DEFAULT 'gemini-1.5-flash';

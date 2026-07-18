-- Migration to add AI provider configuration to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ai_provider text DEFAULT 'gemini' CHECK (ai_provider IN ('gemini', 'openai', 'anthropic')),
ADD COLUMN IF NOT EXISTS ai_api_key text,
ADD COLUMN IF NOT EXISTS ai_proxy_url text;

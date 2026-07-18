-- Migration to add location and distance radius matching fields

-- Update public.jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS work_latitude double precision,
ADD COLUMN IF NOT EXISTS work_longitude double precision,
ADD COLUMN IF NOT EXISTS work_address text,
ADD COLUMN IF NOT EXISTS max_distance double precision, -- in kilometers
ADD COLUMN IF NOT EXISTS distance_mandatory boolean default false;

-- Update public.candidates table
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS domicile_latitude double precision,
ADD COLUMN IF NOT EXISTS domicile_longitude double precision,
ADD COLUMN IF NOT EXISTS domicile_address text,
ADD COLUMN IF NOT EXISTS distance_to_work double precision; -- in kilometers

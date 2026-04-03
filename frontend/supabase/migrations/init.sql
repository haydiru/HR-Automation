-- 1. Create Profiles Table (Linked to Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  company_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Jobs Table
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  mandatory_criteria jsonb default '[]'::jsonb,
  optional_criteria jsonb default '[]'::jsonb,
  passing_grade int default 70,
  alias_email text,
  status text default 'active' check (status in ('active', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Candidates Table
create table public.candidates (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  full_name text not null,
  email text not null,
  phone text,
  cv_url text,
  raw_text text,
  analysis_result jsonb,
  total_score int default 0,
  is_qualified boolean default false,
  status text default 'Pending' check (status in ('Pending', 'Ready to Interview', 'Rejected', 'Hired')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.candidates enable row level security;

-- 5. Policies: Profiles
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- 6. Policies: Jobs
create policy "Users can view their own jobs" on public.jobs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own jobs" on public.jobs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own jobs" on public.jobs
  for update using (auth.uid() = user_id);

create policy "Users can delete their own jobs" on public.jobs
  for delete using (auth.uid() = user_id);

-- 7. Policies: Candidates (Nested via Jobs)
create policy "Users can view candidates of their jobs" on public.candidates
  for select using (
    exists (
      select 1 from public.jobs
      where jobs.id = candidates.job_id
      and jobs.user_id = auth.uid()
    )
  );

create policy "Public insert candidate (for public form/webhook)" on public.candidates
  for insert with check (
    exists (
      select 1 from public.jobs
      where jobs.id = candidates.job_id
      and jobs.status = 'active'
    )
  );

create policy "Users can update candidates of their jobs" on public.candidates
  for update using (
    exists (
      select 1 from public.jobs
      where jobs.id = candidates.job_id
      and jobs.user_id = auth.uid()
    )
  );

-- 8. Functions & Triggers: Create profile on auth signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

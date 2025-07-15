-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type life_category as enum (
  'health',
  'career', 
  'relationships',
  'finances',
  'personal_growth',
  'leisure'
);

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  full_name text,
  avatar_url text,
  onboarding_completed boolean default false
);

-- Create life_assessments table
create table life_assessments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  health_score integer not null check (health_score >= 1 and health_score <= 10),
  career_score integer not null check (career_score >= 1 and career_score <= 10),
  relationships_score integer not null check (relationships_score >= 1 and relationships_score <= 10),
  finances_score integer not null check (finances_score >= 1 and finances_score <= 10),
  personal_growth_score integer not null check (personal_growth_score >= 1 and personal_growth_score <= 10),
  leisure_score integer not null check (leisure_score >= 1 and leisure_score <= 10),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create daily_tasks table
create table daily_tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  assessment_id uuid references life_assessments(id) on delete cascade not null,
  title text not null,
  description text not null,
  category life_category not null,
  estimated_minutes integer not null check (estimated_minutes > 0),
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index profiles_email_idx on profiles(email);
create index life_assessments_user_id_idx on life_assessments(user_id);
create index life_assessments_created_at_idx on life_assessments(created_at desc);
create index daily_tasks_user_id_idx on daily_tasks(user_id);
create index daily_tasks_assessment_id_idx on daily_tasks(assessment_id);
create index daily_tasks_created_at_idx on daily_tasks(created_at desc);
create index daily_tasks_completed_idx on daily_tasks(completed);
create index daily_tasks_category_idx on daily_tasks(category);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table life_assessments enable row level security;
alter table daily_tasks enable row level security;

-- Create RLS policies for profiles
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Create RLS policies for life_assessments
create policy "Users can view own assessments" on life_assessments
  for select using (auth.uid() = user_id);

create policy "Users can insert own assessments" on life_assessments
  for insert with check (auth.uid() = user_id);

create policy "Users can update own assessments" on life_assessments
  for update using (auth.uid() = user_id);

-- Create RLS policies for daily_tasks
create policy "Users can view own tasks" on daily_tasks
  for select using (auth.uid() = user_id);

create policy "Users can insert own tasks" on daily_tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks" on daily_tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete own tasks" on daily_tasks
  for delete using (auth.uid() = user_id);

-- Create functions for updating timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updating timestamps
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

create trigger update_life_assessments_updated_at
  before update on life_assessments
  for each row
  execute function update_updated_at_column();

create trigger update_daily_tasks_updated_at
  before update on daily_tasks
  for each row
  execute function update_updated_at_column();

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create view for user statistics
create or replace view user_stats as
select 
  p.id as user_id,
  p.full_name,
  p.email,
  p.onboarding_completed,
  la.id as latest_assessment_id,
  la.health_score + la.career_score + la.relationships_score + 
  la.finances_score + la.personal_growth_score + la.leisure_score as total_score,
  (la.health_score + la.career_score + la.relationships_score + 
   la.finances_score + la.personal_growth_score + la.leisure_score) / 6.0 as average_score,
  count(dt.id) as total_tasks,
  count(case when dt.completed = true then 1 end) as completed_tasks,
  count(case when dt.completed = true then 1 end)::float / nullif(count(dt.id), 0) as completion_rate
from profiles p
left join lateral (
  select * from life_assessments 
  where user_id = p.id 
  order by created_at desc 
  limit 1
) la on true
left join daily_tasks dt on dt.user_id = p.id and dt.created_at >= current_date
group by p.id, p.full_name, p.email, p.onboarding_completed, 
         la.id, la.health_score, la.career_score, la.relationships_score,
         la.finances_score, la.personal_growth_score, la.leisure_score;

-- Grant access to authenticated users
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

-- Comments for documentation
comment on table profiles is 'User profiles with basic information and onboarding status';
comment on table life_assessments is 'Life wheel assessments with scores for each life area';
comment on table daily_tasks is 'AI-generated daily micro-tasks for users';
comment on column life_assessments.health_score is 'Health and wellness score (1-10)';
comment on column life_assessments.career_score is 'Career and work score (1-10)';
comment on column life_assessments.relationships_score is 'Relationships score (1-10)';
comment on column life_assessments.finances_score is 'Financial situation score (1-10)';
comment on column life_assessments.personal_growth_score is 'Personal growth and learning score (1-10)';
comment on column life_assessments.leisure_score is 'Leisure and fun score (1-10)';
comment on column daily_tasks.estimated_minutes is 'Estimated time to complete task in minutes';
comment on type life_category is 'Categories for life areas and tasks';

-- Insert some example data for testing (optional - remove in production)
-- This will only work after a user signs up
/*
-- Example assessment
insert into life_assessments (user_id, health_score, career_score, relationships_score, finances_score, personal_growth_score, leisure_score)
values (
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  4, 3, 6, 2, 5, 7
);

-- Example tasks
insert into daily_tasks (user_id, assessment_id, title, description, category, estimated_minutes)
values 
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 
   'Take a 5-minute walk', 'Step outside and walk around the block or in your neighborhood for 5 minutes', 'health', 5),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000',
   'Update LinkedIn headline', 'Log into LinkedIn and update your professional headline to reflect your current goals', 'career', 8),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000',
   'Check bank balance', 'Log into your bank account and review your current balance and recent transactions', 'finances', 3);
*/ 
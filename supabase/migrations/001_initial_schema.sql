-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  gender text check (gender in ('male', 'female')),
  season text,
  skin_tone text,
  eye_color text,
  hair_color text,
  contrast_level text,
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Quiz results table
create table public.quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  answers jsonb not null,
  season_result text not null,
  confidence text check (confidence in ('high', 'medium')) not null,
  photo_analysis jsonb,
  created_at timestamptz default now()
);

alter table public.quiz_results enable row level security;

create policy "Users can view own quiz results"
  on public.quiz_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own quiz results"
  on public.quiz_results for insert
  with check (auth.uid() = user_id);

-- Outfits table
create table public.outfits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text,
  hair_color text not null,
  top_color text not null,
  bottom_color text not null,
  shoes_color text not null,
  accessories_color text,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

alter table public.outfits enable row level security;

create policy "Users can view own outfits"
  on public.outfits for select
  using (auth.uid() = user_id);

create policy "Users can insert own outfits"
  on public.outfits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own outfits"
  on public.outfits for update
  using (auth.uid() = user_id);

create policy "Users can delete own outfits"
  on public.outfits for delete
  using (auth.uid() = user_id);

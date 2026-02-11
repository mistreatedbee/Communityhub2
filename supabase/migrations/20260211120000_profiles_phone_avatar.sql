-- Add phone and avatar_url to profiles for user profile editing.
alter table public.profiles
  add column if not exists phone text,
  add column if not exists avatar_url text;

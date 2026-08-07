# Supabase Row Level Security examples and notes

This file contains example policies to enforce that:
- Users can update only their own profile
- Only admin role can update app_settings

Note: Adjust these policies to match your Supabase project's auth identifiers and column names.

-- Enable RLS on tables (run in Supabase SQL editor)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own profile row
-- CREATE POLICY "Insert profile" ON profiles
-- FOR INSERT USING (auth.role() = 'authenticated' AND auth.uid() = id);

-- Allow users to update only their profile
-- CREATE POLICY "Update own profile" ON profiles
-- FOR UPDATE USING (auth.uid() = id);

-- Allow anyone to select basic profile info (or restrict as needed)
-- CREATE POLICY "Select profiles" ON profiles
-- FOR SELECT USING (true);

-- Admin-only updates to app_settings
-- You must have a way to determine admin users. One approach is to maintain an admins table or check a "role" claim.
-- Example: if you store role in profiles and want to enforce it server-side, use a Postgres function or a custom JWT claim that contains role.

-- Example policy using a custom claim (if you add role to JWT via server):
-- CREATE POLICY "Admin update" ON app_settings
-- FOR UPDATE USING (current_setting('jwt.claims.role', true) = 'admin');

-- Alternatively, enforce app_settings updates via Edge Functions or server endpoints that use the service role key (recommended).


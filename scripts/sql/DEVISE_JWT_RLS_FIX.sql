-- CRITICAL SECURITY FIX: RLS POLICIES FOR DEVISE/JWT AUTHENTICATION
-- This replaces the incorrect Clerk-based RLS policies
-- Run this SQL in your Supabase SQL Editor to fix authentication issues

-- IMPORTANT: Since your Rails app uses Devise/JWT authentication and not Supabase Auth,
-- these RLS policies need to work with your application architecture where:
-- 1. Rails backend authenticates users via Devise/JWT
-- 2. Rails backend makes authorized requests to Supabase using service role key
-- 3. RLS policies should validate based on the user_id passed from Rails

-- First, drop existing incorrect policies that reference clerk_id
DROP POLICY IF EXISTS "Users can view own profile" ON "public"."users";
DROP POLICY IF EXISTS "Users can update own profile" ON "public"."users";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."users";
DROP POLICY IF EXISTS "Users can view companies they own or are members of" ON "public"."companies";
DROP POLICY IF EXISTS "Users can insert companies as owner" ON "public"."companies";
DROP POLICY IF EXISTS "Users can update companies they own" ON "public"."companies";
DROP POLICY IF EXISTS "Users can view memberships for accessible companies" ON "public"."company_memberships";
DROP POLICY IF EXISTS "Company owners can manage memberships" ON "public"."company_memberships";
DROP POLICY IF EXISTS "Users can view documents for accessible companies" ON "public"."documents";
DROP POLICY IF EXISTS "Users can manage documents for accessible companies" ON "public"."documents";
DROP POLICY IF EXISTS "Users can view people for accessible companies" ON "public"."people";
DROP POLICY IF EXISTS "Users can manage people for accessible companies" ON "public"."people";
DROP POLICY IF EXISTS "Users can view requests for accessible companies" ON "public"."requests";
DROP POLICY IF EXISTS "Users can manage requests for accessible companies" ON "public"."requests";
DROP POLICY IF EXISTS "Users can view workflows for accessible companies" ON "public"."workflow_instances";
DROP POLICY IF EXISTS "Users can manage workflows for accessible companies" ON "public"."workflow_instances";
DROP POLICY IF EXISTS "Users can view workflow steps for accessible workflows" ON "public"."workflow_steps";
DROP POLICY IF EXISTS "Users can manage workflow steps for accessible workflows" ON "public"."workflow_steps";

-- Enable RLS on all core business tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;

-- Since your Rails app uses Devise/JWT and connects to Supabase with service role key,
-- we need a different approach for RLS policies.

-- Option 1: Use custom JWT claims from Rails
-- Your Rails app can pass the authenticated user_id as a custom claim in requests
-- This requires setting up custom claims in your Rails -> Supabase connection

-- Option 2: Use session variables (RECOMMENDED)
-- Your Rails app sets the current user context for each database session
-- This is more secure and works well with connection pooling

-- Create a function to set the current user context
CREATE OR REPLACE FUNCTION set_current_user_id(user_uuid uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_uuid::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get the current user context
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view own profile" ON "public"."users"
AS PERMISSIVE FOR SELECT TO authenticated, anon
USING (id = get_current_user_id());

CREATE POLICY "Users can update own profile" ON "public"."users"
AS PERMISSIVE FOR UPDATE TO authenticated, anon
USING (id = get_current_user_id());

CREATE POLICY "Service role has full access to users" ON "public"."users"
AS PERMISSIVE FOR ALL TO service_role
USING (true);

-- Companies table policies
CREATE POLICY "Users can view companies they own or are members of" ON "public"."companies"
AS PERMISSIVE FOR SELECT TO authenticated, anon
USING (
  owner_id = get_current_user_id()
  OR
  id IN (
    SELECT company_id FROM company_memberships 
    WHERE user_id = get_current_user_id()
    AND deleted_at IS NULL
  )
);

CREATE POLICY "Users can insert companies as owner" ON "public"."companies"
AS PERMISSIVE FOR INSERT TO authenticated, anon
WITH CHECK (owner_id = get_current_user_id());

CREATE POLICY "Users can update companies they own" ON "public"."companies"
AS PERMISSIVE FOR UPDATE TO authenticated, anon
USING (owner_id = get_current_user_id());

CREATE POLICY "Service role has full access to companies" ON "public"."companies"
AS PERMISSIVE FOR ALL TO service_role
USING (true);

-- Company memberships policies
CREATE POLICY "Users can view memberships for accessible companies" ON "public"."company_memberships"
AS PERMISSIVE FOR SELECT TO authenticated, anon
USING (
  user_id = get_current_user_id()
  OR
  company_id IN (
    SELECT id FROM companies WHERE owner_id = get_current_user_id()
  )
);

CREATE POLICY "Company owners can manage memberships" ON "public"."company_memberships"
AS PERMISSIVE FOR ALL TO authenticated, anon
USING (
  company_id IN (
    SELECT id FROM companies WHERE owner_id = get_current_user_id()
  )
);

CREATE POLICY "Service role has full access to memberships" ON "public"."company_memberships"
AS PERMISSIVE FOR ALL TO service_role
USING (true);

-- Documents policies
CREATE POLICY "Users can view documents for accessible companies" ON "public"."documents"
AS PERMISSIVE FOR SELECT TO authenticated, anon
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = get_current_user_id()
    OR
    id IN (
      SELECT company_id FROM company_memberships 
      WHERE user_id = get_current_user_id()
      AND deleted_at IS NULL
    )
  )
);

CREATE POLICY "Users can manage documents for owned companies" ON "public"."documents"
AS PERMISSIVE FOR ALL TO authenticated, anon
USING (
  company_id IN (
    SELECT id FROM companies WHERE owner_id = get_current_user_id()
  )
);

CREATE POLICY "Service role has full access to documents" ON "public"."documents"
AS PERMISSIVE FOR ALL TO service_role
USING (true);

-- People policies
CREATE POLICY "Users can view people for accessible companies" ON "public"."people"
AS PERMISSIVE FOR SELECT TO authenticated, anon
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = get_current_user_id()
    OR
    id IN (
      SELECT company_id FROM company_memberships 
      WHERE user_id = get_current_user_id()
      AND deleted_at IS NULL
    )
  )
);

CREATE POLICY "Users can manage people for owned companies" ON "public"."people"
AS PERMISSIVE FOR ALL TO authenticated, anon
USING (
  company_id IN (
    SELECT id FROM companies WHERE owner_id = get_current_user_id()
  )
);

CREATE POLICY "Service role has full access to people" ON "public"."people"
AS PERMISSIVE FOR ALL TO service_role
USING (true);

-- Requests policies
CREATE POLICY "Users can view requests for accessible companies" ON "public"."requests"
AS PERMISSIVE FOR SELECT TO authenticated, anon
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = get_current_user_id()
    OR
    id IN (
      SELECT company_id FROM company_memberships 
      WHERE user_id = get_current_user_id()
      AND deleted_at IS NULL
    )
  )
);

CREATE POLICY "Users can manage requests for owned companies" ON "public"."requests"
AS PERMISSIVE FOR ALL TO authenticated, anon
USING (
  company_id IN (
    SELECT id FROM companies WHERE owner_id = get_current_user_id()
  )
);

CREATE POLICY "Service role has full access to requests" ON "public"."requests"
AS PERMISSIVE FOR ALL TO service_role
USING (true);

-- Workflow instances policies
CREATE POLICY "Users can view workflows for accessible companies" ON "public"."workflow_instances"
AS PERMISSIVE FOR SELECT TO authenticated, anon
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = get_current_user_id()
    OR
    id IN (
      SELECT company_id FROM company_memberships 
      WHERE user_id = get_current_user_id()
      AND deleted_at IS NULL
    )
  )
);

CREATE POLICY "Users can manage workflows for owned companies" ON "public"."workflow_instances"
AS PERMISSIVE FOR ALL TO authenticated, anon
USING (
  company_id IN (
    SELECT id FROM companies WHERE owner_id = get_current_user_id()
  )
);

CREATE POLICY "Service role has full access to workflows" ON "public"."workflow_instances"
AS PERMISSIVE FOR ALL TO service_role
USING (true);

-- Workflow steps policies
CREATE POLICY "Users can view workflow steps for accessible workflows" ON "public"."workflow_steps"
AS PERMISSIVE FOR SELECT TO authenticated, anon
USING (
  workflow_instance_id IN (
    SELECT id FROM workflow_instances WHERE 
    company_id IN (
      SELECT id FROM companies WHERE 
      owner_id = get_current_user_id()
      OR
      id IN (
        SELECT company_id FROM company_memberships 
        WHERE user_id = get_current_user_id()
        AND deleted_at IS NULL
      )
    )
  )
);

CREATE POLICY "Users can manage workflow steps for owned company workflows" ON "public"."workflow_steps"
AS PERMISSIVE FOR ALL TO authenticated, anon
USING (
  workflow_instance_id IN (
    SELECT id FROM workflow_instances WHERE 
    company_id IN (
      SELECT id FROM companies WHERE owner_id = get_current_user_id()
    )
  )
);

CREATE POLICY "Service role has full access to workflow steps" ON "public"."workflow_steps"
AS PERMISSIVE FOR ALL TO service_role
USING (true);

-- IMPORTANT: Rails Integration Instructions
-- =========================================
-- In your Rails application, you need to set the user context for each database connection.
-- Add this to your Supabase client initialization or before making queries:
--
-- Example in Rails (add to your Supabase service or ApplicationRecord):
--
-- class SupabaseService
--   def with_user_context(user_id)
--     # Set the user context for this database session
--     ActiveRecord::Base.connection.execute(
--       "SELECT set_current_user_id('#{user_id}'::uuid)"
--     )
--     yield
--   ensure
--     # Clear the context after the operation
--     ActiveRecord::Base.connection.execute(
--       "SELECT set_current_user_id(NULL)"
--     )
--   end
-- end
--
-- Usage:
-- supabase_service.with_user_context(current_user.id) do
--   # Your Supabase queries here will have RLS applied for current_user
-- end

-- Verification queries to check RLS is working
SELECT 'RLS Status Check:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'companies', 'documents', 'people', 'requests', 'company_memberships', 'workflow_instances', 'workflow_steps')
ORDER BY tablename;

SELECT 'Policy Count Check:' as info;
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'companies', 'documents', 'people', 'requests', 'company_memberships', 'workflow_instances', 'workflow_steps')
GROUP BY tablename
ORDER BY tablename;

-- Note: The service_role key bypasses RLS, so your Rails backend should:
-- 1. Use the service_role key for admin operations
-- 2. Set user context and use anon key for user-specific operations
-- 3. OR always use service_role key but implement authorization in Rails
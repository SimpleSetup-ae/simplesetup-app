-- URGENT: CRITICAL SECURITY FIX - RLS POLICIES FOR CORE TABLES
-- Run this SQL in your Supabase SQL Editor immediately
-- This fixes major security vulnerabilities in your database

-- Enable RLS on all core business tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;

-- Users table - users can only see their own record
CREATE POLICY "Users can view own profile" ON "public"."users"
AS PERMISSIVE FOR SELECT TO authenticated 
USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own profile" ON "public"."users"
AS PERMISSIVE FOR UPDATE TO authenticated 
USING (auth.uid()::text = clerk_id);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."users"
AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);

-- Companies table - users can only see companies they own or are members of
CREATE POLICY "Users can view companies they own or are members of" ON "public"."companies"
AS PERMISSIVE FOR SELECT TO authenticated 
USING (
  owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  OR
  id IN (
    SELECT company_id FROM company_memberships 
    WHERE user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    AND deleted_at IS NULL
  )
);

CREATE POLICY "Users can insert companies as owner" ON "public"."companies"
AS PERMISSIVE FOR INSERT TO authenticated 
WITH CHECK (owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can update companies they own" ON "public"."companies"
AS PERMISSIVE FOR UPDATE TO authenticated 
USING (owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Company memberships - users can see memberships for companies they have access to
CREATE POLICY "Users can view memberships for accessible companies" ON "public"."company_memberships"
AS PERMISSIVE FOR SELECT TO authenticated 
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR
    id IN (
      SELECT company_id FROM company_memberships 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND deleted_at IS NULL
    )
  )
);

CREATE POLICY "Company owners can manage memberships" ON "public"."company_memberships"
AS PERMISSIVE FOR ALL TO authenticated 
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  )
);

-- Documents - users can only see documents for companies they have access to
CREATE POLICY "Users can view documents for accessible companies" ON "public"."documents"
AS PERMISSIVE FOR SELECT TO authenticated 
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR
    id IN (
      SELECT company_id FROM company_memberships 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND deleted_at IS NULL
    )
  )
);

CREATE POLICY "Users can manage documents for accessible companies" ON "public"."documents"
AS PERMISSIVE FOR ALL TO authenticated 
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR
    id IN (
      SELECT company_id FROM company_memberships 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND deleted_at IS NULL
    )
  )
);

-- People - users can only see people for companies they have access to
CREATE POLICY "Users can view people for accessible companies" ON "public"."people"
AS PERMISSIVE FOR SELECT TO authenticated 
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR
    id IN (
      SELECT company_id FROM company_memberships 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND deleted_at IS NULL
    )
  )
);

CREATE POLICY "Users can manage people for accessible companies" ON "public"."people"
AS PERMISSIVE FOR ALL TO authenticated 
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR
    id IN (
      SELECT company_id FROM company_memberships 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND deleted_at IS NULL
    )
  )
);

-- Requests - users can only see requests for companies they have access to
CREATE POLICY "Users can view requests for accessible companies" ON "public"."requests"
AS PERMISSIVE FOR SELECT TO authenticated 
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR
    id IN (
      SELECT company_id FROM company_memberships 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND deleted_at IS NULL
    )
  )
);

CREATE POLICY "Users can manage requests for accessible companies" ON "public"."requests"
AS PERMISSIVE FOR ALL TO authenticated 
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR
    id IN (
      SELECT company_id FROM company_memberships 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND deleted_at IS NULL
    )
  )
);

-- Workflow instances - users can only see workflows for companies they have access to
CREATE POLICY "Users can view workflows for accessible companies" ON "public"."workflow_instances"
AS PERMISSIVE FOR SELECT TO authenticated 
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR
    id IN (
      SELECT company_id FROM company_memberships 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND deleted_at IS NULL
    )
  )
);

CREATE POLICY "Users can manage workflows for accessible companies" ON "public"."workflow_instances"
AS PERMISSIVE FOR ALL TO authenticated 
USING (
  company_id IN (
    SELECT id FROM companies WHERE 
    owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR
    id IN (
      SELECT company_id FROM company_memberships 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND deleted_at IS NULL
    )
  )
);

-- Workflow steps - users can only see steps for workflows they have access to
CREATE POLICY "Users can view workflow steps for accessible workflows" ON "public"."workflow_steps"
AS PERMISSIVE FOR SELECT TO authenticated 
USING (
  workflow_instance_id IN (
    SELECT id FROM workflow_instances WHERE 
    company_id IN (
      SELECT id FROM companies WHERE 
      owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      OR
      id IN (
        SELECT company_id FROM company_memberships 
        WHERE user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
        AND deleted_at IS NULL
      )
    )
  )
);

CREATE POLICY "Users can manage workflow steps for accessible workflows" ON "public"."workflow_steps"
AS PERMISSIVE FOR ALL TO authenticated 
USING (
  workflow_instance_id IN (
    SELECT id FROM workflow_instances WHERE 
    company_id IN (
      SELECT id FROM companies WHERE 
      owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      OR
      id IN (
        SELECT company_id FROM company_memberships 
        WHERE user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
        AND deleted_at IS NULL
      )
    )
  )
);

-- Verification queries to check RLS is working
SELECT 'RLS Status Check:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'companies', 'documents', 'people', 'requests')
ORDER BY tablename;

SELECT 'Policy Count Check:' as info;
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'companies', 'documents', 'people', 'requests')
GROUP BY tablename
ORDER BY tablename;


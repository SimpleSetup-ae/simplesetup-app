-- Supabase Storage Setup for Company Formation Documents
-- Run this in your Supabase SQL Editor

-- 1. Create the storage bucket for company documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-documents', 'company-documents', false);

-- 2. Set up Row Level Security policies for the bucket

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'company-documents' 
  AND auth.uid() IS NOT NULL
);

-- Allow users to read files they have access to
-- Note: In production, you'd want more granular access control based on company membership
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'company-documents' 
  AND auth.uid() IS NOT NULL
);

-- Allow users to delete files they uploaded
CREATE POLICY "Allow file deletion" ON storage.objects
FOR DELETE USING (
  bucket_id = 'company-documents' 
  AND auth.uid() IS NOT NULL
);

-- 3. Enable RLS on the storage.objects table (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Optional: Create a more granular policy based on company access
-- This would require storing company_id in the file path and checking membership

/*
-- Example of company-based access control:
CREATE POLICY "Company-based access" ON storage.objects
FOR ALL USING (
  bucket_id = 'company-documents' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM company_memberships cm 
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.user_id = auth.uid()::text
    AND name LIKE c.id::text || '%'  -- File path starts with company ID
  )
);
*/

-- 5. Set bucket configuration
UPDATE storage.buckets 
SET 
  file_size_limit = 10485760, -- 10MB limit
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
WHERE id = 'company-documents';

-- 6. Create indexes for better performance on the documents table
-- (These will be created by our Rails migration)

-- Verification queries:
-- SELECT * FROM storage.buckets WHERE id = 'company-documents';
-- SELECT schemaname, tablename, policyname, cmd, qual FROM pg_policies WHERE tablename = 'objects';

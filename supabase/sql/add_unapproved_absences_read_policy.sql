-- Add read policy for unapproved_absences table
-- This is required for the frontend to query staff status
-- Date: 2025-10-12

-- Add public read access for unapproved_absences (for development)
-- IMPORTANT: In production, you may want to restrict this to authenticated users only
CREATE POLICY "Public read unapproved_absences" 
  ON public.unapproved_absences FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Added read policy for unapproved_absences table';
  RAISE NOTICE 'ℹ️  Note: This allows public read access for development.';
  RAISE NOTICE 'ℹ️  For production, consider restricting to authenticated users only.';
END $$;


-- Migration script to remove assessment_id from daily_tasks table
-- Run this in your Supabase SQL editor

-- Step 1: Drop the foreign key constraint and index
DROP INDEX IF EXISTS daily_tasks_assessment_id_idx;

-- Step 2: Remove the assessment_id column
ALTER TABLE daily_tasks DROP COLUMN IF EXISTS assessment_id;

-- Step 3: The table should now work without assessment_id
-- Tasks will be associated with users directly and we'll fetch the latest assessment when needed

-- Verify the change (optional)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'daily_tasks'; 
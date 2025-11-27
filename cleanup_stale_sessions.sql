-- Cleanup stale active sessions (older than 12 hours)
-- This query closes sessions that are still marked as active (ended_at IS NULL)
-- but have not been updated for more than 12 hours, indicating they were likely
-- abandoned due to crashes, network issues, or logout failures.

-- IMPORTANT: Review the count before running the UPDATE.
-- Run this in READ-ONLY mode first to see how many sessions will be affected:

-- Step 1: Count stale sessions (safe, read-only)
SELECT COUNT(*) as stale_session_count
FROM public.sessions
WHERE ended_at IS NULL
  AND started_at < now() - interval '30 seconds';

-- Step 2: View stale sessions (optional, for inspection)
SELECT 
  id,
  user_id,
  event,
  started_at,
  now() - started_at as age,
  created_at
FROM public.sessions
WHERE ended_at IS NULL
  AND started_at < now() - interval '30 seconds'
ORDER BY started_at DESC;

-- Step 3: Close stale sessions (destructive operation)
-- Uncomment and run ONLY after reviewing Step 1 & 2 results
/*
UPDATE public.sessions
SET 
  ended_at = now(),
  event = 'logout'
WHERE ended_at IS NULL
  AND started_at < now() - interval '30 seconds';
*/

-- Notes:
-- - Adjust the interval '30 seconds' to suit your needs (e.g., '24 hours', '1 day', '6 hours')
-- - Sessions are typically closed via endSession() on logout
-- - This cleanup is a safety measure for orphaned rows
-- - Always backup your database before running destructive queries

-- One-time cleanup: Close all old sessions, keep only the most recent per user
-- This removes the stale sessions accumulated from testing

-- Step 1: Identify sessions to close (all except the most recent per user)
SELECT 
  s.id,
  s.user_id,
  p.username,
  s.started_at,
  NOW() - s.started_at as age,
  'WILL BE CLOSED' as status
FROM public.sessions s
LEFT JOIN public.profiles p ON s.user_id = p.id
WHERE s.ended_at IS NULL
  AND s.id NOT IN (
    -- Subquery: Get the most recent session per user
    SELECT DISTINCT ON (user_id) id
    FROM public.sessions
    WHERE ended_at IS NULL
    ORDER BY user_id, started_at DESC
  )
ORDER BY s.user_id, s.started_at DESC;

-- Step 2: Execute cleanup (uncomment to run)
-- Close all sessions except the most recent per user
/*
UPDATE public.sessions
SET 
  ended_at = NOW(),
  event = 'logout'
WHERE ended_at IS NULL
  AND id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM public.sessions
    WHERE ended_at IS NULL
    ORDER BY user_id, started_at DESC
  );
*/

-- After running:
-- - 10 old sessions will be closed
-- - 5 recent sessions (1 per user) will remain active
-- - Dashboard will show 5 active users (correct count)

-- Inspect all active sessions and their users
-- Run this in Supabase SQL Editor to see what's causing the inflated count

-- Query 1: Count and list all active sessions
SELECT 
  s.id,
  s.user_id,
  s.event,
  s.started_at,
  s.ended_at,
  p.full_name,
  p.username,
  p.email,
  p.role,
  NOW() - s.started_at as age
FROM public.sessions s
LEFT JOIN public.profiles p ON s.user_id = p.id
WHERE s.ended_at IS NULL
ORDER BY s.started_at DESC;

-- Query 2: Count by user (shows duplicates)
SELECT 
  s.user_id,
  p.full_name,
  p.username,
  COUNT(*) as session_count
FROM public.sessions s
LEFT JOIN public.profiles p ON s.user_id = p.id
WHERE s.ended_at IS NULL
GROUP BY s.user_id, p.full_name, p.username
ORDER BY session_count DESC;

-- Query 3: Count summary
SELECT 
  COUNT(*) as total_active_sessions,
  COUNT(DISTINCT s.user_id) as unique_users
FROM public.sessions s
WHERE s.ended_at IS NULL;

-- Query 4: Show sessions with NULL user_id (orphaned)
SELECT 
  id,
  user_id,
  event,
  started_at,
  NOW() - started_at as age
FROM public.sessions
WHERE ended_at IS NULL AND user_id IS NULL
ORDER BY started_at DESC;

-- After running these queries, you'll see:
-- - Total active sessions
-- - How many unique users have active sessions
-- - If there are multiple sessions per user (dedup working, but old rows exist)
-- - If there are orphaned sessions (NULL user_id)
-- 
-- Then decide on cleanup:
-- Option A: Close all old sessions
--   UPDATE public.sessions SET ended_at = NOW(), event = 'logout' 
--   WHERE ended_at IS NULL AND started_at < NOW() - INTERVAL '30 seconds';
-- 
-- Option B: Close sessions for specific users
--   UPDATE public.sessions SET ended_at = NOW(), event = 'logout'
--   WHERE ended_at IS NULL AND user_id IN (/* list user IDs */);
-- 
-- Option C: Close orphaned sessions (NULL user_id)
--   UPDATE public.sessions SET ended_at = NOW(), event = 'logout'
--   WHERE ended_at IS NULL AND user_id IS NULL;

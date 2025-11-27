# Stale Sessions Cleanup Guide

## Overview
This guide explains how to safely identify and close stale (abandoned) sessions in your CyberCafe system.

## Why Clean Up Stale Sessions?

Stale sessions are active sessions (no `ended_at` timestamp) that haven't been updated for a long time. They typically indicate:
- Users who lost connection without logging out
- Browser crashes or network failures
- Logout failures due to permissions or errors
- System restarts without proper session cleanup

Over time, stale sessions can inflate dashboard metrics and consume resources.

## Methods

### Method 1: SQL (Supabase Dashboard)

1. **Open Supabase Dashboard** → SQL Editor
2. **Count stale sessions** (safe, read-only):
   ```sql
   SELECT COUNT(*) as stale_session_count
   FROM public.sessions
   WHERE ended_at IS NULL
     AND started_at < now() - interval '12 hours';
   ```
3. **Review stale sessions** (optional):
   ```sql
   SELECT id, user_id, event, started_at, now() - started_at as age
   FROM public.sessions
   WHERE ended_at IS NULL
     AND started_at < now() - interval '12 hours'
   ORDER BY started_at DESC;
   ```
4. **Close stale sessions** (destructive):
   ```sql
   UPDATE public.sessions
   SET 
     ended_at = now(),
     event = 'logout'
   WHERE ended_at IS NULL
     AND started_at < now() - interval '12 hours';
   ```

See `cleanup_stale_sessions.sql` for the complete script.

### Method 2: Node.js Script (Recommended)

**Interactive mode** (prompts for confirmation):
```bash
node cleanup_stale_sessions.js
```

**Dry-run** (shows count without making changes):
```bash
node cleanup_stale_sessions.js --dry-run
```

**Force** (skips confirmation, use carefully):
```bash
node cleanup_stale_sessions.js --force
```

## Configuration

To change the idle threshold, edit the cleanup script:
- In `cleanup_stale_sessions.sql`: change `interval '12 hours'` to any duration (e.g., `'24 hours'`, `'6 hours'`, `'1 day'`)
- In `cleanup_stale_sessions.js`: change `hours_threshold: 12` parameter

## Best Practices

1. **Always check counts first** — run the SELECT queries before UPDATE
2. **Schedule regular cleanup** — e.g., daily at midnight or weekly
3. **Monitor after cleanup** — verify the dashboard metrics update correctly
4. **Backup before cleanup** — especially in production
5. **Document changes** — keep a log of when and how many sessions were cleaned

## Troubleshooting

**"Permission denied" error**
- Verify your Supabase user/API key has write permissions on the sessions table
- Check RLS (Row Level Security) policies — may need to disable for service role key

**Sessions not closing**
- Verify the `ended_at` column exists and is nullable
- Check for foreign key or constraint violations

**Too many stale sessions found**
- Review login/logout flow — ensure sessions are being properly closed
- Check for frontend errors preventing logout (see browser console)
- Increase the idle threshold (e.g., `'24 hours'`) if 12h is too aggressive

## Integration with Dashboard

The admin dashboard now deduplicates active sessions by user. Cleanup removes truly orphaned rows, while deduplication handles edge cases. Both improve metric accuracy.

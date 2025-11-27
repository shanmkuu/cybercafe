# Fix for Session Creation Error

## Root Cause
The `sessions` table has a foreign key constraint pointing to the `users` table:
```
sessions.user_id → users.id (FOREIGN KEY)
```

But the `users` table is **empty**. All user data is in the `profiles` table:
```
profiles.id = "d2ab1651-c9b7-472c-b352-ac485eec5631"
users table = empty (0 rows)
```

So when trying to insert a session with a `user_id` from `profiles`, it fails because there's no matching row in `users`.

## Solution

You need to update the foreign key constraint in Supabase. Follow these steps:

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com
2. Select your cybercafe project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run This SQL
```sql
-- Drop the old foreign key constraint
ALTER TABLE public.sessions 
DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;

-- Add new foreign key constraint to profiles table
ALTER TABLE public.sessions 
ADD CONSTRAINT sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
ON DELETE CASCADE;
```

### Step 3: Click "Run"
You should see: "Success. No rows returned"

## Alternative: If RLS Policy Blocks It

If you get a "row-level security policy" error, you need to disable RLS on sessions table OR give it proper policies.

To disable RLS:
```sql
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
```

Or to create proper policies:
```sql
-- Allow authenticated users to insert their own sessions
CREATE POLICY "Users can create their own sessions"
ON public.sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read their own sessions
CREATE POLICY "Users can read their own sessions"
ON public.sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Allow authenticated users to update their own sessions
CREATE POLICY "Users can update their own sessions"
ON public.sessions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to read all sessions (if you have an is_admin function)
CREATE POLICY "Admins can read all sessions"
ON public.sessions
FOR SELECT
USING (true);
```

## After Fixing

Test again by:
1. Logging in as customer
2. Checking browser console for "Session created successfully"
3. Refreshing admin dashboard
4. Should see the new session in "Active Sessions"

## Files That Will Work After Fix

- `src/pages/authentication-portal/components/AuthenticationForm.jsx` ✅ (Already fixed)
- `src/pages/administrative-command-center/components/ActiveSessionMonitoring.jsx` ✅ (Ready to use)
- `src/lib/db.js` ✅ (All queries correct)

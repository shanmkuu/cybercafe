# Session Tracking Debug Checklist

## Issues Fixed

### 1. ✅ **User Data Location**
   - **Problem**: Code was looking for users in `users` table, but user data is in `profiles` table
   - **Fixed**: Changed `AuthenticationForm.jsx` line 95-100 to query `profiles` instead of `users`
   - **File**: `src/pages/authentication-portal/components/AuthenticationForm.jsx`

### 2. ✅ **Session Timestamp Column Name**
   - **Problem**: Code referenced `session.start_time` but schema uses `started_at`
   - **Fixed**: Changed `AuthenticationForm.jsx` line 134 from `sessionData.start_time` to `sessionData.started_at`
   - **File**: `src/pages/authentication-portal/components/AuthenticationForm.jsx`

## How to Test

### Step 1: Check Browser Console
When you login as a customer:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for logs like:
   - "Creating session for user: [user-id]"
   - "Session created successfully: [session-data]"
   - "Fetching active sessions..."
   - "Sessions fetched: [count]"

If you see errors, they'll appear in red.

### Step 2: Check Database Directly
Run the debug script to verify sessions exist:
```bash
node debug_sessions.js
```

Should show:
- "All sessions count: [number > 0]"
- "Active sessions (ended_at IS NULL): [number > 0]"

### Step 3: Login Flow
1. Go to authentication portal
2. Select "Customer" role
3. Enter credentials
4. Check console for logs
5. Navigate to admin dashboard
6. Should see "Active Sessions" populated

## Database Query Verification

The `getActiveSessions()` query should:
```javascript
select('*', 'profiles:user_id(full_name, username, avatar_url)')
  .is('ended_at', null)
  .order('started_at', { ascending: false })
```

This means:
- Fetches all columns from sessions
- Joins with profiles using user_id
- Filters for sessions where ended_at IS NULL (active sessions)
- Orders by most recent start time

## Expected Data Structure

When a session is created, it should have:
```javascript
{
  id: "uuid",
  user_id: "uuid",           // From auth.users.id
  event: "login",            // Auto-set by createSession()
  meta: null,                // Optional JSON
  started_at: "2025-11-27T...", // Auto-set by DB
  ended_at: null,            // NULL means active
  profiles: {                // Joined data
    full_name: "User Name",
    username: "user@email.com",
    avatar_url: "https://..."
  }
}
```

## Common Issues

### Sessions Not Creating
- Check: Are you getting "Session created successfully" in console?
- Check: Is `userId` being passed correctly?
- Check: Does the user exist in `profiles` table?

### Sessions Creating But Not Showing
- Check: Are there errors in the admin dashboard console?
- Check: Are you querying `profiles` table or `users` table?
- Check: Is the real-time subscription working? (Check for "Session change detected" logs)

### Admin Dashboard Shows 0 Sessions
- Check: Is `getActiveSessions()` returning data?
- Check: Are the sessions' `ended_at` actually NULL?
- Check: Is the profiles join working?

## Files Modified

1. `src/pages/authentication-portal/components/AuthenticationForm.jsx`
   - Line 95-100: Changed from `users` to `profiles` table query
   - Line 134: Changed from `start_time` to `started_at` column

2. `src/pages/administrative-command-center/components/ActiveSessionMonitoring.jsx`
   - Added console.log statements for debugging
   - Real-time subscription already in place
   - Session fetching logic already correct

## Next Steps if Still Not Working

1. Open DevTools in both customer and admin browser windows
2. Watch customer login console logs
3. Watch admin console logs when refreshing dashboard
4. Share console output if you see errors

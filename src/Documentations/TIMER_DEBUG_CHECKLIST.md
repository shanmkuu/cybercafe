# Session Timer Debug Checklist

## Issues Fixed ✅

1. **Column Name Error**: Changed `data.start_time` → `data.started_at`
   - This was preventing the timer from getting the correct start time
   - File: `src/pages/customer-workspace-portal/index.jsx` (lines 83, 85)

## What to Check

### 1. Browser LocalStorage
Open DevTools (F12) → Application → Local Storage

You should see:
```
sessionId: "some-uuid"
sessionStartTime: "2025-11-27T10:30:45.123Z"
userEmail: "your@email.com"
```

If `sessionStartTime` is missing or wrong, the timer won't work.

### 2. Browser Console
When you login, look for:
```
✅ "Creating session for user: [uuid]"
✅ "Session created: {id, started_at, ...}"
✅ "Fetching active sessions..."
✅ "Sessions fetched: 1"
```

If you see errors, they'll be red.

### 3. SessionTimer Component
The timer should display:
```
Elapsed Time:    00:00:42
Remaining:       01:59:18
```

- Elapsed should start at 0 and increase by ~1 every second
- Remaining should start at ~120 minutes and decrease by ~1 every second
- Color should change based on time remaining (green → yellow → red)

### 4. Database Check
Run the debug script:
```bash
node debug_sessions.js
```

Should show:
```
All sessions count: 1
Active sessions (ended_at IS NULL): 1
```

And sample session should have:
```
Event: login
Started: 2025-11-27T10:30:45.123Z
Ended: null
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Timer shows NaN or undefined | `sessionStartTime` is null | Check localStorage for sessionStartTime |
| Timer stuck at 00:00:00 | currentTime not updating | Check setInterval in SessionTimer is running |
| Timer not counting down | Math error in remaining calculation | Check SessionTimer.jsx getRemainingTime() function |
| Session not created | Wrong column name for start_time | ✅ Fixed (use started_at now) |
| Timer has wrong credit amount | remainingCredit prop not passed | Check CustomerWorkspacePortal passes it to SessionTimer |

## Session Flow Test

1. **Open customer app** (should not be logged in yet)
2. **Go to authentication portal**
3. **Login as customer**
4. **Check console** - Should see session created logs
5. **Check localStorage** - Should have sessionId and sessionStartTime
6. **Look at SessionTimer panel** - Should show elapsed and remaining time
7. **Wait 10 seconds** - Timer numbers should change
8. **Click "End Session"** - Should logout and end session
9. **Check admin dashboard** - Session should no longer appear

## After Fix

The timer should now:
- ✅ Start with correct timestamp from database
- ✅ Count up elapsed time every second
- ✅ Count down remaining time every second
- ✅ Change color as time runs low
- ✅ End session when you click button
- ✅ Remove from admin dashboard when ended

Try logging in again and let me know if the timer works! 🎯

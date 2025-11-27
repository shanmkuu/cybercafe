# Session Timer Implementation Guide

## What's Fixed

1. ✅ **Session Start Time Column**: Changed from `start_time` to `started_at` 
   - File: `src/pages/customer-workspace-portal/index.jsx` lines 83, 85
   - This fixes the timer getting the correct start time from the database

## How the Session Timer Works

### Components
1. **SessionTimer.jsx** - Visual timer display with:
   - Elapsed time (how long you've been in the session)
   - Remaining time (based on credit - default 120 minutes)
   - Extend button (to add more time)
   - End Session button (to logout)

2. **CustomerWorkspacePortal/index.jsx** - Main portal that:
   - Creates session on login
   - Passes `sessionStartTime` to SessionTimer
   - Handles extend and end session actions

### Data Flow

```
Login
  ↓
createSession(userId) in DB
  ↓
Returns: { id, user_id, started_at, event='login', ended_at=null }
  ↓
sessionStartTime = new Date(data.started_at)
  ↓
SessionTimer receives sessionStartTime
  ↓
Timer calculation:
  elapsed = (currentTime - sessionStartTime) / 1000 seconds
  remaining = (120 * 60) - elapsed seconds
  ↓
Display updates every second
```

## Session Timer Features

### Elapsed Time
- Shows how long you've been logged in
- Format: HH:MM:SS
- Updates every second

### Remaining Time
- Default: 120 minutes (2 hours) of credits
- Color coded:
  - 🟢 Green: > 30 minutes remaining
  - 🟡 Yellow: 10-30 minutes remaining  
  - 🔴 Red: < 10 minutes remaining

### Extend Session
- Click "Extend" button to add more time
- Options: 15, 30, 60, or 120 minutes
- (Currently not charging - implement pricing later)

### End Session
- Click "End Session" to logout immediately
- Calls `endSession(sessionId)`
- Sets `ended_at` timestamp in database
- Session disappears from admin dashboard

## What Should Happen Now

### When You Login:
1. ✅ Session created in database with `started_at` timestamp
2. ✅ SessionTimer component receives start time
3. ✅ Timer displays elapsed and remaining time
4. ✅ Timer updates every second

### When Timer Runs Out (remaining = 0):
- Session should automatically end (add timeout logic if needed)
- Display warning at 5 minute mark (add notification if needed)
- Auto-logout when time expires (optional feature)

### When You Click "End Session":
1. ✅ `endSession(sessionId)` is called
2. ✅ Database updates with `ended_at` timestamp and `event='logout'`
3. ✅ Session removed from active sessions in admin
4. ✅ You're logged out

## Testing the Timer

1. **Login as customer**
2. **Check Session Timer Panel** - Should show:
   - 00:00:XX Elapsed (starts at 0)
   - 02:00:00 Remaining (starts at 120 minutes)
3. **Watch timer update** - Numbers should change every second
4. **Click "Extend" button** - Should open modal with time options
5. **Click "End Session" button** - Should logout and end session

## If Timer Not Working

### Check These Things:

1. **Is sessionStartTime being set?**
   - Open browser DevTools → Application → LocalStorage
   - Look for `sessionStartTime` - should have ISO timestamp like "2025-11-27T10:30:00.000Z"

2. **Is SessionTimer receiving the prop?**
   - Add console.log in SessionTimer.jsx:
   ```javascript
   useEffect(() => {
     console.log('SessionTimer received:', { sessionStartTime, remainingCredit });
   }, [sessionStartTime, remainingCredit]);
   ```

3. **Is the interval updating?**
   - Check that `currentTime` updates every second
   - You should see time changing in the component

4. **Is the calculation correct?**
   - elapsed should increase by ~1 second per second
   - remaining should decrease by ~1 second per second

## Files Involved

- `src/pages/customer-workspace-portal/index.jsx` ✅ (Fixed)
- `src/pages/customer-workspace-portal/components/SessionTimer.jsx` (Working)
- `src/lib/db.js` (createSession, endSession functions)

## Future Enhancements

- [ ] Auto-logout when timer reaches 0
- [ ] Warning notification at 5 minutes remaining
- [ ] Charging system for extensions
- [ ] Session timeout tracking
- [ ] Admin ability to see remaining credit

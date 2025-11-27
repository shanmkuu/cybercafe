# Session Timer - Test Instructions

## Step 1: Clear Old Data
1. Open your browser DevTools (F12)
2. Go to "Application" tab
3. Click "Local Storage" 
4. Find and delete these entries:
   - `sessionStartTime`
   - `sessionId`
5. Refresh the page

## Step 2: Fresh Login
1. Go to authentication portal
2. Login as customer
3. Wait for the page to load

## Step 3: Check Browser Console
1. Open DevTools (F12) → "Console" tab
2. You should see logs like:

```
Initial sessionStartTime from localStorage: null
Session created: Object { id: "...", user_id: "...", started_at: "2025-11-27T10:30:45.123Z", ... }
Session started_at: 2025-11-27T10:30:45.123Z
Setting sessionStartTime to: Mon Nov 27 2025 10:30:45 GMT-0500 (Eastern Standard Time)
SessionTimer calculations: Object
  sessionStartTime: Mon Nov 27 2025 10:30:45 GMT-0500
  startTime: Mon Nov 27 2025 10:30:45 GMT-0500
  currentTime: Mon Nov 27 2025 10:30:46 GMT-0500
  elapsedMs: 1000
  elapsed: "0h 0m 1s"
  remaining: "1h 59m 59s"
```

## Step 4: What to Check
- `elapsedMs` should be small (1000 = 1 second, 2000 = 2 seconds, etc.)
- `elapsed` should show small values like "0h 0m 1s" not "1h 0m 0s"
- `remaining` should start close to "2h 0m 0s"
- Both should update every second

## Step 5: Share What You See
If it's still wrong, copy the console logs and tell me:
1. What `elapsedMs` shows
2. What `elapsed` time displays on the timer
3. What `remaining` time displays on the timer

This will help me pinpoint the exact issue! 🔍

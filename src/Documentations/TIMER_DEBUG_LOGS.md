# Session Timer Debug - Getting Wrong Start Time

## Added Debug Logging

I've added console.log statements to help identify the issue. Open your browser DevTools (F12) → Console and look for:

### 1. Initial Load
```
Initial sessionStartTime from localStorage: [timestamp or null]
```
- If this shows an old timestamp, localStorage has stale data
- If null/undefined, it will default to current time

### 2. After Session Creation
```
Session created: {id, user_id, event, started_at, ...}
Session started_at: 2025-11-27T10:30:45.123Z
Setting sessionStartTime to: Mon Nov 27 2025 10:30:45 GMT-0500 (Eastern Standard Time)
```

### 3. SessionTimer Component
```
SessionTimer received: { 
  sessionStartTime: Mon Nov 27 2025 10:30:45 GMT...,
  startTime: Mon Nov 27 2025 10:30:45 GMT...,
  remainingCredit: 120,
  currentTime: Mon Nov 27 2025 10:30:47 GMT...,
  elapsedMs: 2000
}
```

## What to Do

1. **Clear localStorage** before testing:
   - Open DevTools (F12) → Application → LocalStorage
   - Delete `sessionStartTime` and `sessionId`
   - Refresh page

2. **Login as customer**

3. **Check console for logs**:
   - Look for the three log groups above
   - Compare times - they should all be within a few seconds of each other
   - `elapsedMs` should be small (a few thousand milliseconds = a few seconds)

4. **Share the console output** if timer still shows wrong time

## Potential Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Timer shows 3 hours elapsed | OLD localStorage data | Clear localStorage and refresh |
| Times don't match | Session not being created | Check if session actually created in DB |
| elapsedMs is huge | sessionStartTime too old | Need to see the actual logs |

## If Still Wrong

After login, right-click browser console and select "Save as..." then share the output. The logs will show exactly what's happening.

The issue could be:
1. Old data in localStorage (easy fix - clear it)
2. Session created with wrong timestamp from DB
3. Math error in elapsed time calculation
4. Component receiving wrong prop

The logs will reveal which one! 🔍

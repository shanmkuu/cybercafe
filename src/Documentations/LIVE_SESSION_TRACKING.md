# Live Session Tracking Implementation

## Overview
Login and logout sessions are now stored in the database and reflected live on the admin dashboard with real-time updates.

## How It Works

### 1. Session Creation (Login)
When a user logs in via `AuthenticationForm.jsx`:
- `supabase.auth.signInWithPassword()` authenticates the user
- `createSession(userId)` is called to create a session record
- Session record contains: `user_id`, `event: 'login'`, `started_at` (auto-timestamp)
- Session is stored in `supabase/sessions` table with status "active"

### 2. Session Termination (Logout)
When a user logs out or session ends:
- `endSession(sessionId)` updates the session record
- Sets `ended_at` timestamp and changes `event` to `'logout'`
- Session becomes inactive and no longer appears in active sessions list

### 3. Real-Time Admin Dashboard Updates

#### ActiveSessionMonitoring Component Features:
- **Auto-fetches active sessions** on component mount via `getActiveSessions()`
- **Real-time subscriptions** using Supabase's `postgres_changes` channel
  - Listens to all INSERT, UPDATE, DELETE events on sessions table
  - Automatically refreshes session list when changes occur
- **Live duration calculation** - Shows elapsed time updating every second
- **Session termination** - Admin can manually end sessions with confirmation
- **Status indicators** - Shows login/activity/logout events with color coding

#### Database Query (`getActiveSessions`):
```javascript
.select(`
  *,
  profiles:user_id (full_name, username, avatar_url)
`)
.is('ended_at', null)  // Only active sessions
```

## Database Schema

### Sessions Table
```sql
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event text DEFAULT 'activity' (login, logout, activity),
  meta jsonb,
  started_at timestamp DEFAULT now(),
  ended_at timestamp,  -- NULL means active
  CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
)
```

## Key Functions

### In `src/lib/db.js`:

1. **`createSession(userId, workstationId)`**
   - Creates new session on login
   - Returns session ID and start time

2. **`endSession(sessionId)`**
   - Updates session with end time
   - Sets event to 'logout'

3. **`getActiveSessions()`**
   - Fetches all sessions where `ended_at IS NULL`
   - Includes user profile data (name, avatar, username)
   - Used for admin dashboard

4. **`terminateSession(sessionId)`** (NEW)
   - Allows admin to manually end any session
   - Sets ended_at and event='logout'

5. **`getSessionDetails(sessionId)`** (NEW)
   - Gets detailed info for a specific session
   - Includes user profile

## Component Updates

### `ActiveSessionMonitoring.jsx` Changes:
- ✅ Fetches live session data on mount
- ✅ Subscribes to real-time Supabase changes
- ✅ Displays user avatar, name, workstation, duration
- ✅ Shows event status (login/logout/activity)
- ✅ Admin can terminate sessions manually
- ✅ Auto-refreshes on database changes
- ✅ Shows "No active sessions" when empty

### `AuthenticationForm.jsx` Already Integrated:
- ✅ Creates session on successful login
- ✅ Stores session ID in localStorage

### `CustomerWorkspacePortal.jsx` Already Integrated:
- ✅ Calls `endSession()` on logout
- ✅ Calls `endSession()` when session timer expires

## Real-Time Flow Diagram

```
User Login
    ↓
createSession(userId)
    ↓
Session record created in DB
    ↓
Supabase postgres_changes event triggered
    ↓
ActiveSessionMonitoring subscribes to change
    ↓
Component re-fetches sessions
    ↓
Admin dashboard updates instantly
    ↓
New session appears in list with live duration counter
```

## Testing

1. **Login as customer** → Check admin dashboard → New session appears
2. **Session updates live** → Duration counter increments every second
3. **Logout or timeout** → Session disappears from active list
4. **Admin terminates session** → Confirm dialog → Session ends immediately
5. **Open in multiple tabs** → Changes sync instantly across all admin dashboards

## Notes

- Sessions automatically filter by `ended_at IS NULL`
- Duration calculation updates every second in real-time
- Status badges show event type (login/logout/activity)
- Color coding: Green = active, Gray = ended
- All database operations are async with proper error handling
- Real-time subscriptions clean up on component unmount

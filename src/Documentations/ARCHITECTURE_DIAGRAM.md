# System Architecture Diagram

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   QuickActionToolbar Component                   │
│                   (src/pages/.../QuickActionToolbar.jsx)          │
└─────────┬────────────────────────────────────────────────────────┘
          │
          ├──> [Backup Now Button]  ─┐
          │                           │
          ├──> [Export Logs Button] ──┼──> handleBackup()
          │                           │    handleExportLogs()
          └──> [Health Check Button]─┐    handleHealthCheck()
                                     │
          ┌────────────────────────────────────────────────────┐
          │         src/lib/db.js - Database Layer             │
          │        (New Functions Added Below)                  │
          └────────────┬───────────────────────────────────────┘
                       │
         ┌─────────────┼──────────────────┐
         │             │                  │
    [Backups]   [Log Export]       [Health Check]
         │             │                  │
         ├──────┬──────┴──┬──────────┬────┴────┬─────────┐
         │      │         │          │         │         │
         ↓      ↓         ↓          ↓         ↓         ↓
    ┌────────┬────────┬─────────┬──────────┬──────┬──────────┐
    │backups │file_   │sessions │workstations│files│ backups │
    │ table  │ logs   │ table   │   table    │table│  table  │
    │        │ table  │         │            │     │         │
    └────────┴────────┴─────────┴──────────┴──────┴──────────┘
                        Supabase Database
```

---

## Function Call Hierarchy

### 1. Backup System

```
handleBackup()
│
├─ [User Confirms]
│
├─> createBackup()
│   └─> supabase.from('backups').insert([...])
│       └─> ✓ Backup record created
│
├─ setTimeout(2000ms) [Process simulation]
│
├─> supabase.from('files').select('size')
│   └─> Get all files and calculate total size
│
├─> updateBackupStatus()
│   └─> supabase.from('backups').update(...)
│       └─> ✓ Status updated to 'completed'
│
└─> [Show results to user]
    └─> File count: X, Size: Y MB
```

### 2. Export Logs System

```
handleExportLogs()
│
├─> getSystemLogsForExport(30)
│   │
│   ├─> supabase.from('file_logs').select()
│   │   .gte('timestamp', 30_days_ago)
│   │   └─> File activity logs
│   │
│   ├─> supabase.from('sessions').select()
│   │   .gte('start_time', 30_days_ago)
│   │   └─> Session records
│   │
│   └─> supabase.from('backups').select()
│       .gte('started_at', 30_days_ago)
│       └─> Backup history
│
├─> Generate CSV Content
│   ├─ Section 1: File Activity Logs
│   ├─ Section 2: Session Logs
│   └─ Section 3: Backup Logs
│
├─> Create Download Link
│   └─> document.createElement('a')
│
└─> Trigger Download
    └─> system_logs_YYYY-MM-DD.csv
```

### 3. Health Check System

```
getSystemHealth()
│
├─> Parallel Query Phase
│   │
│   ├─> supabase.from('workstations').select()
│   │   └─> Get all workstations
│   │
│   ├─> supabase.from('sessions').select().eq('status', 'active')
│   │   └─> Get active sessions only
│   │
│   ├─> supabase.from('files').select()
│   │   └─> Get all files
│   │
│   └─> supabase.from('backups').select()
│       .eq('status', 'completed')
│       .order('completed_at', DESC)
│       .limit(1)
│       └─> Get last backup
│
├─> Calculate Metrics
│   │
│   ├─> cpu = (activeWorkstations / totalWorkstations) * 100
│   │
│   ├─> memory = max(0, 100 - (sessionCount * 5))
│   │
│   ├─> storage = max(0, 100 - (fileCount * 0.5))
│   │
│   ├─> network = (sessionCount > 0) ? max(50, 100 - (sessionCount * 3)) : 100
│   │
│   ├─> backup = (lastBackup?.status === 'completed') ? 100 : 0
│   │
│   └─> overall = average(cpu, memory, storage, network, backup)
│
└─> Return Health Data
    ├─ cpu%, memory%, storage%, network%, backup%, overall%
    ├─ activeWorkstations, totalWorkstations
    ├─ activeSessions, totalFiles
    └─ lastBackup timestamp
```

---

## Data Flow Diagram: CSV Export

```
┌──────────────────────────────────┐
│  File Activity Logs              │
│  From: file_logs table           │
│  Last 30 days                    │
└──────────┬───────────────────────┘
           │
           ├─ timestamp
           ├─ user_id
           ├─ file_name
           └─ action (upload/download)
                    │
                    ↓
           ┌────────────────────┐
           │   CSV Section 1    │
           │ File Activity Logs │
           └────────────────────┘
                    │
                    │
┌──────────────────────────────────┐
│  Session Records                 │
│  From: sessions table            │
│  Last 30 days                    │
└──────────┬───────────────────────┘
           │
           ├─ start_time
           ├─ end_time
           ├─ user_id
           ├─ workstation_id
           ├─ status
           └─ duration (calculated)
                    │
                    ↓
           ┌────────────────────┐
           │   CSV Section 2    │
           │   Session Logs     │
           └────────────────────┘
                    │
                    │
┌──────────────────────────────────┐
│  Backup Records                  │
│  From: backups table             │
│  Last 30 days                    │
└──────────┬───────────────────────┘
           │
           ├─ started_at
           ├─ completed_at
           ├─ status
           ├─ file_count
           └─ backup_size → convert to MB
                    │
                    ↓
           ┌────────────────────┐
           │   CSV Section 3    │
           │   Backup Logs      │
           └────────────────────┘
                    │
                    ↓
        ┌─────────────────────┐
        │  Combined CSV File  │
        │system_logs_YYYY    │
        │-MM-DD.csv          │
        └─────────────────────┘
                    │
                    ↓
        ┌─────────────────────┐
        │  Browser Download   │
        │  (Auto-triggered)   │
        └─────────────────────┘
```

---

## State Management Flow

### Component State

```
QuickActionToolbar Component
│
├─ showNotifications (boolean)
│  └─ Controls notification panel visibility
│
├─ showAddUser (boolean)
│  └─ Controls add user form visibility
│
├─ newUser (object)
│  └─ Form state for new user creation
│
├─ addUserMessage (object)
│  └─ Feedback messages for user creation
│
└─ systemAlerts (array)
   └─ Alert data from state (static for now)
```

### Async Operations

```
handleBackup()
├─ State: Loading during backup
├─ Error State: If backup fails
└─ Success State: Shows results

handleExportLogs()
├─ State: Loading while fetching
├─ Error State: If export fails
└─ Success State: Download triggered

handleHealthCheck()
├─ State: Loading while calculating
├─ Error State: If health check fails
└─ Success State: Shows report
```

---

## Database Query Performance

### Query Execution Order

```
1. getSystemHealth() - Parallel Queries
   ┌─────────────────────────────────────┐
   │ Query 1: workstations.select()      │  ~20ms
   │ Query 2: sessions.select(active)    │  ~15ms
   │ Query 3: files.select()             │  ~25ms
   │ Query 4: backups.select(completed)  │  ~10ms
   └─────────────────────────────────────┘
   Total Time: ~25ms (parallel, not sequential)

2. getSystemLogsForExport() - Parallel Queries
   ┌─────────────────────────────────────┐
   │ Query 1: file_logs.select()         │  ~50ms
   │ Query 2: sessions.select()          │  ~40ms
   │ Query 3: backups.select()           │  ~20ms
   └─────────────────────────────────────┘
   Total Time: ~50ms (parallel)
   + CSV Generation: ~5ms
   = Total: ~55ms

3. createBackup() - Single Write
   └─ backups.insert() → ~10ms

4. updateBackupStatus() - Single Update
   └─ backups.update() → ~10ms
```

### Index Strategy

```
✓ idx_backups_status
  - Speeds up: .eq('status', 'completed')
  - Used by: getSystemHealth()

✓ idx_backups_started_at
  - Speeds up: .gte('started_at', date)
  - Used by: getSystemLogsForExport()

✓ idx_sessions_status (already exists)
  - Speeds up: .eq('status', 'active')
  - Used by: getSystemHealth()

✓ idx_file_logs_created_at (if exists)
  - Speeds up: .gte('created_at', date)
  - Used by: getSystemLogsForExport()
```

---

## Error Handling Flow

```
User Action
    │
    ├─ Try Block
    │  ├─ Query Database
    │  ├─ Process Data
    │  └─ Return Results
    │
    └─ Catch Block
       ├─ Log to Console
       │  └─ console.error()
       │
       ├─ Store Error
       │  └─ error object
       │
       └─ Show to User
          ├─ Alert Message
          ├─ Error Details (where applicable)
          └─ Guidance for recovery
```

### Error Types Handled

```
1. Database Connection Error
   └─> "Error exporting logs: [database error message]"

2. Missing Data
   └─> "No logs available for export."
   └─> "Unable to retrieve system health data."

3. Invalid Response
   └─> "User creation failed: no user ID returned."

4. Timeout
   └─> Graceful degradation with fallback values
```

---

## CSV Structure Example

```
File Activity Logs:
Timestamp,User ID,File Name,Action,Type
11/27/2025 10:30:45 AM,user-123,document.pdf,upload,File Activity
11/27/2025 10:31:12 AM,user-456,image.jpg,download,File Activity

Session Logs:
Start Time,End Time,User ID,Workstation ID,Status,Duration
11/27/2025 09:00:00 AM,11/27/2025 09:45:30 AM,user-123,WS-001,completed,45 min
11/27/2025 10:15:00 AM,11/27/2025 10:45:00 AM,user-456,WS-002,completed,30 min

Backup Logs:
Started At,Completed At,Status,File Count,Backup Size (MB)
11/27/2025 02:00:00 AM,11/27/2025 02:15:30 AM,completed,1250,156.50
11/26/2025 02:00:00 AM,11/26/2025 02:18:45 AM,completed,1180,142.30
```

---

## Health Report Example

```
System Health Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Health: 85%

Component Status:
• Workstation Utilization: 75%  (3 active of 4 total)
• Session Memory: 90%           (2 sessions, low impact)
• Storage Usage: 80%            (156 files)
• Network Status: 85%           (Good connectivity)
• Backup Health: 100%           (Recent backup available)

System Statistics:
• Active Workstations: 3/4
• Active Sessions: 2
• Total Files: 156
• Last Backup: 11/27/2025, 2:15:30 AM

Status: ✓ All systems operational
```

---

## Sequence Diagram: Complete Backup Flow

```
User              Browser              Database
  │                 │                      │
  │ Click "Backup"  │                      │
  ├────────────────>│                      │
  │                 │ Confirm Dialog       │
  │                 │<─────────────────────┐
  │                 │                      │
  │ Click "OK"      │                      │
  ├────────────────>│                      │
  │                 │ createBackup()       │
  │                 │ ─────────────────────>
  │                 │                      │ INSERT into backups
  │                 │                      │ status='in_progress'
  │                 │ <─────────────────────
  │                 │ Show "Backup Started" │
  │ "Backup        │<────────────────────┐
  │  started..."   │                      │
  │<────────────────┤                      │
  │                 │                      │
  │                 │ Wait 2 seconds       │
  │                 │                      │
  │                 │ SELECT files         │
  │                 │ ─────────────────────>
  │                 │                      │ Fetch all files
  │                 │ <─────────────────────
  │                 │ Calculate size       │
  │                 │                      │
  │                 │ updateBackupStatus() │
  │                 │ ─────────────────────>
  │                 │                      │ UPDATE backups
  │                 │                      │ status='completed'
  │                 │ <─────────────────────
  │                 │ Show "Backup complete"│
  │ "Backup        │<────────────────────┐
  │ Complete! 50   │                      │
  │ files, 45 MB"  │                      │
  │<────────────────┤                      │
  │                 │                      │
```

This visual representation shows the complete flow from user action through database operations to final result display.

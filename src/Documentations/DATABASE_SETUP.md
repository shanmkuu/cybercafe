# Database Setup Guide - SQL Scripts

## Table Schemas

### ✅ Existing Tables (Already in Supabase)

#### `file_logs` Table (Existing)
```sql
CREATE TABLE public.file_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  file_name TEXT NOT NULL,
  action TEXT NULL DEFAULT 'upload'::text,
  created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT now(),
  
  CONSTRAINT file_logs_pkey PRIMARY KEY (id),
  CONSTRAINT file_logs_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT file_logs_action_check CHECK (
    action = ANY (ARRAY['upload'::text, 'download'::text, 'delete'::text])
  )
);
```

**Columns:**
- `id` - Unique identifier (UUID)
- `user_id` - Reference to user (can be NULL)
- `file_name` - Name of the file (required)
- `action` - Operation type: 'upload', 'download', or 'delete'
- `created_at` - Timestamp when file activity occurred

**Note:** This table tracks all file operations (uploads, downloads, deletes)

---

### ✅ NEW TABLE - Create This One

#### `backups` Table (REQUIRED - Create Now)
```sql
CREATE TABLE public.backups (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in_progress'::text,
  backup_size BIGINT NOT NULL DEFAULT 0,
  file_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT backups_pkey PRIMARY KEY (id),
  CONSTRAINT backups_status_check CHECK (
    status = ANY (ARRAY['in_progress'::text, 'completed'::text, 'failed'::text])
  )
) TABLESPACE pg_default;
```

**Columns:**
- `id` - Unique identifier (UUID)
- `started_at` - When backup started (required)
- `completed_at` - When backup ended (nullable)
- `status` - State: 'in_progress', 'completed', or 'failed'
- `backup_size` - Size in bytes (0 initially)
- `file_count` - Number of files backed up
- `created_at` - Record creation timestamp

**Used by:**
- Backup function (creates & updates records)
- Export Logs function (backup history section)
- Health Check function (backup status)

---

## 📋 Setup Instructions

### Step 1: Create Backups Table

Go to **Supabase Dashboard → SQL Editor** and paste:

```sql
CREATE TABLE public.backups (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in_progress'::text,
  backup_size BIGINT NOT NULL DEFAULT 0,
  file_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT backups_pkey PRIMARY KEY (id),
  CONSTRAINT backups_status_check CHECK (
    status = ANY (ARRAY['in_progress'::text, 'completed'::text, 'failed'::text])
  )
) TABLESPACE pg_default;
```

Then click **RUN** and verify success (should see "CREATE TABLE" confirmation).

---

### Step 2: Create Indexes (Performance Optimization)

Still in SQL Editor, paste and run each:

```sql
-- Index for status filtering (used in Health Check & Export)
CREATE INDEX idx_backups_status ON public.backups(status);
```

```sql
-- Index for date range queries (used in Export)
CREATE INDEX idx_backups_started_at ON public.backups(started_at DESC);
```

```sql
-- Compound index for common queries
CREATE INDEX idx_backups_status_started_at 
  ON public.backups(status, started_at DESC);
```

---

### Step 3: Enable Row Level Security (RLS)

Still in SQL Editor, run these commands:

```sql
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
```

Then create policies:

```sql
-- Allow authenticated users to read all backups
CREATE POLICY "Enable read access for authenticated users" ON public.backups
  FOR SELECT TO authenticated USING (true);
```

```sql
-- Allow authenticated users to create backups
CREATE POLICY "Enable insert for authenticated users" ON public.backups
  FOR INSERT TO authenticated WITH CHECK (true);
```

```sql
-- Allow authenticated users to update backups
CREATE POLICY "Enable update for authenticated users" ON public.backups
  FOR UPDATE TO authenticated USING (true);
```

---

## Existing Tables (Already in Your Database)

These tables are already created and used by the new functions:


### `file_logs` Table (Already Exists)
**Schema:**
```
- id (UUID) - Primary Key
- user_id (UUID) - Foreign key to users table
- file_name (TEXT) - Name of the file
- action (TEXT) - 'upload', 'download', or 'delete'
- created_at (TIMESTAMP) - When the activity occurred
```

**Used by:**
- `getSystemLogsForExport()` - Gets file activity for last 30 days
- `getSystemHealth()` - May use for activity metrics

**Key constraint:** action can only be 'upload', 'download', or 'delete'

---

### `sessions` Table (Already Exists)
**Schema:**
```
- id (UUID) - Primary Key
- user_id (UUID) - Foreign key to users table
- workstation_id (TEXT) - ID of the workstation
- start_time (TIMESTAMP) - When session started
- end_time (TIMESTAMP, nullable) - When session ended
- status (TEXT) - 'active', 'completed', 'idle', etc.
```

**Used by:**
- `getSystemLogsForExport()` - Gets session history for last 30 days
- `getSystemHealth()` - Counts active sessions for memory metric

---

### `workstations` Table (Already Exists)
**Schema:**
```
- id (UUID or TEXT) - Primary Key
- status (TEXT) - 'active', 'inactive', 'offline', etc.
- [other columns as defined in your schema]
```

**Used by:**
- `getSystemHealth()` - Calculates workstation utilization percentage

---

### `files` Table (Already Exists)
**Schema:**
```
- id (UUID) - Primary Key
- user_id (UUID) - Foreign key to users table
- size (BIGINT) - File size in bytes
- type (TEXT) - MIME type or file extension
- created_at (TIMESTAMP) - When file was uploaded
- [other columns as defined in your schema]
```

**Used by:**
- `handleBackup()` - Queries all files to calculate backup size
- `getSystemHealth()` - Counts total files for storage metric

---

## Step 4: Verify Setup

After creating the `backups` table:

### 1. Test in Supabase Console

Open your Supabase project and run:

```sql
-- Should return empty table
SELECT * FROM backups;

-- Insert a test backup
INSERT INTO backups (started_at, status, backup_size, file_count)
VALUES (now(), 'completed', 1024000, 50);

-- Should return your test backup
SELECT * FROM backups;
```

### 2. Test from Your App

In browser console after app loads:

```javascript
import { createBackup, updateBackupStatus, getBackupHistory } from './src/lib/db.js';

// Test creating a backup
const result = await createBackup();
console.log('Create backup:', result);

// Test getting history
const history = await getBackupHistory(5);
console.log('Backup history:', history);
```

### 3. Test the UI Buttons

1. Go to Administrative Command Center
2. Click "Backup Now" button
3. Check database for new backup record
4. Click "Export Logs" button
5. Verify CSV file downloads
6. Click "Health Check" button
7. Verify metrics display

---

## Troubleshooting

### Error: "relation 'public.backups' does not exist"

**Solution:** The table hasn't been created yet. Run the SQL script above in Supabase SQL Editor.

### Error: "permission denied for schema public"

**Solution:** Make sure you're logged in as a Supabase admin or have proper permissions.

### Export Logs is empty

**Solution:** Make sure your `file_logs`, `sessions`, and `backups` tables have data. Check:
```sql
SELECT COUNT(*) FROM file_logs;
SELECT COUNT(*) FROM sessions;
SELECT COUNT(*) FROM backups;
```

### Health Check shows all 0%

**Solution:** Ensure `workstations` table has at least one workstation with status='active':
```sql
SELECT * FROM workstations;
-- If empty, add:
INSERT INTO workstations (id, status) VALUES ('WS-001', 'active');
```

---

## Performance Notes

- Add indexes on frequently queried columns (already included in SQL script)
- `getSystemLogsForExport(30)` queries 3 tables - keep retention policy reasonable
- Consider archiving old logs if table grows large
- For high-volume systems, consider partitioning `file_logs` table by date

---

## Backup Retention Policy (Optional)

To automatically clean up old backups after 90 days:

```sql
-- Create a function to delete old backups
CREATE OR REPLACE FUNCTION delete_old_backups()
RETURNS void AS $$
BEGIN
  DELETE FROM backups
  WHERE completed_at IS NOT NULL
  AND completed_at < NOW() - INTERVAL '90 days'
  AND status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Schedule it to run daily (requires pg_cron extension)
SELECT cron.schedule('delete-old-backups', '0 2 * * *', 'SELECT delete_old_backups()');
```


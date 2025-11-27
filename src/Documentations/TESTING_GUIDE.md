# Testing Guide for New System Functions

## Manual Testing in Browser Console

### Test 1: Backup Function

```javascript
// Simulating the backup flow manually
import { createBackup, updateBackupStatus, getBackupHistory } from './src/lib/db.js';
import { supabase } from './src/lib/supabase.js';

// Step 1: Create a backup
const { data: backupData, error: backupError } = await createBackup();
console.log('Backup created:', backupData);

// Step 2: Get the backup ID
const backupId = backupData.id;

// Step 3: Simulate getting file stats
const { data: files } = await supabase.from('files').select('size');
const totalSize = files?.reduce((sum, f) => sum + (f.size || 0), 0) || 0;
const fileCount = files?.length || 0;
console.log(`Files: ${fileCount}, Total Size: ${totalSize} bytes`);

// Step 4: Update backup status
const { data: updatedBackup } = await updateBackupStatus(backupId, 'completed', totalSize, fileCount);
console.log('Backup updated:', updatedBackup);

// Step 5: Get backup history
const { data: history } = await getBackupHistory(5);
console.log('Backup history:', history);
```

---

### Test 2: Export Logs Function

```javascript
import { getSystemLogsForExport } from './src/lib/db.js';

// Fetch logs from last 7 days
const { data: logsData, error: logsError } = await getSystemLogsForExport(7);
console.log('System logs:', logsData);

// Check each log type
console.log(`File logs: ${logsData.fileLogs.length}`);
console.log(`Sessions: ${logsData.sessions.length}`);
console.log(`Backups: ${logsData.backups.length}`);

// Example: Show first file log
if (logsData.fileLogs.length > 0) {
  console.log('Sample file log:', logsData.fileLogs[0]);
}

// Example: Show first session
if (logsData.sessions.length > 0) {
  console.log('Sample session:', logsData.sessions[0]);
}
```

---

### Test 3: Health Check Function

```javascript
import { getSystemHealth } from './src/lib/db.js';

// Get system health metrics
const { data: healthData, error: healthError } = await getSystemHealth();
console.log('System health:', healthData);

// Check individual metrics
console.log(`CPU: ${healthData.cpu}%`);
console.log(`Memory: ${healthData.memory}%`);
console.log(`Storage: ${healthData.storage}%`);
console.log(`Network: ${healthData.network}%`);
console.log(`Backup: ${healthData.backup}%`);
console.log(`Overall: ${healthData.overall}%`);

// Check system statistics
console.log(`Active workstations: ${healthData.activeWorkstations}/${healthData.totalWorkstations}`);
console.log(`Active sessions: ${healthData.activeSessions}`);
console.log(`Total files: ${healthData.totalFiles}`);
console.log(`Last backup: ${healthData.lastBackup}`);
```

---

## Unit Tests (Jest)

Create a file: `src/lib/__tests__/db.test.js`

```javascript
import { getSystemHealth, getSystemLogsForExport, createBackup, updateBackupStatus } from '../db';

describe('Database Functions', () => {
  
  describe('getSystemHealth', () => {
    it('should return health metrics', async () => {
      const { data, error } = await getSystemHealth();
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.overall).toBeGreaterThanOrEqual(0);
      expect(data.overall).toBeLessThanOrEqual(100);
      expect(data.cpu).toBeGreaterThanOrEqual(0);
      expect(data.memory).toBeGreaterThanOrEqual(0);
      expect(data.storage).toBeGreaterThanOrEqual(0);
      expect(data.network).toBeGreaterThanOrEqual(0);
      expect(data.backup).toBeGreaterThanOrEqual(0);
    });

    it('should include system statistics', async () => {
      const { data } = await getSystemHealth();
      
      expect(data.activeWorkstations).toBeDefined();
      expect(data.totalWorkstations).toBeDefined();
      expect(data.activeSessions).toBeDefined();
      expect(data.totalFiles).toBeDefined();
    });
  });

  describe('getSystemLogsForExport', () => {
    it('should return logs for specified days', async () => {
      const { data, error } = await getSystemLogsForExport(7);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data.fileLogs)).toBe(true);
      expect(Array.isArray(data.sessions)).toBe(true);
      expect(Array.isArray(data.backups)).toBe(true);
    });

    it('should return empty arrays if no logs', async () => {
      const { data } = await getSystemLogsForExport(1);
      
      expect(Array.isArray(data.fileLogs)).toBe(true);
      expect(Array.isArray(data.sessions)).toBe(true);
      expect(Array.isArray(data.backups)).toBe(true);
    });
  });

  describe('createBackup', () => {
    it('should create a backup record', async () => {
      const { data, error } = await createBackup();
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.status).toBe('in_progress');
      expect(data.backup_size).toBe(0);
      expect(data.file_count).toBe(0);
    });
  });

  describe('updateBackupStatus', () => {
    it('should update backup status and set completion time', async () => {
      // Create a backup first
      const { data: backup } = await createBackup();
      
      // Update it
      const { data: updated, error } = await updateBackupStatus(
        backup.id,
        'completed',
        1000000,
        50
      );
      
      expect(error).toBeNull();
      expect(updated.status).toBe('completed');
      expect(updated.backup_size).toBe(1000000);
      expect(updated.file_count).toBe(50);
      expect(updated.completed_at).toBeDefined();
    });
  });
});
```

---

## Integration Test Scenario

### Scenario: Full Backup & Restore Flow

```javascript
// Test file: src/__tests__/integration/backup-flow.test.js

describe('Backup & Restore Integration', () => {
  it('should complete full backup workflow', async () => {
    // 1. Start backup
    const { data: backup1 } = await createBackup();
    expect(backup1.status).toBe('in_progress');

    // 2. Get files to backup
    const { data: files } = await supabase.from('files').select('size');
    const totalSize = files?.reduce((sum, f) => sum + (f.size || 0), 0) || 0;

    // 3. Complete backup
    const { data: backup2 } = await updateBackupStatus(
      backup1.id,
      'completed',
      totalSize,
      files.length
    );
    expect(backup2.status).toBe('completed');

    // 4. Retrieve backup history
    const { data: history } = await getBackupHistory(1);
    expect(history[0].id).toBe(backup1.id);
    expect(history[0].status).toBe('completed');

    // 5. Export logs (should include new backup)
    const { data: logs } = await getSystemLogsForExport(1);
    const backupInLogs = logs.backups.find(b => b.id === backup1.id);
    expect(backupInLogs).toBeDefined();
  });

  it('should handle failed backups', async () => {
    const { data: backup } = await createBackup();
    
    // Simulate failure
    const { data: failedBackup } = await updateBackupStatus(
      backup.id,
      'failed',
      0,
      0
    );
    
    expect(failedBackup.status).toBe('failed');
    expect(failedBackup.completed_at).toBeDefined();
  });
});
```

---

## Performance Testing

### Test Query Performance

```javascript
console.time('getSystemHealth');
const { data: health } = await getSystemHealth();
console.timeEnd('getSystemHealth');
// Expected: < 100ms

console.time('getSystemLogsForExport 7 days');
const { data: logs } = await getSystemLogsForExport(7);
console.timeEnd('getSystemLogsForExport 7 days');
// Expected: < 500ms (depends on data volume)

console.time('getBackupHistory');
const { data: history } = await getBackupHistory(10);
console.timeEnd('getBackupHistory');
// Expected: < 50ms
```

---

## UI Interaction Testing

### Backup Button Test
```
1. Navigate to Administrative Command Center
2. Click "Backup Now" button
3. Confirm in dialog
4. Wait for "Backup started..." alert
5. Wait 3 seconds for "Backup completed" alert
6. Verify file count and size are shown
7. Check Supabase that new backup record exists
```

### Export Logs Test
```
1. Click "Export Logs" button
2. Wait for processing alert
3. Verify CSV file downloads with name: system_logs_YYYY-MM-DD.csv
4. Open CSV in spreadsheet editor
5. Verify three sections:
   - File Activity Logs (header + data)
   - Session Logs (header + data)
   - Backup Logs (header + data)
6. Check timestamps are formatted correctly
```

### Health Check Test
```
1. Click "Health Check" button
2. Wait for processing alert
3. Verify report shows:
   - Overall Health %
   - Component percentages (CPU, Memory, Storage, Network, Backup)
   - System Statistics (workstations, sessions, files, last backup)
   - Status indicator (✓/⚠/✗)
4. Verify numbers are realistic (0-100%)
```

---

## Error Scenario Testing

### Test Missing Backups Table
```
1. Delete backups table from Supabase
2. Click "Backup Now"
3. Verify error message displays
4. Check console for error details
5. Restore backups table
```

### Test No Data Available
```
1. Clear all data from tables (or use test environment)
2. Click "Export Logs" - should handle empty data gracefully
3. Click "Health Check" - should show 0% for metrics
4. Verify no crashes occur
```

### Test Database Connection Error
```
1. Disable Supabase in browser DevTools (Network tab)
2. Click any button
3. Verify user-friendly error message
4. Re-enable Supabase
5. Button should work again
```

---

## Debugging Tips

### Enable Verbose Logging

Add to your component:

```javascript
// Before calling functions
localStorage.setItem('DEBUG_DB', 'true');

// In db.js, add at top of each function:
if (localStorage.getItem('DEBUG_DB')) {
  console.log(`[DB] Calling function...`, { params });
}
```

### Monitor Network Requests

In browser DevTools:
1. Open Network tab
2. Filter by "api" or "supabase"
3. Watch requests as you click buttons
4. Check response payload and status

### Check Supabase Logs

In Supabase Dashboard:
1. Go to Logs → API
2. Filter by function name (e.g., "createBackup")
3. Check for errors or slow queries

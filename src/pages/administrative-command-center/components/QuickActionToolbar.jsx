import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';
import { hashPassword } from '../../../lib/password';
import { createBackup, updateBackupStatus, getSystemLogsForExport, getSystemHealth } from '../../../lib/db';

const QuickActionToolbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'customer' });
  const [addUserMessage, setAddUserMessage] = useState({ type: '', text: '' });
  const [systemAlerts] = useState([
    {
      id: 'alert-001',
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Workstation WS-003 is using 89% memory',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      workstation: 'WS-003'
    },
    {
      id: 'alert-002',
      type: 'info',
      title: 'Deep Freeze Cycle Complete',
      message: 'All workstations have been reset successfully',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      workstation: 'All'
    },
    {
      id: 'alert-003',
      type: 'success',
      title: 'Backup Completed',
      message: 'Daily backup completed successfully at 02:00 AM',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      workstation: 'Server'
    }
  ]);

  const openAddUser = () => {
    setShowAddUser(true);
    setShowNotifications(false);
  };

  const closeAddUser = () => {
    setShowAddUser(false);
    setNewUser({ username: '', email: '', password: '', role: 'customer' });
    setAddUserMessage({ type: '', text: '' });
  };

  const submitAddUser = async (e) => {
    e.preventDefault();

    // Validation
    if (!newUser.username?.trim()) {
      setAddUserMessage({ type: 'error', text: 'Username is required' });
      return;
    }
    if (!newUser.email?.trim()) {
      setAddUserMessage({ type: 'error', text: 'Email is required' });
      return;
    }
    if (!newUser.password?.trim()) {
      setAddUserMessage({ type: 'error', text: 'Password is required' });
      return;
    }
    if (newUser.password.length < 6) {
      setAddUserMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      // 1️⃣ Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email.trim(),
        password: newUser.password,
        options: {
          emailRedirectTo: undefined, // skip redirect
        },
      });

      if (authError) {
        setAddUserMessage({ type: 'error', text: `Auth error: ${authError.message}` });
        return;
      }

      const userId = authData?.user?.id;
      if (!userId) {
        setAddUserMessage({ type: 'error', text: 'User creation failed: no user ID returned.' });
        return;
      }

      // 2️⃣ Insert into your custom users table with the same user_id
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: userId, // keep consistent with Supabase Auth ID
          username: newUser.username.trim(),
          email: newUser.email.trim(),
          role: newUser.role,
        },
      ]);

      if (dbError) {
        setAddUserMessage({ type: 'error', text: `Database error: ${dbError.message}` });
        return;
      }

      setAddUserMessage({
        type: 'success',
        text: `User ${newUser.username} added successfully!`,
      });

      setTimeout(() => {
        closeAddUser();
      }, 2000);
    } catch (err) {
      console.error(err);
      setAddUserMessage({ type: 'error', text: `Error: ${err.message}` });
    }
  };


  const handleBackup = async () => {
    const confirmBackup = window.confirm("Start system backup?");
    if (!confirmBackup) return;

    try {
      // Create backup record in database
      const { data: backupData, error: backupError } = await createBackup();

      if (backupError) {
        alert(`Error starting backup: ${backupError.message}`);
        return;
      }

      const backupId = backupData?.id;
      alert("Backup started successfully. Archiving files...");

      // Simulate backup processing (in real scenario, this would be a background job)
      setTimeout(async () => {
        try {
          // Get file stats to determine backup size
          const { data: files } = await supabase.from('files').select('size');
          const totalSize = files?.reduce((sum, f) => sum + (f.size || 0), 0) || 0;
          const fileCount = files?.length || 0;

          // Update backup status to completed
          await updateBackupStatus(backupId, 'completed', totalSize, fileCount);
          
          // Notify user
          const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);
          alert(`Backup completed successfully!\n\nFiles archived: ${fileCount}\nSize: ${sizeInMB} MB`);
        } catch (err) {
          console.error('Error completing backup:', err);
          await updateBackupStatus(backupId, 'failed', 0, 0);
          alert('Backup completed with errors. Please check system logs.');
        }
      }, 2000);

    } catch (err) {
      console.error('Backup error:', err);
      alert(`Backup error: ${err.message}`);
    }
  };

  const handleExportLogs = async () => {
    try {
      alert("Exporting system logs... Please wait.");

      // Fetch system logs for the last 30 days
      const { data: logsData, error: logsError } = await getSystemLogsForExport(30);

      if (logsError) {
        alert(`Error exporting logs: ${logsError.message}`);
        return;
      }

      if (!logsData) {
        alert("No logs available for export.");
        return;
      }

      // Create CSV content from file logs
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Timestamp,User ID,File Name,Action,Type\n";

      logsData.fileLogs?.forEach(log => {
        const row = [
          new Date(log.timestamp).toLocaleString(),
          log.user_id || '-',
          log.file_name || '-',
          log.action || '-',
          'File Activity'
        ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
        csvContent += row + "\n";
      });

      // Add session logs
      csvContent += "\nSession Logs:\n";
      csvContent += "Start Time,End Time,User ID,Workstation ID,Status,Duration\n";

      logsData.sessions?.forEach(session => {
        const startTime = new Date(session.start_time);
        const endTime = session.end_time ? new Date(session.end_time) : new Date();
        const duration = Math.round((endTime - startTime) / 60000); // minutes
        
        const row = [
          startTime.toLocaleString(),
          endTime.toLocaleString(),
          session.user_id || '-',
          session.workstation_id || '-',
          session.status || '-',
          `${duration} min`
        ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
        csvContent += row + "\n";
      });

      // Add backup logs
      csvContent += "\nBackup Logs:\n";
      csvContent += "Started At,Completed At,Status,File Count,Backup Size (MB)\n";

      logsData.backups?.forEach(backup => {
        const size = backup.backup_size ? (backup.backup_size / 1024 / 1024).toFixed(2) : '0';
        const row = [
          backup.started_at ? new Date(backup.started_at).toLocaleString() : '-',
          backup.completed_at ? new Date(backup.completed_at).toLocaleString() : '-',
          backup.status || '-',
          backup.file_count || '0',
          size
        ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
        csvContent += row + "\n";
      });

      // Create and trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();

      alert("System logs exported successfully!");
    } catch (err) {
      console.error('Export logs error:', err);
      alert(`Error exporting logs: ${err.message}`);
    }
  };

  const handleHealthCheck = async () => {
    try {
      alert("Performing system health check... Please wait.");

      const { data: healthData, error: healthError } = await getSystemHealth();

      if (healthError) {
        alert(`Error checking system health: ${healthError.message}`);
        return;
      }

      if (!healthData) {
        alert("Unable to retrieve system health data.");
        return;
      }

      const {
        cpu,
        memory,
        storage,
        network,
        backup,
        overall,
        activeWorkstations,
        totalWorkstations,
        activeSessions,
        totalFiles,
        lastBackup
      } = healthData;

      const lastBackupStr = lastBackup
        ? new Date(lastBackup).toLocaleString()
        : 'Never';

      const statusMessage = `System Health Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Health: ${overall}%

Component Status:
• Workstation Utilization: ${cpu}%
• Session Memory: ${memory}%
• Storage Usage: ${storage}%
• Network Status: ${network}%
• Backup Health: ${backup}%

System Statistics:
• Active Workstations: ${activeWorkstations}/${totalWorkstations}
• Active Sessions: ${activeSessions}
• Total Files: ${totalFiles}
• Last Backup: ${lastBackupStr}

Status: ${overall >= 80 ? '✓ All systems operational' : overall >= 60 ? '⚠ Warning: Some systems degraded' : '✗ Critical: Immediate attention needed'}`;

      alert(statusMessage);
    } catch (err) {
      console.error('Health check error:', err);
      alert(`Error checking system health: ${err.message}`);
    }
  };

  const quickActions = [
    {
      id: 'add-user',
      label: 'Add User',
      icon: 'UserPlus',
      shortcut: 'Ctrl+N',
      color: 'primary',
      action: openAddUser
    },
    // System Reset removed as requested
    {
      id: 'backup-now',
      label: 'Backup Now',
      icon: 'Database',
      shortcut: 'Ctrl+B',
      color: 'accent',
      action: handleBackup
    },
    {
      id: 'export-logs',
      label: 'Export Logs',
      icon: 'Download',
      shortcut: 'Ctrl+E',
      color: 'success',
      action: handleExportLogs
    },
    {
      id: 'system-health',
      label: 'Health Check',
      icon: 'Activity',
      shortcut: 'Ctrl+H',
      color: 'secondary',
      action: handleHealthCheck
    }
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return { icon: 'AlertTriangle', color: 'text-warning' };
      case 'error':
        return { icon: 'XCircle', color: 'text-error' };
      case 'success':
        return { icon: 'CheckCircle', color: 'text-success' };
      case 'info':
        return { icon: 'Info', color: 'text-accent' };
      default:
        return { icon: 'Bell', color: 'text-muted-foreground' };
    }
  };

  const getAlertBadge = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-error/10 text-error border-error/20';
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'info':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getActionButtonColor = (color) => {
    switch (color) {
      case 'primary':
        return 'hover:bg-primary/10 hover:text-primary';
      case 'warning':
        return 'hover:bg-warning/10 hover:text-warning';
      case 'accent':
        return 'hover:bg-accent/10 hover:text-accent';
      case 'success':
        return 'hover:bg-success/10 hover:text-success';
      case 'secondary':
        return 'hover:bg-secondary/10 hover:text-secondary';
      default:
        return 'hover:bg-muted';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      return `${hours}h ago`;
    }
  };

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Quick Actions:</span>
          {quickActions?.map((action) => {
            return (
              <div key={action?.id} className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={action?.action}
                  className={`flex items-center space-x-2 ${getActionButtonColor(action?.color)} spring-hover`}
                >
                  <Icon name={action?.icon} size={16} />
                  <span>{action?.label}</span>
                </Button>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {action?.label} ({action?.shortcut})
                </div>

                {/* Add User inline panel */}
                {action?.id === 'add-user' && showAddUser && (
                  <div className="absolute left-0 top-full mt-2 w-full sm:w-72 bg-popover border border-border rounded-lg shadow-modal z-50 p-3">
                    {addUserMessage.text && (
                      <div className={`text-xs p-2 rounded mb-3 ${addUserMessage.type === 'error'
                        ? 'bg-error/10 text-error border border-error/20'
                        : 'bg-success/10 text-success border border-success/20'
                        }`}>
                        {addUserMessage.text}
                      </div>
                    )}
                    <form onSubmit={submitAddUser} className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Username</label>
                        <input
                          type="text"
                          value={newUser.username}
                          onChange={(e) => setNewUser((s) => ({ ...s, username: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-border rounded bg-input text-foreground focus:outline-none"
                          placeholder="Username"
                          required
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground">Email</label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-border rounded bg-input text-foreground focus:outline-none"
                          placeholder="user@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground">Password</label>
                        <input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-border rounded bg-input text-foreground focus:outline-none"
                          placeholder="Minimum 6 characters"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground">Role</label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser((s) => ({ ...s, role: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-border rounded bg-input text-foreground focus:outline-none"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div className="flex justify-end space-x-2 pt-1">
                        <Button type="button" variant="ghost" size="sm" onClick={closeAddUser}>
                          Cancel
                        </Button>
                        <Button type="submit" size="sm">
                          Add
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* System Status and Notifications */}
        <div className="flex items-center space-x-4">
          {/* System Status Indicators */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-success status-pulse"></div>
              <span className="text-sm text-muted-foreground">Deep Freeze</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-success status-pulse"></div>
              <span className="text-sm text-muted-foreground">Cloud Sync</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-warning status-pulse"></div>
              <span className="text-sm text-muted-foreground">Backup</span>
            </div>
          </div>

          <div className="h-4 w-px bg-border hidden md:block"></div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative spring-hover"
            >
              <Icon name="Bell" size={20} />
              {systemAlerts?.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{systemAlerts?.length}</span>
                </div>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-modal z-200">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-popover-foreground">System Alerts</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(false)}
                      iconName="X"
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {systemAlerts?.map((alert) => {
                    const alertInfo = getAlertIcon(alert?.type);
                    return (
                      <div key={alert?.id} className="p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <Icon name={alertInfo?.icon} size={16} className={alertInfo?.color} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-sm font-medium text-popover-foreground truncate">
                                {alert?.title}
                              </h5>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(alert?.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{alert?.message}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded border ${getAlertBadge(alert?.type)}`}>
                                {alert?.workstation}
                              </span>
                              <Button variant="ghost" size="sm" className="text-xs">
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 border-t border-border">
                  <Button variant="outline" size="sm" fullWidth>
                    View All Alerts
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="search"
              placeholder="Search users, sessions..."
              className="w-64 px-3 py-2 pl-9 text-sm border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionToolbar;

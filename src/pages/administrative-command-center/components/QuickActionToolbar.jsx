import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionToolbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
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

  const quickActions = [
    {
      id: 'add-user',
      label: 'Add User',
      icon: 'UserPlus',
      shortcut: 'Ctrl+N',
      color: 'primary',
      action: () => console.log('Add user action')
    },
    {
      id: 'system-reset',
      label: 'System Reset',
      icon: 'RotateCcw',
      shortcut: 'Ctrl+R',
      color: 'warning',
      action: () => console.log('System reset action')
    },
    {
      id: 'backup-now',
      label: 'Backup Now',
      icon: 'Database',
      shortcut: 'Ctrl+B',
      color: 'accent',
      action: () => console.log('Backup action')
    },
    {
      id: 'export-logs',
      label: 'Export Logs',
      icon: 'Download',
      shortcut: 'Ctrl+E',
      color: 'success',
      action: () => console.log('Export logs action')
    },
    {
      id: 'system-health',
      label: 'Health Check',
      icon: 'Activity',
      shortcut: 'Ctrl+H',
      color: 'secondary',
      action: () => console.log('Health check action')
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
          {quickActions?.map((action) => (
            <div key={action?.id} className="relative group">
              <Button
                variant="ghost"
                size="sm"
                onClick={action?.action}
                className={`flex items-center space-x-2 ${getActionButtonColor(action?.color)} spring-hover`}
              >
                <Icon name={action?.icon} size={16} />
                <span className="hidden lg:inline">{action?.label}</span>
              </Button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {action?.label} ({action?.shortcut})
              </div>
            </div>
          ))}
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
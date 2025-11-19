import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onAction, files = [] }) => {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const quickActions = [
    {
      id: 'upload',
      label: 'Upload Files',
      icon: 'Upload',
      shortcut: 'Ctrl+U',
      description: 'Add new files to your workspace',
      color: 'bg-primary/10 text-primary'
    },
    {
      id: 'download',
      label: 'Download Selected',
      icon: 'Download',
      shortcut: 'Ctrl+D',
      description: 'Download selected files',
      color: 'bg-accent/10 text-accent'
    },
    {
      id: 'newfolder',
      label: 'New Folder',
      icon: 'FolderPlus',
      shortcut: 'Ctrl+Shift+N',
      description: 'Create a new folder',
      color: 'bg-success/10 text-success'
    },
    {
      id: 'search',
      label: 'Search Files',
      icon: 'Search',
      shortcut: 'Ctrl+F',
      description: 'Find files quickly',
      color: 'bg-warning/10 text-warning'
    }
  ];

  const systemInfo = useMemo(() => {
    const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
    const totalGB = totalSize / (1024 * 1024 * 1024);
    const limitGB = 5.0;
    const percentage = Math.min((totalGB / limitGB) * 100, 100);

    const lastFile = files.length > 0 ? files[0] : null; // Files are sorted by date desc
    const lastSyncTime = lastFile ? new Date(lastFile.created_at) : new Date();

    const getTimeAgo = (date) => {
      const seconds = Math.floor((new Date() - date) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    };

    return [
      {
        label: 'Storage Used',
        value: `${totalGB.toFixed(2)} GB / ${limitGB.toFixed(1)} GB`,
        percentage: percentage,
        icon: 'HardDrive'
      },
      {
        label: 'Files Count',
        value: `${files.length} files`,
        icon: 'Files'
      },
      {
        label: 'Last Sync',
        value: getTimeAgo(lastSyncTime),
        icon: 'RefreshCw'
      }
    ];
  }, [files]);

  const handleKeyboardShortcut = (e) => {
    if (e?.ctrlKey || e?.metaKey) {
      switch (e?.key?.toLowerCase()) {
        case 'u':
          e?.preventDefault();
          onAction?.('upload');
          break;
        case 'd':
          e?.preventDefault();
          onAction?.('download');
          break;
        case 'f':
          e?.preventDefault();
          onAction?.('search');
          break;
        case 'n':
          if (e?.shiftKey) {
            e?.preventDefault();
            onAction?.('newfolder');
          }
          break;
      }
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, []);

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-card-foreground">Quick Actions</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShortcuts(!showShortcuts)}
            iconName="Keyboard"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickActions?.map(action => (
            <button
              key={action?.id}
              onClick={() => onAction?.(action?.id)}
              className="p-3 rounded-lg border border-border hover:bg-muted transition-all spring-hover text-left"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action?.color}`}>
                  <Icon name={action?.icon} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {action?.label}
                  </div>
                  {showShortcuts && (
                    <div className="text-xs text-muted-foreground font-mono">
                      {action?.shortcut}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {showShortcuts && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Keyboard Shortcuts</h4>
            <div className="space-y-1">
              {quickActions?.map(action => (
                <div key={action?.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{action?.label}</span>
                  <span className="font-mono text-foreground">{action?.shortcut}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* System Information */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-card-foreground mb-4">System Info</h3>

        <div className="space-y-3">
          {systemInfo?.map((info, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name={info?.icon} size={16} className="text-muted-foreground" />
                <span className="text-sm text-foreground">{info?.label}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">{info?.value}</div>
                {info?.percentage !== undefined && (
                  <div className="w-20 bg-muted rounded-full h-1.5 mt-1">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${info?.percentage}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Connection Status */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-success status-pulse"></div>
            <span className="text-sm font-medium text-foreground">Cloud Sync</span>
          </div>
          <span className="text-xs text-success font-mono">ONLINE</span>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          All files are automatically synchronized with cloud storage.
          Your data is secure and accessible from any device.
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          iconName="RefreshCw"
          iconPosition="left"
        >
          Force Sync
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
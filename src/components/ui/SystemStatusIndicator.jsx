import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const SystemStatusIndicator = ({ 
  position = 'header', 
  showDetails = true, 
  className = '' 
}) => {
  const [systemHealth, setSystemHealth] = useState({
    database: 'online',
    deepFreeze: 'online',
    network: 'online',
    workstations: 'warning',
    lastUpdate: new Date()
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Simulate real-time system monitoring
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        ...prev,
        lastUpdate: new Date(),
        // Simulate occasional status changes
        workstations: Math.random() > 0.8 ? 'warning' : 'online'
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'online':
        return {
          color: 'text-success',
          bgColor: 'bg-success',
          icon: 'CheckCircle',
          label: 'Online'
        };
      case 'warning':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning',
          icon: 'AlertTriangle',
          label: 'Warning'
        };
      case 'error':
        return {
          color: 'text-error',
          bgColor: 'bg-error',
          icon: 'XCircle',
          label: 'Error'
        };
      case 'offline':
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted-foreground',
          icon: 'Circle',
          label: 'Offline'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted-foreground',
          icon: 'Circle',
          label: 'Unknown'
        };
    }
  };

  const getOverallStatus = () => {
    const statuses = Object.values(systemHealth)?.filter(val => typeof val === 'string');
    if (statuses?.includes('error') || statuses?.includes('offline')) return 'error';
    if (statuses?.includes('warning')) return 'warning';
    return 'online';
  };

  const overallStatus = getOverallStatus();
  const statusInfo = getStatusInfo(overallStatus);

  // Compact version for mobile or minimal display
  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${statusInfo?.bgColor} status-pulse`}></div>
        <span className="text-sm font-medium text-foreground">System</span>
        <span className={`text-sm font-mono ${statusInfo?.color}`}>
          {statusInfo?.label?.toUpperCase()}
        </span>
      </div>
    );
  }

  // Header version
  if (position === 'header') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          <div className={`w-2 h-2 rounded-full ${statusInfo?.bgColor} status-pulse`}></div>
          <span className="text-sm font-medium text-foreground">System Status</span>
          <span className={`text-sm font-mono ${statusInfo?.color}`}>
            {statusInfo?.label?.toUpperCase()}
          </span>
          <Icon 
            name={isExpanded ? "ChevronUp" : "ChevronDown"} 
            size={14} 
            className="text-muted-foreground" 
          />
        </button>
        {isExpanded && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-modal z-200">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-popover-foreground">System Health</h3>
                <span className="text-xs text-muted-foreground font-mono">
                  Last updated: {systemHealth?.lastUpdate?.toLocaleTimeString()}
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(systemHealth)?.map(([key, status]) => {
                  if (key === 'lastUpdate') return null;
                  
                  const info = getStatusInfo(status);
                  const displayName = key?.charAt(0)?.toUpperCase() + key?.slice(1)?.replace(/([A-Z])/g, ' $1');
                  
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon name={info?.icon} size={16} className={info?.color} />
                        <span className="text-sm text-popover-foreground">{displayName}</span>
                      </div>
                      <span className={`text-xs font-mono px-2 py-1 rounded ${info?.color} bg-opacity-10`}>
                        {info?.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Auto-refresh: 5s</span>
                  <button className="text-primary hover:text-primary/80">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dashboard version
  return (
    <div className={`bg-card rounded-lg border border-border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">System Status</h3>
        <div className={`flex items-center space-x-2 ${statusInfo?.color}`}>
          <Icon name={statusInfo?.icon} size={20} />
          <span className="font-medium">{statusInfo?.label}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(systemHealth)?.map(([key, status]) => {
          if (key === 'lastUpdate') return null;
          
          const info = getStatusInfo(status);
          const displayName = key?.charAt(0)?.toUpperCase() + key?.slice(1)?.replace(/([A-Z])/g, ' $1');
          
          return (
            <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${info?.bgColor} status-pulse`}></div>
                <span className="text-sm font-medium text-card-foreground">{displayName}</span>
              </div>
              <span className={`text-sm font-mono ${info?.color}`}>
                {info?.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
        <span>Last updated: {systemHealth?.lastUpdate?.toLocaleTimeString()}</span>
        <button className="text-primary hover:text-primary/80 font-medium">
          Refresh Now
        </button>
      </div>
    </div>
  );
};

export default SystemStatusIndicator;
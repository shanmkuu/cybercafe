import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SecurityStatusPanel = () => {
  const [systemStatus, setSystemStatus] = useState({
    supabase: 'online',
    deepFreeze: 'online',
    workstations: 'warning',
    ssl: 'online'
  });

  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate occasional status changes
      setSystemStatus(prev => ({
        ...prev,
        workstations: Math.random() > 0.7 ? 'warning' : 'online'
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'online':
        return { color: 'text-success', bgColor: 'bg-success', icon: 'CheckCircle' };
      case 'warning':
        return { color: 'text-warning', bgColor: 'bg-warning', icon: 'AlertTriangle' };
      case 'error':
        return { color: 'text-error', bgColor: 'bg-error', icon: 'XCircle' };
      default:
        return { color: 'text-muted-foreground', bgColor: 'bg-muted-foreground', icon: 'Circle' };
    }
  };

  const statusItems = [
    { key: 'supabase', label: 'Database Connection', status: systemStatus?.supabase },
    { key: 'deepFreeze', label: 'Deep Freeze System', status: systemStatus?.deepFreeze },
    { key: 'workstations', label: 'Workstation Registry', status: systemStatus?.workstations },
    { key: 'ssl', label: 'SSL Certificate', status: systemStatus?.ssl }
  ];

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Shield" size={16} className="text-primary" />
          <span>System Status</span>
        </h3>
        <div className="text-xs text-muted-foreground font-mono">
          {lastUpdate?.toLocaleTimeString()}
        </div>
      </div>
      <div className="space-y-3">
        {statusItems?.map(({ key, label, status }) => {
          const statusInfo = getStatusInfo(status);
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${statusInfo?.bgColor} status-pulse`}></div>
                <span className="text-xs text-foreground">{label}</span>
              </div>
              <span className={`text-xs font-mono ${statusInfo?.color} uppercase`}>
                {status}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Auto-refresh: 10s</span>
          <button className="text-primary hover:text-primary/80 font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityStatusPanel;
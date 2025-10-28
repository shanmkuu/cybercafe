import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const WorkstationInfo = () => {
  const [workstationData, setWorkstationData] = useState({
    id: 'WS-007',
    ipAddress: '192.168.1.107',
    status: 'available',
    lastReset: new Date(Date.now() - 3600000), // 1 hour ago
    deepFreezeStatus: 'active'
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-success';
      case 'occupied':
        return 'text-warning';
      case 'maintenance':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return 'CheckCircle';
      case 'occupied':
        return 'Clock';
      case 'maintenance':
        return 'AlertTriangle';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Monitor" size={16} className="text-primary" />
          <span>Workstation Info</span>
        </h3>
        <div className={`flex items-center space-x-1 ${getStatusColor(workstationData?.status)}`}>
          <Icon name={getStatusIcon(workstationData?.status)} size={14} />
          <span className="text-xs font-medium capitalize">{workstationData?.status}</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Station ID</span>
          <span className="text-xs font-mono text-foreground">{workstationData?.id}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">IP Address</span>
          <span className="text-xs font-mono text-foreground">{workstationData?.ipAddress}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Deep Freeze</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-success status-pulse"></div>
            <span className="text-xs font-mono text-success uppercase">{workstationData?.deepFreezeStatus}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Last Reset</span>
          <span className="text-xs text-foreground">
            {workstationData?.lastReset?.toLocaleTimeString()}
          </span>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Current Time</span>
          <span className="font-mono text-foreground">{currentTime?.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkstationInfo;
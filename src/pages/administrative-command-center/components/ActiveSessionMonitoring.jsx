import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActiveSessionMonitoring = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const activeSessionsData = [
  {
    id: 'session-001',
    workstation: 'WS-001',
    user: 'John Smith',
    username: 'john.smith',
    startTime: new Date(Date.now() - 8100000), // 2h 15m ago
    activity: 'Document Editing',
    filesAccessed: 3,
    dataTransfer: '245 MB',
    ipAddress: '192.168.1.101',
    status: 'active',
    avatar: "https://images.unsplash.com/photo-1641479160067-5ae7bde244b0",
    avatarAlt: 'Professional headshot of young man with brown hair in casual shirt'
  },
  {
    id: 'session-002',
    workstation: 'WS-003',
    user: 'Sarah Johnson',
    username: 'sarah.johnson',
    startTime: new Date(Date.now() - 2700000), // 45m ago
    activity: 'File Upload',
    filesAccessed: 8,
    dataTransfer: '1.2 GB',
    ipAddress: '192.168.1.103',
    status: 'active',
    avatar: "https://images.unsplash.com/photo-1684262855358-88f296a2cfc2",
    avatarAlt: 'Professional woman with blonde hair in white blazer smiling at camera'
  },
  {
    id: 'session-003',
    workstation: 'WS-005',
    user: 'Mike Davis',
    username: 'mike.davis',
    startTime: new Date(Date.now() - 5400000), // 1h 30m ago
    activity: 'Gaming',
    filesAccessed: 1,
    dataTransfer: '89 MB',
    ipAddress: '192.168.1.105',
    status: 'active',
    avatar: "https://images.unsplash.com/photo-1597945310606-a54b1774e175",
    avatarAlt: 'Young professional man with dark hair in navy suit jacket'
  },
  {
    id: 'session-004',
    workstation: 'GS-201',
    user: 'Alex Chen',
    username: 'alex.chen',
    startTime: new Date(Date.now() - 12120000), // 3h 22m ago
    activity: 'Gaming Session',
    filesAccessed: 2,
    dataTransfer: '456 MB',
    ipAddress: '192.168.2.101',
    status: 'active',
    avatar: "https://images.unsplash.com/photo-1698072556534-40ec6e337311",
    avatarAlt: 'Asian man with glasses and black hair in casual button-up shirt'
  },
  {
    id: 'session-005',
    workstation: 'GS-203',
    user: 'Emma Wilson',
    username: 'emma.wilson',
    startTime: new Date(Date.now() - 3900000), // 1h 5m ago
    activity: 'Web Browsing',
    filesAccessed: 0,
    dataTransfer: '12 MB',
    ipAddress: '192.168.2.103',
    status: 'idle',
    avatar: "https://images.unsplash.com/photo-1654463313333-3bccfaee8430",
    avatarAlt: 'Professional woman with curly brown hair in business attire'
  },
  {
    id: 'session-006',
    workstation: 'PR-001',
    user: 'David Brown',
    username: 'david.brown',
    startTime: new Date(Date.now() - 14400000), // 4h ago
    activity: 'Video Editing',
    filesAccessed: 15,
    dataTransfer: '3.8 GB',
    ipAddress: '192.168.3.101',
    status: 'active',
    avatar: "https://images.unsplash.com/photo-1713946598186-8e28275719b9",
    avatarAlt: 'Professional man with beard in dark suit jacket'
  }];


  const calculateSessionDuration = (startTime) => {
    const duration = currentTime - startTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor(duration % (1000 * 60 * 60) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return { icon: 'Activity', color: 'text-success' };
      case 'idle':
        return { icon: 'Clock', color: 'text-warning' };
      case 'away':
        return { icon: 'Moon', color: 'text-muted-foreground' };
      default:
        return { icon: 'Circle', color: 'text-muted-foreground' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'idle':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'away':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getActivityIcon = (activity) => {
    if (activity?.includes('Gaming')) return 'Gamepad2';
    if (activity?.includes('Upload') || activity?.includes('Download')) return 'Upload';
    if (activity?.includes('Document') || activity?.includes('Edit')) return 'FileText';
    if (activity?.includes('Video')) return 'Video';
    if (activity?.includes('Web')) return 'Globe';
    return 'Monitor';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Active Sessions</h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-success status-pulse' : 'bg-muted-foreground'}`}></div>
            <span className="text-xs text-muted-foreground">
              {autoRefresh ? 'Auto-refresh' : 'Manual'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
            onClick={() => setAutoRefresh(!autoRefresh)} />

        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activeSessionsData?.map((session) => {
          const statusInfo = getStatusIcon(session?.status);
          const activityIcon = getActivityIcon(session?.activity);

          return (
            <div key={session?.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={session?.avatar}
                    alt={session?.avatarAlt}
                    className="w-10 h-10 rounded-full object-cover" />

                  <div>
                    <div className="font-medium text-foreground">{session?.user}</div>
                    <div className="text-sm text-muted-foreground">{session?.workstation}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusBadge(session?.status)}`}>
                    {session?.status}
                  </span>
                  <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Icon name="Clock" size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground font-mono">
                      {calculateSessionDuration(session?.startTime)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name={activityIcon} size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{session?.activity}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Icon name="HardDrive" size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground font-mono">{session?.dataTransfer}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="FileText" size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{session?.filesAccessed} files</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Icon name="Wifi" size={12} />
                  <span className="font-mono">{session?.ipAddress}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" iconName="Eye" />
                  <Button variant="ghost" size="sm" iconName="MessageSquare" />
                  <Button variant="outline" size="sm" iconName="LogOut" />
                </div>
              </div>
            </div>);

        })}
      </div>
      {activeSessionsData?.length === 0 &&
      <div className="text-center py-8">
          <Icon name="Monitor" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No active sessions</p>
        </div>
      }
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Last updated: {currentTime?.toLocaleTimeString()}</span>
          <span>{activeSessionsData?.length} active session{activeSessionsData?.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>);

};

export default ActiveSessionMonitoring;
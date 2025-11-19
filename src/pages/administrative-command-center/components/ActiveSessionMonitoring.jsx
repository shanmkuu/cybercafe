import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActiveSessionMonitoring = ({ sessions }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const activeSessionsData = sessions ? sessions.map(session => ({
    id: session.id,
    workstation: session.workstation_id || 'Unknown', // Need to join or fetch workstation name
    user: session.profiles?.full_name || 'Guest',
    username: session.profiles?.username || 'guest',
    startTime: new Date(session.start_time),
    activity: 'Active', // Placeholder or infer from logs
    filesAccessed: 0, // Placeholder
    dataTransfer: '-', // Placeholder
    ipAddress: '-', // Placeholder
    status: session.status,
    avatar: session.profiles?.avatar_url || "https://via.placeholder.com/150",
    avatarAlt: session.profiles?.full_name
  })) : [];

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
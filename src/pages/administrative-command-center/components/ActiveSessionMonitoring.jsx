import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';
import { getActiveSessions, terminateSession } from '../../../lib/db';

const ActiveSessionMonitoring = ({ sessions }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch active sessions from database
  const fetchSessions = async () => {
    try {
      console.log('Fetching active sessions...');
      const { data, error } = await getActiveSessions();
      console.log('Fetch result - Data:', data, 'Error:', error);
      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }
      console.log('Sessions fetched:', data?.length || 0);
      setLiveSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual session termination
  const handleTerminateSession = async (sessionId) => {
    try {
      const { error } = await terminateSession(sessionId);
      if (error) {
        console.error('Error terminating session:', error);
        alert('Failed to terminate session');
        return;
      }
      // Refresh sessions list
      fetchSessions();
    } catch (err) {
      console.error('Error terminating session:', err);
      alert('Error terminating session');
    }
  };

  // Initial fetch and set up real-time subscription
  useEffect(() => {
    fetchSessions();

    // Subscribe to real-time changes in sessions table
    const channel = supabase
      .channel('public:sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        (payload) => {
          console.log('Session change detected:', payload);
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Timer for current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Map live sessions to display data
  const activeSessionsData = liveSessions.map(session => ({
    id: session.id,
    workstation: session.workstation_id || 'Unknown',
    user: session.profiles?.full_name || 'Guest',
    username: session.profiles?.username || 'guest',
    startTime: new Date(session.started_at),
    endTime: session.ended_at ? new Date(session.ended_at) : null,
    activity: 'Active',
    filesAccessed: 0,
    dataTransfer: '-',
    ipAddress: '-',
    status: session.ended_at ? 'ended' : 'active',
    event: session.event,
    avatar: session.profiles?.avatar_url || "https://via.placeholder.com/150",
    avatarAlt: session.profiles?.full_name || 'User'
  }));

  const calculateSessionDuration = (startTime, endTime = null) => {
    const end = endTime || currentTime;
    const duration = end - startTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusIcon = (event, status) => {
    if (status === 'ended') {
      return { icon: 'LogOut', color: 'text-muted-foreground' };
    }
    switch (event) {
      case 'login':
        return { icon: 'LogIn', color: 'text-success' };
      case 'logout':
        return { icon: 'LogOut', color: 'text-muted-foreground' };
      case 'activity':
        return { icon: 'Activity', color: 'text-accent' };
      default:
        return { icon: 'Circle', color: 'text-muted-foreground' };
    }
  };

  const getStatusBadge = (event, status) => {
    if (status === 'ended') {
      return 'bg-muted text-muted-foreground border-border';
    }
    switch (event) {
      case 'login':
      case 'activity':
        return 'bg-success/10 text-success border-success/20';
      case 'logout':
        return 'bg-warning/10 text-warning border-warning/20';
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
            onClick={() => { setAutoRefresh(!autoRefresh); fetchSessions(); }} />

        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-muted-foreground">Loading sessions...</span>
          </div>
        ) : activeSessionsData.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-muted-foreground">No active sessions</span>
          </div>
        ) : (
          activeSessionsData.map((session) => {
            const statusInfo = getStatusIcon(session?.event, session?.status);
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
                    <span className={`text-xs px-2 py-1 rounded border ${getStatusBadge(session?.event, session?.status)}`}>
                      {session?.event || 'activity'}
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
                  <Button variant="ghost" size="sm" iconName="Eye" title="View details" />
                  <Button variant="ghost" size="sm" iconName="MessageSquare" title="Send message" />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    iconName="LogOut"
                    title="Terminate session"
                    onClick={() => {
                      if (window.confirm(`Terminate session for ${session?.user}?`)) {
                        handleTerminateSession(session?.id);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Last updated: {currentTime?.toLocaleTimeString()}</span>
          <span>{activeSessionsData?.length} active session{activeSessionsData?.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>);

};

export default ActiveSessionMonitoring;
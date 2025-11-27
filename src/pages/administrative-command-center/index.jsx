import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SystemStatusIndicator from '../../components/ui/SystemStatusIndicator';
import MetricsCards from './components/MetricsCards';
import WorkstationStatusTree from './components/WorkstationStatusTree';
import UserManagementTable from './components/UserManagementTable';
import ActiveSessionMonitoring from './components/ActiveSessionMonitoring';
import AnalyticsCharts from './components/AnalyticsCharts';
import QuickActionToolbar from './components/QuickActionToolbar';
import { getUsers, getActiveSessions, getWorkstations, getAllSessions, getFileStats } from '../../lib/db';

const AdministrativeCommandCenter = ({ userRole, onLogout, isAuthenticated }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [adminName, setAdminName] = useState('Administrator');

  // Helper functions for processing analytics data
  const processSessionTrend = (sessions) => {
    // Group sessions by day for the last N days (sessions are expected to be within the requested range)
    try {
      const daysMap = new Map();
      // Initialize last 7 days labels (starting from 6 days ago to today)
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString(undefined, { weekday: 'short' }); // Mon, Tue...
        const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
        daysMap.set(iso, { label: key, sessions: 0, minutes: 0 });
      }

      const ratePerMinute = 0.05; // $0.05 per minute as an estimated revenue driver

      (sessions || []).forEach(s => {
        const started = s?.started_at ? new Date(s.started_at) : null;
        const ended = s?.ended_at ? new Date(s.ended_at) : new Date();
        if (!started) return;
        const iso = started.toISOString().slice(0, 10);
        if (!daysMap.has(iso)) return; // out of range

        const minutes = Math.max(0, Math.round((ended - started) / 60000));
        const entry = daysMap.get(iso);
        entry.sessions = (entry.sessions || 0) + 1;
        entry.minutes = (entry.minutes || 0) + minutes;
        daysMap.set(iso, entry);
      });

      // Convert map to array preserving date order
      const result = Array.from(daysMap.entries()).map(([iso, val]) => ({
        day: val.label,
        sessions: val.sessions || 0,
        revenue: Math.round((val.minutes || 0) * ratePerMinute * 100) / 100 // round to cents
      }));

      return result;
    } catch (err) {
      console.error('processSessionTrend error', err);
      return [];
    }
  };

  const processUsageTime = (sessions) => {
    try {
      // We'll build 2-hour buckets from 06:00 to 22:00 to match the chart
      const bucketHours = [6, 8, 10, 12, 14, 16, 18, 20, 22];
      const buckets = bucketHours.map(h => ({ hour: String(h).padStart(2, '0') + ':00', minutes: 0 }));

      const days = 7; // assuming getAllSessions was called with 7 days

      (sessions || []).forEach(s => {
        const start = s?.started_at ? new Date(s.started_at) : null;
        const end = s?.ended_at ? new Date(s.ended_at) : new Date();
        if (!start) return;

        // For each bucket, compute overlap in minutes
        buckets.forEach((b, idx) => {
          const bucketStart = new Date(start);
          bucketStart.setHours(bucketHours[idx], 0, 0, 0);
          const bucketEnd = new Date(bucketStart);
          bucketEnd.setHours(bucketStart.getHours() + 2);

          // If session spans multiple days, clamp to session day for start
          // We'll iterate per session-day chunk: for simplicity assume sessions are short
          const overlapStart = start > bucketStart ? start : bucketStart;
          const overlapEnd = end < bucketEnd ? end : bucketEnd;
          const overlapMs = Math.max(0, overlapEnd - overlapStart);
          const overlapMins = Math.floor(overlapMs / 60000);
          if (overlapMins > 0) b.minutes += overlapMins;
        });
      });

      // Convert to usage metric. We'll use average minutes per day in the bucket as the usage value
      const usage = buckets.map(b => ({
        hour: b.hour,
        usage: Math.round((b.minutes || 0) / days)
      }));

      return usage;
    } catch (err) {
      console.error('processUsageTime error', err);
      return [];
    }
  };

  const processWorkstationUtilization = (workstations, sessions) => {
    // Placeholder logic
    return [
      { name: 'Floor 1', value: 50, color: '#16A34A' },
      { name: 'Available', value: 50, color: '#E5E7EB' }
    ];
  };

  const processFileActivity = (files) => {
    // Placeholder logic
    return [
      { type: 'Documents', uploads: files?.length || 0, downloads: 0 }
    ];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, activeSessionsResponse, workstationsResponse, allSessionsResponse, fileStatsResponse] = await Promise.all([
        getUsers(),
        getActiveSessions(),
        getWorkstations(),
        getAllSessions(7), // Last 7 days for analytics
        getFileStats()
      ]);

      const usersData = usersResponse.data || [];
      const activeSessionsData = activeSessionsResponse.data || [];
      const allSessionsData = allSessionsResponse.data || [];
      const fileStatsData = fileStatsResponse.data || [];
      const workstationsData = workstationsResponse.data || [];

      // Calculate derived stats
      const activeUserIds = new Set(activeSessionsData.map(s => s.user_id));
      const userSessionCounts = allSessionsData.reduce((acc, session) => {
        acc[session.user_id] = (acc[session.user_id] || 0) + 1;
        return acc;
      }, {});
      const userFileCounts = fileStatsData.reduce((acc, file) => {
        if (file.user_id) {
          acc[file.user_id] = (acc[file.user_id] || 0) + 1;
        }
        return acc;
      }, {});

      const enrichedUsers = usersData.map(user => {
        let displayStatus = 'inactive';
        // If user is suspended in DB, keep that status
        if (user.status === 'suspended') {
          displayStatus = 'suspended';
        } else if (activeUserIds.has(user.id)) {
          displayStatus = 'active';
        }

        return {
          ...user,
          status: displayStatus,
          totalSessions: userSessionCounts[user.id] || 0,
          filesUploaded: userFileCounts[user.id] || 0
        };
      });

      setUsers(enrichedUsers);
      setActiveSessions(activeSessionsData);
      setWorkstations(workstationsData);

      // Process Analytics Data
      const processedAnalytics = {
        sessionTrend: processSessionTrend(allSessionsData),
        usageTime: processUsageTime(allSessionsData),
        workstationUtilization: processWorkstationUtilization(workstationsData, allSessionsData),
        fileActivity: processFileActivity(fileStatsData)
      };
      setAnalyticsData(processedAnalytics);

      // Process Metrics Data
      const processedMetrics = [
        {
          id: 'total-users',
          title: 'Total Users',
          value: usersData.length,
          change: '+0', // Placeholder
          changeType: 'neutral',
          icon: 'Users',
          color: 'primary'
        },
        {
          id: 'active-sessions',
          title: 'Active Sessions',
          value: activeSessionsData.length,
          change: '+0', // Placeholder
          changeType: 'neutral',
          icon: 'Monitor',
          color: 'accent'
        },
        {
          id: 'files-uploaded',
          title: 'Files Uploaded',
          value: fileStatsData.length,
          change: '+0', // Placeholder
          changeType: 'neutral',
          icon: 'Upload',
          color: 'success'
        },
        {
          id: 'system-health',
          title: 'System Health',
          value: '100%', // Placeholder
          change: '0%',
          changeType: 'neutral',
          icon: 'Activity',
          color: 'warning'
        }
      ];
      setMetrics(processedMetrics);

    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isAuthenticated || userRole !== 'admin') {
      // Authentication portal is mounted at the app root ("/")
      navigate('/', { replace: true });
      return;
    }

    // Get current admin name
    try {
      const authData = localStorage.getItem('cyberCafeAuth');
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed.username) {
          // Capitalize first letter
          setAdminName(parsed.username.charAt(0).toUpperCase() + parsed.username.slice(1));
        }
      }
    } catch (e) {
      console.error('Error parsing auth data:', e);
    }

    fetchData();

    // Set up polling for real-time updates (every 30 seconds)
    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);

  }, [isAuthenticated, userRole, navigate]);

  if (!isAuthenticated || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole={userRole}
        userName={adminName}
        onLogout={onLogout}
        onToggleSidebar={() => { }}
      />
      <div className="pt-16">
        <QuickActionToolbar onSignOut={onLogout} />
        <div
          className="p-6"
          style={{ maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}
        >
          <div className="mb-6">
            <MetricsCards metrics={metrics} />
          </div>
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3">
                  <WorkstationStatusTree workstations={workstations} />
                </div>
                <div className="lg:col-span-6 flex flex-col gap-6">
                  <div>
                    <UserManagementTable users={users} onRefresh={fetchData} />
                  </div>
                  <div>
                    <ActiveSessionMonitoring sessions={activeSessions} />
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <AnalyticsCharts analyticsData={analyticsData} />
                </div>
              </div>
            </div>
            <div>
              <SystemStatusIndicator position="dashboard" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministrativeCommandCenter;
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
    // Placeholder logic - would need to group sessions by day
    return [
      { day: 'Mon', sessions: 0, revenue: 0 },
      { day: 'Tue', sessions: 0, revenue: 0 },
      { day: 'Wed', sessions: 0, revenue: 0 },
      { day: 'Thu', sessions: 0, revenue: 0 },
      { day: 'Fri', sessions: 0, revenue: 0 },
      { day: 'Sat', sessions: 0, revenue: 0 },
      { day: 'Sun', sessions: 0, revenue: 0 }
    ];
  };

  const processUsageTime = (sessions) => {
    // Placeholder logic
    return [
      { hour: '06:00', usage: 0 },
      { hour: '12:00', usage: 0 },
      { hour: '18:00', usage: 0 }
    ];
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
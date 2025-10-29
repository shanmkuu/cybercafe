import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SystemStatusIndicator from '../../components/ui/SystemStatusIndicator';
import MetricsCards from './components/MetricsCards';
import WorkstationStatusTree from './components/WorkstationStatusTree';
import UserManagementTable from './components/UserManagementTable';
import ActiveSessionMonitoring from './components/ActiveSessionMonitoring';
import AnalyticsCharts from './components/AnalyticsCharts';
import QuickActionToolbar from './components/QuickActionToolbar';

const AdministrativeCommandCenter = ({ userRole, onLogout, isAuthenticated }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isAuthenticated || userRole !== 'admin') {
      // Authentication portal is mounted at the app root ("/")
      navigate('/', { replace: true });
      return;
    }

    // Set up keyboard shortcuts
    const handleKeyboardShortcuts = (e) => {
      if (e?.ctrlKey) {
        switch (e?.key) {
          case 'n':
            e?.preventDefault();
            console.log('Add new user shortcut');
            break;
          case 'f':
            e?.preventDefault();
            document.querySelector('input[type="search"]')?.focus();
            break;
          case 'r':
            e?.preventDefault();
            console.log('System reset shortcut');
            break;
          case 'b':
            e?.preventDefault();
            console.log('Backup shortcut');
            break;
          case 'e':
            e?.preventDefault();
            console.log('Export logs shortcut');
            break;
          case 'h':
            e?.preventDefault();
            console.log('Health check shortcut');
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [isAuthenticated, userRole, navigate]);

  if (!isAuthenticated || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header 
        userRole={userRole}
        userName="Administrator"
        onLogout={onLogout}
        onToggleSidebar={() => {}}
      />

      {/* Main Content Area: reserved space below fixed header; vertical scrolling */}
      <div className="pt-16">
        {/* Quick Action Toolbar (ensure it can call sign-out) */}
        <div className="px-6">
          <QuickActionToolbar onSignOut={onLogout} />
        </div>

        {/* Dashboard Content: vertical stack, scrolls vertically inside viewport */}
        <div
          className="p-6"
          style={{ maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}
        >
          {/* Top Metrics Cards */}
          <div className="mb-6">
            <MetricsCards />
          </div>

          {/* Stacked panels (vertical flow on small screens, multi-column on lg) */}
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Sidebar - Workstation Status Tree */}
                <div className="lg:col-span-3">
                  <WorkstationStatusTree />
                </div>

                {/* Center - User Management and Active Sessions */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                  <div>
                    <UserManagementTable />
                  </div>
                  <div>
                    <ActiveSessionMonitoring />
                  </div>
                </div>

                {/* Right Panel - Analytics Charts */}
                <div className="lg:col-span-3">
                  <AnalyticsCharts />
                </div>
              </div>
            </div>

            {/* System Status Footer */}
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
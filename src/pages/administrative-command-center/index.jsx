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
      navigate('/authentication-portal');
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

      {/* Main Content Area */}
      <div className="pt-16">
        {/* Quick Action Toolbar */}
        <QuickActionToolbar />

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Top Metrics Cards */}
          <MetricsCards />

          {/* Four-Panel Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)]">
            {/* Left Sidebar - Workstation Status Tree (15%) */}
            <div className="lg:col-span-2">
              <WorkstationStatusTree />
            </div>

            {/* Center-Left Panel - User Management Table (35%) */}
            <div className="lg:col-span-4">
              <UserManagementTable />
            </div>

            {/* Center-Right Panel - Active Session Monitoring (35%) */}
            <div className="lg:col-span-4">
              <ActiveSessionMonitoring />
            </div>

            {/* Right Panel - Analytics Charts (15%) */}
            <div className="lg:col-span-2">
              <AnalyticsCharts />
            </div>
          </div>

          {/* System Status Footer */}
          <div className="mt-6">
            <SystemStatusIndicator position="dashboard" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministrativeCommandCenter;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import ErrorBoundaryNavigation from '../../components/ui/ErrorBoundaryNavigation';
import SystemStatusIndicator from '../../components/ui/SystemStatusIndicator';
import ErrorDiagnosticPanel from './components/ErrorDiagnosticPanel';
import ErrorDetailsCard from './components/ErrorDetailsCard';
import BulkRecoveryPanel from './components/BulkRecoveryPanel';
import IntegrationStatusGrid from './components/IntegrationStatusGrid';

const SystemErrorRecoveryInterface = ({ userRole = 'admin', onLogout }) => {
  const navigate = useNavigate();
  const [currentError, setCurrentError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [systemAlerts, setSystemAlerts] = useState([]);

  // Mock error data
  const mockErrors = [
    {
      id: 'ERR_001',
      code: 'AUTH_FAILURE_001',
      type: 'AUTH_FAILURE',
      title: 'Authentication Service Unavailable',
      description: 'Multiple users unable to authenticate due to Supabase Auth service connectivity issues',
      severity: 'high',
      timestamp: '2025-10-28 17:45:30',
      location: 'Workstations 1-5',
      affectedSystems: ['Supabase Auth', 'User Sessions', 'File Access'],
      userImpact: '15 users affected',
      estimatedRecovery: '5-10 minutes'
    },
    {
      id: 'ERR_002',
      code: 'DB_CONNECTION_002',
      type: 'DB_CONNECTION',
      title: 'Database Connection Timeout',
      description: 'Intermittent database connectivity causing session data loss and file upload failures',
      severity: 'critical',
      timestamp: '2025-10-28 17:50:15',
      location: 'All Workstations',
      affectedSystems: ['Supabase Database', 'Session Management', 'File Storage'],
      userImpact: 'All active users',
      estimatedRecovery: '2-5 minutes'
    },
    {
      id: 'ERR_003',
      code: 'SYNC_ERROR_003',
      type: 'SYNC_ERROR',
      title: 'Cloud Synchronization Failed',
      description: 'Local file changes not syncing to cloud storage, potential data loss risk',
      severity: 'medium',
      timestamp: '2025-10-28 17:52:45',
      location: 'Workstations 8, 12, 15',
      affectedSystems: ['Cloud Sync', 'File Storage', 'Backup Services'],
      userImpact: '8 users affected',
      estimatedRecovery: '3-7 minutes'
    }
  ];

  useEffect(() => {
    // Set initial error if none selected
    if (!currentError && mockErrors?.length > 0) {
      setCurrentError(mockErrors?.[0]);
    }

    // Simulate real-time system alerts
    const alertInterval = setInterval(() => {
      const newAlert = {
        id: Date.now(),
        type: Math.random() > 0.5 ? 'warning' : 'info',
        message: Math.random() > 0.5 
          ? 'Workstation WS007 reconnected successfully' : 'Deep Freeze sync completed for 3 workstations',
        timestamp: new Date()
      };
      
      setSystemAlerts(prev => [newAlert, ...prev?.slice(0, 4)]);
    }, 15000);

    return () => clearInterval(alertInterval);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleErrorResolve = (errorId) => {
    setSystemAlerts(prev => [{
      id: Date.now(),
      type: 'success',
      message: `Error ${errorId} marked as resolved`,
      timestamp: new Date()
    }, ...prev?.slice(0, 4)]);
    
    // Move to next error or clear if none
    const currentIndex = mockErrors?.findIndex(err => err?.id === errorId);
    const nextError = mockErrors?.[currentIndex + 1] || mockErrors?.[0];
    setCurrentError(nextError);
  };

  const handleErrorEscalate = (errorId) => {
    setSystemAlerts(prev => [{
      id: Date.now(),
      type: 'warning',
      message: `Error ${errorId} escalated to senior administrator`,
      timestamp: new Date()
    }, ...prev?.slice(0, 4)]);
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    
    // Simulate retry process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsRetrying(false);
    setSystemAlerts(prev => [{
      id: Date.now(),
      type: 'success',
      message: 'Connection retry completed successfully',
      timestamp: new Date()
    }, ...prev?.slice(0, 4)]);
  };

  const handleBulkAction = (actionType, workstationIds) => {
    setSystemAlerts(prev => [{
      id: Date.now(),
      type: 'info',
      message: `Bulk ${actionType} initiated for ${workstationIds?.length} workstations`,
      timestamp: new Date()
    }, ...prev?.slice(0, 4)]);
  };

  const handleServiceAction = (action, serviceId) => {
    setSystemAlerts(prev => [{
      id: Date.now(),
      type: 'info',
      message: `Service ${action} completed for ${serviceId}`,
      timestamp: new Date()
    }, ...prev?.slice(0, 4)]);
  };

  const tabs = [
    { id: 'overview', name: 'System Overview', icon: 'BarChart3' },
    { id: 'errors', name: 'Active Errors', icon: 'AlertTriangle' },
    { id: 'diagnostics', name: 'Diagnostics', icon: 'Activity' },
    { id: 'recovery', name: 'Bulk Recovery', icon: 'Layers' },
    { id: 'integrations', name: 'Integrations', icon: 'Zap' }
  ];

  return (
    <ErrorBoundaryNavigation userRole={userRole}>
      <div className="min-h-screen bg-background">
        <Header 
          userRole={userRole}
          userName={userRole === 'admin' ? 'System Administrator' : 'Support Staff'}
          onLogout={onLogout}
        />

        <div className="pt-16">
          {/* Navigation Header */}
          <div className="bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-error to-warning rounded-xl flex items-center justify-center">
                    <Icon name="AlertTriangle" size={24} color="white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">System Error Recovery</h1>
                    <p className="text-muted-foreground">Comprehensive error handling and system diagnostics</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <SystemStatusIndicator position="header" showDetails={false} />
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleNavigation('/administrative-command-center')}
                      iconName="ArrowLeft"
                      iconPosition="left"
                    >
                      Admin Dashboard
                    </Button>
                    
                    <Button
                      variant="default"
                      onClick={handleRetryConnection}
                      loading={isRetrying}
                      iconName="RefreshCw"
                      iconPosition="left"
                    >
                      Retry All
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 mt-6">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all spring-hover ${
                      activeTab === tab?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span className="font-medium">{tab?.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* System Alerts */}
            {systemAlerts?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">Recent System Alerts</h2>
                <div className="space-y-2">
                  {systemAlerts?.slice(0, 3)?.map((alert) => (
                    <div
                      key={alert?.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        alert?.type === 'success' ? 'border-success bg-success/5' :
                        alert?.type === 'warning' ? 'border-warning bg-warning/5' :
                        alert?.type === 'error' ? 'border-error bg-error/5' : 'border-accent bg-accent/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon 
                            name={
                              alert?.type === 'success' ? 'CheckCircle' :
                              alert?.type === 'warning' ? 'AlertTriangle' :
                              alert?.type === 'error' ? 'XCircle' : 'Info'
                            } 
                            size={16} 
                            className={
                              alert?.type === 'success' ? 'text-success' :
                              alert?.type === 'warning' ? 'text-warning' :
                              alert?.type === 'error' ? 'text-error' : 'text-accent'
                            }
                          />
                          <span className="text-sm text-foreground">{alert?.message}</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {alert?.timestamp?.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <SystemStatusIndicator className="lg:col-span-2" />
                  
                  {currentError && (
                    <div className="lg:col-span-2">
                      <ErrorDetailsCard
                        error={currentError}
                        onResolve={handleErrorResolve}
                        onEscalate={handleErrorEscalate}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'errors' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Active System Errors</h2>
                    <span className="text-sm text-muted-foreground">
                      {mockErrors?.length} active errors requiring attention
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {mockErrors?.map((error) => (
                      <ErrorDetailsCard
                        key={error?.id}
                        error={error}
                        onResolve={handleErrorResolve}
                        onEscalate={handleErrorEscalate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'diagnostics' && (
                <ErrorDiagnosticPanel
                  errorType={currentError?.type}
                  onRetry={handleRetryConnection}
                  isRetrying={isRetrying}
                />
              )}

              {activeTab === 'recovery' && (
                <BulkRecoveryPanel
                  onBulkAction={handleBulkAction}
                  isProcessing={isRetrying}
                />
              )}

              {activeTab === 'integrations' && (
                <IntegrationStatusGrid onServiceAction={handleServiceAction} />
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleNavigation('/authentication-portal')}
                  iconName="LogIn"
                  iconPosition="left"
                >
                  Authentication Portal
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleNavigation('/customer-workspace-portal')}
                  iconName="Users"
                  iconPosition="left"
                >
                  Customer Portal
                </Button>
                
                <Button
                  variant="secondary"
                  iconName="Download"
                  iconPosition="left"
                >
                  Export System Report
                </Button>
                
                <Button
                  variant="warning"
                  iconName="AlertTriangle"
                  iconPosition="left"
                >
                  Emergency Shutdown
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundaryNavigation>
  );
};

export default SystemErrorRecoveryInterface;
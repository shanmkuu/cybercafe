import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ErrorDiagnosticPanel = ({ errorType, onRetry, isRetrying }) => {
  const [diagnosticData, setDiagnosticData] = useState({
    database: { status: 'checking', latency: null, lastCheck: null },
    authentication: { status: 'checking', activeUsers: null, lastCheck: null },
    fileStorage: { status: 'checking', availableSpace: null, lastCheck: null },
    workstations: { status: 'checking', connected: null, total: 20, lastCheck: null }
  });

  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, [errorType]);

  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    
    // Simulate diagnostic checks
    const services = ['database', 'authentication', 'fileStorage', 'workstations'];
    
    for (const service of services) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDiagnosticData(prev => ({
        ...prev,
        [service]: {
          ...prev?.[service],
          status: Math.random() > 0.3 ? 'online' : 'error',
          latency: service === 'database' ? Math.floor(Math.random() * 100) + 50 : null,
          activeUsers: service === 'authentication' ? Math.floor(Math.random() * 15) + 5 : null,
          availableSpace: service === 'fileStorage' ? Math.floor(Math.random() * 40) + 60 : null,
          connected: service === 'workstations' ? Math.floor(Math.random() * 18) + 12 : null,
          lastCheck: new Date()
        }
      }));
    }
    
    setIsRunningDiagnostics(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'error': return 'text-error';
      case 'warning': return 'text-warning';
      case 'checking': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return 'CheckCircle';
      case 'error': return 'XCircle';
      case 'warning': return 'AlertTriangle';
      case 'checking': return 'Loader';
      default: return 'Circle';
    }
  };

  const formatLatency = (latency) => {
    if (!latency) return 'N/A';
    return `${latency}ms`;
  };

  const formatStorage = (space) => {
    if (!space) return 'N/A';
    return `${space}% available`;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 glow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
            <Icon name="Activity" size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">System Diagnostics</h3>
            <p className="text-sm text-muted-foreground">Real-time health monitoring</p>
          </div>
        </div>
        
        <button
          onClick={runDiagnostics}
          disabled={isRunningDiagnostics}
          className="flex items-center space-x-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 spring-hover"
        >
          <Icon 
            name="RefreshCw" 
            size={16} 
            className={isRunningDiagnostics ? 'animate-spin' : ''} 
          />
          <span className="text-sm font-medium">
            {isRunningDiagnostics ? 'Scanning...' : 'Refresh'}
          </span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Database Status */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Icon name="Database" size={18} className="text-muted-foreground" />
              <span className="font-medium text-card-foreground">Database</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={getStatusIcon(diagnosticData?.database?.status)} 
                size={16} 
                className={`${getStatusColor(diagnosticData?.database?.status)} ${
                  diagnosticData?.database?.status === 'checking' ? 'animate-spin' : ''
                }`} 
              />
              <span className={`text-sm font-medium ${getStatusColor(diagnosticData?.database?.status)}`}>
                {diagnosticData?.database?.status?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Latency:</span>
              <span className="font-mono">{formatLatency(diagnosticData?.database?.latency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Check:</span>
              <span className="font-mono">
                {diagnosticData?.database?.lastCheck ? 
                  diagnosticData?.database?.lastCheck?.toLocaleTimeString() : 'Pending'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Icon name="Shield" size={18} className="text-muted-foreground" />
              <span className="font-medium text-card-foreground">Authentication</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={getStatusIcon(diagnosticData?.authentication?.status)} 
                size={16} 
                className={`${getStatusColor(diagnosticData?.authentication?.status)} ${
                  diagnosticData?.authentication?.status === 'checking' ? 'animate-spin' : ''
                }`} 
              />
              <span className={`text-sm font-medium ${getStatusColor(diagnosticData?.authentication?.status)}`}>
                {diagnosticData?.authentication?.status?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Active Users:</span>
              <span className="font-mono">{diagnosticData?.authentication?.activeUsers || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Check:</span>
              <span className="font-mono">
                {diagnosticData?.authentication?.lastCheck ? 
                  diagnosticData?.authentication?.lastCheck?.toLocaleTimeString() : 'Pending'
                }
              </span>
            </div>
          </div>
        </div>

        {/* File Storage Status */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Icon name="HardDrive" size={18} className="text-muted-foreground" />
              <span className="font-medium text-card-foreground">File Storage</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={getStatusIcon(diagnosticData?.fileStorage?.status)} 
                size={16} 
                className={`${getStatusColor(diagnosticData?.fileStorage?.status)} ${
                  diagnosticData?.fileStorage?.status === 'checking' ? 'animate-spin' : ''
                }`} 
              />
              <span className={`text-sm font-medium ${getStatusColor(diagnosticData?.fileStorage?.status)}`}>
                {diagnosticData?.fileStorage?.status?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Available:</span>
              <span className="font-mono">{formatStorage(diagnosticData?.fileStorage?.availableSpace)}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Check:</span>
              <span className="font-mono">
                {diagnosticData?.fileStorage?.lastCheck ? 
                  diagnosticData?.fileStorage?.lastCheck?.toLocaleTimeString() : 'Pending'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Workstations Status */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Icon name="Monitor" size={18} className="text-muted-foreground" />
              <span className="font-medium text-card-foreground">Workstations</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={getStatusIcon(diagnosticData?.workstations?.status)} 
                size={16} 
                className={`${getStatusColor(diagnosticData?.workstations?.status)} ${
                  diagnosticData?.workstations?.status === 'checking' ? 'animate-spin' : ''
                }`} 
              />
              <span className={`text-sm font-medium ${getStatusColor(diagnosticData?.workstations?.status)}`}>
                {diagnosticData?.workstations?.status?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Connected:</span>
              <span className="font-mono">
                {diagnosticData?.workstations?.connected || 'N/A'}/{diagnosticData?.workstations?.total}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Check:</span>
              <span className="font-mono">
                {diagnosticData?.workstations?.lastCheck ? 
                  diagnosticData?.workstations?.lastCheck?.toLocaleTimeString() : 'Pending'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 spring-hover"
          >
            <Icon name="RotateCcw" size={16} className={isRetrying ? 'animate-spin' : ''} />
            <span className="text-sm font-medium">
              {isRetrying ? 'Retrying...' : 'Retry Connection'}
            </span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors spring-hover">
            <Icon name="Download" size={16} />
            <span className="text-sm font-medium">Export Logs</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition-colors spring-hover">
            <Icon name="AlertTriangle" size={16} />
            <span className="text-sm font-medium">Reset Services</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDiagnosticPanel;
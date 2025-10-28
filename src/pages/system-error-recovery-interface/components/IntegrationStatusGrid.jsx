import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const IntegrationStatusGrid = ({ onServiceAction }) => {
  const [services, setServices] = useState([
    {
      id: 'supabase_auth',
      name: 'Supabase Authentication',
      status: 'online',
      lastCheck: new Date(),
      uptime: '99.8%',
      responseTime: '45ms',
      description: 'User authentication and session management',
      icon: 'Shield',
      endpoints: ['Auth API', 'User Management', 'Session Tokens'],
      retryCount: 0
    },
    {
      id: 'supabase_storage',
      name: 'Supabase Storage',
      status: 'warning',
      lastCheck: new Date(),
      uptime: '98.2%',
      responseTime: '120ms',
      description: 'File upload and download services',
      icon: 'HardDrive',
      endpoints: ['File Upload', 'File Download', 'Storage Buckets'],
      retryCount: 2
    },
    {
      id: 'supabase_database',
      name: 'Supabase Database',
      status: 'online',
      lastCheck: new Date(),
      uptime: '99.9%',
      responseTime: '32ms',
      description: 'PostgreSQL database operations',
      icon: 'Database',
      endpoints: ['Read Operations', 'Write Operations', 'Real-time Subscriptions'],
      retryCount: 0
    },
    {
      id: 'deep_freeze',
      name: 'Deep Freeze Integration',
      status: 'error',
      lastCheck: new Date(),
      uptime: '95.1%',
      responseTime: 'Timeout',
      description: 'Workstation reset and management',
      icon: 'Snowflake',
      endpoints: ['Reset Commands', 'Status Monitoring', 'Configuration Sync'],
      retryCount: 5
    },
    {
      id: 'cloud_sync',
      name: 'Cloud Synchronization',
      status: 'warning',
      lastCheck: new Date(),
      uptime: '97.5%',
      responseTime: '89ms',
      description: 'Data synchronization between local and cloud',
      icon: 'Cloud',
      endpoints: ['Sync Queue', 'Conflict Resolution', 'Backup Services'],
      retryCount: 1
    },
    {
      id: 'workstation_network',
      name: 'Workstation Network',
      status: 'online',
      lastCheck: new Date(),
      uptime: '99.3%',
      responseTime: '15ms',
      description: 'Local network connectivity and monitoring',
      icon: 'Wifi',
      endpoints: ['Network Discovery', 'Health Checks', 'Status Updates'],
      retryCount: 0
    }
  ]);

  const [selectedService, setSelectedService] = useState(null);
  const [isRetrying, setIsRetrying] = useState({});

  useEffect(() => {
    // Simulate real-time status updates
    const interval = setInterval(() => {
      setServices(prev => prev?.map(service => ({
        ...service,
        lastCheck: new Date(),
        responseTime: service?.status === 'error' ? 'Timeout' : 
                     service?.status === 'warning' ? `${Math.floor(Math.random() * 100) + 80}ms` :
                     `${Math.floor(Math.random() * 50) + 20}ms`
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      case 'offline': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'online': return 'bg-success/10';
      case 'warning': return 'bg-warning/10';
      case 'error': return 'bg-error/10';
      case 'offline': return 'bg-muted-foreground/10';
      default: return 'bg-muted-foreground/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'XCircle';
      case 'offline': return 'Circle';
      default: return 'Circle';
    }
  };

  const handleRetryService = async (serviceId) => {
    setIsRetrying(prev => ({ ...prev, [serviceId]: true }));
    
    // Simulate retry process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setServices(prev => prev?.map(service => 
      service?.id === serviceId 
        ? { 
            ...service, 
            status: Math.random() > 0.3 ? 'online' : 'warning',
            retryCount: service?.retryCount + 1,
            lastCheck: new Date()
          }
        : service
    ));
    
    setIsRetrying(prev => ({ ...prev, [serviceId]: false }));
    onServiceAction('retry', serviceId);
  };

  const handleRestartService = async (serviceId) => {
    setIsRetrying(prev => ({ ...prev, [serviceId]: true }));
    
    // Simulate restart process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setServices(prev => prev?.map(service => 
      service?.id === serviceId 
        ? { 
            ...service, 
            status: 'online',
            retryCount: 0,
            lastCheck: new Date()
          }
        : service
    ));
    
    setIsRetrying(prev => ({ ...prev, [serviceId]: false }));
    onServiceAction('restart', serviceId);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 glow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Icon name="Zap" size={20} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Integration Status</h3>
            <p className="text-sm text-muted-foreground">Service health and connectivity monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="RefreshCw" size={16} />
          <span>Auto-refresh: 10s</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services?.map((service) => (
          <div
            key={service?.id}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer spring-hover ${
              selectedService === service?.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedService(selectedService === service?.id ? null : service?.id)}
          >
            {/* Service Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusBgColor(service?.status)}`}>
                  <Icon name={service?.icon} size={16} className={getStatusColor(service?.status)} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-card-foreground text-sm">{service?.name}</h4>
                  <p className="text-xs text-muted-foreground">{service?.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Icon 
                  name={getStatusIcon(service?.status)} 
                  size={16} 
                  className={getStatusColor(service?.status)} 
                />
                <span className={`text-xs font-medium ${getStatusColor(service?.status)}`}>
                  {service?.status?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Service Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-xs text-muted-foreground">Uptime</span>
                <p className="text-sm font-medium text-card-foreground">{service?.uptime}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Response</span>
                <p className="text-sm font-medium text-card-foreground font-mono">{service?.responseTime}</p>
              </div>
            </div>

            {/* Retry Count */}
            {service?.retryCount > 0 && (
              <div className="mb-3">
                <span className="text-xs text-warning">
                  Retry attempts: {service?.retryCount}
                </span>
              </div>
            )}

            {/* Expanded Details */}
            {selectedService === service?.id && (
              <div className="border-t border-border pt-3 mt-3">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-card-foreground">Endpoints Status</span>
                    <div className="mt-1 space-y-1">
                      {service?.endpoints?.map((endpoint, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{endpoint}</span>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${
                              service?.status === 'online' ? 'bg-success' :
                              service?.status === 'warning' ? 'bg-warning' : 'bg-error'
                            }`}></div>
                            <span className={getStatusColor(service?.status)}>
                              {service?.status === 'online' ? 'OK' : 
                               service?.status === 'warning' ? 'SLOW' : 'FAIL'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-card-foreground">Last Check</span>
                    <p className="text-xs text-muted-foreground font-mono">
                      {service?.lastCheck?.toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleRetryService(service?.id);
                      }}
                      disabled={isRetrying?.[service?.id]}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 text-xs"
                    >
                      <Icon 
                        name="RotateCcw" 
                        size={12} 
                        className={isRetrying?.[service?.id] ? 'animate-spin' : ''} 
                      />
                      <span>{isRetrying?.[service?.id] ? 'Retrying...' : 'Retry'}</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleRestartService(service?.id);
                      }}
                      disabled={isRetrying?.[service?.id]}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-warning text-warning-foreground rounded-md hover:bg-warning/90 transition-colors disabled:opacity-50 text-xs"
                    >
                      <Icon name="RefreshCw" size={12} />
                      <span>Restart</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Overall Status Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-success">
              {services?.filter(s => s?.status === 'online')?.length}
            </p>
            <p className="text-sm text-muted-foreground">Online</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">
              {services?.filter(s => s?.status === 'warning')?.length}
            </p>
            <p className="text-sm text-muted-foreground">Warning</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-error">
              {services?.filter(s => s?.status === 'error')?.length}
            </p>
            <p className="text-sm text-muted-foreground">Error</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-muted-foreground">
              {services?.filter(s => s?.status === 'offline')?.length}
            </p>
            <p className="text-sm text-muted-foreground">Offline</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationStatusGrid;
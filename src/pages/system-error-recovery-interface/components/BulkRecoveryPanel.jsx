import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkRecoveryPanel = ({ onBulkAction, isProcessing }) => {
  const [selectedWorkstations, setSelectedWorkstations] = useState([]);
  const [recoveryType, setRecoveryType] = useState('session_restore');
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const workstations = [
    { id: 'WS001', name: 'Workstation 01', status: 'error', ip: '192.168.1.101', user: 'john.doe@email.com', userAlt: 'Profile photo of John Doe, young professional man with brown hair in casual shirt' },
    { id: 'WS002', name: 'Workstation 02', status: 'warning', ip: '192.168.1.102', user: 'jane.smith@email.com', userAlt: 'Profile photo of Jane Smith, professional woman with blonde hair in business attire' },
    { id: 'WS003', name: 'Workstation 03', status: 'offline', ip: '192.168.1.103', user: null, userAlt: null },
    { id: 'WS004', name: 'Workstation 04', status: 'error', ip: '192.168.1.104', user: 'mike.wilson@email.com', userAlt: 'Profile photo of Mike Wilson, middle-aged man with glasses and beard in polo shirt' },
    { id: 'WS005', name: 'Workstation 05', status: 'warning', ip: '192.168.1.105', user: 'sarah.johnson@email.com', userAlt: 'Profile photo of Sarah Johnson, young woman with curly hair in professional blazer' },
    { id: 'WS006', name: 'Workstation 06', status: 'online', ip: '192.168.1.106', user: 'david.brown@email.com', userAlt: 'Profile photo of David Brown, professional man with short dark hair in button-up shirt' },
    { id: 'WS007', name: 'Workstation 07', status: 'error', ip: '192.168.1.107', user: 'lisa.davis@email.com', userAlt: 'Profile photo of Lisa Davis, professional woman with red hair in navy suit' },
    { id: 'WS008', name: 'Workstation 08', status: 'offline', ip: '192.168.1.108', user: null, userAlt: null }
  ];

  const recoveryOptions = [
    {
      id: 'session_restore',
      name: 'Session Restoration',
      description: 'Restore user sessions and file access',
      icon: 'RotateCcw',
      estimatedTime: '2-3 minutes per workstation'
    },
    {
      id: 'user_reauth',
      name: 'User Re-authentication',
      description: 'Force re-authentication for all users',
      icon: 'Shield',
      estimatedTime: '1-2 minutes per workstation'
    },
    {
      id: 'system_reset',
      name: 'System Reset',
      description: 'Full system reset with Deep Freeze',
      icon: 'RefreshCw',
      estimatedTime: '5-10 minutes per workstation'
    },
    {
      id: 'network_refresh',
      name: 'Network Refresh',
      description: 'Refresh network connections and registrations',
      icon: 'Wifi',
      estimatedTime: '30 seconds per workstation'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      case 'offline': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
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

  const handleSelectAll = () => {
    if (selectedWorkstations?.length === workstations?.length) {
      setSelectedWorkstations([]);
    } else {
      setSelectedWorkstations(workstations?.map(ws => ws?.id));
    }
  };

  const handleSelectWorkstation = (workstationId) => {
    setSelectedWorkstations(prev => 
      prev?.includes(workstationId)
        ? prev?.filter(id => id !== workstationId)
        : [...prev, workstationId]
    );
  };

  const handleBulkRecovery = async () => {
    if (selectedWorkstations?.length === 0) return;
    
    setIsRunning(true);
    setProgress(0);
    
    // Simulate bulk recovery process
    for (let i = 0; i <= selectedWorkstations?.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress((i / selectedWorkstations?.length) * 100);
    }
    
    setIsRunning(false);
    onBulkAction(recoveryType, selectedWorkstations);
  };

  const selectedOption = recoveryOptions?.find(opt => opt?.id === recoveryType);
  const estimatedTotalTime = selectedWorkstations?.length * 2; // Average 2 minutes per workstation

  return (
    <div className="bg-card rounded-xl border border-border p-6 glow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Layers" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Bulk Recovery Operations</h3>
            <p className="text-sm text-muted-foreground">Mass recovery for multiple workstations</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm font-medium text-card-foreground">
            {selectedWorkstations?.length} of {workstations?.length} selected
          </p>
          <p className="text-xs text-muted-foreground">
            Est. time: {estimatedTotalTime} minutes
          </p>
        </div>
      </div>
      {/* Recovery Type Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-card-foreground mb-3">Recovery Type</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recoveryOptions?.map((option) => (
            <button
              key={option?.id}
              onClick={() => setRecoveryType(option?.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left spring-hover ${
                recoveryType === option?.id
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Icon 
                  name={option?.icon} 
                  size={20} 
                  className={recoveryType === option?.id ? 'text-primary' : 'text-muted-foreground'} 
                />
                <div className="flex-1">
                  <h5 className={`font-medium ${
                    recoveryType === option?.id ? 'text-primary' : 'text-card-foreground'
                  }`}>
                    {option?.name}
                  </h5>
                  <p className="text-sm text-muted-foreground mt-1">{option?.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{option?.estimatedTime}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Workstation Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-card-foreground">Select Workstations</h4>
          <button
            onClick={handleSelectAll}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            {selectedWorkstations?.length === workstations?.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        <div className="max-h-64 overflow-y-auto space-y-2">
          {workstations?.map((workstation) => (
            <div
              key={workstation?.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedWorkstations?.includes(workstation?.id)
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
              }`}
              onClick={() => handleSelectWorkstation(workstation?.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedWorkstations?.includes(workstation?.id)
                      ? 'border-primary bg-primary' :'border-muted-foreground'
                  }`}>
                    {selectedWorkstations?.includes(workstation?.id) && (
                      <Icon name="Check" size={12} color="white" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-card-foreground">{workstation?.name}</span>
                      <Icon 
                        name={getStatusIcon(workstation?.status)} 
                        size={14} 
                        className={getStatusColor(workstation?.status)} 
                      />
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="font-mono">{workstation?.ip}</span>
                      {workstation?.user && (
                        <span>{workstation?.user}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(workstation?.status)} bg-opacity-10`}>
                  {workstation?.status?.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Progress Bar */}
      {isRunning && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-card-foreground">Recovery Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="default"
          onClick={handleBulkRecovery}
          disabled={selectedWorkstations?.length === 0 || isRunning}
          loading={isRunning}
          iconName="Play"
          iconPosition="left"
          className="spring-hover"
        >
          {isRunning ? 'Processing...' : `Start ${selectedOption?.name}`}
        </Button>
        
        <Button
          variant="outline"
          disabled={isRunning}
          iconName="Pause"
          iconPosition="left"
          className="spring-hover"
        >
          Schedule Later
        </Button>
        
        <Button
          variant="secondary"
          disabled={isRunning}
          iconName="Download"
          iconPosition="left"
          className="spring-hover"
        >
          Export Report
        </Button>
      </div>
      {/* Recovery Summary */}
      {selectedWorkstations?.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="bg-muted rounded-lg p-4">
            <h5 className="text-sm font-semibold text-card-foreground mb-2">Recovery Summary</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Selected:</span>
                <span className="ml-2 font-medium text-card-foreground">{selectedWorkstations?.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2 font-medium text-card-foreground">{selectedOption?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Est. Time:</span>
                <span className="ml-2 font-medium text-card-foreground">{estimatedTotalTime}m</span>
              </div>
              <div>
                <span className="text-muted-foreground">Impact:</span>
                <span className="ml-2 font-medium text-warning">Service Interruption</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkRecoveryPanel;
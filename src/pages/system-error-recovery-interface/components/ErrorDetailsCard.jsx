import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ErrorDetailsCard = ({ error, onResolve, onEscalate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [resolutionStep, setResolutionStep] = useState(0);

  const getErrorSeverity = (errorCode) => {
    if (errorCode?.startsWith('AUTH')) return 'high';
    if (errorCode?.startsWith('DB')) return 'critical';
    if (errorCode?.startsWith('NET')) return 'medium';
    if (errorCode?.startsWith('SYNC')) return 'low';
    return 'medium';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-error';
      case 'high': return 'text-warning';
      case 'medium': return 'text-accent';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return 'AlertTriangle';
      case 'high': return 'AlertCircle';
      case 'medium': return 'Info';
      case 'low': return 'CheckCircle';
      default: return 'Circle';
    }
  };

  const getResolutionSteps = (errorType) => {
    const steps = {
      'AUTH_FAILURE': [
        'Verify user credentials in database',
        'Check authentication service status',
        'Clear cached authentication tokens',
        'Restart authentication service',
        'Verify network connectivity to auth server'
      ],
      'DB_CONNECTION': [
        'Check database server status',
        'Verify connection string configuration',
        'Test network connectivity to database',
        'Check database user permissions',
        'Restart database connection pool'
      ],
      'SYNC_ERROR': [
        'Check cloud service connectivity',
        'Verify API credentials and permissions',
        'Clear local sync cache',
        'Retry synchronization process',
        'Check for data conflicts'
      ],
      'WORKSTATION_OFFLINE': [
        'Ping workstation network address',
        'Check physical network connections',
        'Verify workstation power status',
        'Restart network services',
        'Update workstation registration'
      ]
    };
    return steps?.[errorType] || ['Contact system administrator', 'Check system logs', 'Restart affected services'];
  };

  const severity = getErrorSeverity(error?.code);
  const resolutionSteps = getResolutionSteps(error?.type);

  const handleNextStep = () => {
    if (resolutionStep < resolutionSteps?.length - 1) {
      setResolutionStep(resolutionStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (resolutionStep > 0) {
      setResolutionStep(resolutionStep - 1);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 glow-card">
      {/* Error Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            severity === 'critical' ? 'bg-error/10' :
            severity === 'high' ? 'bg-warning/10' :
            severity === 'medium' ? 'bg-accent/10' : 'bg-success/10'
          }`}>
            <Icon 
              name={getSeverityIcon(severity)} 
              size={24} 
              className={getSeverityColor(severity)} 
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-card-foreground">{error?.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(severity)} bg-opacity-10`}>
                {severity?.toUpperCase()}
              </span>
            </div>
            <p className="text-muted-foreground mb-2">{error?.description}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Icon name="Hash" size={14} />
                <span className="font-mono">{error?.code}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Icon name="Clock" size={14} />
                <span>{error?.timestamp}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Icon name="MapPin" size={14} />
                <span>{error?.location}</span>
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={20} />
        </button>
      </div>
      {/* Affected Systems */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-card-foreground mb-3">Affected Systems</h4>
        <div className="flex flex-wrap gap-2">
          {error?.affectedSystems?.map((system, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium"
            >
              {system}
            </span>
          ))}
        </div>
      </div>
      {/* Resolution Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-card-foreground">Resolution Steps</h4>
          <span className="text-sm text-muted-foreground">
            Step {resolutionStep + 1} of {resolutionSteps?.length}
          </span>
        </div>
        
        <div className="bg-muted rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary-foreground">{resolutionStep + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-card-foreground font-medium">{resolutionSteps?.[resolutionStep]}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Estimated time: {Math.floor(Math.random() * 5) + 2} minutes
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousStep}
            disabled={resolutionStep === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 spring-hover"
          >
            <Icon name="ChevronLeft" size={16} />
            <span className="text-sm font-medium">Previous</span>
          </button>
          
          <div className="flex space-x-2">
            {resolutionSteps?.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= resolutionStep ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNextStep}
            disabled={resolutionStep === resolutionSteps?.length - 1}
            className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 spring-hover"
          >
            <span className="text-sm font-medium">Next</span>
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
      </div>
      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-semibold text-card-foreground mb-3">Technical Details</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Error ID:</span>
                  <span className="font-mono text-card-foreground">{error?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stack Trace:</span>
                  <span className="font-mono text-card-foreground">Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User Impact:</span>
                  <span className="text-card-foreground">{error?.userImpact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recovery Time:</span>
                  <span className="text-card-foreground">{error?.estimatedRecovery}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-semibold text-card-foreground mb-3">Related Logs</h5>
              <div className="bg-background rounded-lg p-3 font-mono text-xs text-muted-foreground max-h-32 overflow-y-auto">
                <div>[2025-10-28 17:56:30] ERROR: {error?.type} - {error?.description}</div>
                <div>[2025-10-28 17:56:25] WARN: Connection timeout detected</div>
                <div>[2025-10-28 17:56:20] INFO: Attempting reconnection...</div>
                <div>[2025-10-28 17:56:15] ERROR: Service unavailable</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border">
        <button
          onClick={onResolve}
          className="flex items-center space-x-2 px-6 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors spring-hover"
        >
          <Icon name="CheckCircle" size={16} />
          <span className="font-medium">Mark Resolved</span>
        </button>
        
        <button
          onClick={onEscalate}
          className="flex items-center space-x-2 px-6 py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition-colors spring-hover"
        >
          <Icon name="ArrowUp" size={16} />
          <span className="font-medium">Escalate</span>
        </button>
        
        <button className="flex items-center space-x-2 px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors spring-hover">
          <Icon name="Copy" size={16} />
          <span className="font-medium">Copy Details</span>
        </button>
      </div>
    </div>
  );
};

export default ErrorDetailsCard;
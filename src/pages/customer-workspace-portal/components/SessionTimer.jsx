import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SessionTimer = ({ 
  sessionStartTime = new Date(Date.now() - 3600000), // 1 hour ago
  remainingCredit = 120, // minutes
  workstationId = "WS-007",
  onExtendSession,
  onEndSession 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showExtendModal, setShowExtendModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getElapsedTime = () => {
    const elapsed = Math.floor((currentTime - sessionStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return { hours, minutes, seconds };
  };

  const getRemainingTime = () => {
    const remainingSeconds = remainingCredit * 60;
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    return { hours, minutes };
  };

  const getStatusColor = () => {
    if (remainingCredit > 30) return 'text-success';
    if (remainingCredit > 10) return 'text-warning';
    return 'text-error';
  };

  const elapsed = getElapsedTime();
  const remaining = getRemainingTime();
  const statusColor = getStatusColor();

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Clock" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Session Active</h3>
            <p className="text-sm text-muted-foreground">Workstation {workstationId}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColor?.replace('text-', 'bg-')} status-pulse`}></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-mono font-bold text-foreground">
            {String(elapsed?.hours)?.padStart(2, '0')}:{String(elapsed?.minutes)?.padStart(2, '0')}:{String(elapsed?.seconds)?.padStart(2, '0')}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Elapsed Time</div>
        </div>
        
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className={`text-2xl font-mono font-bold ${statusColor}`}>
            {String(remaining?.hours)?.padStart(2, '0')}:{String(remaining?.minutes)?.padStart(2, '0')}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Remaining</div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExtendModal(true)}
          iconName="Plus"
          iconPosition="left"
          className="flex-1"
        >
          Extend
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={onEndSession}
          iconName="LogOut"
          iconPosition="left"
          className="flex-1"
        >
          End Session
        </Button>
      </div>
      {showExtendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-200">
          <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Extend Session</h3>
            
            <div className="space-y-3 mb-6">
              {[15, 30, 60, 120]?.map(minutes => (
                <button
                  key={minutes}
                  onClick={() => {
                    onExtendSession?.(minutes);
                    setShowExtendModal(false);
                  }}
                  className="w-full p-3 text-left border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">+{minutes} minutes</span>
                    <span className="text-sm text-muted-foreground">${(minutes * 0.05)?.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExtendModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => setShowExtendModal(false)}
                className="flex-1"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTimer;
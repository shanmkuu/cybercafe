import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingHeader from './components/BrandingHeader';
import AuthenticationForm from './components/AuthenticationForm';
import SecurityStatusPanel from './components/SecurityStatusPanel';
import WorkstationInfo from './components/WorkstationInfo';

const AuthenticationPortal = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const checkExistingAuth = () => {
      const savedAuth = localStorage.getItem('cyberCafeAuth');
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          // Route to appropriate dashboard based on role
          if (authData?.role === 'admin') {
            navigate('/administrative-command-center');
          } else if (authData?.role === 'customer') {
            navigate('/customer-workspace-portal');
          }
        } catch (error) {
          // Clear invalid auth data
          localStorage.removeItem('cyberCafeAuth');
        }
      }
    };

    checkExistingAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-morph flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Panel - System Information */}
        <div className="hidden lg:block space-y-6">
          <SecurityStatusPanel />
          <WorkstationInfo />
        </div>

        {/* Center Panel - Authentication Form */}
        <div className="lg:col-span-1">
          <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-modal p-8 glow-card border border-border/50">
            <BrandingHeader />
            <AuthenticationForm />
          </div>
        </div>

        {/* Right Panel - Additional Information */}
        <div className="hidden lg:block space-y-6">
          {/* Network Status */}
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-success status-pulse"></div>
              <span>Network Status</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Sessions</span>
                <span className="font-mono text-foreground">12/50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bandwidth Usage</span>
                <span className="font-mono text-foreground">67%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Server Load</span>
                <span className="font-mono text-success">Normal</span>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">Quick Access</h3>
            <div className="space-y-2">
              <button className="w-full text-left text-xs text-muted-foreground hover:text-primary transition-colors p-2 rounded hover:bg-primary/5">
                System Documentation
              </button>
              <button className="w-full text-left text-xs text-muted-foreground hover:text-primary transition-colors p-2 rounded hover:bg-primary/5">
                Network Diagnostics
              </button>
              <button className="w-full text-left text-xs text-muted-foreground hover:text-primary transition-colors p-2 rounded hover:bg-primary/5">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile System Info */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4">
        <div className="grid grid-cols-2 gap-4">
          <SecurityStatusPanel />
          <WorkstationInfo />
        </div>
      </div>
      {/* Footer */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
          © {new Date()?.getFullYear()} CyberCafe Tracker • Secure Local Network Management
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPortal;
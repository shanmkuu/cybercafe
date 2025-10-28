import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';

class ErrorBoundaryNavigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState?.retryCount + 1
    }));
  };

  handleNavigateHome = () => {
    const { userRole } = this.props;
    
    // Clear error state and navigate based on role
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Navigate to appropriate dashboard
    if (userRole === 'admin') {
      window.location.href = '/administrative-command-center';
    } else if (userRole === 'customer') {
      window.location.href = '/customer-workspace-portal';
    } else {
      window.location.href = '/authentication-portal';
    }
  };

  handleReportError = () => {
    const errorReport = {
      error: this.state?.error?.toString(),
      stack: this.state?.error?.stack,
      componentStack: this.state?.errorInfo?.componentStack,
      userRole: this.props?.userRole,
      timestamp: new Date()?.toISOString(),
      retryCount: this.state?.retryCount
    };

    // In a real app, this would send to an error reporting service
    console.log('Error Report:', errorReport);
    
    // Show user feedback
    alert('Error report sent. Our team will investigate this issue.');
  };

  getErrorSeverity = () => {
    const errorMessage = this.state?.error?.message?.toLowerCase() || '';
    
    if (errorMessage?.includes('network') || errorMessage?.includes('fetch')) {
      return 'network';
    } else if (errorMessage?.includes('auth') || errorMessage?.includes('permission')) {
      return 'auth';
    } else if (errorMessage?.includes('database') || errorMessage?.includes('supabase')) {
      return 'database';
    } else {
      return 'application';
    }
  };

  getErrorIcon = (severity) => {
    switch (severity) {
      case 'network':
        return 'Wifi';
      case 'auth':
        return 'Lock';
      case 'database':
        return 'Database';
      default:
        return 'AlertTriangle';
    }
  };

  getErrorMessage = (severity) => {
    switch (severity) {
      case 'network':
        return 'Network connection issue detected. Please check your internet connection.';
      case 'auth':
        return 'Authentication error. Please sign in again to continue.';
      case 'database':
        return 'Database connection issue. Our team has been notified.';
      default:
        return 'An unexpected error occurred. Please try again or contact support.';
    }
  };

  getRecoveryActions = (severity) => {
    const { userRole } = this.props;
    
    const baseActions = [
      {
        label: 'Try Again',
        action: this.handleRetry,
        variant: 'default',
        icon: 'RefreshCw'
      },
      {
        label: userRole === 'admin' ? 'Admin Dashboard' : userRole === 'customer' ? 'My Workspace' : 'Sign In',
        action: this.handleNavigateHome,
        variant: 'outline',
        icon: 'Home'
      }
    ];

    if (severity === 'auth') {
      return [
        {
          label: 'Sign In Again',
          action: () => window.location.href = '/authentication-portal',
          variant: 'default',
          icon: 'LogIn'
        },
        ...baseActions?.slice(1)
      ];
    }

    if (severity === 'network') {
      return [
        {
          label: 'Check Connection',
          action: () => window.location?.reload(),
          variant: 'default',
          icon: 'Wifi'
        },
        ...baseActions
      ];
    }

    return baseActions;
  };

  render() {
    if (this.state?.hasError) {
      const severity = this.getErrorSeverity();
      const errorIcon = this.getErrorIcon(severity);
      const errorMessage = this.getErrorMessage(severity);
      const recoveryActions = this.getRecoveryActions(severity);

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-2xl shadow-modal p-8 text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon name={errorIcon} size={32} className="text-error" />
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-foreground mb-2">
                System Error
              </h1>
              
              <p className="text-muted-foreground mb-6">
                {errorMessage}
              </p>

              {/* Error Details (for admin users) */}
              {this.props?.userRole === 'admin' && this.state?.error && (
                <div className="mb-6 p-4 bg-muted rounded-lg text-left">
                  <details className="text-sm">
                    <summary className="font-medium text-foreground cursor-pointer mb-2">
                      Technical Details
                    </summary>
                    <div className="text-muted-foreground font-mono text-xs space-y-2">
                      <div>
                        <strong>Error:</strong> {this.state?.error?.toString()}
                      </div>
                      {this.state?.retryCount > 0 && (
                        <div>
                          <strong>Retry Count:</strong> {this.state?.retryCount}
                        </div>
                      )}
                      <div>
                        <strong>Timestamp:</strong> {new Date()?.toISOString()}
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Recovery Actions */}
              <div className="space-y-3 mb-6">
                {recoveryActions?.map((action, index) => (
                  <Button
                    key={index}
                    variant={action?.variant}
                    fullWidth
                    onClick={action?.action}
                    iconName={action?.icon}
                    iconPosition="left"
                    className="spring-hover"
                  >
                    {action?.label}
                  </Button>
                ))}
              </div>

              {/* Report Error */}
              <div className="pt-4 border-t border-border">
                <button
                  onClick={this.handleReportError}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Report this error to support
                </button>
              </div>

              {/* System Status */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-warning status-pulse"></div>
                  <span>System Status: Degraded</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props?.children;
  }
}

export default ErrorBoundaryNavigation;
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from './Button.jsx';
import Input from './Input.jsx';

const AuthenticationRouter = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    role: 'customer'
  });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for existing authentication
    const checkAuth = () => {
      const savedAuth = localStorage.getItem('cyberCafeAuth');
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          setIsAuthenticated(true);
          setUserRole(authData?.role);
          
          // Route based on role
          if (location?.pathname === '/authentication-portal') {
            routeUserByRole(authData?.role);
          }
        } catch (error) {
          localStorage.removeItem('cyberCafeAuth');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [location?.pathname]);

  const routeUserByRole = (role) => {
    switch (role) {
      case 'admin': navigate('/administrative-command-center');
        break;
      case 'customer': navigate('/customer-workspace-portal');
        break;
      default:
        navigate('/authentication-portal');
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock authentication logic
      if (loginForm?.username && loginForm?.password) {
        const authData = {
          username: loginForm?.username,
          role: loginForm?.role,
          timestamp: new Date()?.toISOString()
        };

        localStorage.setItem('cyberCafeAuth', JSON.stringify(authData));
        setIsAuthenticated(true);
        setUserRole(loginForm?.role);
        routeUserByRole(loginForm?.role);
      } else {
        setLoginError('Please enter valid credentials');
      }
    } catch (error) {
      setLoginError('Authentication failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cyberCafeAuth');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/authentication-portal');
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (loginError) setLoginError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center animate-pulse">
            <Icon name="Shield" size={24} color="white" />
          </div>
          <div className="text-muted-foreground">Initializing system...</div>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated and on authentication portal
  if (!isAuthenticated && location?.pathname === '/authentication-portal') {
    return (
      <div className="min-h-screen bg-gradient-morph flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-modal p-8 glow-card">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="Shield" size={32} color="white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">CyberCafe Tracker</h1>
              <p className="text-muted-foreground">Secure access to your workspace</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                label="Username"
                type="text"
                name="username"
                value={loginForm?.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                required
                disabled={isLoggingIn}
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={loginForm?.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={isLoggingIn}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Access Level</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLoginForm(prev => ({ ...prev, role: 'customer' }))}
                    className={`p-3 rounded-lg border-2 transition-all spring-hover ${
                      loginForm?.role === 'customer' ?'border-primary bg-primary/5 text-primary' :'border-border bg-background text-muted-foreground hover:border-primary/50'
                    }`}
                    disabled={isLoggingIn}
                  >
                    <Icon name="User" size={20} className="mx-auto mb-1" />
                    <div className="text-sm font-medium">Customer</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setLoginForm(prev => ({ ...prev, role: 'admin' }))}
                    className={`p-3 rounded-lg border-2 transition-all spring-hover ${
                      loginForm?.role === 'admin' ?'border-primary bg-primary/5 text-primary' :'border-border bg-background text-muted-foreground hover:border-primary/50'
                    }`}
                    disabled={isLoggingIn}
                  >
                    <Icon name="Settings" size={20} className="mx-auto mb-1" />
                    <div className="text-sm font-medium">Admin</div>
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertCircle" size={16} className="text-error" />
                    <span className="text-sm text-error">{loginError}</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="default"
                fullWidth
                loading={isLoggingIn}
                iconName="LogIn"
                iconPosition="right"
                className="spring-hover"
              >
                {isLoggingIn ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>

            {/* System Status */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-success status-pulse"></div>
                <span>System Online</span>
                <span className="font-mono">•</span>
                <span>{new Date()?.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to authentication if not authenticated
  if (!isAuthenticated) {
    navigate('/authentication-portal');
    return null;
  }

  // Render children with authentication context
  return React.cloneElement(children, { 
    userRole, 
    onLogout: handleLogout,
    isAuthenticated 
  });
};

export default AuthenticationRouter;
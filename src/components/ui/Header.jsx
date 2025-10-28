import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const Header = ({ userRole = 'admin', userName = 'Administrator', isCollapsed = false, onToggleSidebar }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState('online');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    // Logout logic would go here
    console.log('Logging out...');
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'online':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-100 shadow-card">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section - Logo and Navigation Toggle */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={20} color="white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-foreground">CyberCafe Tracker</h1>
              <span className="text-xs text-muted-foreground font-mono">
                {currentTime?.toLocaleDateString()} • {currentTime?.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="lg:hidden"
            >
              <Icon name="Menu" size={20} />
            </Button>
          )}
        </div>

        {/* Center Section - System Status */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} status-pulse`}></div>
            <span className="text-sm font-medium text-foreground">System Status</span>
            <span className={`text-sm font-mono ${getStatusColor()}`}>
              {systemStatus?.toUpperCase()}
            </span>
          </div>

          <div className="h-4 w-px bg-border"></div>

          <div className="flex items-center space-x-2">
            <Icon name="Users" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Active Sessions:</span>
            <span className="text-sm font-semibold text-foreground font-mono">24</span>
          </div>
        </div>

        {/* Right Section - User Menu */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-foreground">{getGreeting()}</p>
            <p className="text-xs text-muted-foreground">{userName}</p>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 spring-hover"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <Icon name="ChevronDown" size={16} className="hidden sm:block" />
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-modal z-200">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium text-popover-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole} Account</p>
                </div>
                
                <div className="p-1">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md transition-colors">
                    <Icon name="Settings" size={16} />
                    <span>Settings</span>
                  </button>
                  
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md transition-colors">
                    <Icon name="HelpCircle" size={16} />
                    <span>Help & Support</span>
                  </button>
                  
                  <div className="h-px bg-border my-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-error hover:bg-muted rounded-md transition-colors"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
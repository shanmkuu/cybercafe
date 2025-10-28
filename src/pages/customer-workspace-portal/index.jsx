import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Header from '../../components/ui/Header';
import ErrorBoundaryNavigation from '../../components/ui/ErrorBoundaryNavigation';

// Import components
import SessionTimer from './components/SessionTimer';
import FileBrowser from './components/FileBrowser';
import FileGrid from './components/FileGrid';
import UploadInterface from './components/UploadInterface';
import FileActivityPanel from './components/FileActivityPanel';
import QuickActions from './components/QuickActions';

const CustomerWorkspacePortal = ({ userRole, onLogout, isAuthenticated }) => {
  const navigate = useNavigate();
  const [selectedFolder, setSelectedFolder] = useState('documents');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadInterface, setShowUploadInterface] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Redirect if not authenticated or not a customer
    if (!isAuthenticated || userRole !== 'customer') {
      navigate('/authentication-portal');
      return;
    }

    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, userRole, navigate]);

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('File uploaded:', file?.name);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'upload':
        setShowUploadInterface(true);
        break;
      case 'download':
        if (selectedFiles?.length > 0) {
          console.log('Downloading files:', selectedFiles);
        } else {
          alert('Please select files to download');
        }
        break;
      case 'newfolder':
        const folderName = prompt('Enter folder name:');
        if (folderName) {
          console.log('Creating folder:', folderName);
        }
        break;
      case 'search':
        document.querySelector('input[type="search"]')?.focus();
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  };

  const handleExtendSession = (minutes) => {
    console.log(`Extending session by ${minutes} minutes`);
    // In a real app, this would call the backend API
  };

  const handleEndSession = () => {
    if (confirm('Are you sure you want to end your session?')) {
      onLogout?.();
    }
  };

  const handleLogoutClick = () => {
    if (confirm('Are you sure you want to sign out?')) {
      onLogout?.();
    }
  };

  if (!isAuthenticated || userRole !== 'customer') {
    return null; // Will redirect in useEffect
  }

  return (
    <ErrorBoundaryNavigation userRole={userRole}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <Header 
          userRole={userRole}
          userName="John Customer"
          onLogout={handleLogoutClick}
          onToggleSidebar={() => {}}
        />

        {/* Main Content */}
        <div className="pt-16">
          <div className="max-w-7xl mx-auto p-6">
            {/* Welcome Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Welcome to Your Workspace
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your files, track your session, and stay productive
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Current Time</div>
                    <div className="text-lg font-mono font-semibold text-foreground">
                      {currentTime?.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadInterface(!showUploadInterface)}
                    iconName="Upload"
                    iconPosition="left"
                  >
                    Upload Files
                  </Button>
                </div>
              </div>
            </div>

            {/* Upload Interface */}
            {showUploadInterface && (
              <div className="mb-6">
                <UploadInterface 
                  onUpload={handleFileUpload}
                  isUploading={isUploading}
                />
              </div>
            )}

            {/* Main Layout */}
            <div className="grid grid-cols-12 gap-6">
              {/* Left Sidebar - File Browser & Quick Actions */}
              <div className="col-span-12 lg:col-span-3 space-y-6">
                {/* Session Timer */}
                <SessionTimer
                  onExtendSession={handleExtendSession}
                  onEndSession={handleEndSession}
                />

                {/* File Browser */}
                <div className="h-96">
                  <FileBrowser
                    onFolderSelect={setSelectedFolder}
                    selectedFolder={selectedFolder}
                  />
                </div>

                {/* Quick Actions */}
                <QuickActions onAction={handleQuickAction} />
              </div>

              {/* Main Content Area */}
              <div className="col-span-12 lg:col-span-6">
                {/* Search Bar */}
                <div className="mb-4">
                  <Input
                    type="search"
                    placeholder="Search files by name, type, or date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="w-full"
                  />
                </div>

                {/* File Grid */}
                <div className="h-[600px]">
                  <FileGrid
                    selectedFolder={selectedFolder}
                    onFileSelect={setSelectedFiles}
                    selectedFiles={selectedFiles}
                  />
                </div>
              </div>

              {/* Right Sidebar - Activity Panel */}
              <div className="col-span-12 lg:col-span-3">
                <div className="h-[600px]">
                  <FileActivityPanel />
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Icon name="Files" size={24} className="text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">127</div>
                <div className="text-sm text-muted-foreground">Total Files</div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Icon name="HardDrive" size={24} className="text-accent" />
                </div>
                <div className="text-2xl font-bold text-foreground">2.4 GB</div>
                <div className="text-sm text-muted-foreground">Storage Used</div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Icon name="Upload" size={24} className="text-success" />
                </div>
                <div className="text-2xl font-bold text-foreground">23</div>
                <div className="text-sm text-muted-foreground">Files Uploaded Today</div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Icon name="Clock" size={24} className="text-warning" />
                </div>
                <div className="text-2xl font-bold text-foreground">1h 45m</div>
                <div className="text-sm text-muted-foreground">Session Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Icon name="Shield" size={20} color="white" />
                </div>
                <div>
                  <div className="font-semibold text-card-foreground">CyberCafe Tracker</div>
                  <div className="text-xs text-muted-foreground">Customer Workspace</div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-success status-pulse"></div>
                  <span>System Online</span>
                </div>
                <div>Workstation: WS-007</div>
                <div>&copy; {new Date()?.getFullYear()} CyberCafe Tracker</div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundaryNavigation>
  );
};

export default CustomerWorkspacePortal;
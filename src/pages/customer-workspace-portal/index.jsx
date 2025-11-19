import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Header from '../../components/ui/Header';
import ErrorBoundaryNavigation from '../../components/ui/ErrorBoundaryNavigation';
import { getUserFiles, createSession, endSession, logFileActivity, getUserActivityLogs } from '../../lib/db';
import { downloadFile } from '../../lib/storage';

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
  const [files, setFiles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize sessionStartTime from localStorage or default to now if not present
  // This ensures the timer starts immediately even before DB confirmation
  const [sessionStartTime, setSessionStartTime] = useState(() => {
    const stored = localStorage.getItem('sessionStartTime');
    return stored ? new Date(stored) : new Date();
  });
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId'));

  useEffect(() => {
    // Redirect if not authenticated or not a customer
    if (!isAuthenticated || userRole !== 'customer') {
      navigate('/authentication-portal');
      return;
    }

    // Get user email and ID
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();

    // Handle Session
    const initSession = async () => {
      // Need user ID for session creation now
      const { data: { user } } = await supabase.auth.getUser();

      if (!sessionId && user) {
        // Create new session if one doesn't exist
        try {
          console.log('Creating new session for', user.id);
          const { data, error } = await createSession(user.id, 'WS-007'); // Default workstation ID
          if (data && !error) {
            console.log('Session created:', data);
            setSessionId(data.id);
            setSessionStartTime(new Date(data.start_time));
            localStorage.setItem('sessionId', data.id);
            localStorage.setItem('sessionStartTime', data.start_time);
          } else {
            console.error('Failed to create session:', error);
          }
        } catch (err) {
          console.error('Session creation error:', err);
        }
      }
    };

    initSession();

    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, userRole, navigate]);

  const fetchFiles = async () => {
    if (!userId) return;

    setIsLoading(true);
    const { data, error } = await getUserFiles(userId);
    if (error) {
      console.error('Error fetching files:', error);
    } else {
      setFiles(data || []);
    }
    setIsLoading(false);
  };

  const fetchActivities = async () => {
    if (!userId) return;
    const { data, error } = await getUserActivityLogs(userId);
    if (error) {
      console.error('Error fetching activities:', error);
    } else {
      setActivities(data || []);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFiles();
      fetchActivities();
    }
  }, [userId]);

  const handleFileUpload = async (file, fileData) => {
    // Refresh file list and activities after upload
    if (userId) {
      fetchFiles();
      fetchActivities();
    }
  };

  const handleDownloadFiles = async (filesToDownload) => {
    if (!filesToDownload || filesToDownload.length === 0) {
      alert('Please select files to download');
      return;
    }

    for (const file of filesToDownload) {
      try {
        const { data, error } = await downloadFile('user_uploads', file.path);
        if (data) {
          const url = URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);

          if (userId) {
            await logFileActivity(userId, file.name, 'download');
            fetchActivities(); // Refresh activities
          }
        } else {
          console.error('Error downloading file:', error);
          alert(`Failed to download ${file.name}`);
        }
      } catch (err) {
        console.error('Download exception:', err);
      }
    }
  };

  const handleQuickAction = async (actionId) => {
    switch (actionId) {
      case 'upload':
        setShowUploadInterface(true);
        // Scroll to upload section
        setTimeout(() => {
          document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;
      case 'download':
        handleDownloadFiles(selectedFiles);
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

  const handleEndSession = async () => {
    if (confirm('Are you sure you want to end your session?')) {
      if (sessionId) {
        await endSession(sessionId);
        localStorage.removeItem('sessionId');
        localStorage.removeItem('sessionStartTime');
      }
      onLogout?.();
    }
  };

  const handleLogoutClick = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      if (sessionId) {
        await endSession(sessionId);
        localStorage.removeItem('sessionId');
        localStorage.removeItem('sessionStartTime');
      }
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
          onToggleSidebar={() => { }}
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
              <div className="mb-6" id="upload-section">
                <UploadInterface
                  onUpload={handleFileUpload}
                  isUploading={isUploading}
                  userEmail={userEmail}
                  userId={userId}
                />
              </div>
            )}

            {/* Main Layout */}
            <div className="grid grid-cols-12 gap-6">
              {/* Left Sidebar - File Browser & Quick Actions */}
              <div className="col-span-12 lg:col-span-3 space-y-6">
                {/* Session Timer */}
                <SessionTimer
                  sessionStartTime={sessionStartTime}
                  onExtendSession={handleExtendSession}
                  onEndSession={handleEndSession}
                />

                {/* File Browser */}
                <div className="h-96">
                  <FileBrowser
                    onFolderSelect={setSelectedFolder}
                    selectedFolder={selectedFolder}
                    files={files}
                  />
                </div>

                {/* Quick Actions */}
                <QuickActions
                  onAction={handleQuickAction}
                  files={files}
                />
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
                    files={files}
                    userEmail={userEmail}
                    onDownload={handleDownloadFiles}
                  />
                </div>
              </div>

              {/* Right Sidebar - Activity Panel */}
              <div className="col-span-12 lg:col-span-3">
                <div className="h-[600px]">
                  <FileActivityPanel activities={activities} />
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Icon name="Files" size={24} className="text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{files.length}</div>
                <div className="text-sm text-muted-foreground">Total Files</div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Icon name="HardDrive" size={24} className="text-accent" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {(files.reduce((acc, file) => acc + (file.size || 0), 0) / (1024 * 1024)).toFixed(2)} MB
                </div>
                <div className="text-sm text-muted-foreground">Storage Used</div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Icon name="Upload" size={24} className="text-success" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {files.filter(f => new Date(f.created_at).toDateString() === new Date().toDateString()).length}
                </div>
                <div className="text-sm text-muted-foreground">Files Uploaded Today</div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Icon name="Clock" size={24} className="text-warning" />
                </div>
                <div className="text-2xl font-bold text-foreground">Active</div>
                <div className="text-sm text-muted-foreground">Session Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundaryNavigation>
  );
};

export default CustomerWorkspacePortal;
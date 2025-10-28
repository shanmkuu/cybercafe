import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FileActivityPanel = () => {
  const [filter, setFilter] = useState('all'); // 'all', 'uploads', 'downloads'

  const activities = [
    {
      id: 1,
      type: 'upload',
      fileName: 'Project Proposal.pdf',
      timestamp: new Date('2025-10-28T16:45:00'),
      size: 2048576,
      status: 'completed'
    },
    {
      id: 2,
      type: 'download',
      fileName: 'Meeting Notes.docx',
      timestamp: new Date('2025-10-28T16:30:00'),
      size: 1024000,
      status: 'completed'
    },
    {
      id: 3,
      type: 'upload',
      fileName: 'Budget Analysis.xlsx',
      timestamp: new Date('2025-10-28T16:15:00'),
      size: 3072000,
      status: 'completed'
    },
    {
      id: 4,
      type: 'upload',
      fileName: 'Team Photo.jpg',
      timestamp: new Date('2025-10-28T16:00:00'),
      size: 5120000,
      status: 'failed'
    },
    {
      id: 5,
      type: 'download',
      fileName: 'Presentation.pptx',
      timestamp: new Date('2025-10-28T15:45:00'),
      size: 8192000,
      status: 'completed'
    },
    {
      id: 6,
      type: 'upload',
      fileName: 'Contract Draft.pdf',
      timestamp: new Date('2025-10-28T15:30:00'),
      size: 1536000,
      status: 'completed'
    }
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getActivityIcon = (type, status) => {
    if (status === 'failed') return 'XCircle';
    return type === 'upload' ? 'Upload' : 'Download';
  };

  const getActivityColor = (type, status) => {
    if (status === 'failed') return 'text-error';
    return type === 'upload' ? 'text-primary' : 'text-accent';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const filteredActivities = activities?.filter(activity => {
    if (filter === 'all') return true;
    return activity?.type === filter?.slice(0, -1); // Remove 's' from 'uploads'/'downloads'
  });

  const getFilterCount = (type) => {
    if (type === 'all') return activities?.length;
    return activities?.filter(a => a?.type === type?.slice(0, -1))?.length;
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-card-foreground mb-3">Recent Activity</h3>
        
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'uploads', label: 'Uploads' },
            { key: 'downloads', label: 'Downloads' }
          ]?.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                filter === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label} ({getFilterCount(key)})
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredActivities?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-3">
              <Icon name="Activity" size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No activity found</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredActivities?.map(activity => (
              <div key={activity?.id} className="flex items-start space-x-3 p-3 hover:bg-muted rounded-lg transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activity?.status === 'failed' ? 'bg-error/10' : 
                  activity?.type === 'upload' ? 'bg-primary/10' : 'bg-accent/10'
                }`}>
                  <Icon 
                    name={getActivityIcon(activity?.type, activity?.status)} 
                    size={16} 
                    className={getActivityColor(activity?.type, activity?.status)} 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity?.fileName}
                    </p>
                    <span className="text-xs text-muted-foreground ml-2">
                      {getTimeAgo(activity?.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium capitalize ${getActivityColor(activity?.type, activity?.status)}`}>
                        {activity?.status === 'failed' ? 'Failed' : activity?.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(activity?.size)}
                      </span>
                    </div>
                    
                    {activity?.status === 'failed' && (
                      <button className="text-xs text-primary hover:text-primary/80">
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {activities?.filter(a => a?.status === 'completed')?.length} successful operations
          </span>
          <button className="text-primary hover:text-primary/80 font-medium">
            View All
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileActivityPanel;
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FileActivityPanel = ({ activities = [] }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'uploads', 'downloads'

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
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
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const filteredActivities = activities?.filter(activity => {
    if (filter === 'all') return true;
    return activity?.action === filter?.slice(0, -1); // Remove 's' from 'uploads'/'downloads'
  });

  const getFilterCount = (type) => {
    if (type === 'all') return activities?.length;
    return activities?.filter(a => a?.action === type?.slice(0, -1))?.length;
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
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${filter === key
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
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activity?.status === 'failed' ? 'bg-error/10' :
                    activity?.action === 'upload' ? 'bg-primary/10' : 'bg-accent/10'
                  }`}>
                  <Icon
                    name={getActivityIcon(activity?.action, activity?.status)}
                    size={16}
                    className={getActivityColor(activity?.action, activity?.status)}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity?.file_name}
                    </p>
                    <span className="text-xs text-muted-foreground ml-2">
                      {getTimeAgo(activity?.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium capitalize ${getActivityColor(activity?.action, activity?.status)}`}>
                        {activity?.status === 'failed' ? 'Failed' : activity?.action}
                      </span>
                      {/* File size might not be in logs, so check if it exists */}
                      {activity?.size && (
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(activity?.size)}
                        </span>
                      )}
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
            {activities?.length} operations
          </span>
          {/* View All could link to a full history page later */}
        </div>
      </div>
    </div>
  );
};

export default FileActivityPanel;
import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCards = () => {
  const metricsData = [
    {
      id: 'total-users',
      title: 'Total Users',
      value: '247',
      change: '+12',
      changeType: 'increase',
      icon: 'Users',
      color: 'primary'
    },
    {
      id: 'active-sessions',
      title: 'Active Sessions',
      value: '18',
      change: '+3',
      changeType: 'increase',
      icon: 'Monitor',
      color: 'accent'
    },
    {
      id: 'files-uploaded',
      title: 'Files Uploaded',
      value: '1,342',
      change: '+89',
      changeType: 'increase',
      icon: 'Upload',
      color: 'success'
    },
    {
      id: 'system-health',
      title: 'System Health',
      value: '98.5%',
      change: '+0.2%',
      changeType: 'increase',
      icon: 'Activity',
      color: 'warning'
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'primary':
        return 'bg-primary text-white';
      case 'accent':
        return 'bg-accent text-white';
      case 'success':
        return 'bg-success text-white';
      case 'warning':
        return 'bg-warning text-white';
      default:
        return 'bg-primary text-white';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metricsData?.map((metric) => (
        <div key={metric?.id} className="bg-card rounded-lg border border-border p-4 glow-card spring-hover">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg ${getColorClasses(metric?.color)} flex items-center justify-center`}>
              <Icon name={metric?.icon} size={20} />
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <Icon 
                name={metric?.changeType === 'increase' ? 'TrendingUp' : 'TrendingDown'} 
                size={14} 
                className={metric?.changeType === 'increase' ? 'text-success' : 'text-error'} 
              />
              <span className={metric?.changeType === 'increase' ? 'text-success' : 'text-error'}>
                {metric?.change}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{metric?.value}</h3>
            <p className="text-sm text-muted-foreground">{metric?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
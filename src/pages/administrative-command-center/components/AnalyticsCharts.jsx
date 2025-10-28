import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AnalyticsCharts = () => {
  const [selectedChart, setSelectedChart] = useState('sessions');
  const [timeRange, setTimeRange] = useState('7d');

  const sessionTrendData = [
    { day: 'Mon', sessions: 45, revenue: 225 },
    { day: 'Tue', sessions: 52, revenue: 260 },
    { day: 'Wed', sessions: 38, revenue: 190 },
    { day: 'Thu', sessions: 61, revenue: 305 },
    { day: 'Fri', sessions: 73, revenue: 365 },
    { day: 'Sat', sessions: 89, revenue: 445 },
    { day: 'Sun', sessions: 67, revenue: 335 }
  ];

  const usageTimeData = [
    { hour: '06:00', usage: 12 },
    { hour: '08:00', usage: 28 },
    { hour: '10:00', usage: 45 },
    { hour: '12:00', usage: 67 },
    { hour: '14:00', usage: 89 },
    { hour: '16:00', usage: 92 },
    { hour: '18:00', usage: 78 },
    { hour: '20:00', usage: 56 },
    { hour: '22:00', usage: 34 }
  ];

  const workstationUtilizationData = [
    { name: 'Floor 1', value: 78, color: '#16A34A' },
    { name: 'Floor 2 Gaming', value: 92, color: '#0EA5E9' },
    { name: 'Private Rooms', value: 65, color: '#F59E0B' },
    { name: 'Available', value: 35, color: '#E5E7EB' }
  ];

  const fileActivityData = [
    { type: 'Documents', uploads: 145, downloads: 89 },
    { type: 'Images', uploads: 234, downloads: 156 },
    { type: 'Videos', uploads: 67, downloads: 45 },
    { type: 'Archives', uploads: 89, downloads: 123 },
    { type: 'Others', uploads: 56, downloads: 78 }
  ];

  const chartOptions = [
    { id: 'sessions', label: 'Session Trends', icon: 'TrendingUp' },
    { id: 'usage', label: 'Usage Time', icon: 'Clock' },
    { id: 'workstations', label: 'Workstation Utilization', icon: 'Monitor' },
    { id: 'files', label: 'File Activity', icon: 'FileText' }
  ];

  const timeRangeOptions = [
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' }
  ];

  const renderChart = () => {
    switch (selectedChart) {
      case 'sessions':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sessionTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="sessions" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'usage':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="hour" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="usage" 
                stroke="#0EA5E9" 
                strokeWidth={3}
                dot={{ fill: '#0EA5E9', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'workstations':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={workstationUtilizationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {workstationUtilizationData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'files':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fileActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="type" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="uploads" fill="#16A34A" radius={[2, 2, 0, 0]} />
              <Bar dataKey="downloads" fill="#0EA5E9" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getChartStats = () => {
    switch (selectedChart) {
      case 'sessions':
        const totalSessions = sessionTrendData?.reduce((sum, item) => sum + item?.sessions, 0);
        const avgSessions = Math.round(totalSessions / sessionTrendData?.length);
        return [
          { label: 'Total Sessions', value: totalSessions, icon: 'Users' },
          { label: 'Daily Average', value: avgSessions, icon: 'TrendingUp' },
          { label: 'Peak Day', value: 'Saturday', icon: 'Calendar' }
        ];

      case 'usage':
        const peakHour = usageTimeData?.reduce((max, item) => item?.usage > max?.usage ? item : max);
        return [
          { label: 'Peak Hour', value: peakHour?.hour, icon: 'Clock' },
          { label: 'Peak Usage', value: `${peakHour?.usage}%`, icon: 'Activity' },
          { label: 'Avg Usage', value: '62%', icon: 'BarChart3' }
        ];

      case 'workstations':
        const totalUtilization = workstationUtilizationData?.reduce((sum, item) => sum + item?.value, 0);
        return [
          { label: 'Total Utilization', value: `${Math.round(totalUtilization / 4)}%`, icon: 'Monitor' },
          { label: 'Best Performing', value: 'Gaming Zone', icon: 'Trophy' },
          { label: 'Available', value: '35%', icon: 'CheckCircle' }
        ];

      case 'files':
        const totalUploads = fileActivityData?.reduce((sum, item) => sum + item?.uploads, 0);
        const totalDownloads = fileActivityData?.reduce((sum, item) => sum + item?.downloads, 0);
        return [
          { label: 'Total Uploads', value: totalUploads, icon: 'Upload' },
          { label: 'Total Downloads', value: totalDownloads, icon: 'Download' },
          { label: 'Most Active', value: 'Images', icon: 'Image' }
        ];

      default:
        return [];
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Analytics Dashboard</h3>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e?.target?.value)}
            className="px-3 py-1 text-sm border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {timeRangeOptions?.map(option => (
              <option key={option?.id} value={option?.id}>{option?.label}</option>
            ))}
          </select>
          <Button variant="ghost" size="sm" iconName="Download" />
        </div>
      </div>
      {/* Chart Type Selector */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto">
        {chartOptions?.map((option) => (
          <button
            key={option?.id}
            onClick={() => setSelectedChart(option?.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedChart === option?.id
                ? 'bg-primary text-white' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon name={option?.icon} size={16} />
            <span>{option?.label}</span>
          </button>
        ))}
      </div>
      {/* Chart Display */}
      <div className="mb-4">
        {renderChart()}
      </div>
      {/* Chart Statistics */}
      <div className="grid grid-cols-3 gap-4">
        {getChartStats()?.map((stat, index) => (
          <div key={index} className="bg-muted rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Icon name={stat?.icon} size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground">{stat?.label}</span>
            </div>
            <div className="text-lg font-semibold text-foreground">{stat?.value}</div>
          </div>
        ))}
      </div>
      {/* Legend for Workstation Chart */}
      {selectedChart === 'workstations' && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="grid grid-cols-2 gap-2">
            {workstationUtilizationData?.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item?.color }}
                ></div>
                <span className="text-sm text-muted-foreground">{item?.name}</span>
                <span className="text-sm font-medium text-foreground">{item?.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Legend for File Activity Chart */}
      {selectedChart === 'files' && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-success"></div>
              <span className="text-sm text-muted-foreground">Uploads</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-accent"></div>
              <span className="text-sm text-muted-foreground">Downloads</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;
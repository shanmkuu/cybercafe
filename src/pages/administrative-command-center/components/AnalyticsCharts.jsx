import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AnalyticsCharts = ({ analyticsData }) => {
  const [selectedChart, setSelectedChart] = useState('sessions');
  const [timeRange, setTimeRange] = useState('7d');

  const sessionTrendData = analyticsData?.sessionTrend || [
    { day: 'Mon', sessions: 0, revenue: 0 },
    { day: 'Tue', sessions: 0, revenue: 0 },
    { day: 'Wed', sessions: 0, revenue: 0 },
    { day: 'Thu', sessions: 0, revenue: 0 },
    { day: 'Fri', sessions: 0, revenue: 0 },
    { day: 'Sat', sessions: 0, revenue: 0 },
    { day: 'Sun', sessions: 0, revenue: 0 }
  ];

  const usageTimeData = analyticsData?.usageTime || [
    { hour: '06:00', usage: 0 },
    { hour: '08:00', usage: 0 },
    { hour: '10:00', usage: 0 },
    { hour: '12:00', usage: 0 },
    { hour: '14:00', usage: 0 },
    { hour: '16:00', usage: 0 },
    { hour: '18:00', usage: 0 },
    { hour: '20:00', usage: 0 },
    { hour: '22:00', usage: 0 }
  ];

  const workstationUtilizationData = analyticsData?.workstationUtilization || [
    { name: 'Floor 1', value: 0, color: '#16A34A' },
    { name: 'Floor 2 Gaming', value: 0, color: '#0EA5E9' },
    { name: 'Private Rooms', value: 0, color: '#F59E0B' },
    { name: 'Available', value: 100, color: '#E5E7EB' }
  ];

  const fileActivityData = analyticsData?.fileActivity || [
    { type: 'Documents', uploads: 0, downloads: 0 },
    { type: 'Images', uploads: 0, downloads: 0 },
    { type: 'Videos', uploads: 0, downloads: 0 },
    { type: 'Archives', uploads: 0, downloads: 0 },
    { type: 'Others', uploads: 0, downloads: 0 }
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
        const peakHour = usageTimeData?.reduce((max, item) => item?.usage > max?.usage ? item : max, { usage: 0, hour: '-' });
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
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedChart === option?.id
                ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
            <div className="text-lg font-bold text-foreground">{stat?.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsCharts;
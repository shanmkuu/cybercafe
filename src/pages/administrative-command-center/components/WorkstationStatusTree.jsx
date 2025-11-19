import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const WorkstationStatusTree = ({ workstations }) => {
  const [expandedSections, setExpandedSections] = useState(['floor-1', 'floor-2']);

  // Process flat workstation list into sections if provided, otherwise use default structure or empty
  const workstationData = workstations ? (() => {
    const sections = {};
    workstations.forEach(ws => {
      if (!sections[ws.section_id]) {
        sections[ws.section_id] = {
          id: ws.section_id,
          name: ws.section_id === 'floor-1' ? 'Floor 1 - Main Area' :
            ws.section_id === 'floor-2' ? 'Floor 2 - Gaming Zone' :
              'Private Rooms', // Simple mapping for now
          type: 'section',
          workstations: []
        };
      }
      sections[ws.section_id].workstations.push({
        id: ws.id,
        name: ws.name,
        status: ws.status,
        user: ws.sessions?.user_id ? 'Occupied' : null, // We might need to fetch user name separately or join
        ip: ws.ip_address,
        session: ws.sessions ? new Date(ws.sessions.start_time).toLocaleTimeString() : null
      });
    });
    return Object.values(sections);
  })() : [
    {
      id: 'floor-1',
      name: 'Floor 1 - Main Area',
      type: 'section',
      workstations: []
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev?.includes(sectionId)
        ? prev?.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'occupied':
        return { icon: 'User', color: 'text-error' };
      case 'available':
        return { icon: 'CheckCircle', color: 'text-success' };
      case 'maintenance':
        return { icon: 'Wrench', color: 'text-warning' };
      default:
        return { icon: 'Circle', color: 'text-muted-foreground' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'occupied':
        return 'bg-error/10 text-error border-error/20';
      case 'available':
        return 'bg-success/10 text-success border-success/20';
      case 'maintenance':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Workstation Status</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-success status-pulse"></div>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {workstationData?.map((section) => (
          <div key={section?.id} className="border border-border rounded-lg">
            <button
              onClick={() => toggleSection(section?.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Icon
                  name={expandedSections?.includes(section?.id) ? 'ChevronDown' : 'ChevronRight'}
                  size={16}
                  className="text-muted-foreground"
                />
                <span className="font-medium text-foreground">{section?.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {section?.workstations?.filter(ws => ws?.status === 'occupied')?.length}/{section?.workstations?.length}
              </span>
            </button>

            {expandedSections?.includes(section?.id) && (
              <div className="border-t border-border">
                {section?.workstations?.map((workstation) => {
                  const statusInfo = getStatusIcon(workstation?.status);
                  return (
                    <div key={workstation?.id} className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Icon name={statusInfo?.icon} size={14} className={statusInfo?.color} />
                          <span className="text-sm font-medium text-foreground">{workstation?.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded border ${getStatusBadge(workstation?.status)}`}>
                          {workstation?.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1 ml-4">
                        <div>IP: {workstation?.ip}</div>
                        {workstation?.user && (
                          <div>User: {workstation?.user}</div>
                        )}
                        {workstation?.session && (
                          <div>Session: {workstation?.session}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-border">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-success"></div>
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-error"></div>
            <span className="text-muted-foreground">Occupied</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-warning"></div>
            <span className="text-muted-foreground">Maintenance</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkstationStatusTree;
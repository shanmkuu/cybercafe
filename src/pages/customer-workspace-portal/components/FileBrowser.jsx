import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const FileBrowser = ({ onFolderSelect, selectedFolder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(['root', 'documents']);

  const folderStructure = [
    {
      id: 'root',
      name: 'My Files',
      icon: 'Folder',
      children: [
        {
          id: 'documents',
          name: 'Documents',
          icon: 'FileText',
          children: [
            { id: 'work', name: 'Work Files', icon: 'Briefcase' },
            { id: 'personal', name: 'Personal', icon: 'User' }
          ]
        },
        {
          id: 'images',
          name: 'Images',
          icon: 'Image',
          children: [
            { id: 'photos', name: 'Photos', icon: 'Camera' },
            { id: 'screenshots', name: 'Screenshots', icon: 'Monitor' }
          ]
        },
        {
          id: 'downloads',
          name: 'Downloads',
          icon: 'Download'
        },
        {
          id: 'uploads',
          name: 'Recent Uploads',
          icon: 'Upload'
        }
      ]
    }
  ];

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => 
      prev?.includes(folderId) 
        ? prev?.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders?.includes(folder?.id);
    const isSelected = selectedFolder === folder?.id;
    const hasChildren = folder?.children && folder?.children?.length > 0;

    return (
      <div key={folder?.id}>
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
            isSelected 
              ? 'bg-primary/10 text-primary border border-primary/20' :'hover:bg-muted text-foreground'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            onFolderSelect?.(folder?.id);
            if (hasChildren) toggleFolder(folder?.id);
          }}
        >
          {hasChildren && (
            <Icon 
              name={isExpanded ? "ChevronDown" : "ChevronRight"} 
              size={16} 
              className="text-muted-foreground" 
            />
          )}
          <Icon 
            name={folder?.icon} 
            size={16} 
            className={isSelected ? "text-primary" : "text-muted-foreground"} 
          />
          <span className="text-sm font-medium truncate">{folder?.name}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {folder?.children?.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredFolders = (folders) => {
    if (!searchTerm) return folders;
    
    return folders?.filter(folder => 
      folder?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      (folder?.children && folder?.children?.some(child => 
        child?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      ))
    );
  };

  return (
    <div className="h-full flex flex-col bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-card-foreground mb-3">File Browser</h3>
        <Input
          type="search"
          placeholder="Search folders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e?.target?.value)}
          className="w-full"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filteredFolders(folderStructure)?.map(folder => renderFolder(folder))}
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Storage Used</span>
          <span className="font-mono">2.4 GB / 5.0 GB</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: '48%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default FileBrowser;
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const FileGrid = ({ selectedFolder = 'documents', onFileSelect, selectedFiles = [] }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'size', 'type'

  const mockFiles = [
    {
      id: 'file1',
      name: 'Project Proposal.pdf',
      type: 'pdf',
      size: 2048576,
      lastModified: new Date('2025-10-28T10:30:00'),
      thumbnail: "https://images.unsplash.com/photo-1618242537685-bdc08d6311b3",
      thumbnailAlt: 'PDF document icon with red and white design showing text lines'
    },
    {
      id: 'file2',
      name: 'Meeting Notes.docx',
      type: 'docx',
      size: 1024000,
      lastModified: new Date('2025-10-28T14:15:00'),
      thumbnail: "https://images.unsplash.com/photo-1658203897415-3cad6cfad5c0",
      thumbnailAlt: 'Microsoft Word document icon in blue with white W letter'
    },
    {
      id: 'file3',
      name: 'Budget Analysis.xlsx',
      type: 'xlsx',
      size: 3072000,
      lastModified: new Date('2025-10-27T16:45:00'),
      thumbnail: "https://images.unsplash.com/photo-1658203897339-0b8c64a42fba",
      thumbnailAlt: 'Excel spreadsheet icon in green with white X letter and grid pattern'
    },
    {
      id: 'file4',
      name: 'Team Photo.jpg',
      type: 'jpg',
      size: 5120000,
      lastModified: new Date('2025-10-26T12:20:00'),
      thumbnail: "https://images.unsplash.com/photo-1493882552576-fce827c6161e",
      thumbnailAlt: 'Group of diverse professionals smiling at camera in modern office setting'
    },
    {
      id: 'file5',
      name: 'Presentation.pptx',
      type: 'pptx',
      size: 8192000,
      lastModified: new Date('2025-10-25T09:10:00'),
      thumbnail: "https://images.unsplash.com/photo-1658203897406-9ef9e2af686c",
      thumbnailAlt: 'PowerPoint presentation icon in orange with white P letter'
    },
    {
      id: 'file6',
      name: 'Contract Draft.pdf',
      type: 'pdf',
      size: 1536000,
      lastModified: new Date('2025-10-24T11:30:00'),
      thumbnail: "https://images.unsplash.com/photo-1540129278276-7690eb92ca65",
      thumbnailAlt: 'Legal document with official seal and signature lines visible'
    }];


  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getFileIcon = (type) => {
    const iconMap = {
      pdf: 'FileText',
      docx: 'FileText',
      xlsx: 'Sheet',
      pptx: 'Presentation',
      jpg: 'Image',
      png: 'Image',
      gif: 'Image',
      mp4: 'Video',
      mp3: 'Music',
      zip: 'Archive'
    };
    return iconMap?.[type] || 'File';
  };

  const sortFiles = (files) => {
    return [...files]?.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a?.name?.localeCompare(b?.name);
        case 'date':
          return new Date(b.lastModified) - new Date(a.lastModified);
        case 'size':
          return b?.size - a?.size;
        case 'type':
          return a?.type?.localeCompare(b?.type);
        default:
          return 0;
      }
    });
  };

  const handleFileClick = (file, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      // Multi-select with Ctrl/Cmd
      const isSelected = selectedFiles?.includes(file?.id);
      const newSelection = isSelected ?
        selectedFiles?.filter((id) => id !== file?.id) :
        [...selectedFiles, file?.id];
      onFileSelect?.(newSelection);
    } else {
      // Single select
      onFileSelect?.([file?.id]);
    }
  };

  const sortedFiles = sortFiles(mockFiles);

  return (
    <div className="h-full flex flex-col bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-card-foreground">
            Files ({mockFiles?.length})
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              iconName="Grid3X3" />

            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              iconName="List" />

          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="px-3 py-1 border border-border rounded-md text-sm bg-background">

            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="size">Sort by Size</option>
            <option value="type">Sort by Type</option>
          </select>

          {selectedFiles?.length > 0 &&
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedFiles?.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left">

                Download
              </Button>
              <Button
                variant="destructive"
                size="sm"
                iconName="Trash2"
                iconPosition="left">

                Delete
              </Button>
            </div>
          }
        </div>
      </div>
      {/* File Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'grid' ?
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedFiles?.map((file) =>
              <div
                key={file?.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all spring-hover ${selectedFiles?.includes(file?.id) ?
                    'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted'}`
                }
                onClick={(e) => handleFileClick(file, e)}>

                <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {file?.type?.includes('jpg') || file?.type?.includes('png') ?
                    <Image
                      src={file?.thumbnail}
                      alt={file?.thumbnailAlt}
                      className="w-full h-full object-cover" /> :


                    <Icon name={getFileIcon(file?.type)} size={32} className="text-muted-foreground" />
                  }
                </div>
                <div className="text-sm font-medium text-foreground truncate" title={file?.name}>
                  {file?.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(file?.size)}
                </div>
              </div>
            )}
          </div> :

          <div className="space-y-1">
            {sortedFiles?.map((file) =>
              <div
                key={file?.id}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${selectedFiles?.includes(file?.id) ?
                    'bg-primary/5 border border-primary/20' : 'hover:bg-muted'}`
                }
                onClick={(e) => handleFileClick(file, e)}>

                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  {file?.type?.includes('jpg') || file?.type?.includes('png') ?
                    <Image
                      src={file?.thumbnail}
                      alt={file?.thumbnailAlt}
                      className="w-full h-full object-cover rounded-lg" /> :


                    <Icon name={getFileIcon(file?.type)} size={20} className="text-muted-foreground" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {file?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(file?.size)} • {file?.lastModified?.toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Download"
                    onClick={(e) => {
                      e?.stopPropagation();
                      // Handle download
                    }} />

                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="MoreVertical"
                    onClick={(e) => {
                      e?.stopPropagation();
                      // Handle more options
                    }} />

                </div>
              </div>
            )}
          </div>
        }
      </div>
    </div>);

};

export default FileGrid;
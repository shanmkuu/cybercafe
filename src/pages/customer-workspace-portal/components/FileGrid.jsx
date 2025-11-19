import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const FileGrid = ({ selectedFolder = 'documents', onFileSelect, selectedFiles = [], files = [], onDownload, onDelete }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'size', 'type'

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
    // Extract extension from mimetype or name if needed
    const ext = type?.split('/')?.pop() || type;
    return iconMap?.[ext] || 'File';
  };

  const sortFiles = (filesToSort) => {
    return [...filesToSort]?.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a?.name?.localeCompare(b?.name);
        case 'date':
          return new Date(b.created_at) - new Date(a.created_at);
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
      const isSelected = selectedFiles.some(f => f.id === file.id);
      const newSelection = isSelected ?
        selectedFiles.filter((f) => f.id !== file.id) :
        [...selectedFiles, file];
      onFileSelect?.(newSelection);
    } else {
      // Single select
      onFileSelect?.([file]);
    }
  };

  const sortedFiles = sortFiles(files);

  return (
    <div className="h-full flex flex-col bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-card-foreground">
            Files ({files?.length})
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
                iconPosition="left"
                onClick={() => onDownload?.(selectedFiles)}
              >
                Download
              </Button>
              <Button
                variant="destructive"
                size="sm"
                iconName="Trash2"
                iconPosition="left"
                onClick={() => onDelete?.(selectedFiles)}
              >
                Delete
              </Button>
            </div>
          }
        </div>
      </div>
      {/* File Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Icon name="File" size={48} className="mb-4 opacity-50" />
            <p>No files found. Upload some files to get started.</p>
          </div>
        ) : (
          viewMode === 'grid' ?
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedFiles?.map((file) =>
                <div
                  key={file?.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all spring-hover ${selectedFiles.some(f => f.id === file.id) ?
                    'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted'}`
                  }
                  onClick={(e) => handleFileClick(file, e)}>

                  <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {file?.type?.includes('image') ?
                      <Image
                        src={file?.thumbnail || 'placeholder'}
                        // Note: Real thumbnails would need a signed URL or public URL if bucket is public
                        // For now we might just show icon if we don't have a thumbnail URL
                        alt={file?.name}
                        className="w-full h-full object-cover"
                        fallback={<Icon name={getFileIcon(file?.type)} size={32} className="text-muted-foreground" />}
                      /> :
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
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${selectedFiles.some(f => f.id === file.id) ?
                    'bg-primary/5 border border-primary/20' : 'hover:bg-muted'}`
                  }
                  onClick={(e) => handleFileClick(file, e)}>

                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {file?.type?.includes('image') ?
                      <Image
                        src={file?.thumbnail}
                        alt={file?.name}
                        className="w-full h-full object-cover rounded-lg"
                        fallback={<Icon name={getFileIcon(file?.type)} size={20} className="text-muted-foreground" />}
                      /> :
                      <Icon name={getFileIcon(file?.type)} size={20} className="text-muted-foreground" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {file?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file?.size)} • {new Date(file?.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Download"
                      onClick={(e) => {
                        e?.stopPropagation();
                        onDownload?.([file]);
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
        )}
      </div>
    </div>);

};

export default FileGrid;
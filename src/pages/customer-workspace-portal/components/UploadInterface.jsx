import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { uploadFile } from '../../../lib/storage';

const UploadInterface = ({ onUpload, isUploading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef(null);

  const allowedTypes = {
    'image/*': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-excel': ['xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'application/vnd.ms-powerpoint': ['ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
    'text/plain': ['txt'],
    'application/zip': ['zip', 'rar']
  };

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFiles(Array.from(e?.dataTransfer?.files));
    }
  };

  const handleFileInput = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFiles(Array.from(e?.target?.files));
    }
  };

  const handleFiles = (files) => {
    const validFiles = [];
    const errors = [];

    files?.forEach(file => {
      // Check file size
      if (file?.size > maxFileSize) {
        errors?.push(`${file?.name}: File too large (max 50MB)`);
        return;
      }

      // Check file type
      const fileExtension = file?.name?.split('.')?.pop()?.toLowerCase();
      const isValidType = Object.values(allowedTypes)?.some(extensions => 
        extensions?.includes(fileExtension)
      );

      if (!isValidType) {
        errors?.push(`${file?.name}: File type not supported`);
        return;
      }

      validFiles?.push({
        id: Date.now() + Math.random(),
        file,
        name: file?.name,
        size: file?.size,
        type: file?.type,
        progress: 0,
        status: 'pending' // pending, uploading, completed, error
      });
    });

    if (errors?.length > 0) {
      alert('Upload errors:\n' + errors?.join('\n'));
    }

    if (validFiles?.length > 0) {
      setUploadQueue(prev => [...prev, ...validFiles]);
      setShowUploadModal(true);
    }
  };

  const startUpload = async () => {
    const pendingFiles = uploadQueue?.filter(f => f?.status === 'pending');
    if (!pendingFiles || pendingFiles.length === 0) return;

    // Mark overall uploading state
    setUploadQueue(prev => prev?.map(f => f?.status === 'pending' ? { ...f, status: 'queued' } : f));

    for (const fileItem of pendingFiles) {
      // start optimistic progress animation
      setUploadQueue(prev => prev?.map(f => 
        f?.id === fileItem?.id ? { ...f, status: 'uploading', progress: 5 } : f
      ));

      let progress = 5;
      const ticker = setInterval(() => {
        progress = Math.min(90, progress + Math.floor(Math.random() * 10) + 5);
        setUploadQueue(prev => prev?.map(f => 
          f?.id === fileItem?.id ? { ...f, progress } : f
        ));
      }, 300);

      try {
        // Build a safe path. Assumption: a bucket named 'uploads' exists. Adjust as needed.
  const safeName = `${Date.now()}_${(fileItem?.name || '').replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
        const path = `uploads/${safeName}`;

        const { data, error } = await uploadFile('uploads', path, fileItem?.file);
        clearInterval(ticker);

        if (error) {
          setUploadQueue(prev => prev?.map(f => 
            f?.id === fileItem?.id ? { ...f, status: 'error', error: error?.message || String(error) } : f
          ));
          continue;
        }

        // finalize progress
        setUploadQueue(prev => prev?.map(f => 
          f?.id === fileItem?.id ? { ...f, status: 'completed', progress: 100, uploaded: data } : f
        ));

        // notify parent with upload result (file and storage data)
        // Call parent handler with original File as first arg and storage response as second arg
        onUpload?.(fileItem?.file, data);
      } catch (err) {
        clearInterval(ticker);
        setUploadQueue(prev => prev?.map(f => 
          f?.id === fileItem?.id ? { ...f, status: 'error', error: err?.message || String(err) } : f
        ));
      }
    }
  };

  const removeFromQueue = (fileId) => {
    setUploadQueue(prev => prev?.filter(f => f?.id !== fileId));
  };

  const clearCompleted = () => {
    setUploadQueue(prev => prev?.filter(f => f?.status !== 'completed'));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'Clock';
      case 'uploading': return 'Upload';
      case 'completed': return 'CheckCircle';
      case 'error': return 'XCircle';
      default: return 'File';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-muted-foreground';
      case 'uploading': return 'text-primary';
      case 'completed': return 'text-success';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive 
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          accept={Object.keys(allowedTypes)?.join(',')}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <Icon name="Upload" size={32} className="text-primary" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-sm text-muted-foreground">
              Supports: Images, PDFs, Office documents, Text files, Archives
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum file size: 50MB per file
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => fileInputRef?.current?.click()}
            iconName="FolderOpen"
            iconPosition="left"
          >
            Choose Files
          </Button>
        </div>
      </div>
      {/* Upload Queue Button */}
      {uploadQueue?.length > 0 && (
        <Button
          variant="default"
          onClick={() => setShowUploadModal(true)}
          iconName="List"
          iconPosition="left"
          className="w-full"
        >
          Upload Queue ({uploadQueue?.length})
        </Button>
      )}
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-200">
          <div className="bg-card rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-card-foreground">
                  Upload Files ({uploadQueue?.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                  iconName="X"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {uploadQueue?.map(fileItem => (
                  <div key={fileItem?.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Icon 
                      name={getStatusIcon(fileItem?.status)} 
                      size={20} 
                      className={getStatusColor(fileItem?.status)} 
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {fileItem?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(fileItem?.size)}
                      </div>
                      
                      {fileItem?.status === 'uploading' && (
                        <div className="w-full bg-background rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${fileItem?.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {fileItem?.status === 'uploading' && `${fileItem?.progress}%`}
                      {fileItem?.status === 'completed' && 'Done'}
                      {fileItem?.status === 'error' && 'Failed'}
                    </div>

                    {(fileItem?.status === 'pending' || fileItem?.status === 'error') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromQueue(fileItem?.id)}
                        iconName="X"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={clearCompleted}
                  disabled={!uploadQueue?.some(f => f?.status === 'completed')}
                >
                  Clear Completed
                </Button>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Close
                  </Button>
                  
                  <Button
                    variant="default"
                    onClick={startUpload}
                    disabled={!uploadQueue?.some(f => f?.status === 'pending') || isUploading}
                    loading={isUploading}
                    iconName="Upload"
                    iconPosition="left"
                  >
                    Start Upload
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadInterface;
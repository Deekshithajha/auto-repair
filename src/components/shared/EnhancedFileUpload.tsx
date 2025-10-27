import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CameraCapture } from './CameraCapture';

interface EnhancedFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  className?: string;
  placeholder?: string;
  id?: string;
}

export const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onFilesSelected,
  accept = "image/*",
  multiple = false,
  maxFiles = 5,
  maxFileSize = 10,
  className = "",
  placeholder = "Upload photos",
  id = "file-upload"
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
  };

  const handleCameraCapture = (file: File) => {
    processFiles([file]);
  };

  const processFiles = (files: File[]) => {
    // Validate file count
    if (files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file size
    const oversizedFiles = files.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Some files are too large. Maximum size is ${maxFileSize}MB`);
      return;
    }

    // Validate file type
    const invalidFiles = files.filter(file => {
      if (accept === "image/*") {
        return !file.type.startsWith('image/');
      }
      return !file.type.match(accept.replace(/\*/g, '.*'));
    });

    if (invalidFiles.length > 0) {
      alert('Some files have invalid format');
      return;
    }

    onFilesSelected(files);
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleTakePhoto = () => {
    setShowCamera(true);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl mb-2">📸</div>
          <p className="text-sm text-muted-foreground mb-4">
            {placeholder} (max {maxFiles} files, {maxFileSize}MB each)
          </p>
          
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleChooseFiles}
              className="flex items-center gap-2"
            >
              <span>📁</span>
              Choose Files
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleTakePhoto}
              className="flex items-center gap-2"
            >
              <span>📷</span>
              Take Photo
            </Button>
          </div>
        </div>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        id={id}
      />

      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
        multiple={multiple}
        maxPhotos={maxFiles}
      />
    </div>
  );
};

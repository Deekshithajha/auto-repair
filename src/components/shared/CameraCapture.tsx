import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  isOpen: boolean;
  multiple?: boolean;
  maxPhotos?: number;
}

type PermissionChoice = 'always' | 'once' | 'never' | null;

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
  isOpen,
  multiple = false,
  maxPhotos = 5
}) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [permissionDialog, setPermissionDialog] = useState(false);
  const [permissionChoice, setPermissionChoice] = useState<PermissionChoice>(null);
  const [cameraPermission, setCameraPermission] = useState<PermissionState>('prompt');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);

  // Load saved permission choice from localStorage
  useEffect(() => {
    const savedChoice = localStorage.getItem('camera-permission-choice') as PermissionChoice;
    if (savedChoice) {
      setPermissionChoice(savedChoice);
    }
  }, []);

  // Check camera permission status
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((result) => {
        setCameraPermission(result.state);
      });
    }
  }, []);

  const handleCameraAccess = async () => {
    // If user previously chose "never", show permission dialog again
    if (permissionChoice === 'never') {
      setPermissionDialog(true);
      return;
    }

    // If user chose "always" or "once", proceed directly
    if (permissionChoice === 'always' || permissionChoice === 'once') {
      await startCamera();
      return;
    }

    // First time access - show permission dialog
    setPermissionDialog(true);
  };

  const handlePermissionChoice = async (choice: PermissionChoice) => {
    setPermissionChoice(choice);
    setPermissionDialog(false);
    
    // Save choice to localStorage
    localStorage.setItem('camera-permission-choice', choice || '');
    
    if (choice === 'never') {
      toast({
        title: "Camera Access Denied",
        description: "Camera access has been denied. You can change this in your browser settings.",
        variant: "destructive"
      });
      return;
    }

    await startCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraPermission('granted');
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      if (error.name === 'NotAllowedError') {
        toast({
          title: "Camera Access Denied",
          description: "Please allow camera access to take photos",
          variant: "destructive"
        });
      } else if (error.name === 'NotFoundError') {
        toast({
          title: "No Camera Found",
          description: "No camera device found on this device",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Camera Error",
          description: "Failed to access camera. Please try again.",
          variant: "destructive"
        });
      }
      
      onClose();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        if (multiple) {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setCapturedPhotos(prev => [...prev, dataUrl]);
          
          if (capturedPhotos.length + 1 >= maxPhotos) {
            // Convert all captured photos to files and call onCapture
            const files = capturedPhotos.map((dataUrl, index) => {
              const byteString = atob(dataUrl.split(',')[1]);
              const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              return new File([ab], `camera-photo-${index + 1}.jpg`, { type: mimeString });
            });
            
            files.forEach(file => onCapture(file));
            onClose();
          }
        } else {
          onCapture(file);
          onClose();
        }
      }
    }, 'image/jpeg', 0.8);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedPhotos([]);
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Take Photo with Camera</DialogTitle>
            <DialogDescription>
              {multiple ? `Take up to ${maxPhotos} photos` : 'Take a photo using your device camera'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {cameraPermission === 'granted' ? (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button onClick={capturePhoto} disabled={isCapturing}>
                    {isCapturing ? 'Capturing...' : '📸 Capture Photo'}
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </div>

                {multiple && capturedPhotos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Captured Photos ({capturedPhotos.length}/{maxPhotos})</p>
                    <div className="grid grid-cols-2 gap-2">
                      {capturedPhotos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Captured ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📷</div>
                <p className="text-muted-foreground mb-4">
                  Click the button below to access your camera
                </p>
                <Button onClick={handleCameraAccess}>
                  Access Camera
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Permission Choice Dialog */}
      <Dialog open={permissionDialog} onOpenChange={() => setPermissionDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Camera Permission</DialogTitle>
            <DialogDescription>
              This website wants to access your camera to take photos. How would you like to handle this permission?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Button 
                onClick={() => handlePermissionChoice('always')} 
                className="w-full justify-start"
                variant="outline"
              >
                <span className="mr-2">✅</span>
                Always allow camera access
              </Button>
              <Button 
                onClick={() => handlePermissionChoice('once')} 
                className="w-full justify-start"
                variant="outline"
              >
                <span className="mr-2">⏰</span>
                Just this once
              </Button>
              <Button 
                onClick={() => handlePermissionChoice('never')} 
                className="w-full justify-start"
                variant="outline"
              >
                <span className="mr-2">❌</span>
                Never allow camera access
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              You can change this setting later in your browser's site permissions.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

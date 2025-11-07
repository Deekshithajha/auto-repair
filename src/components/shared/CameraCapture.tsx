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
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [hasStream, setHasStream] = useState(false);

  // Load saved permission choice from localStorage
  useEffect(() => {
    const savedChoice = localStorage.getItem('camera-permission-choice') as PermissionChoice;
    if (savedChoice) {
      setPermissionChoice(savedChoice);
    }
  }, []);

  // Check camera permission status
  useEffect(() => {
    const checkPermission = async () => {
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setCameraPermission(result.state);
          
          // Listen for permission changes
          result.onchange = () => {
            setCameraPermission(result.state);
          };
        } catch (err) {
          console.error('Error checking camera permission:', err);
        }
      }
    };
    
    checkPermission();
  }, []);

  // Auto-start camera when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Re-check permission status when dialog opens
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'camera' as PermissionName }).then((result) => {
          setCameraPermission(result.state);
          
          // If permission was already granted, start camera immediately
          if (result.state === 'granted' && !streamRef.current) {
            startCamera();
          }
        });
      }
      
      // If permission was already granted, start camera immediately
      if (cameraPermission === 'granted' && !streamRef.current) {
        startCamera();
      }
      // If permission is prompt and user has previously allowed, try to start
      else if (cameraPermission === 'prompt' && (permissionChoice === 'always' || permissionChoice === 'once')) {
        startCamera();
      }
    }
    // Cleanup when dialog closes
    if (!isOpen && streamRef.current) {
      stopCamera();
      setCapturedPhotos([]);
    }
  }, [isOpen, cameraPermission, permissionChoice]);

  const handleCameraAccess = async () => {
    // If user previously chose "never", show permission dialog again
    if (permissionChoice === 'never') {
      setPermissionDialog(true);
      return;
    }

    // Check if permission is already granted (browser might have granted it)
    if (cameraPermission === 'granted') {
      await startCamera();
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
      console.log('Starting camera...');
      
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Request camera access - remove facingMode constraint for desktop Safari
      const constraints: MediaStreamConstraints = {
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      console.log('Requesting camera access with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Camera stream obtained:', stream);
      console.log('Stream tracks:', stream.getTracks());
      
      streamRef.current = stream;
      setCameraPermission('granted');
      setHasStream(true);
      
      // Wait a bit for the video element to be in the DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Set up video element
      const setupVideo = () => {
        if (!videoRef.current) {
          console.error('Video element not found!');
          // Retry after a short delay
          setTimeout(setupVideo, 100);
          return;
        }

        const video = videoRef.current;
        console.log('Setting video srcObject...');
        video.srcObject = stream;
        
        // Ensure video plays
        const playVideo = async () => {
          try {
            if (video && video.srcObject) {
              console.log('Attempting to play video...');
              console.log('Video readyState:', video.readyState);
              console.log('Video paused:', video.paused);
              
              await video.play();
              setIsStreamActive(true);
              console.log('✅ Video stream is now active and playing!');
            }
          } catch (err: any) {
            console.error('Error playing video:', err);
            console.error('Error details:', {
              name: err.name,
              message: err.message,
              code: err.code
            });
            setIsStreamActive(false);
            toast({
              title: "Camera Error",
              description: `Failed to start camera preview: ${err.message || 'Unknown error'}`,
              variant: "destructive"
            });
          }
        };

        // Handle when video metadata is loaded
        const handleLoadedMetadata = () => {
          console.log('✅ Video metadata loaded, readyState:', video.readyState);
          playVideo();
        };
        
        // Handle when video starts playing
        const handlePlaying = () => {
          console.log('✅ Video is now playing');
          setIsStreamActive(true);
        };
        
        // Handle when video can play
        const handleCanPlay = () => {
          console.log('✅ Video can play');
          playVideo();
        };
        
        // Handle video errors
        const handleError = (e: Event) => {
          console.error('Video element error:', e);
        };
        
        // Add event listeners
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('error', handleError);
        
        // Try to play immediately
        playVideo();
        
        // Also try after a short delay in case metadata loads quickly
        setTimeout(() => {
          if (video.paused && video.readyState >= 2) {
            playVideo();
          }
        }, 200);
      };
      
      setupVideo();
      
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code
      });
      
      if (error.name === 'NotAllowedError') {
        setCameraPermission('denied');
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
          description: `Failed to access camera: ${error.message || 'Unknown error'}`,
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
    setIsStreamActive(false);
    setHasStream(false);
    if (videoRef.current) {
      // Remove all event listeners before clearing srcObject
      const video = videoRef.current;
      video.srcObject = null;
      // Clear any event listeners by cloning the element (if needed)
      video.onloadedmetadata = null;
      video.onplaying = null;
      video.oncanplay = null;
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedPhotos([]);
    onClose();
  };

  // Cleanup event listeners and camera on unmount
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) {
        // Remove event listeners
        video.onloadedmetadata = null;
        video.onplaying = null;
        video.oncanplay = null;
      }
      stopCamera();
    };
  }, []);
  
  // Ensure video element gets the stream when it becomes available
  useEffect(() => {
    if (hasStream && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      const stream = streamRef.current;
      
      if (!video.srcObject || video.srcObject !== stream) {
        console.log('Setting stream on video element via useEffect');
        video.srcObject = stream;
        
        // Try to play immediately
        video.play().then(() => {
          console.log('Video playing successfully from useEffect');
          setIsStreamActive(true);
        }).catch(err => {
          console.error('Error playing video in useEffect:', err);
          // Video will play when metadata loads
        });
      }
    }
  }, [hasStream]);
  
  // Force video to play when stream becomes active
  useEffect(() => {
    if (isStreamActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      // Ensure video is playing
      if (video.paused) {
        video.play().catch(err => {
          console.error('Error forcing video play:', err);
        });
      }
    }
  }, [isStreamActive]);

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
            {/* Always render video element so it's available when stream is set */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover rounded-lg border bg-black"
                style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
              />
              <canvas ref={canvasRef} className="hidden" />
              {!streamRef.current && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📷</div>
                    <p className="text-white text-sm">Click "Access Camera" to start</p>
                  </div>
                </div>
              )}
              {streamRef.current && !isStreamActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin text-white text-2xl mb-2">⏳</div>
                    <p className="text-white text-sm">Starting camera...</p>
                  </div>
                </div>
              )}
            </div>
            
            {streamRef.current ? (
              <>
                <div className="flex gap-2 justify-center">
                  <Button onClick={capturePhoto} disabled={isCapturing || !isStreamActive}>
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
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Click the button below to access your camera
                </p>
                <Button onClick={handleCameraAccess} disabled={cameraPermission === 'denied'}>
                  Access Camera
                </Button>
                {cameraPermission === 'denied' && (
                  <p className="text-sm text-destructive mt-2">
                    Camera access was denied. Please enable it in your browser settings.
                  </p>
                )}
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

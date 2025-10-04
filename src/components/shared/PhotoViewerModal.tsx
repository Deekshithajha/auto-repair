import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, RotateCw } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  caption?: string;
  date?: string;
}

interface PhotoViewerModalProps {
  photos: Photo[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  photos,
  initialIndex = 0,
  open,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const currentPhoto = photos[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    resetTransforms();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    resetTransforms();
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetTransforms = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  if (!currentPhoto) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0"
        onKeyDown={handleKeyDown}
      >
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="text-white">
              <p className="text-sm font-medium">
                {currentIndex + 1} / {photos.length}
              </p>
              {currentPhoto.caption && (
                <p className="text-xs text-white/70">{currentPhoto.caption}</p>
              )}
              {currentPhoto.date && (
                <p className="text-xs text-white/50">{currentPhoto.date}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center p-16 overflow-hidden">
            <img
              src={currentPhoto.url}
              alt={currentPhoto.caption || 'Photo'}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`
              }}
            />
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 p-4 bg-gradient-to-t from-black/80 to-transparent">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                disabled={photos.length <= 1}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <div className="text-white text-sm mx-2">
                {currentIndex + 1} / {photos.length}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={photos.length <= 1}
                className="text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-white/20 mx-2" />

            {/* Zoom & Rotate Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="text-white hover:bg-white/20"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              
              <span className="text-white text-sm w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="text-white hover:bg-white/20"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleRotate}
                className="text-white hover:bg-white/20"
              >
                <RotateCw className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetTransforms}
                className="text-white hover:bg-white/20 text-xs"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Mobile Touch Navigation Hints */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4 lg:hidden">
            <div className="w-1/3 h-full" onClick={handlePrevious} style={{ pointerEvents: 'auto' }} />
            <div className="w-1/3 h-full" />
            <div className="w-1/3 h-full" onClick={handleNext} style={{ pointerEvents: 'auto' }} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
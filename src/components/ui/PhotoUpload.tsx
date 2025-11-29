import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhotoCategory } from '../../types';

interface PhotoUploadProps {
  photos: Array<{
    id: string;
    file?: File;
    url: string;
    category: PhotoCategory;
    description?: string;
  }>;
  onPhotosChange: (photos: Array<{
    id: string;
    file?: File;
    url: string;
    category: PhotoCategory;
    description?: string;
  }>) => void;
  maxPhotos?: number;
  allowMultiple?: boolean;
}

const PHOTO_CATEGORIES: Array<{ value: PhotoCategory; label: string; icon: string }> = [
  { value: 'damage', label: 'Damage', icon: '🔧' },
  { value: 'dashboard-warning', label: 'Warning Lights', icon: '⚠️' },
  { value: 'vin-sticker', label: 'VIN Sticker', icon: '🏷️' },
  { value: 'engine-bay', label: 'Engine Bay', icon: '⚙️' },
  { value: 'tires', label: 'Tires', icon: '🛞' },
  { value: 'interior', label: 'Interior', icon: '🪑' },
  { value: 'exterior', label: 'Exterior', icon: '🚗' },
  { value: 'other', label: 'Other', icon: '📷' },
];

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  allowMultiple = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesToProcess = allowMultiple ? Array.from(files) : [files[0]];
    const remainingSlots = maxPhotos - photos.length;
    const filesToAdd = filesToProcess.slice(0, remainingSlots);

    const newPhotos = await Promise.all(
      filesToAdd.map(async (file) => {
        const compressed = await compressImage(file);
        return {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          url: compressed,
          category: 'other' as PhotoCategory,
          description: '',
        };
      })
    );

    onPhotosChange([...photos, ...newPhotos]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCategoryChange = (photoId: string, category: PhotoCategory) => {
    onPhotosChange(
      photos.map((photo) =>
        photo.id === photoId ? { ...photo, category } : photo
      )
    );
  };

  const handleDescriptionChange = (photoId: string, description: string) => {
    onPhotosChange(
      photos.map((photo) =>
        photo.id === photoId ? { ...photo, description } : photo
      )
    );
  };

  const handleRemovePhoto = (photoId: string) => {
    onPhotosChange(photos.filter((photo) => photo.id !== photoId));
    if (selectedPhotoId === photoId) {
      setSelectedPhotoId(null);
    }
  };

  const selectedPhoto = photos.find((p) => p.id === selectedPhotoId);

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {photos.length < maxPhotos && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={allowMultiple}
            onChange={handleFileSelect}
            className="hidden"
            capture="environment"
          />
          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="text-left">
              <p className="text-sm font-semibold text-primary">
                {photos.length === 0 ? 'Upload Photos' : 'Add More Photos'}
              </p>
              <p className="text-xs text-text-muted">
                {photos.length} of {maxPhotos} photos
              </p>
            </div>
          </motion.button>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence>
            {photos.map((photo) => {
              const categoryInfo = PHOTO_CATEGORIES.find((c) => c.value === photo.category);
              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-primary/50 transition-all cursor-pointer group"
                  onClick={() => setSelectedPhotoId(photo.id)}
                >
                  <img
                    src={photo.url}
                    alt={photo.description || 'Vehicle photo'}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                    <span>{categoryInfo?.icon}</span>
                    <span className="text-text-main">{categoryInfo?.label}</span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(photo.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Edit Indicator */}
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-primary/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Photo Detail Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhotoId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Preview */}
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.description || 'Vehicle photo'}
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setSelectedPhotoId(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Photo Details */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {PHOTO_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleCategoryChange(selectedPhoto.id, cat.value)}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          selectedPhoto.category === cat.value
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-xs font-medium text-text-main">{cat.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={selectedPhoto.description || ''}
                    onChange={(e) => handleDescriptionChange(selectedPhoto.id, e.target.value)}
                    placeholder="Add notes about this photo..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none resize-none"
                    rows={3}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPhotoId(null)}
                  className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


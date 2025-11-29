import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PhotoUpload } from '../ui/PhotoUpload';
import { PhotoCategory } from '../../types';

interface RescheduleRequestProps {
  ticketId: string;
  onSubmit: (data: {
    reason: string;
    notes?: string;
    photos: Array<{
      id: string;
      url: string;
      category: PhotoCategory;
      description?: string;
    }>;
  }) => void;
  onCancel: () => void;
}

export const RescheduleRequest: React.FC<RescheduleRequestProps> = ({
  ticketId,
  onSubmit,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<Array<{
    id: string;
    file?: File;
    url: string;
    category: PhotoCategory;
    description?: string;
  }>>([]);

  const handleSubmit = () => {
    if (!reason.trim()) return;

    onSubmit({
      reason: reason.trim(),
      notes: notes.trim() || undefined,
      photos: photos.map(p => ({
        id: p.id,
        url: p.url,
        category: p.category,
        description: p.description,
      })),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-text-main">Request Return Visit</h2>
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Alert Banner */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-orange-800">Return Visit Required</p>
                <p className="text-sm text-orange-700 mt-1">
                  This will flag the ticket for admin review. The customer will be notified once a return date is scheduled.
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-text-muted">Ticket ID</p>
            <p className="text-lg font-bold text-text-main">#{ticketId.toUpperCase()}</p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Reason for Return Visit *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Need to order replacement part, requires additional inspection, customer needs to return for follow-up work..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none resize-none"
              rows={4}
            />
            <p className="text-xs text-text-muted mt-2">
              Explain why the customer needs to bring the vehicle back
            </p>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details or instructions for the admin or customer..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Supporting Photos (Optional)
            </label>
            <p className="text-xs text-text-muted mb-3">
              Upload photos of damaged parts, leaks, worn components, or anything that supports the need for a return visit
            </p>
            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={10}
              allowMultiple={true}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 py-3 border-2 border-gray-300 text-text-main rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!reason.trim()}
              className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RescheduleInfo } from '../../types';

interface RescheduleManagementProps {
  ticketId: string;
  rescheduleInfo: RescheduleInfo;
  onSetSchedule: (data: {
    scheduledDate: string;
    scheduledTime: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export const RescheduleManagement: React.FC<RescheduleManagementProps> = ({
  ticketId,
  rescheduleInfo,
  onSetSchedule,
  onCancel,
}) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!scheduledDate || !scheduledTime) return;

    onSetSchedule({
      scheduledDate,
      scheduledTime,
      notes: notes.trim() || undefined,
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
          <h2 className="text-xl font-bold text-text-main">Set Return Visit Date</h2>
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
          {/* Ticket Info */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-text-muted">Ticket ID</p>
            <p className="text-lg font-bold text-text-main">#{ticketId.toUpperCase()}</p>
          </div>

          {/* Reschedule Request Info */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-orange-800">Reason for Return Visit</p>
                <p className="text-sm text-orange-700 mt-1 whitespace-pre-wrap">{rescheduleInfo.reason}</p>
              </div>

              {rescheduleInfo.notes && (
                <div>
                  <p className="text-sm font-semibold text-orange-800">Additional Notes</p>
                  <p className="text-sm text-orange-700 mt-1 whitespace-pre-wrap">{rescheduleInfo.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-orange-600">
                  Requested by mechanic on {formatDate(rescheduleInfo.requestedAt)}
                </p>
              </div>

              {rescheduleInfo.photos && rescheduleInfo.photos.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-orange-800 mb-2">Supporting Photos</p>
                  <div className="grid grid-cols-4 gap-2">
                    {rescheduleInfo.photos.map((photo) => (
                      <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border-2 border-orange-200">
                        <img src={photo.dataUrl || photo.url} alt={photo.description || 'Supporting evidence'} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Date */}
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Return Visit Date *
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Schedule Time */}
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Preferred Time Window *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScheduledTime('Morning (8AM-12PM)')}
                className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                  scheduledTime === 'Morning (8AM-12PM)'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 text-text-muted hover:border-primary/50'
                }`}
              >
                Morning
                <span className="block text-xs font-normal">8AM - 12PM</span>
              </button>
              <button
                type="button"
                onClick={() => setScheduledTime('Afternoon (12PM-5PM)')}
                className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                  scheduledTime === 'Afternoon (12PM-5PM)'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 text-text-muted hover:border-primary/50'
                }`}
              >
                Afternoon
                <span className="block text-xs font-normal">12PM - 5PM</span>
              </button>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Or enter a specific time:
            </p>
            <input
              type="time"
              value={scheduledTime.includes(':') ? scheduledTime : ''}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none mt-2"
            />
          </div>

          {/* Admin Notes for Customer */}
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Instructions for Customer (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Please bring the vehicle at the scheduled time. Part has been ordered and will be ready for installation..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none resize-none"
              rows={3}
            />
            <p className="text-xs text-text-muted mt-2">
              This message will be included in the customer notification
            </p>
          </div>

          {/* Preview */}
          {scheduledDate && scheduledTime && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-green-800">Customer Notification Preview</p>
                  <p className="text-sm text-green-700 mt-2">
                    Your vehicle service requires a return visit. Please bring your vehicle back on:
                  </p>
                  <p className="text-sm font-bold text-green-800 mt-1">
                    {formatDate(scheduledDate)} at {scheduledTime}
                  </p>
                  {notes && (
                    <p className="text-sm text-green-700 mt-2 whitespace-pre-wrap">
                      {notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

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
              disabled={!scheduledDate || !scheduledTime}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Set Return Date & Notify Customer
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


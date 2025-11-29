import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdditionalFinding, Photo, PhotoCategory } from '../../types';
import { PhotoUpload } from '../ui/PhotoUpload';
import { Button } from '../ui/Button';

interface AdditionalFindingsProps {
  findings: AdditionalFinding[];
  onAddFinding: (finding: Omit<AdditionalFinding, 'id' | 'createdAt'>) => void;
  mechanicId: string;
}

export const AdditionalFindings: React.FC<AdditionalFindingsProps> = ({
  findings,
  onAddFinding,
  mechanicId,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    requiresCustomerApproval: true,
    photos: [] as Array<{ id: string; file?: File; url: string; category: PhotoCategory; description?: string }>,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    // Convert PhotoUpload photos to Photo format
    const photos: Photo[] = formData.photos.map((p) => ({
      id: p.id,
      category: p.category,
      dataUrl: p.url,
      description: p.description,
      createdAt: new Date().toISOString(),
    }));

    onAddFinding({
      mechanicId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      severity: formData.severity,
      requiresCustomerApproval: formData.requiresCustomerApproval,
      status: 'proposed',
      photos: photos.length > 0 ? photos : undefined,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      severity: 'medium',
      requiresCustomerApproval: true,
      photos: [],
    });
    setShowAddForm(false);
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusColor = (status: 'proposed' | 'approved' | 'declined') => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'proposed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-main">Additional Findings</h3>
          <p className="text-sm text-text-muted">Issues discovered during inspection</p>
        </div>
        {!showAddForm && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            + Add Finding
          </Button>
        )}
      </div>

      {/* Add Finding Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <h4 className="text-md font-semibold text-text-main mb-4">Add New Finding</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-main mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Worn brake pads, Leaking transmission fluid"
                  className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-main mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requiresCustomerApproval}
                      onChange={(e) => setFormData({ ...formData, requiresCustomerApproval: e.target.checked })}
                      className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-text-main">
                      Requires Customer Approval
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-main mb-2">
                  Photos (Optional)
                </label>
                <PhotoUpload
                  photos={formData.photos}
                  onPhotosChange={(photos) => setFormData({ ...formData, photos })}
                  maxPhotos={5}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      title: '',
                      description: '',
                      severity: 'medium',
                      requiresCustomerApproval: true,
                      photos: [],
                    });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  Add Finding
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Findings List */}
      {findings.length === 0 && !showAddForm ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-text-muted">No additional findings yet</p>
          <p className="text-xs text-text-muted mt-1">Click "Add Finding" to document issues discovered during inspection</p>
        </div>
      ) : (
        <div className="space-y-3">
          {findings.map((finding) => (
            <motion.div
              key={finding.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-text-main">{finding.title}</h4>
                  <p className="text-sm text-text-muted mt-1 whitespace-pre-wrap">{finding.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(finding.severity)}`}>
                    {finding.severity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(finding.status)}`}>
                    {finding.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {finding.requiresCustomerApproval && (
                <div className="mt-2 flex items-center gap-2 text-xs text-orange-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Requires customer approval</span>
                </div>
              )}

              {finding.photos && finding.photos.length > 0 && (
                <div className="mt-3">
                  <div className="grid grid-cols-4 gap-2">
                    {finding.photos.map((photo) => (
                      <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img src={photo.dataUrl} alt={photo.description || 'Finding photo'} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2 text-xs text-text-muted">
                Added {new Date(finding.createdAt).toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};


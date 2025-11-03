/**
 * Damage Log Todo Manager Component
 * Displays damage logs as a todo list with CRUD operations and image uploads
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EnhancedFileUpload } from '@/components/shared/EnhancedFileUpload';
import { PhotoViewerModal } from '@/components/shared/PhotoViewerModal';
import { Plus, Edit, Trash2, Image as ImageIcon, MoreVertical, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';

interface DamageLog {
  id: string;
  vehicle_id: string;
  description: string;
  photo_ids: string[] | null; // Array of photo URLs/paths
  logged_at: string;
  logged_by: string;
  ticket_id: string | null;
  created_at: string;
  updated_at: string;
  is_completed?: boolean; // For todo functionality
  completed_at?: string | null;
}

interface DamageLogTodoManagerProps {
  vehicleId: string;
  ticketId?: string;
}

export const DamageLogTodoManager: React.FC<DamageLogTodoManagerProps> = ({
  vehicleId,
  ticketId,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [damageLogs, setDamageLogs] = useState<DamageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState<{ logId: string; index: number } | null>(null);

  // Form state
  const [description, setDescription] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  useEffect(() => {
    fetchDamageLogs();
  }, [vehicleId, ticketId]);

  const fetchDamageLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('damage_log')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('logged_at', { ascending: false });

      if (ticketId) {
        query = query.eq('ticket_id', ticketId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setDamageLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching damage logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load damage logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadPhotos = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    const uploadedPaths: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${vehicleId}/damage/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('vehicle-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading photo:', error);
        toast({
          title: 'Upload Error',
          description: `Failed to upload ${file.name}`,
          variant: 'destructive',
        });
        continue;
      }

      // Store file path (will convert to public URL when displaying)
      uploadedPaths.push(fileName);
    }

    return uploadedPaths;
  };

  const getPhotoUrl = (photoPath: string): string => {
    const { data } = supabase.storage
      .from('vehicle-photos')
      .getPublicUrl(photoPath);
    return data?.publicUrl || photoPath;
  };

  const handleAddDamageLog = async () => {
    if (!description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a damage description',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Upload photos if any
      const newPhotoUrls = await uploadPhotos(uploadedPhotos);
      const allPhotoUrls = [...existingPhotos, ...newPhotoUrls];

      const { data, error } = await supabase
        .from('damage_log')
        .insert({
          vehicle_id: vehicleId,
          description: description.trim(),
          photo_ids: allPhotoUrls.length > 0 ? allPhotoUrls : null,
          logged_by: user?.id || '',
          ticket_id: ticketId || null,
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Damage log added successfully',
      });

      // Reset form
      setDescription('');
      setUploadedPhotos([]);
      setExistingPhotos([]);
      setShowAddDialog(false);

      // Refresh list
      fetchDamageLogs();
    } catch (error: any) {
      console.error('Error adding damage log:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add damage log',
        variant: 'destructive',
      });
    }
  };

  const handleEditDamageLog = (log: DamageLog) => {
    setEditingId(log.id);
    setDescription(log.description);
    // Store existing photo paths (these are file paths, not URLs)
    setExistingPhotos(log.photo_ids || []);
    setUploadedPhotos([]);
    setShowAddDialog(true);
  };

  const handleUpdateDamageLog = async () => {
    if (!description.trim() || !editingId) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a damage description',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Upload new photos if any
      const newPhotoUrls = await uploadPhotos(uploadedPhotos);
      const allPhotoUrls = [...existingPhotos, ...newPhotoUrls];

      const { error } = await supabase
        .from('damage_log')
        .update({
          description: description.trim(),
          photo_ids: allPhotoUrls.length > 0 ? allPhotoUrls : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Damage log updated successfully',
      });

      // Reset form
      setEditingId(null);
      setDescription('');
      setUploadedPhotos([]);
      setExistingPhotos([]);
      setShowAddDialog(false);

      // Refresh list
      fetchDamageLogs();
    } catch (error: any) {
      console.error('Error updating damage log:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update damage log',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDamageLog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this damage log entry?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('damage_log')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Damage log deleted successfully',
      });

      // Refresh list
      fetchDamageLogs();
    } catch (error: any) {
      console.error('Error deleting damage log:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete damage log',
        variant: 'destructive',
      });
    }
  };

  const handleToggleComplete = async (log: DamageLog) => {
    try {
      const { error } = await supabase
        .from('damage_log')
        .update({
          is_completed: !log.is_completed,
          completed_at: !log.is_completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', log.id);

      if (error) throw error;

      // Optimistically update UI
      setDamageLogs((prev) =>
        prev.map((item) =>
          item.id === log.id
            ? {
                ...item,
                is_completed: !log.is_completed,
                completed_at: !log.is_completed ? new Date().toISOString() : null,
              }
            : item
        )
      );

      toast({
        title: 'Success',
        description: log.is_completed
          ? 'Damage log marked as incomplete'
          : 'Damage log marked as complete',
      });
    } catch (error: any) {
      console.error('Error toggling completion:', error);
      toast({
        title: 'Error',
        description: 'Failed to update damage log',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePhoto = (index: number) => {
    if (editingId) {
      // Delete from existing photos
      setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Delete from uploaded photos
      setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setDescription('');
    setUploadedPhotos([]);
    setExistingPhotos([]);
    setShowAddDialog(false);
  };

  const getPhotoUrls = (log: DamageLog): string[] => {
    return (log.photo_ids || []).map(getPhotoUrl);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading damage logs...</div>
        </CardContent>
      </Card>
    );
  }

  const allPhotos = editingId ? existingPhotos : uploadedPhotos.map((f) => URL.createObjectURL(f));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Damage Log Todo List</h3>
          <p className="text-sm text-muted-foreground">
            Track and manage vehicle damage entries
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => handleCancel()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Damage Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Damage Entry' : 'Add Damage Entry'}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'Update the damage description and photos'
                  : 'Document vehicle damage with description and photos'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Damage Description *</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the damage in detail..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Photos</label>
                <EnhancedFileUpload
                  onFilesSelected={(files) => setUploadedPhotos((prev) => [...prev, ...files])}
                  accept="image/*"
                  multiple
                  maxFiles={10}
                  maxFileSize={5}
                />

                {/* Display existing photos if editing */}
                {editingId && existingPhotos.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-muted-foreground">Existing Photos:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {existingPhotos.map((photoPath, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={getPhotoUrl(photoPath)}
                            alt={`Damage photo ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeletePhoto(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display newly uploaded photos */}
                {uploadedPhotos.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-muted-foreground">New Photos:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {uploadedPhotos.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeletePhoto(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={editingId ? handleUpdateDamageLog : handleAddDamageLog}
                disabled={!description.trim()}
              >
                {editingId ? 'Update' : 'Add'} Damage Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Todo List */}
      <div className="space-y-2">
        {damageLogs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Circle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No damage logs yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Add Damage Entry" to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          damageLogs.map((log) => {
            const photoUrls = getPhotoUrls(log);
            return (
              <Card
                key={log.id}
                className={log.is_completed ? 'opacity-75 bg-muted/50' : ''}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <Checkbox
                      checked={log.is_completed || false}
                      onCheckedChange={() => handleToggleComplete(log)}
                      className="mt-1"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p
                            className={
                              log.is_completed
                                ? 'line-through text-muted-foreground'
                                : 'font-medium'
                            }
                          >
                            {log.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{format(new Date(log.logged_at), 'MMM d, yyyy h:mm a')}</span>
                            {log.ticket_id && (
                              <Badge variant="outline" className="text-xs">
                                Ticket Linked
                              </Badge>
                            )}
                            {log.is_completed && log.completed_at && (
                              <Badge variant="secondary" className="text-xs">
                                Completed {format(new Date(log.completed_at), 'MMM d')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditDamageLog(log)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteDamageLog(log.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Photos */}
                      {photoUrls.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {photoUrls.map((url, index) => (
                            <div
                              key={index}
                              className="relative group cursor-pointer"
                              onClick={() => setViewingPhotoIndex({ logId: log.id, index })}
                            >
                              <img
                                src={url}
                                alt={`Damage photo ${index + 1}`}
                                className="h-20 w-20 object-cover rounded border hover:opacity-80 transition-opacity"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Photo Viewer Modal */}
      {viewingPhotoIndex && (
        <PhotoViewerModal
          open={!!viewingPhotoIndex}
          onClose={() => setViewingPhotoIndex(null)}
          photos={getPhotoUrls(damageLogs.find((l) => l.id === viewingPhotoIndex.logId) || damageLogs[0]).map((url, idx) => ({
            id: `${viewingPhotoIndex.logId}-${idx}`,
            url: url,
          }))}
          initialIndex={viewingPhotoIndex.index}
        />
      )}
    </div>
  );
};


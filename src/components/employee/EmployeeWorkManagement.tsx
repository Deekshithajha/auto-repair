import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { EnhancedFileUpload } from '@/components/shared/EnhancedFileUpload';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkSession {
  id: string;
  ticket_id: string;
  status: string;
  started_at: string;
  ended_at: string;
  notes: string;
  on_hold_reason?: string;
  ticket: {
    id: string;
    description: string;
    status: string;
    user_id: string;
    vehicle: {
      id: string;
      make: string;
      model: string;
      year: number;
      reg_no: string;
      license_no?: string;
      location_status?: string;
      expected_return_date?: string;
    };
    customer_name: string;
    customer_phone: string;
  };
}

interface PartUsed {
  name: string;
  quantity: number;
  unit_price: number;
}

interface DamageLogEntry {
  id: string;
  vehicle_id: string;
  description: string;
  logged_at: string;
  logged_by: string;
  ticket_id?: string;
  photo_ids?: string[];
  is_new_damage?: boolean;
  selected_services?: string[];
}

interface StandardService {
  id: string;
  service_name: string;
  category: 'standard' | 'non_standard';
  default_price: number | null;
  labor_hours: number | null;
  taxable: boolean;
  description: string | null;
}

export const EmployeeWorkManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [workNotes, setWorkNotes] = useState<Record<string, string>>({});
  const [partsUsed, setPartsUsed] = useState<Record<string, PartUsed[]>>({});
  const [newPart, setNewPart] = useState<Record<string, PartUsed>>({});
  const [vehicleLocationStatus, setVehicleLocationStatus] = useState<Record<string, string>>({});
  const [vehicleLocationReason, setVehicleLocationReason] = useState<Record<string, string>>({});
  const [expectedReturnDate, setExpectedReturnDate] = useState<Record<string, string>>({});
  const [onHoldReason, setOnHoldReason] = useState<Record<string, string>>({});
  const [showOnHoldDialog, setShowOnHoldDialog] = useState<Record<string, boolean>>({});
  const [damageLogs, setDamageLogs] = useState<Record<string, DamageLogEntry[]>>({});
  const [newDamageDescription, setNewDamageDescription] = useState<Record<string, string>>({});
  const [damagePhotos, setDamagePhotos] = useState<Record<string, File[]>>({});
  const [showDamageDialog, setShowDamageDialog] = useState<Record<string, boolean>>({});
  const [editingDamageLog, setEditingDamageLog] = useState<DamageLogEntry | null>(null);
  const [showEditDamageDialog, setShowEditDamageDialog] = useState<Record<string, boolean>>({});
  const [editDamageDescription, setEditDamageDescription] = useState<Record<string, string>>({});
  const [editDamagePhotos, setEditDamagePhotos] = useState<Record<string, File[]>>({});
  const [issueEdits, setIssueEdits] = useState<Record<string, string>>({});
  const [showIssueDialog, setShowIssueDialog] = useState<Record<string, boolean>>({});
  const [vehicleEdits, setVehicleEdits] = useState<Record<string, { vin?: string; engine_size?: string; mileage?: string; trim_code?: string; drivetrain?: string }>>({});
  const [vinStickerPhotos, setVinStickerPhotos] = useState<Record<string, File[]>>({});
  const [interiorPhotos, setInteriorPhotos] = useState<Record<string, File[]>>({});
  const [exteriorPhotos, setExteriorPhotos] = useState<Record<string, File[]>>({});
  const [rescheduleReason, setRescheduleReason] = useState<Record<string, string>>({});
  const [rescheduleDate, setRescheduleDate] = useState<Record<string, string>>({});
  const [upcomingReturns, setUpcomingReturns] = useState<any[]>([]);
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'primary'>('all');
  const [ticketRoles, setTicketRoles] = useState<Record<string, 'primary' | 'secondary'>>({});
  const [standardServices, setStandardServices] = useState<StandardService[]>([]);
  const [selectedServices, setSelectedServices] = useState<Record<string, string[]>>({});
  const [showServiceDialog, setShowServiceDialog] = useState<Record<string, boolean>>({});

  // Dummy data for demonstration
  const dummyWorkSessions: WorkSession[] = [
    {
      id: '1',
      ticket_id: 'WO-001',
      status: 'in_progress',
      started_at: '2024-01-16T08:00:00Z',
      ended_at: '',
      notes: 'Engine diagnostic completed. Found spark plug issue. Parts ordered.',
      ticket: {
        id: 'WO-001',
        description: 'Engine making strange noise, needs diagnostic check. Car has been running rough for the past week.',
        status: 'in_progress',
        user_id: 'user-1',
        vehicle: {
          id: 'vehicle-1',
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          reg_no: 'ABC-1234',
          license_no: 'ABC-1234',
          location_status: 'in_shop'
        },
        customer_name: 'John Smith',
        customer_phone: '(555) 123-4567'
      }
    },
    {
      id: '2',
      ticket_id: 'WO-002',
      status: 'completed',
      started_at: '2024-01-15T09:00:00Z',
      ended_at: '2024-01-15T15:30:00Z',
      notes: 'AC system repair completed. Replaced compressor and recharged system. Customer satisfied.',
      ticket: {
        id: 'WO-002',
        description: 'AC not blowing cold air properly. System needs inspection and repair.',
        status: 'completed',
        user_id: 'user-2',
        vehicle: {
          id: 'vehicle-2',
          make: 'Honda',
          model: 'Civic',
          year: 2019,
          reg_no: 'XYZ-5678',
          license_no: 'XYZ-5678',
          location_status: 'ready_for_pickup',
          expected_return_date: '2024-01-15T17:30:00Z'
        },
        customer_name: 'Sarah Johnson',
        customer_phone: '(555) 234-5678'
      }
    },
    {
      id: '3',
      ticket_id: 'WO-003',
      status: 'not_started',
      started_at: '',
      ended_at: '',
      notes: '',
      ticket: {
        id: 'WO-003',
        description: 'Brake squeaking and oil change needed. Regular maintenance service.',
        status: 'assigned',
        user_id: 'user-3',
        vehicle: {
          id: 'vehicle-3',
          make: 'Ford',
          model: 'Focus',
          year: 2021,
          reg_no: 'DEF-9012',
          license_no: 'DEF-9012',
          location_status: 'waiting_for_parts'
        },
        customer_name: 'Mike Davis',
        customer_phone: '(555) 345-6789'
      }
    },
    {
      id: '4',
      ticket_id: 'WO-004',
      status: 'not_started',
      started_at: '',
      ended_at: '',
      notes: '',
      ticket: {
        id: 'WO-004',
        description: 'Transmission issues - car jerks when shifting gears. Needs diagnostic.',
        status: 'assigned',
        user_id: 'user-4',
        vehicle: {
          id: 'vehicle-4',
          make: 'BMW',
          model: 'X5',
          year: 2022,
          reg_no: 'GHI-3456',
          license_no: 'GHI-3456',
          location_status: 'in_shop'
        },
        customer_name: 'Emily Wilson',
        customer_phone: '(555) 456-7890'
      }
    }
  ];

  const dummyPartsUsed: Record<string, PartUsed[]> = {
    'WO-001': [
      { name: 'Spark Plugs (Set of 4)', quantity: 1, unit_price: 45.00 },
      { name: 'Air Filter', quantity: 1, unit_price: 25.00 },
      { name: 'Oil Filter', quantity: 1, unit_price: 15.00 }
    ],
    'WO-002': [
      { name: 'AC Compressor', quantity: 1, unit_price: 180.00 },
      { name: 'Refrigerant R134a', quantity: 2, unit_price: 25.00 },
      { name: 'AC Filter', quantity: 1, unit_price: 35.00 }
    ],
    'WO-003': [
      { name: 'Brake Pads (Front)', quantity: 1, unit_price: 85.00 },
      { name: 'Motor Oil 5W-30', quantity: 5, unit_price: 8.50 },
      { name: 'Oil Filter', quantity: 1, unit_price: 12.00 }
    ],
    'WO-004': [
      { name: 'Transmission Fluid', quantity: 4, unit_price: 18.00 },
      { name: 'Transmission Filter', quantity: 1, unit_price: 45.00 }
    ]
  };

  const dummyUpcomingReturns = [
    {
      id: '1',
      vehicle_id: 'vehicle-1',
      customer_name: 'John Smith',
      vehicle_info: '2020 Toyota Camry',
      expected_return_date: '2024-01-18T16:00:00Z',
      service_description: 'Engine diagnostic and spark plug replacement',
      status: 'in_progress'
    },
    {
      id: '2',
      vehicle_id: 'vehicle-2',
      customer_name: 'Sarah Johnson',
      vehicle_info: '2019 Honda Civic',
      expected_return_date: '2024-01-15T15:30:00Z',
      service_description: 'AC system repair completed',
      status: 'ready_for_pickup'
    }
  ];

  useEffect(() => {
    // Use dummy data instead of database calls
    setWorkSessions(dummyWorkSessions);
    setPartsUsed(dummyPartsUsed);
    setUpcomingReturns(dummyUpcomingReturns);
    setLoading(false);
    
    // Set ticket roles for dummy data
    const roles: Record<string, 'primary' | 'secondary'> = {
      'WO-001': 'primary',
      'WO-002': 'primary', 
      'WO-003': 'secondary',
      'WO-004': 'primary'
    };
    setTicketRoles(roles);
    
    // Fetch standard services
    fetchStandardServices();
  }, []);

  const fetchWorkSessions = async () => {
    // Use dummy data instead of database calls
    setWorkSessions(dummyWorkSessions);
    setPartsUsed(dummyPartsUsed);
    setUpcomingReturns(dummyUpcomingReturns);
    setLoading(false);
  };

  const fetchPartsForTicket = async (ticketId: string) => {
    // Use dummy data instead of database calls
    const parts = dummyPartsUsed[ticketId] || [];
    setPartsUsed(prev => ({
      ...prev,
      [ticketId]: parts
    }));
  };

  const handleStartWork = async (sessionId: string, ticketId: string) => {
    // Update dummy data instead of database
    setWorkSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
          status: 'in_progress',
          started_at: new Date().toISOString()
          }
        : session
    ));

      toast({
        title: "Success",
        description: "Work started successfully",
      });
  };

  const handleAddPart = async (ticketId: string) => {
    const part = newPart[ticketId];
    if (!part?.name || !part?.quantity || !part?.unit_price) {
      toast({
        title: "Error",
        description: "Please fill in all part details",
        variant: "destructive",
      });
      return;
    }

    // Update dummy data instead of database
    setPartsUsed(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), part]
    }));

      toast({
        title: "Success",
        description: "Part added successfully",
      });

      // Clear the form
      setNewPart(prev => ({
        ...prev,
        [ticketId]: { name: '', quantity: 0, unit_price: 0 }
      }));
  };

  const handleRemovePart = (ticketId: string, index: number) => {
    setPartsUsed(prev => ({
      ...prev,
      [ticketId]: (prev[ticketId] || []).filter((_, i) => i !== index)
    }));
    toast({ title: 'Removed', description: 'Part removed from this ticket.' });
  };

  const handleFinishWork = async (sessionId: string, ticketId: string) => {
    // Update dummy data instead of database
    setWorkSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
          status: 'completed',
          ended_at: new Date().toISOString(),
          notes: workNotes[sessionId] || ''
          }
        : session
    ));

    // Sync updates to database and profiles
    const session = workSessions.find(s => s.id === sessionId);
    if (session) {
      await syncUpdatesToProfiles(sessionId, session.ticket.vehicle.id, ticketId);
    }

      toast({
        title: "Success",
        description: "Work completed! Customer has been notified.",
      });
  };

  const handleOnHold = async (sessionId: string, reason?: string) => {
    // Update dummy data instead of database
    setWorkSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            status: 'on_hold',
            on_hold_reason: reason || null
          }
        : session
    ));

    // Sync updates to database and profiles
    const session = workSessions.find(s => s.id === sessionId);
    if (session) {
      await syncUpdatesToProfiles(sessionId, session.ticket.vehicle.id, session.ticket_id);
    }

    toast({
      title: "Work Put On Hold",
      description: reason ? `Work put on hold: ${reason}` : "Work has been put on hold",
    });

    // Close dialog
    setShowOnHoldDialog(prev => ({ ...prev, [sessionId]: false }));
  };

  const handleVehicleLocationUpdate = async (vehicleId: string, sessionId: string) => {
    const locationStatus = vehicleLocationStatus[sessionId];
    const reason = vehicleLocationReason[sessionId];
    const returnDate = expectedReturnDate[sessionId];

    // Update dummy data instead of database
    setWorkSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session,
            ticket: {
              ...session.ticket,
              vehicle: {
                ...session.ticket.vehicle,
                location_status: locationStatus,
                expected_return_date: returnDate || null
              }
            }
          }
        : session
    ));

    // Sync updates to database and profiles
    const session = workSessions.find(s => s.id === sessionId);
    if (session) {
      await syncUpdatesToProfiles(sessionId, vehicleId, session.ticket_id);
    }

    toast({
      title: "Vehicle Location Updated",
      description: `Vehicle location updated to ${locationStatus === 'in_shop' ? 'In Shop' : 'Not In Shop'}`,
    });
  };

  const handleDamagePhotoUpload = (sessionId: string, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setDamagePhotos(prev => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), ...fileArray].slice(0, 5) // Limit to 5 photos
    }));
  };

  const removeDamagePhoto = (sessionId: string, index: number) => {
    setDamagePhotos(prev => ({
      ...prev,
      [sessionId]: prev[sessionId]?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddDamageLog = async (sessionId: string, vehicleId: string, ticketId: string) => {
    const description = newDamageDescription[sessionId];
    if (!description?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a damage description",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload photos first if any
      let photoIds: string[] = [];
      if (damagePhotos[sessionId]?.length > 0) {
        const uploadPromises = damagePhotos[sessionId].map(async (photo, index) => {
          const fileExt = photo.name.split('.').pop();
          const fileName = `damage-${Date.now()}-${index}.${fileExt}`;
          
          const { error } = await supabase.storage
            .from('vehicle-photos')
            .upload(fileName, photo);
          
          if (error) throw error;
          return fileName;
        });

        photoIds = await Promise.all(uploadPromises);
      }

      // Create damage log entry
      const newDamageEntry: DamageLogEntry = {
        id: `damage-${Date.now()}`,
        vehicle_id: vehicleId,
        description: description.trim(),
        logged_at: new Date().toISOString(),
        logged_by: user?.id || '',
        ticket_id: ticketId,
        photo_ids: photoIds,
        is_new_damage: true,
        selected_services: selectedServices[sessionId] || []
      };

      // Update local state
      setDamageLogs(prev => ({
        ...prev,
        [sessionId]: [newDamageEntry, ...(prev[sessionId] || [])]
      }));

      // Clear form
      setNewDamageDescription(prev => ({ ...prev, [sessionId]: '' }));
      setDamagePhotos(prev => ({ ...prev, [sessionId]: [] }));
      setSelectedServices(prev => ({ ...prev, [sessionId]: [] }));
      setShowDamageDialog(prev => ({ ...prev, [sessionId]: false }));

      toast({
        title: "Damage Log Added",
        description: "Damage entry has been recorded successfully",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add damage log",
        variant: "destructive"
      });
    }
  };

  const fetchDamageLogs = async (vehicleId: string, sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('damage_log')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('logged_at', { ascending: false });

      if (error) throw error;

      // Mark old vs new damage (new = from current ticket, old = from previous tickets)
      const currentTicketId = workSessions.find(s => s.id === sessionId)?.ticket_id;
      const processedLogs = (data || []).map(log => ({
        ...log,
        is_new_damage: log.ticket_id === currentTicketId
      }));

      setDamageLogs(prev => ({
        ...prev,
        [sessionId]: processedLogs
      }));
    } catch (error: any) {
      console.error('Error fetching damage logs:', error);
    }
  };

  const handleEditDamageLog = (damageLog: DamageLogEntry, sessionId: string) => {
    setEditingDamageLog(damageLog);
    setEditDamageDescription(prev => ({ ...prev, [damageLog.id]: damageLog.description }));
    setEditDamagePhotos(prev => ({ ...prev, [damageLog.id]: [] }));
    setShowEditDamageDialog(prev => ({ ...prev, [damageLog.id]: true }));
  };

  const handleUpdateDamageLog = async (damageLogId: string, sessionId: string) => {
    const description = editDamageDescription[damageLogId];
    if (!description?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a damage description",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload new photos if any
      let photoIds: string[] = [];
      if (editDamagePhotos[damageLogId]?.length > 0) {
        const uploadPromises = editDamagePhotos[damageLogId].map(async (photo, index) => {
          const fileExt = photo.name.split('.').pop();
          const fileName = `damage-${Date.now()}-${index}.${fileExt}`;
          
          const { error } = await supabase.storage
            .from('vehicle-photos')
            .upload(fileName, photo);
          
          if (error) throw error;
          return fileName;
        });

        photoIds = await Promise.all(uploadPromises);
      }

      // Update damage log entry in database
      const { error } = await supabase
        .from('damage_log')
        .update({
          description: description.trim(),
          photo_ids: photoIds.length > 0 ? photoIds : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', damageLogId);

      if (error) throw error;

      // Update local state
      setDamageLogs(prev => ({
        ...prev,
        [sessionId]: prev[sessionId]?.map(log => 
          log.id === damageLogId 
            ? { ...log, description: description.trim(), photo_ids: photoIds.length > 0 ? photoIds : log.photo_ids }
            : log
        ) || []
      }));

      // Clear form
      setEditDamageDescription(prev => ({ ...prev, [damageLogId]: '' }));
      setEditDamagePhotos(prev => ({ ...prev, [damageLogId]: [] }));
      setShowEditDamageDialog(prev => ({ ...prev, [damageLogId]: false }));
      setEditingDamageLog(null);

      toast({
        title: "Damage Log Updated",
        description: "Damage entry has been updated successfully",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update damage log",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDamageLog = async (damageLogId: string, sessionId: string) => {
    if (!confirm('Are you sure you want to delete this damage log entry?')) return;

    try {
      // Delete from database
      const { error } = await supabase
        .from('damage_log')
        .delete()
        .eq('id', damageLogId);

      if (error) throw error;

      // Update local state
      setDamageLogs(prev => ({
        ...prev,
        [sessionId]: prev[sessionId]?.filter(log => log.id !== damageLogId) || []
      }));

      toast({
        title: "Damage Log Deleted",
        description: "Damage entry has been deleted successfully",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete damage log",
        variant: "destructive"
      });
    }
  };

  const handleEditDamagePhotoUpload = (damageLogId: string, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setEditDamagePhotos(prev => ({
      ...prev,
      [damageLogId]: [...(prev[damageLogId] || []), ...fileArray].slice(0, 5) // Limit to 5 photos
    }));
  };

  const removeEditDamagePhoto = (damageLogId: string, index: number) => {
    setEditDamagePhotos(prev => ({
      ...prev,
      [damageLogId]: prev[damageLogId]?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSaveIssue = async (sessionId: string, ticketId: string) => {
    const description = issueEdits[sessionId];
    if (!description?.trim()) {
      toast({ title: "Error", description: "Please enter an issue description", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ description: description.trim(), updated_at: new Date().toISOString() })
        .eq('id', ticketId);
      if (error) throw error;
      setWorkSessions(prev => prev.map(s => s.id === sessionId ? ({ ...s, ticket: { ...s.ticket, description: description.trim() } }) : s));
      setShowIssueDialog(prev => ({ ...prev, [sessionId]: false }));
      toast({ title: 'Issue Updated', description: 'Customer issue has been updated.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to update issue', variant: 'destructive' });
    }
  };

  const handleSaveVehicleDetails = async (sessionId: string, vehicleId: string) => {
    const edits = vehicleEdits[sessionId] || {};
    try {
      const payload: any = {
        updated_at: new Date().toISOString()
      };
      if (edits.vin !== undefined) payload.vin = edits.vin || null;
      if (edits.engine_size !== undefined) payload.engine_size = edits.engine_size || null;
      if (edits.mileage !== undefined) payload.mileage = edits.mileage ? parseInt(edits.mileage) : null;
      if (edits.trim_code !== undefined) payload.trim_code = edits.trim_code || null;
      if (edits.drivetrain !== undefined) payload.drivetrain = edits.drivetrain || null;

      const { error } = await supabase
        .from('vehicles')
        .update(payload)
        .eq('id', vehicleId);
      if (error) throw error;

      setWorkSessions(prev => prev.map(s => s.id === sessionId ? ({
        ...s,
        ticket: {
          ...s.ticket,
          vehicle: {
            ...s.ticket.vehicle,
            vin: edits.vin ?? s.ticket.vehicle['vin'],
            engine_size: edits.engine_size ?? s.ticket.vehicle['engine_size'],
            mileage: edits.mileage ? parseInt(edits.mileage) : (s.ticket.vehicle as any)['mileage'],
            trim_code: edits.trim_code ?? (s.ticket.vehicle as any)['trim_code'],
            drivetrain: edits.drivetrain ?? (s.ticket.vehicle as any)['drivetrain']
          }
        }
      }) : s));
      toast({ title: 'Vehicle Updated', description: 'Vehicle details saved.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to save vehicle details', variant: 'destructive' });
    }
  };

  const uploadPhotos = async (files: File[], pathPrefix: string) => {
    const uploaded: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const fileName = `${pathPrefix}-${Date.now()}-${i}.${ext}`;
      const { error } = await supabase.storage.from('vehicle-photos').upload(fileName, file);
      if (error) throw error;
      uploaded.push(fileName);
    }
    return uploaded;
  };

  const handleUploadVehiclePhotos = async (sessionId: string, vehicleId: string) => {
    try {
      const vinFiles = vinStickerPhotos[sessionId] || [];
      const intFiles = interiorPhotos[sessionId] || [];
      const extFiles = exteriorPhotos[sessionId] || [];
      if (vinFiles.length === 0 && intFiles.length === 0 && extFiles.length === 0) {
        toast({ title: 'No Photos', description: 'Please select photos to upload.' });
        return;
      }
      await uploadPhotos(vinFiles, `${vehicleId}/vin-sticker`);
      await uploadPhotos(intFiles, `${vehicleId}/interior`);
      await uploadPhotos(extFiles, `${vehicleId}/exterior`);
      setVinStickerPhotos(prev => ({ ...prev, [sessionId]: [] }));
      setInteriorPhotos(prev => ({ ...prev, [sessionId]: [] }));
      setExteriorPhotos(prev => ({ ...prev, [sessionId]: [] }));
      toast({ title: 'Photos Uploaded', description: 'VIN sticker and vehicle photos uploaded.' });
    } catch (e: any) {
      toast({ title: 'Upload Failed', description: e.message || 'Failed to upload photos', variant: 'destructive' });
    }
  };

  const handleReschedule = async (sessionId: string, ticketId: string) => {
    const reason = rescheduleReason[sessionId];
    const date = rescheduleDate[sessionId];
    if (!date) {
      toast({ title: 'Error', description: 'Please select a reschedule date/time', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ reschedule_date: new Date(date).toISOString(), reschedule_reason: reason || null, not_in_shop_reason: vehicleLocationReason[sessionId] || null, updated_at: new Date().toISOString() })
        .eq('id', ticketId);
      if (error) throw error;

      // Send reminders to customer, employee, and first admin
      const userId = workSessions.find(s => s.id === sessionId)?.ticket.user_id;
      const employeeUserId = user?.id;
      let adminId: string | null = null;
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1);
      if (admins && admins.length > 0) adminId = admins[0].id;

      const inserts: any[] = [];
      if (userId) inserts.push({ user_id: userId, type: 'vehicle_reschedule_reminder', title: 'Vehicle Rescheduled', message: 'Your vehicle is scheduled to return for service.', metadata: { ticket_id: ticketId, reschedule_date: date } });
      if (employeeUserId) inserts.push({ user_id: employeeUserId, type: 'vehicle_reschedule_reminder', title: 'Vehicle Rescheduled', message: 'A vehicle has been rescheduled.', metadata: { ticket_id: ticketId, reschedule_date: date } });
      if (adminId) inserts.push({ user_id: adminId, type: 'vehicle_reschedule_reminder', title: 'Vehicle Rescheduled', message: 'A vehicle has been rescheduled.', metadata: { ticket_id: ticketId, reschedule_date: date } });
      if (inserts.length > 0) {
        await supabase.from('notifications').insert(inserts);
      }

      setWorkSessions(prev => prev.map(s => s.id === sessionId ? ({
        ...s,
        ticket: {
          ...s.ticket,
          vehicle: { ...s.ticket.vehicle, expected_return_date: date }
        }
      }) : s));

      toast({ title: 'Rescheduled', description: 'Reschedule date saved and reminders scheduled.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to reschedule', variant: 'destructive' });
    }
  };

  const fetchUpcomingReturns = async () => {
    // Use dummy data instead of database calls
    setUpcomingReturns(dummyUpcomingReturns);
  };

  const fetchStandardServices = async () => {
    try {
      const { data, error } = await supabase
        .from('standard_services')
        .select('*')
        .eq('is_active', true)
        .order('service_name');

      if (error) throw error;
      setStandardServices(data || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch services',
        variant: 'destructive'
      });
    }
  };

  const handleServiceSelect = (sessionId: string, serviceId: string) => {
    setSelectedServices(prev => {
      const currentServices = prev[sessionId] || [];
      if (currentServices.includes(serviceId)) {
        return prev; // Service already selected
      }
      return {
        ...prev,
        [sessionId]: [...currentServices, serviceId]
      };
    });
  };

  const handleServiceRemove = (sessionId: string, serviceId: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [sessionId]: (prev[sessionId] || []).filter(id => id !== serviceId)
    }));
  };

  const getAvailableServices = (sessionId: string) => {
    const selectedServiceIds = selectedServices[sessionId] || [];
    return standardServices.filter(service => !selectedServiceIds.includes(service.id));
  };

  const getSelectedServices = (sessionId: string) => {
    const selectedServiceIds = selectedServices[sessionId] || [];
    return standardServices.filter(service => selectedServiceIds.includes(service.id));
  };

  const printIssue = (session: WorkSession) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Issue Report - ${session.ticket['ticket_number'] || session.ticket.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; margin-bottom: 5px; }
          .content { margin-left: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Issue Report</h1>
          <p><strong>Ticket Number:</strong> ${session.ticket['ticket_number'] || session.ticket.id}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <div class="label">Vehicle Information:</div>
          <div class="content">
            <p><strong>Vehicle:</strong> ${session.ticket.vehicle.year} ${session.ticket.vehicle.make} ${session.ticket.vehicle.model}</p>
            <p><strong>Registration:</strong> ${session.ticket.vehicle.reg_no}</p>
            <p><strong>License:</strong> ${session.ticket.vehicle.license_no || 'N/A'}</p>
          </div>
        </div>

        <div class="section">
          <div class="label">Customer Information:</div>
          <div class="content">
            <p><strong>Name:</strong> ${session.ticket.customer_name}</p>
            <p><strong>Phone:</strong> ${session.ticket.customer_phone}</p>
          </div>
        </div>

        <div class="section">
          <div class="label">Issue Description:</div>
          <div class="content">
            <p>${session.ticket.description}</p>
          </div>
        </div>

        <div class="section">
          <div class="label">Work Status:</div>
          <div class="content">
            <p><strong>Status:</strong> ${session.status.replace('_', ' ').toUpperCase()}</p>
            ${session.started_at ? `<p><strong>Started:</strong> ${new Date(session.started_at).toLocaleString()}</p>` : ''}
            ${session.ended_at ? `<p><strong>Completed:</strong> ${new Date(session.ended_at).toLocaleString()}</p>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const printDamageLog = (session: WorkSession) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const damageLogsForSession = damageLogs[session.id] || [];
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Damage Log - ${session.ticket['ticket_number'] || session.ticket.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; margin-bottom: 5px; }
          .content { margin-left: 10px; }
          .damage-entry { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
          .damage-type { font-weight: bold; color: #d32f2f; }
          .damage-old { font-weight: bold; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Damage Log Report</h1>
          <p><strong>Ticket Number:</strong> ${session.ticket['ticket_number'] || session.ticket.id}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <div class="label">Vehicle Information:</div>
          <div class="content">
            <p><strong>Vehicle:</strong> ${session.ticket.vehicle.year} ${session.ticket.vehicle.make} ${session.ticket.vehicle.model}</p>
            <p><strong>Registration:</strong> ${session.ticket.vehicle.reg_no}</p>
            <p><strong>License:</strong> ${session.ticket.vehicle.license_no || 'N/A'}</p>
          </div>
        </div>

        <div class="section">
          <div class="label">Damage Entries:</div>
          <div class="content">
            ${damageLogsForSession.length > 0 ? 
              damageLogsForSession.map(log => `
                <div class="damage-entry">
                  <div class="${log.is_new_damage ? 'damage-type' : 'damage-old'}">
                    ${log.is_new_damage ? 'NEW DAMAGE' : 'PREVIOUS DAMAGE'} - ${new Date(log.logged_at).toLocaleDateString()}
                  </div>
                  <p><strong>Description:</strong> ${log.description}</p>
                  ${log.photo_ids && log.photo_ids.length > 0 ? `<p><strong>Photos:</strong> ${log.photo_ids.length} photo(s) attached</p>` : ''}
                </div>
              `).join('') : 
              '<p>No damage entries recorded for this vehicle.</p>'
            }
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const syncUpdatesToProfiles = async (sessionId: string, vehicleId: string, ticketId: string) => {
    try {
      // Get current session data
      const session = workSessions.find(s => s.id === sessionId);
      if (!session) return;

      // Update vehicle location status in database
      const locationStatus = vehicleLocationStatus[sessionId];
      const reason = vehicleLocationReason[sessionId];
      const returnDate = expectedReturnDate[sessionId];

      if (locationStatus) {
        const updateData: any = {
          location_status: locationStatus,
          updated_at: new Date().toISOString()
        };

        if (locationStatus === 'not_in_shop') {
          if (reason) updateData.location_reason = reason;
          if (returnDate) updateData.expected_return_date = returnDate;
        } else {
          updateData.expected_return_date = null;
          updateData.location_reason = null;
        }

        const { error: vehicleError } = await supabase
          .from('vehicles')
          .update(updateData)
          .eq('id', vehicleId);

        if (vehicleError) throw vehicleError;
      }

      // Update work session status in database
      const sessionStatus = session.status;
      const sessionUpdateData: any = {
        updated_at: new Date().toISOString()
      };

      if (sessionStatus === 'on_hold' && session.on_hold_reason) {
        sessionUpdateData.on_hold_reason = session.on_hold_reason;
      }

      if (sessionStatus === 'completed') {
        sessionUpdateData.ended_at = new Date().toISOString();
        sessionUpdateData.notes = workNotes[sessionId] || '';
      }

      if (sessionStatus === 'in_progress') {
        sessionUpdateData.started_at = new Date().toISOString();
      }

      const { error: sessionError } = await supabase
        .from('work_sessions')
        .update(sessionUpdateData)
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // Update ticket status if work is completed
      if (sessionStatus === 'completed') {
        const { error: ticketError } = await supabase
          .from('tickets')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', ticketId);

        if (ticketError) throw ticketError;
      }

      toast({
        title: "Updates Synced",
        description: "All updates have been synchronized across profiles",
      });

    } catch (error: any) {
      console.error('Error syncing updates:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync updates across profiles",
        variant: "destructive"
      });
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-500';
      case 'in_progress': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading work assignments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Filter Options */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={assignmentFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setAssignmentFilter('all')}
          size="sm"
        >
          All Assignments
        </Button>
        <Button
          variant={assignmentFilter === 'primary' ? 'default' : 'outline'}
          onClick={() => setAssignmentFilter('primary')}
          size="sm"
        >
          Primary Only
        </Button>
      </div>

      {/* Upcoming Returns */}
      {upcomingReturns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📅 Upcoming Vehicle Returns</CardTitle>
            <CardDescription>Vehicles scheduled to return to the shop</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingReturns.slice(0, 5).map((returnItem) => (
                <div key={returnItem.id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <div>
                    <div className="font-medium">
                      {returnItem.vehicles?.year} {returnItem.vehicles?.make} {returnItem.vehicles?.model}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {returnItem.profiles?.name} • {returnItem.vehicles?.license_no}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {new Date(returnItem.reschedule_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {returnItem.ticket_number}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:gap-6">
        {workSessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No work assignments available</p>
            </CardContent>
          </Card>
        ) : (
          workSessions
            .filter(session => assignmentFilter === 'all' || ticketRoles[session.ticket_id] === 'primary')
            .map((session) => {
              const role = ticketRoles[session.ticket_id];
              return (
            <Card key={session.id} className="w-full">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base sm:text-lg">
                        {session.ticket.vehicle.year} {session.ticket.vehicle.make} {session.ticket.vehicle.model}
                      </CardTitle>
                      <Badge variant={role === 'primary' ? 'default' : 'secondary'} className="font-bold">
                        {role?.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      Reg: {session.ticket.vehicle.reg_no} • Customer: {session.ticket.customer_name}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(session.status)} text-white text-xs px-2 py-1`}>
                    {session.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Issue:</strong> {session.ticket.description}
                  </div>
                  <div>
                    <strong>Customer Phone:</strong> {session.ticket.customer_phone}
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Button size="sm" variant="outline" onClick={() => setShowIssueDialog(prev => ({ ...prev, [session.id]: true }))}>✏️ Edit Issue</Button>
                      <Button size="sm" variant="outline" onClick={() => printIssue(session)}>🖨️ Print Issue</Button>
                      <span className="text-xs text-muted-foreground">Ticket: {session.ticket['ticket_number'] || session.ticket.id}</span>
                    </div>
                    <Dialog open={showIssueDialog[session.id] || false} onOpenChange={(open) => setShowIssueDialog(prev => ({ ...prev, [session.id]: open }))}>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Edit Issue, Services & Damage</DialogTitle>
                          <DialogDescription>Update the customer issue, select services, and optionally log damage in one place.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Issue description */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Issue Description</Label>
                          <Textarea
                            value={issueEdits[session.id] ?? session.ticket.description}
                            onChange={(e) => setIssueEdits(prev => ({ ...prev, [session.id]: e.target.value }))}
                            rows={4}
                          />
                          </div>

                          {/* Services selection */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Services</Label>
                              <span className="text-xs text-muted-foreground">Choose applicable services for this ticket</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {getAvailableServices(session.id).slice(0, 10).map(service => (
                                <Button key={service.id} size="sm" variant="outline" onClick={() => handleServiceSelect(session.id, service.id)}>
                                  ➕ {service.service_name}
                                </Button>
                              ))}
                              {getAvailableServices(session.id).length === 0 && (
                                <span className="text-xs text-muted-foreground">All available services already selected</span>
                              )}
                            </div>
                            {getSelectedServices(session.id).length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {getSelectedServices(session.id).map(service => (
                                  <Badge key={service.id} variant="secondary" className="flex items-center gap-2">
                                    {service.service_name}
                                    <button onClick={() => handleServiceRemove(session.id, service.id)} aria-label="Remove service">✖️</button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Optional Damage log */}
                          <div className="space-y-3 border-t pt-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Damage Log (optional)</Label>
                              <span className="text-xs text-muted-foreground">Add damage details and photos</span>
                            </div>
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Describe the damage in detail..."
                                value={newDamageDescription[session.id] || ''}
                                onChange={(e) => setNewDamageDescription(prev => ({ ...prev, [session.id]: e.target.value }))}
                                rows={3}
                              />
                              <div>
                                <input
                                  id={`issue-damage-photo-upload-${session.id}`}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => {
                                    const files = e.target.files ? Array.from(e.target.files) : [];
                                    setDamagePhotos(prev => ({ ...prev, [session.id]: [...(prev[session.id] || []), ...files].slice(0, 5) }));
                                  }}
                                />
                                <Label htmlFor={`issue-damage-photo-upload-${session.id}`} className="inline-flex items-center gap-2 text-blue-600 cursor-pointer">
                                  📷 Upload Damage Photos (max 5)
                                </Label>
                              </div>
                              {damagePhotos[session.id]?.length > 0 && (
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  {damagePhotos[session.id].map((photo, index) => (
                                    <span key={index} className="px-2 py-1 bg-muted rounded">
                                      {photo.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowIssueDialog(prev => ({ ...prev, [session.id]: false }))}>Cancel</Button>
                            <Button onClick={async () => {
                              await handleSaveIssue(session.id, session.ticket.id);
                              // If damage description provided, create a damage log entry using current selections
                              if ((newDamageDescription[session.id] || '').trim()) {
                                await handleAddDamageLog(session.id, session.ticket.vehicle.id, session.ticket_id);
                              }
                            }}>Save</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {session.started_at && (
                    <div>
                      <strong>Started:</strong> {new Date(session.started_at).toLocaleString()}
                    </div>
                  )}
                  {session.ended_at && (
                    <div>
                      <strong>Completed:</strong> {new Date(session.ended_at).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Parts Section */}
                {session.status !== 'not_started' && (
                  <div className="border-t pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h4 className="font-medium">Parts Used</h4>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="sm:w-auto w-full">
                            🔧 Add Part
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Part</DialogTitle>
                            <DialogDescription>
                              Add a part used for this repair
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="partName">Part Name</Label>
                              <Input
                                id="partName"
                                placeholder="e.g., Brake Pad"
                                value={newPart[session.ticket_id]?.name || ''}
                                onChange={(e) => setNewPart(prev => ({
                                  ...prev,
                                  [session.ticket_id]: { 
                                    ...prev[session.ticket_id], 
                                    name: e.target.value,
                                    quantity: prev[session.ticket_id]?.quantity || 0,
                                    unit_price: prev[session.ticket_id]?.unit_price || 0
                                  }
                                }))}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                  id="quantity"
                                  type="number"
                                  placeholder="1"
                                  value={newPart[session.ticket_id]?.quantity || ''}
                                  onChange={(e) => setNewPart(prev => ({
                                    ...prev,
                                    [session.ticket_id]: { 
                                      ...prev[session.ticket_id], 
                                      quantity: parseInt(e.target.value) || 0,
                                      name: prev[session.ticket_id]?.name || '',
                                      unit_price: prev[session.ticket_id]?.unit_price || 0
                                    }
                                  }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="price">Unit Price ($)</Label>
                                <Input
                                  id="price"
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={newPart[session.ticket_id]?.unit_price || ''}
                                  onChange={(e) => setNewPart(prev => ({
                                    ...prev,
                                    [session.ticket_id]: { 
                                      ...prev[session.ticket_id], 
                                      unit_price: parseFloat(e.target.value) || 0,
                                      name: prev[session.ticket_id]?.name || '',
                                      quantity: prev[session.ticket_id]?.quantity || 0
                                    }
                                  }))}
                                />
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleAddPart(session.ticket_id)}
                              className="w-full"
                            >
                              Add Part
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {partsUsed[session.ticket_id]?.length > 0 ? (
                      <div className="space-y-2 text-sm">
                        {partsUsed[session.ticket_id].map((part, index) => (
                          <div key={index} className="flex justify-between items-center bg-muted p-2 rounded gap-2">
                            <span className="truncate">{part.name} (x{part.quantity})</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span>${(part.quantity * part.unit_price).toFixed(2)}</span>
                              <Button size="icon" variant="ghost" onClick={() => handleRemovePart(session.ticket_id, index)} aria-label="Remove part">🗑️</Button>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between items-center font-medium pt-2 border-t">
                          <span>Total Parts Cost:</span>
                          <span>${partsUsed[session.ticket_id].reduce((sum, part) => sum + (part.quantity * part.unit_price), 0).toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No parts added yet</p>
                    )}
                  </div>
                )}

                {/* Vehicle Location Status */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Vehicle Location Status</Label>
                    <Badge variant={session.ticket.vehicle.location_status === 'in_shop' ? 'default' : 'secondary'}>
                      {session.ticket.vehicle.location_status === 'in_shop' ? 'In Shop' : 'Not In Shop'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Select 
                      value={vehicleLocationStatus[session.id] || session.ticket.vehicle.location_status || 'in_shop'} 
                      onValueChange={(value) => setVehicleLocationStatus(prev => ({ ...prev, [session.id]: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_shop">In Shop</SelectItem>
                        <SelectItem value="not_in_shop">Not In Shop</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={() => handleVehicleLocationUpdate(session.ticket.vehicle.id, session.id)}
                      size="sm"
                      variant="outline"
                    >
                      Update
                    </Button>
                  </div>

                  {vehicleLocationStatus[session.id] === 'not_in_shop' && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Reason for not being in shop (optional)"
                        value={vehicleLocationReason[session.id] || ''}
                        onChange={(e) => setVehicleLocationReason(prev => ({ ...prev, [session.id]: e.target.value }))}
                      />
                      <Input
                        type="datetime-local"
                        placeholder="Expected return date"
                        value={expectedReturnDate[session.id] || ''}
                        onChange={(e) => setExpectedReturnDate(prev => ({ ...prev, [session.id]: e.target.value }))}
                      />
                      <Input
                        type="datetime-local"
                        placeholder="Reschedule date"
                        value={rescheduleDate[session.id] || ''}
                        onChange={(e) => setRescheduleDate(prev => ({ ...prev, [session.id]: e.target.value }))}
                      />
                      <Input
                        placeholder="Reschedule reason (optional)"
                        value={rescheduleReason[session.id] || ''}
                        onChange={(e) => setRescheduleReason(prev => ({ ...prev, [session.id]: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleReschedule(session.id, session.ticket.id)}>Save Reschedule & Notify</Button>
                      </div>
                    </div>
                  )}

                  {session.ticket.vehicle.expected_return_date && (
                    <div className="text-sm text-muted-foreground">
                      Expected return: {new Date(session.ticket.vehicle.expected_return_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Damage Log Section */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Damage Log</Label>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => printDamageLog(session)}
                      >
                        🖨️ Print Damage Log
                      </Button>
                      <Dialog open={showDamageDialog[session.id] || false} onOpenChange={(open) => setShowDamageDialog(prev => ({ ...prev, [session.id]: open }))}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => fetchDamageLogs(session.ticket.vehicle.id, session.id)}
                          >
                            📝 Add Damage Entry
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add Damage Log Entry</DialogTitle>
                          <DialogDescription>
                            Document vehicle damage found during check-in
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="damage-description">Damage Description *</Label>
                            <Textarea
                              id="damage-description"
                              placeholder="Describe the damage in detail..."
                              value={newDamageDescription[session.id] || ''}
                              onChange={(e) => setNewDamageDescription(prev => ({ ...prev, [session.id]: e.target.value }))}
                              rows={4}
                            />
                          </div>

                          {/* Service Selection */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>Required Services</Label>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowServiceDialog(prev => ({ ...prev, [session.id]: true }))}
                              >
                                + Add Service
                              </Button>
                            </div>
                            
                            {/* Selected Services Display */}
                            {getSelectedServices(session.id).length > 0 && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-green-700">Selected Services:</Label>
                                <div className="space-y-2">
                                  {getSelectedServices(session.id).map((service) => (
                                    <div key={service.id} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <Badge variant={service.category === 'standard' ? 'default' : 'secondary'}>
                                          {service.category === 'standard' ? 'Standard' : 'Non-Standard'}
                                        </Badge>
                                        <span className="text-sm font-medium">{service.service_name}</span>
                                        {service.description && (
                                          <span className="text-xs text-muted-foreground">- {service.description}</span>
                                        )}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleServiceRemove(session.id, service.id)}
                                        className="h-6 w-6 p-0"
                                      >
                                        ✕
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Service Selection Dialog */}
                            <Dialog open={showServiceDialog[session.id] || false} onOpenChange={(open) => setShowServiceDialog(prev => ({ ...prev, [session.id]: open }))}>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Select Service</DialogTitle>
                                  <DialogDescription>Choose a service required for this damage</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Available Services</Label>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                      {getAvailableServices(session.id).map((service) => (
                                        <div
                                          key={service.id}
                                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                          onClick={() => {
                                            handleServiceSelect(session.id, service.id);
                                            setShowServiceDialog(prev => ({ ...prev, [session.id]: false }));
                                          }}
                                        >
                                          <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={service.category === 'standard' ? 'default' : 'secondary'}>
                                              {service.category === 'standard' ? 'Standard' : 'Non-Standard'}
                                            </Badge>
                                            <span className="font-medium">{service.service_name}</span>
                                          </div>
                                          {service.description && (
                                            <p className="text-sm text-muted-foreground">{service.description}</p>
                                          )}
                                          {service.default_price && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              Base Price: ${service.default_price.toFixed(2)}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                      {getAvailableServices(session.id).length === 0 && (
                                        <p className="text-center text-muted-foreground py-4">
                                          All services have been selected
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Damage Photos (Optional)</Label>
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                              <div className="text-center">
                                <div className="text-2xl mb-2">📸</div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  Upload photos of the damage (max 5 photos)
                                </p>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleDamagePhotoUpload(session.id, e.target.files)}
                                  className="hidden"
                                  id={`damage-photo-upload-${session.id}`}
                                />
                                <Label
                                  htmlFor={`damage-photo-upload-${session.id}`}
                                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 cursor-pointer"
                                >
                                  Choose Photos
                                </Label>
                              </div>
                              
                              {/* Photo Previews */}
                              {damagePhotos[session.id]?.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {damagePhotos[session.id].map((photo, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={URL.createObjectURL(photo)}
                                        alt={`Damage ${index + 1}`}
                                        className="w-full h-20 object-cover rounded-md"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                                        onClick={() => removeDamagePhoto(session.id, index)}
                                      >
                                        <span className="text-xs">✕</span>
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleAddDamageLog(session.id, session.ticket.vehicle.id, session.ticket_id)}
                              disabled={!newDamageDescription[session.id]?.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Add Damage Entry
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowDamageDialog(prev => ({ ...prev, [session.id]: false }))}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Edit Damage Log Dialog */}
                    <Dialog open={showEditDamageDialog[editingDamageLog?.id || ''] || false} onOpenChange={(open) => {
                      if (!open) {
                        setShowEditDamageDialog(prev => ({ ...prev, [editingDamageLog?.id || '']: false }));
                        setEditingDamageLog(null);
                      }
                    }}>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Damage Log Entry</DialogTitle>
                          <DialogDescription>
                            Update the damage description and photos
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-damage-description">Damage Description *</Label>
                            <Textarea
                              id="edit-damage-description"
                              placeholder="Describe the damage in detail..."
                              value={editDamageDescription[editingDamageLog?.id || ''] || ''}
                              onChange={(e) => setEditDamageDescription(prev => ({ ...prev, [editingDamageLog?.id || '']: e.target.value }))}
                              rows={4}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Additional Photos (Optional)</Label>
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                              <div className="text-center">
                                <div className="text-2xl mb-2">📸</div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  Upload additional photos of the damage (max 5 photos)
                                </p>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleEditDamagePhotoUpload(editingDamageLog?.id || '', e.target.files)}
                                  className="hidden"
                                  id={`edit-damage-photo-upload-${editingDamageLog?.id || ''}`}
                                />
                                <Label
                                  htmlFor={`edit-damage-photo-upload-${editingDamageLog?.id || ''}`}
                                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 cursor-pointer"
                                >
                                  Choose Photos
                                </Label>
                              </div>
                              
                              {/* Photo Previews */}
                              {editDamagePhotos[editingDamageLog?.id || '']?.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {editDamagePhotos[editingDamageLog?.id || ''].map((photo, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={URL.createObjectURL(photo)}
                                        alt={`Damage ${index + 1}`}
                                        className="w-full h-20 object-cover rounded-md"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                                        onClick={() => removeEditDamagePhoto(editingDamageLog?.id || '', index)}
                                      >
                                        <span className="text-xs">✕</span>
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleUpdateDamageLog(editingDamageLog?.id || '', session.id)}
                              disabled={!editDamageDescription[editingDamageLog?.id || '']?.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Update Damage Entry
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setShowEditDamageDialog(prev => ({ ...prev, [editingDamageLog?.id || '']: false }));
                                setEditingDamageLog(null);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Damage History */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {damageLogs[session.id]?.length > 0 ? (
                      damageLogs[session.id].map((log) => (
                        <div 
                          key={log.id} 
                          className={`p-3 rounded-lg border-l-4 ${
                            log.is_new_damage 
                              ? 'bg-red-50 border-red-400' 
                              : 'bg-gray-50 border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                log.is_new_damage 
                                  ? 'bg-red-200 text-red-800' 
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                {log.is_new_damage ? 'NEW DAMAGE' : 'PREVIOUS DAMAGE'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.logged_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditDamageLog(log, session.id)}
                                className="h-6 w-6 p-0"
                              >
                                ✏️
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteDamageLog(log.id, session.id)}
                                className="h-6 w-6 p-0"
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm">{log.description}</p>
                          
                          {/* Selected Services Display */}
                          {log.selected_services && log.selected_services.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-medium text-muted-foreground mb-1">Required Services:</div>
                              <div className="flex flex-wrap gap-1">
                                {log.selected_services.map((serviceId) => {
                                  const service = standardServices.find(s => s.id === serviceId);
                                  return service ? (
                                    <Badge key={serviceId} variant={service.category === 'standard' ? 'default' : 'secondary'} className="text-xs">
                                      {service.service_name}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                          
                          {log.photo_ids && log.photo_ids.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              📷 {log.photo_ids.length} photo(s) attached
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No damage logs recorded for this vehicle
                      </p>
                    )}
                  </div>
                </div>

                {/* Vehicle Details & Photos */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Vehicle Details</Label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input placeholder="VIN" value={(vehicleEdits[session.id]?.vin) ?? (session.ticket.vehicle as any)['vin'] ?? ''} onChange={(e) => setVehicleEdits(prev => ({ ...prev, [session.id]: { ...(prev[session.id] || {}), vin: e.target.value } }))} />
                    <Input placeholder="Engine Size" value={(vehicleEdits[session.id]?.engine_size) ?? (session.ticket.vehicle as any)['engine_size'] ?? ''} onChange={(e) => setVehicleEdits(prev => ({ ...prev, [session.id]: { ...(prev[session.id] || {}), engine_size: e.target.value } }))} />
                    <Input placeholder="Mileage" type="number" value={(vehicleEdits[session.id]?.mileage) ?? String((session.ticket.vehicle as any)['mileage'] ?? '')} onChange={(e) => setVehicleEdits(prev => ({ ...prev, [session.id]: { ...(prev[session.id] || {}), mileage: e.target.value } }))} />
                    <Input placeholder="Trim Code" value={(vehicleEdits[session.id]?.trim_code) ?? (session.ticket.vehicle as any)['trim_code'] ?? ''} onChange={(e) => setVehicleEdits(prev => ({ ...prev, [session.id]: { ...(prev[session.id] || {}), trim_code: e.target.value } }))} />
                    <Input placeholder="Drivetrain" value={(vehicleEdits[session.id]?.drivetrain) ?? (session.ticket.vehicle as any)['drivetrain'] ?? ''} onChange={(e) => setVehicleEdits(prev => ({ ...prev, [session.id]: { ...(prev[session.id] || {}), drivetrain: e.target.value } }))} />
                    <Button variant="outline" onClick={() => handleSaveVehicleDetails(session.id, session.ticket.vehicle.id)}>Save Vehicle</Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label>VIN Sticker</Label>
                      <div className="mt-2">
                        <EnhancedFileUpload
                          onFilesSelected={(files) => setVinStickerPhotos(prev => ({ ...prev, [session.id]: files }))}
                          accept="image/*"
                          multiple={false}
                          maxFiles={1}
                          maxFileSize={10}
                          placeholder="Take VIN sticker photo"
                          id={`vin-sticker-${session.id}`}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Interior Photos</Label>
                      <div className="mt-2">
                        <EnhancedFileUpload
                          onFilesSelected={(files) => setInteriorPhotos(prev => ({ ...prev, [session.id]: files }))}
                          accept="image/*"
                          multiple={true}
                          maxFiles={5}
                          maxFileSize={10}
                          placeholder="Take interior photos"
                          id={`interior-${session.id}`}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Exterior Photos</Label>
                      <div className="mt-2">
                        <EnhancedFileUpload
                          onFilesSelected={(files) => setExteriorPhotos(prev => ({ ...prev, [session.id]: files }))}
                          accept="image/*"
                          multiple={true}
                          maxFiles={5}
                          maxFileSize={10}
                          placeholder="Take exterior photos"
                          id={`exterior-${session.id}`}
                        />
                      </div>
                    </div>
                  </div>
                  <Button className="mt-2" onClick={() => handleUploadVehiclePhotos(session.id, session.ticket.vehicle.id)}>Upload Selected Photos</Button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 pt-4 border-t">
                  {session.status === 'not_started' && (
                    <Button 
                      onClick={() => handleStartWork(session.id, session.ticket_id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                    >
                      🚀 Start Work
                    </Button>
                  )}

                  {session.status === 'in_progress' && (
                    <>
                      <Textarea
                        placeholder="Add work notes (optional)"
                        value={workNotes[session.id] || ''}
                        onChange={(e) => 
                          setWorkNotes(prev => ({ ...prev, [session.id]: e.target.value }))
                        }
                        className="text-sm"
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={() => handleFinishWork(session.id, session.ticket_id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          ✅ Finish Work
                        </Button>
                        
                        <Dialog open={showOnHoldDialog[session.id] || false} onOpenChange={(open) => setShowOnHoldDialog(prev => ({ ...prev, [session.id]: open }))}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800">
                              ⏸️ On Hold
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Put Work On Hold</DialogTitle>
                              <DialogDescription>
                                Add a reason for putting this work on hold (optional)
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Reason for putting work on hold (optional)"
                                value={onHoldReason[session.id] || ''}
                                onChange={(e) => setOnHoldReason(prev => ({ ...prev, [session.id]: e.target.value }))}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleOnHold(session.id, onHoldReason[session.id])}
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                >
                                  Put On Hold
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setShowOnHoldDialog(prev => ({ ...prev, [session.id]: false }))}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </>
                  )}

                  {session.status === 'on_hold' && (
                    <div className="space-y-3">
                      <div className="bg-yellow-50 p-3 rounded text-sm">
                        <strong>Work On Hold</strong>
                        {session.on_hold_reason && <p className="mt-1">Reason: {session.on_hold_reason}</p>}
                      </div>
                      <Button 
                        onClick={() => handleStartWork(session.id, session.ticket_id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                      >
                        🔄 Resume Work
                      </Button>
                    </div>
                  )}

                  {session.status === 'completed' && session.notes && (
                    <div className="bg-muted p-3 rounded text-sm">
                      <strong>Work Notes:</strong> {session.notes || 'No notes available'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
        )}
      </div>
    </div>
  );
};
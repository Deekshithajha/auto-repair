import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/ui/status-badge';
import { CreateTicketDialog } from '@/components/tickets/CreateTicketDialog';
import { CustomerVehicleManagement } from '@/components/customers/CustomerVehicleManagement';
import { EnhancedCustomerProfile } from '@/components/customers/EnhancedCustomerProfile';
import { VehicleServiceHistory } from '@/components/vehicles/VehicleServiceHistory';
import { toast } from '@/hooks/use-toast';
import DashboardBackground from '@/components/layout/DashboardBackground';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Ticket {
  id: string;
  status: string;
  description: string;
  created_at: string;
  vehicles: {
    make: string;
    model: string;
    year: number;
  };
}

interface VehicleStatus {
  id: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    reg_no: string;
    color: string;
    mileage: number;
  };
  current_ticket: {
    id: string;
    description: string;
    status: string;
    progress_percentage: number;
    estimated_completion: string;
    assigned_mechanic: string;
    work_stages: {
      stage: string;
      status: 'completed' | 'in_progress' | 'pending';
      completed_at?: string;
    }[];
  };
  service_history: {
    date: string;
    service: string;
    cost: number;
    status: string;
  }[];
}

interface UserDashboardProps {
  activeTab?: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ activeTab = 'tickets' }) => {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<{
    id: string;
    date: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    description: string;
    vehicle: string;
    ticketId?: string;
  } | null>(null);
  const [userInvoices, setUserInvoices] = useState<Array<{
    id: string;
    date: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    description: string;
    vehicle: string;
    ticketId?: string;
  }>>([]);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(true);
  const [invoiceServices, setInvoiceServices] = useState<Array<{ name: string; quantity: number; unit_price: number; is_taxable: boolean; is_standard?: boolean }>>([]);
  const [invoiceParts, setInvoiceParts] = useState<Array<{ name: string; quantity: number; unit_price: number; is_taxable: boolean }>>([]);
  const [invoiceTaxRate, setInvoiceTaxRate] = useState<number>(8.25);
  const [loadingInvoiceDetails, setLoadingInvoiceDetails] = useState<boolean>(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState<string | null>(null);
  const [userVehicles, setUserVehicles] = useState<Array<{ id: string; make: string; model: string; year: number; license_no?: string }>>([]);


  const dummyInvoices = [
    {
      id: 'INV-001',
      date: '2024-01-10',
      amount: 245.50,
      status: 'paid',
      description: 'Oil change and brake pad replacement',
      vehicle: '2020 Toyota Camry'
    },
    {
      id: 'INV-002',
      date: '2023-12-15',
      amount: 180.00,
      status: 'paid',
      description: 'Tire rotation and alignment',
      vehicle: '2019 Honda Civic'
    },
    {
      id: 'INV-003',
      date: '2023-11-20',
      amount: 320.75,
      status: 'paid',
      description: 'Transmission fluid change and filter replacement',
      vehicle: '2021 Ford Focus'
    },
    {
      id: 'INV-004',
      date: '2024-02-05',
      amount: 0,
      status: 'pending',
      description: 'Pending invoice demo with services and parts',
      vehicle: '2022 Hyundai Elantra'
    }
  ];

  const dummyInvoiceDetailsById: Record<string, { services: Array<{ name: string; quantity: number; unit_price: number; is_taxable: boolean; is_standard?: boolean }>; parts: Array<{ name: string; quantity: number; unit_price: number; is_taxable: boolean }>; taxRate: number; }> = {
    'INV-004': {
      taxRate: 8.25,
      services: [
        { name: 'Oil Change', quantity: 1, unit_price: 45, is_taxable: true, is_standard: true },
        { name: 'Brake Pad Replacement', quantity: 1, unit_price: 120, is_taxable: true, is_standard: true },
        { name: 'Custom Detailing', quantity: 1, unit_price: 60, is_taxable: true, is_standard: false },
      ],
      parts: [
        { name: 'Engine Oil 5W-30', quantity: 1, unit_price: 30, is_taxable: true },
        { name: 'Brake Pads (Front)', quantity: 1, unit_price: 80, is_taxable: true },
      ],
    },
  };

  const handleOpenInvoice = (invoiceId: string) => {
    const found = userInvoices.find(inv => inv.id === invoiceId) || null;
    setSelectedInvoice(found);
    setInvoiceDialogOpen(!!found);
    if (found) {
      loadInvoiceDetails({ id: found.id, ticketId: found.ticketId, amount: found.amount });
    }
  };

  const loadInvoiceDetails = async (invoice: { id: string; ticketId?: string; amount?: number }) => {
    setLoadingInvoiceDetails(true);
    try {
      if (invoice.ticketId) {
        const [partsRes] = await Promise.all([
          supabase.from('parts').select('*').eq('ticket_id', invoice.ticketId),
        ]);

        const mappedServices: any[] = [];

        if (!partsRes.error) {
          const mappedParts = (partsRes.data || []).map((p: any) => ({
            name: p.name ?? 'Part',
            quantity: Number(p.quantity ?? 1),
            unit_price: Number(p.unit_price ?? 0),
            is_taxable: (p.tax_percentage ?? 0) > 0,
          }));
          setInvoiceParts(mappedParts);
        }

        setInvoiceTaxRate(8.25);
        // If we successfully fetched live items, stop here
        if ((invoiceServices.length > 0) || (invoiceParts.length > 0)) {
          return;
        }
      }

      const dummy = dummyInvoiceDetailsById[invoice.id];
      if (dummy) {
        setInvoiceServices(dummy.services);
        setInvoiceParts(dummy.parts);
        setInvoiceTaxRate(dummy.taxRate);
      } else {
        setInvoiceServices([]);
        setInvoiceParts([]);
        setInvoiceTaxRate(8.25);
      }

      // Final fallback: if there are still no line items but we know the invoice amount,
      // inject a single non-taxable line item so the inside total matches the card total.
      const amount = typeof invoice.amount === 'number' ? invoice.amount : selectedInvoice?.amount;
      if ((invoiceServices.length === 0) && (invoiceParts.length === 0) && amount && amount > 0) {
        setInvoiceServices([{ name: 'Billed amount', quantity: 1, unit_price: amount, is_taxable: false, is_standard: false }]);
        setInvoiceTaxRate(0);
      }
    } finally {
      setLoadingInvoiceDetails(false);
    }
  };

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    date: string;
    type: string;
  }>>([]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedNotifications = (data || []).map((notif: any) => ({
        id: notif.id,
        title: notif.title || 'Notification',
        message: notif.message || '',
        date: notif.created_at,
        type: notif.type || 'info'
      }));

      setNotifications(formattedNotifications);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch tickets on mount
  useEffect(() => {
    if (user?.id) {
      console.log('🎯 UserDashboard: Triggering fetchTickets for user:', user.id);
      fetchTickets();
    }
  }, [user?.id]);

  // Fetch vehicles on mount
  useEffect(() => {
    if (user?.id) {
      console.log('🚗 UserDashboard: Triggering fetchUserVehicles for user:', user.id);
      fetchUserVehicles();
    }
  }, [user?.id]);

  const fetchUserVehicles = async () => {
    if (!user?.id) return;
    
    try {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('id, make, model, year, license_plate')
        .eq('owner_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      
      const formatted = (vehicles || []).map(v => ({
        id: v.id,
        make: v.make,
        model: v.model,
        year: v.year,
        license_no: v.license_plate
      }));
      
      console.log('✅ fetchUserVehicles: Got vehicles', formatted);
      setUserVehicles(formatted);
    } catch (error: any) {
      console.error('❌ Error fetching user vehicles:', error);
    }
  };

  const [vehicleStatuses, setVehicleStatuses] = useState<VehicleStatus[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchVehicleStatuses();
    }
  }, [user?.id]);

  const fetchVehicleStatuses = async () => {
    if (!user?.id) {
      console.log('❌ fetchVehicleStatuses: No user ID found');
      return;
    }
    
    console.log('🚗 fetchVehicleStatuses: Starting fetch for user:', user.id);
    
    try {
      // Fetch user's vehicles with their current tickets
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select(`
          id,
          make,
          model,
          year,
          reg_no,
          license_plate,
          color,
          mileage
        `)
        .eq('owner_id', user.id)
        .eq('status', 'active');

      console.log('🚗 fetchVehicleStatuses: Vehicles result', { vehicles, vehiclesError, count: vehicles?.length });

      if (vehiclesError) throw vehiclesError;

      // For each vehicle, get the current active ticket
      const statuses = await Promise.all((vehicles || []).map(async (vehicle: any) => {
        const { data: tickets } = await supabase
          .from('tickets')
          .select(`
            id,
            ticket_number,
            description,
            status,
            preferred_pickup_time,
            primary_mechanic_id,
            profiles:primary_mechanic_id (name)
          `)
          .eq('vehicle_id', vehicle.id)
          .in('status', ['pending', 'in_progress', 'awaiting_parts', 'completed'])
          .order('created_at', { ascending: false })
          .limit(1);

        const currentTicket = tickets && tickets.length > 0 ? tickets[0] : null;
        const mechanic = currentTicket?.profiles ? (Array.isArray(currentTicket.profiles) ? currentTicket.profiles[0] : currentTicket.profiles) : null;

        // Get service history (completed tickets)
        const { data: completedTickets } = await supabase
          .from('tickets')
          .select(`
            id,
            created_at,
            description,
            status
          `)
          .eq('vehicle_id', vehicle.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(3);

        const serviceHistory = (completedTickets || []).map((ticket: any) => ({
          date: ticket.created_at,
          service: ticket.description || 'Service',
          cost: 0, // Would need to fetch from invoices
          status: 'completed'
        }));

        return {
          id: vehicle.id,
          vehicle: {
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            reg_no: vehicle.reg_no || vehicle.license_plate || '',
            color: vehicle.color || 'N/A',
            mileage: vehicle.mileage || 0
          },
          current_ticket: currentTicket ? {
            id: currentTicket.ticket_number || currentTicket.id,
            description: currentTicket.description || '',
            status: currentTicket.status,
            progress_percentage: currentTicket.status === 'completed' ? 100 : currentTicket.status === 'in_progress' ? 50 : currentTicket.status === 'awaiting_parts' ? 25 : 0,
            estimated_completion: currentTicket.preferred_pickup_time || '',
            assigned_mechanic: mechanic?.name || 'Pending Assignment',
            work_stages: [] // Would need to fetch from work_sessions or damage_log
          } : {
            id: 'N/A',
            description: 'No active ticket',
            status: 'none',
            progress_percentage: 0,
            estimated_completion: '',
            assigned_mechanic: 'N/A',
            work_stages: []
          },
          service_history: serviceHistory
        };
      }));

      setVehicleStatuses(statuses);
    } catch (error: any) {
      console.error('Error fetching vehicle statuses:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTickets();
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchUserVehicles = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('id, make, model, year, license_plate')
          .eq('owner_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUserVehicles(data as any || []);
      } catch (error: any) {
        console.error('Error fetching vehicles:', error);
      }
    };

    fetchUserVehicles();
  }, [user?.id]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoadingInvoices(true);
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            id,
            invoice_number,
            total_amount,
            payment_status,
            created_at,
            tickets:ticket_id (
              id,
              ticket_number,
              vehicles:vehicle_id (
                make, model, year
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map((row: any) => ({
          id: row.invoice_number ?? row.id,
          date: row.created_at,
          amount: Number(row.total_amount ?? 0),
          status: (row.payment_status ?? 'pending') as 'pending' | 'paid' | 'overdue' | 'cancelled',
          description: row.tickets?.ticket_number ? `Invoice for ${row.tickets.ticket_number}` : 'Service invoice',
          vehicle: row.tickets?.vehicles ? `${row.tickets.vehicles.year} ${row.tickets.vehicles.make} ${row.tickets.vehicles.model}` : 'Vehicle',
          ticketId: row.tickets?.id,
        }));

        if (mapped.length === 0) {
          const demo = dummyInvoices.map(inv => ({
            id: inv.id,
            date: inv.date,
            amount: inv.amount,
            status: (inv.status === 'paid' ? 'paid' : 'pending') as 'pending' | 'paid',
            description: inv.description,
            vehicle: inv.vehicle,
          }));
          setUserInvoices(demo);
        } else {
          setUserInvoices(mapped);
        }
      } catch (e) {
        const demo = dummyInvoices.map(inv => ({
          id: inv.id,
          date: inv.date,
          amount: inv.amount,
          status: (inv.status === 'paid' ? 'paid' : 'pending') as 'pending' | 'paid',
          description: inv.description,
          vehicle: inv.vehicle,
        }));
        setUserInvoices(demo);
      } finally {
        setLoadingInvoices(false);
      }
    };

    fetchInvoices();

    const channel = supabase
      .channel('invoices-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        fetchInvoices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchTickets = async () => {
    if (!user?.id) {
      console.log('❌ fetchTickets: No user ID found', user);
      return;
    }
    
    console.log('🔍 fetchTickets: Starting fetch for user:', user.id);
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          status,
          description,
          created_at,
          vehicles:vehicle_id (
            make,
            model,
            year
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      console.log('📊 fetchTickets: Query result', { data, error, count: data?.length });

      if (error) throw error;

      const formattedTickets = (data || []).map((ticket: any) => ({
        id: ticket.id,
        status: ticket.status,
        description: ticket.description || '',
        created_at: ticket.created_at,
        vehicles: Array.isArray(ticket.vehicles) ? ticket.vehicles[0] : ticket.vehicles,
      }));

      console.log('✅ fetchTickets: Formatted tickets', formattedTickets);
      setTickets(formattedTickets);
    } catch (error: any) {
      console.error('❌ Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTicketCreated = () => {
    fetchTickets();
    setShowCreateTicket(false);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'tickets':
        return renderTicketsPage();
      case 'vehicles':
        return renderVehiclesPage();
      case 'vehicle-status':
        return renderVehicleStatusPage();
      case 'invoices':
        return renderInvoicesPage();
      case 'notifications':
        return renderNotificationsPage();
      case 'profile':
        return renderProfilePage();
      default:
        return renderTicketsPage();
    }
  };

  const renderTicketsPage = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">My Tickets</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Track your repair requests</p>
        </div>
        <Button 
          onClick={() => setShowCreateTicket(true)}
          className="bg-gradient-primary w-full sm:w-auto"
        >
          <span className="mr-2">➕</span>
          <span className="hidden sm:inline">Raise Ticket</span>
          <span className="sm:hidden">Raise</span>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold mb-2">No repair tickets yet</h3>
            <p className="text-muted-foreground mb-6">Create your first ticket to get started</p>
            <Button 
              onClick={() => setShowCreateTicket(true)}
              className="bg-gradient-primary"
            >
              <span className="mr-2">➕</span>
              Create First Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-elegant transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {ticket.vehicles.year} {ticket.vehicles.make} {ticket.vehicles.model}
                  </CardTitle>
                  <StatusBadge status={ticket.status as any} />
                </div>
                <CardDescription className="flex items-center text-xs">
                  <span className="mr-1">📅</span>
                  {new Date(ticket.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {ticket.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderVehiclesPage = () => (
    <div className="space-y-4 sm:space-y-6">
      <CustomerVehicleManagement />
    </div>
  );

  const renderVehicleStatusPage = () => (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">My Vehicle Status</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Track the progress of your vehicle repairs</p>
      </div>

      <div className="grid gap-6">
        {vehicleStatuses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-lg font-semibold mb-2">No vehicles</h3>
              <p className="text-muted-foreground">Add a vehicle to get started</p>
            </CardContent>
          </Card>
        ) : (
          vehicleStatuses.map((vehicleStatus) => (
          <Card key={vehicleStatus.id} className="hover:shadow-elegant transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    {vehicleStatus.vehicle.year} {vehicleStatus.vehicle.make} {vehicleStatus.vehicle.model}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span>Reg: {vehicleStatus.vehicle.reg_no}</span>
                    <span>•</span>
                    <span>{vehicleStatus.vehicle.color}</span>
                    <span>•</span>
                    <span>{vehicleStatus.vehicle.mileage.toLocaleString()} miles</span>
                  </CardDescription>
                </div>
                <Badge variant={
                  vehicleStatus.current_ticket.status === 'completed' ? 'default' :
                  vehicleStatus.current_ticket.status === 'in_progress' ? 'secondary' : 'outline'
                }>
                  {vehicleStatus.current_ticket.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Ticket Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Current Repair Progress</h3>
                  <span className="text-sm font-medium">{vehicleStatus.current_ticket.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${vehicleStatus.current_ticket.progress_percentage}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Ticket ID:</span>
                    <span className="text-muted-foreground ml-2">{vehicleStatus.current_ticket.id}</span>
                  </div>
                  <div>
                    <span className="font-medium">Assigned Mechanic:</span>
                    <span className="text-muted-foreground ml-2">{vehicleStatus.current_ticket.assigned_mechanic}</span>
                  </div>
                  <div>
                    <span className="font-medium">Estimated Completion:</span>
                    <span className="text-muted-foreground ml-2">
                      {new Date(vehicleStatus.current_ticket.estimated_completion).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Description:</span>
                    <span className="text-muted-foreground ml-2">{vehicleStatus.current_ticket.description}</span>
                  </div>
                </div>
              </div>

              {/* Work Stages */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Work Stages</h3>
                <div className="space-y-2">
                  {vehicleStatus.current_ticket.work_stages.map((stage, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        stage.status === 'completed' ? 'bg-green-500 text-white' :
                        stage.status === 'in_progress' ? 'bg-blue-500 text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {stage.status === 'completed' ? '✓' :
                         stage.status === 'in_progress' ? '⏳' : index + 1}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium">{stage.stage}</span>
                        {stage.completed_at && (
                          <p className="text-xs text-muted-foreground">
                            Completed: {new Date(stage.completed_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Badge variant={
                        stage.status === 'completed' ? 'default' :
                        stage.status === 'in_progress' ? 'secondary' : 'outline'
                      } className="text-xs">
                        {stage.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Recent Service History</h3>
                  {(() => {
                    // Try to find matching vehicle ID from user vehicles
                    const matchingVehicle = userVehicles.find(v => 
                      v.year === vehicleStatus.vehicle.year &&
                      v.make === vehicleStatus.vehicle.make &&
                      v.model === vehicleStatus.vehicle.model
                    );
                    return matchingVehicle ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedVehicleForHistory(matchingVehicle.id);
                          setShowHistoryDialog(true);
                        }}
                      >
                        📋 View Full History
                      </Button>
                    ) : null;
                  })()}
                </div>
                <div className="space-y-2">
                  {vehicleStatus.service_history.slice(0, 3).map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div>
                        <span className="text-sm font-medium">{service.service}</span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(service.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">${service.cost.toFixed(2)}</span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderInvoicesPage = () => (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Invoices</h2>
        <p className="text-muted-foreground text-sm sm:text-base">View your repair invoices</p>
      </div>
      {loadingInvoices ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-elegant transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{invoice.id}</CardTitle>
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                    {invoice.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center text-xs">
                  <span className="mr-1">📅</span>
                  {new Date(invoice.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{invoice.vehicle}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {invoice.description}
                  </p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-green-600">
                      ${invoice.amount.toFixed(2)}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleOpenInvoice(invoice.id)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {(!loadingInvoices && userInvoices.length === 0) && (
        <Card className="text-center py-10">
          <CardContent>
            <div className="text-4xl mb-2">🧾</div>
            <div className="text-sm text-muted-foreground">No invoices yet.</div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderNotificationsPage = () => (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Notifications</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Stay updated on your repairs</p>
      </div>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
          <Card key={notification.id} className="hover:shadow-elegant transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {notification.type === 'info' && <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">ℹ️</div>}
                  {notification.type === 'reminder' && <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">⏰</div>}
                  {notification.type === 'success' && <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">✅</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-foreground">
                      {notification.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderProfilePage = () => (
    <div className="space-y-4 sm:space-y-6">
      <EnhancedCustomerProfile customerId={user?.id || ''} />
    </div>
  );

  return (
    <DashboardBackground>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {renderPage()}

        {/* Create Ticket Dialog */}
        <CreateTicketDialog 
          open={showCreateTicket}
          onOpenChange={setShowCreateTicket}
          onTicketCreated={handleTicketCreated}
        />

        {/* Invoice Details Dialog */}
        <Dialog open={invoiceDialogOpen} onOpenChange={(open) => { 
          setInvoiceDialogOpen(open); 
          if (!open) setSelectedInvoice(null); 
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>Review your invoice information</DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Invoice ID</span>
                  <span className="font-medium">{selectedInvoice.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date(selectedInvoice.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vehicle</span>
                  <span className="font-medium">{selectedInvoice.vehicle}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Description</span>
                  <p className="text-sm mt-1">{selectedInvoice.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={selectedInvoice.status === 'paid' ? 'default' : 'secondary'}>
                    {selectedInvoice.status}
                  </Badge>
                </div>
                {/* Line Items */}
                <div className="pt-2 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Services</h4>
                    {loadingInvoiceDetails ? (
                      <div className="text-sm text-muted-foreground">Loading services…</div>
                    ) : invoiceServices.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No services added.</div>
                    ) : (
                      <div className="space-y-2">
                        {invoiceServices.filter(s => s.is_standard).length > 0 && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Standard</div>
                            {invoiceServices.filter(s => s.is_standard).map((s, idx) => (
                              <div key={`std-${idx}`} className="flex justify-between text-sm">
                                <span>{s.name} × {s.quantity}</span>
                                <span>${(s.unit_price * s.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {invoiceServices.filter(s => !s.is_standard).length > 0 && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Non-standard</div>
                            {invoiceServices.filter(s => !s.is_standard).map((s, idx) => (
                              <div key={`nstd-${idx}`} className="flex justify-between text-sm">
                                <span>{s.name} × {s.quantity}</span>
                                <span>${(s.unit_price * s.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Parts</h4>
                    {loadingInvoiceDetails ? (
                      <div className="text-sm text-muted-foreground">Loading parts…</div>
                    ) : invoiceParts.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No parts added.</div>
                    ) : (
                      <div className="space-y-1">
                        {invoiceParts.map((p, idx) => (
                          <div key={`part-${idx}`} className="flex justify-between text-sm">
                            <span>{p.name} × {p.quantity}</span>
                            <span>${(p.unit_price * p.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="border-t pt-3 space-y-1 text-sm">
                    {(() => {
                      const servicesSubtotal = invoiceServices.reduce((sum, s) => sum + s.unit_price * s.quantity, 0);
                      const partsSubtotal = invoiceParts.reduce((sum, p) => sum + p.unit_price * p.quantity, 0);
                      const taxableAmount = invoiceServices.filter(s => s.is_taxable).reduce((sum, s) => sum + s.unit_price * s.quantity, 0)
                        + invoiceParts.filter(p => p.is_taxable).reduce((sum, p) => sum + p.unit_price * p.quantity, 0);
                      const tax = (taxableAmount * invoiceTaxRate) / 100;
                      const total = servicesSubtotal + partsSubtotal + tax;
                      return (
                        <>
                          <div className="flex justify-between"><span>Services</span><span>${servicesSubtotal.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Parts</span><span>${partsSubtotal.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Tax ({invoiceTaxRate}%)</span><span>${tax.toFixed(2)}</span></div>
                          <div className="flex justify-between font-semibold text-base"><span>Total</span><span>${total.toFixed(2)}</span></div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Service History Dialog */}
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Service History</DialogTitle>
              <DialogDescription>
                {selectedVehicleForHistory && userVehicles.find(v => v.id === selectedVehicleForHistory) && (
                  <>
                    Complete service history for {userVehicles.find(v => v.id === selectedVehicleForHistory)?.year}{' '}
                    {userVehicles.find(v => v.id === selectedVehicleForHistory)?.make}{' '}
                    {userVehicles.find(v => v.id === selectedVehicleForHistory)?.model}
                    {userVehicles.find(v => v.id === selectedVehicleForHistory)?.license_no && 
                      ` (${userVehicles.find(v => v.id === selectedVehicleForHistory)?.license_no})`}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedVehicleForHistory && (
              <VehicleServiceHistory vehicleId={selectedVehicleForHistory} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardBackground>
  );
};
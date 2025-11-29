import { 
  Ticket, 
  TicketStatus, 
  CustomerTicketPayload, 
  EmployeeTicketPayload,
  RescheduleInfo,
  MechanicIntake,
  AdditionalFinding,
  Photo,
  Customer,
  Vehicle,
  Service
} from '../types';

export interface TicketService {
  createTicketFromCustomerFlow(payload: CustomerTicketPayload): Promise<Ticket>;
  createTicketFromEmployeeFlow(payload: EmployeeTicketPayload): Promise<Ticket>;
  getTickets(filter?: { status?: TicketStatus; assignedTo?: string }): Promise<Ticket[]>;
  getTicketById(id: string): Promise<Ticket | null>;
  assignMechanic(ticketId: string, mechanicId: string): Promise<Ticket>; // Legacy - adds to array
  assignMechanics(ticketId: string, mechanicIds: string[]): Promise<Ticket>; // New - assign multiple
  removeMechanic(ticketId: string, mechanicId: string): Promise<Ticket>; // Remove a mechanic
  updateTicketStatus(ticketId: string, status: TicketStatus): Promise<Ticket>;
  updateTicketNotes(ticketId: string, notes: string): Promise<Ticket>;
  setRescheduleInfo(ticketId: string, info: RescheduleInfo): Promise<Ticket>;
  setMechanicIntake(ticketId: string, intake: MechanicIntake): Promise<Ticket>;
  addAdditionalFinding(ticketId: string, finding: Omit<AdditionalFinding, 'id' | 'createdAt'>): Promise<Ticket>;
}

// In-memory storage
let tickets: Ticket[] = [];
let ticketIdCounter = 1;

// Load from localStorage on init
const STORAGE_KEY = 'automotive_tickets';

function loadFromStorage(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      tickets = JSON.parse(stored);
      // Find max ID to continue counter
      const maxId = tickets.reduce((max, t) => {
        const numId = parseInt(t.id.replace('t', ''), 10);
        return numId > max ? numId : max;
      }, 0);
      ticketIdCounter = maxId + 1;
    }
  } catch (error) {
    console.error('Failed to load tickets from storage:', error);
    tickets = [];
  }
}

function saveToStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (error) {
    console.error('Failed to save tickets to storage:', error);
  }
}

// Initialize
loadFromStorage();

function generateTicketId(): string {
  return `t${ticketIdCounter++}`;
}

function convertServicePhotos(photos?: string[]): Photo[] {
  if (!photos || photos.length === 0) return [];
  return photos.map((dataUrl, index) => ({
    id: `photo-${Date.now()}-${index}`,
    category: 'other' as const,
    dataUrl,
    createdAt: new Date().toISOString(),
  }));
}

function convertSelectedServicesToServices(selectedServices: CustomerTicketPayload['selectedServices']): Service[] {
  return selectedServices.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.symptoms,
    status: 'pending' as const,
  }));
}

// Helper to find or create customer from customerInfo
async function findOrCreateCustomer(customerInfo: CustomerTicketPayload['customerInfo']): Promise<Customer> {
  // In a real app, this would query a customer service
  // For now, create a new customer or find existing by email
  const existingCustomer = tickets.find(t => 
    t.customer.email.toLowerCase() === customerInfo.email.toLowerCase()
  )?.customer;

  if (existingCustomer) {
    return existingCustomer;
  }

  // Create new customer
  const nameParts = customerInfo.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: `c${Date.now()}`,
    firstName,
    lastName,
    email: customerInfo.email,
    phone: customerInfo.phone,
    address: customerInfo.address,
    preferredNotification: customerInfo.notificationPreference,
    vehicles: [],
    tickets: [],
    invoices: [],
    createdAt: new Date().toISOString(),
  };
}

const inMemoryTicketService: TicketService = {
  async createTicketFromCustomerFlow(payload: CustomerTicketPayload): Promise<Ticket> {
    const customer = await findOrCreateCustomer(payload.customerInfo);
    const now = new Date().toISOString();

    // Convert selected services to Service objects
    const services = convertSelectedServicesToServices(payload.selectedServices);
    
    // Collect all photos from services
    const servicePhotos: Photo[] = [];
    payload.selectedServices.forEach((service) => {
      if (service.photos) {
        servicePhotos.push(...convertServicePhotos(service.photos));
      }
    });

    // Add any direct photos
    const allPhotos = payload.photos ? [...payload.photos, ...servicePhotos] : servicePhotos;

    // Build symptoms from services
    const symptoms = payload.selectedServices
      .filter(s => s.symptoms)
      .map(s => `${s.name}: ${s.symptoms}`)
      .join('\n');

    const ticket: Ticket = {
      id: generateTicketId(),
      source: 'customer',
      customer,
      vehicle: payload.vehicle,
      services,
      symptoms: symptoms || undefined,
      photos: allPhotos,
      status: 'pending-admin-review',
      createdAt: now,
      updatedAt: now,
      schedulingPreferences: {
        pickupTime: payload.schedulingPreferences.pickupTime,
        dropoffDate: payload.schedulingPreferences.dropOffDate,
        notificationMethod: payload.customerInfo.notificationPreference,
      },
      // Legacy fields
      customerId: customer.id,
      vehicleId: payload.vehicle.id,
      description: symptoms || 'Service request',
      createdBy: customer.id,
      createdByType: 'customer',
    };

    tickets.push(ticket);
    saveToStorage();
    return ticket;
  },

  async createTicketFromEmployeeFlow(payload: EmployeeTicketPayload): Promise<Ticket> {
    const now = new Date().toISOString();

    const ticket: Ticket = {
      id: generateTicketId(),
      source: 'employee',
      customer: payload.customer,
      vehicle: payload.vehicle,
      services: payload.selectedServices || [],
      symptoms: payload.symptoms,
      notes: payload.description,
      photos: payload.photos || [],
      status: 'pending-admin-review',
      createdAt: now,
      updatedAt: now,
      schedulingPreferences: payload.schedulingPreferences,
      // Legacy fields
      customerId: payload.customer.id,
      vehicleId: payload.vehicle.id,
      description: payload.description || payload.symptoms || 'Service request',
      createdBy: payload.customer.id, // In real app, would be employee ID
      createdByType: 'employee',
    };

    tickets.push(ticket);
    saveToStorage();
    return ticket;
  },

  async getTickets(filter?: { status?: TicketStatus; assignedTo?: string }): Promise<Ticket[]> {
    let filtered = [...tickets];
    
    if (filter?.status) {
      filtered = filtered.filter(t => t.status === filter.status);
    }
    
    if (filter?.assignedTo) {
      filtered = filtered.filter(t => {
        // Check new array field
        if (t.assignedMechanicIds && t.assignedMechanicIds.includes(filter.assignedTo!)) {
          return true;
        }
        // Check legacy field for backward compatibility
        return t.assignedMechanicId === filter.assignedTo;
      });
    }
    
    return filtered;
  },

  async getTicketById(id: string): Promise<Ticket | null> {
    return tickets.find(t => t.id === id) || null;
  },

  async assignMechanic(ticketId: string, mechanicId: string): Promise<Ticket> {
    // For backward compatibility, this method still accepts a single mechanic ID
    // It will add to the array if it doesn't exist
    return this.assignMechanics(ticketId, [mechanicId]);
  },

  async assignMechanics(ticketId: string, mechanicIds: string[]): Promise<Ticket> {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    // Initialize array if it doesn't exist
    if (!ticket.assignedMechanicIds) {
      // Migrate from legacy assignedMechanicId if it exists
      ticket.assignedMechanicIds = ticket.assignedMechanicId ? [ticket.assignedMechanicId] : [];
    }

    // Add new mechanics (avoid duplicates)
    mechanicIds.forEach(id => {
      if (!ticket.assignedMechanicIds!.includes(id)) {
        ticket.assignedMechanicIds!.push(id);
      }
    });

    // Update legacy field for backward compatibility (use first mechanic)
    ticket.assignedMechanicId = ticket.assignedMechanicIds[0] || null;
    ticket.assignedTo = ticket.assignedMechanicIds[0] || undefined;

    // Update status if not already assigned/in-progress
    if (ticket.status === 'pending-admin-review') {
      ticket.status = 'assigned';
    }
    ticket.updatedAt = new Date().toISOString();

    // Add to status history
    if (!ticket.statusHistory) {
      ticket.statusHistory = [];
    }
    ticket.statusHistory.push({
      status: ticket.status,
      timestamp: new Date().toISOString(),
      updatedBy: 'admin', // TODO: Get actual admin ID
      notes: `Assigned to ${mechanicIds.length} mechanic(s)`,
    });

    saveToStorage();
    return ticket;
  },

  async removeMechanic(ticketId: string, mechanicId: string): Promise<Ticket> {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    if (!ticket.assignedMechanicIds) {
      // Migrate from legacy field
      ticket.assignedMechanicIds = ticket.assignedMechanicId ? [ticket.assignedMechanicId] : [];
    }

    // Remove mechanic from array
    ticket.assignedMechanicIds = ticket.assignedMechanicIds.filter(id => id !== mechanicId);

    // Update legacy field
    ticket.assignedMechanicId = ticket.assignedMechanicIds[0] || null;
    ticket.assignedTo = ticket.assignedMechanicIds[0] || undefined;

    // If no mechanics assigned, revert to pending-admin-review
    if (ticket.assignedMechanicIds.length === 0 && ticket.status === 'assigned') {
      ticket.status = 'pending-admin-review';
    }

    ticket.updatedAt = new Date().toISOString();
    saveToStorage();
    return ticket;
  },

  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();

    // Add to status history
    if (!ticket.statusHistory) {
      ticket.statusHistory = [];
    }
    ticket.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      updatedBy: ticket.assignedMechanicId || 'system',
      notes: `Status changed from ${oldStatus} to ${status}`,
    });

    saveToStorage();
    return ticket;
  },

  async updateTicketNotes(ticketId: string, notes: string): Promise<Ticket> {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    ticket.notes = notes;
    ticket.updatedAt = new Date().toISOString();

    saveToStorage();
    return ticket;
  },

  async setRescheduleInfo(ticketId: string, info: RescheduleInfo): Promise<Ticket> {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    ticket.rescheduleInfo = info;
    ticket.updatedAt = new Date().toISOString();

    // Update status if scheduled date is set
    if (info.scheduledDate && info.scheduledTime) {
      ticket.status = 'rescheduled-awaiting-vehicle';
    } else if (info.requestedByMechanicId) {
      ticket.status = 'return-visit-required';
    }

    saveToStorage();
    return ticket;
  },

  async setMechanicIntake(ticketId: string, intake: MechanicIntake): Promise<Ticket> {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    ticket.mechanicIntake = intake;
    ticket.updatedAt = new Date().toISOString();

    // If ticket is assigned but not in-progress, move to in-progress after intake
    if (ticket.status === 'assigned') {
      ticket.status = 'in-progress';
      if (!ticket.statusHistory) {
        ticket.statusHistory = [];
      }
      ticket.statusHistory.push({
        status: 'in-progress',
        timestamp: new Date().toISOString(),
        updatedBy: intake.intakeMechanicId,
        notes: 'Pre-service intake completed',
      });
    }

    saveToStorage();
    return ticket;
  },

  async addAdditionalFinding(ticketId: string, finding: Omit<AdditionalFinding, 'id' | 'createdAt'>): Promise<Ticket> {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    if (!ticket.additionalFindings) {
      ticket.additionalFindings = [];
    }

    const newFinding: AdditionalFinding = {
      ...finding,
      id: `finding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    ticket.additionalFindings.push(newFinding);
    ticket.updatedAt = new Date().toISOString();

    saveToStorage();
    return ticket;
  },
};

export const ticketService: TicketService = inMemoryTicketService;


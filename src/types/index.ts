export type TicketStatus = 
  | 'pending-admin-review'
  | 'assigned'
  | 'in-progress'
  | 'return-visit-required'
  | 'rescheduled-awaiting-vehicle'
  | 'work-completed'
  | 'invoice-generated'
  | 'closed-paid';

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected';
export type NotificationMethod = 'text' | 'call' | 'email';
export type PhotoCategory = 
  | 'damage' 
  | 'dashboard-warning' 
  | 'vin-sticker' 
  | 'engine-bay' 
  | 'tires' 
  | 'interior' 
  | 'exterior'
  | 'other';

export interface VehiclePhoto {
  id: string;
  url: string;
  category: PhotoCategory;
  uploadedAt: string;
  uploadedBy: string; // customerId or employeeId
  description?: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  vin?: string;
  nickname?: string;
  photos?: VehiclePhoto[];
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  estimatedHours?: number;
  status?: 'pending' | 'in-progress' | 'completed';
}

export interface Part {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Labor {
  id: string;
  description: string;
  hours: number;
  hourlyRate: number;
  total: number;
}

export interface Photo {
  id: string;
  category: PhotoCategory;
  dataUrl: string;       // base64 or object URL
  description?: string;
  createdAt: string;
}

// Legacy alias for backward compatibility
export interface TicketPhoto extends Photo {
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface RescheduleInfo {
  reason: string;
  notes?: string;
  requestedByMechanicId?: string;
  scheduledDate?: string;  // ISO date string, e.g. "2025-01-15"
  scheduledTime?: string;  // time string, e.g. "10:30"
  photos?: Photo[];
}

export interface MechanicIntake {
  mileage: number;
  vin: string;
  engineType: string;
  transmissionType: 'automatic' | 'manual' | 'cvt' | 'other';
  drivetrain: 'fwd' | 'rwd' | 'awd' | '4x4' | 'other';
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'ev' | 'other';
  checkEngineLightOn: boolean;
  tireConditionNotes?: string;
  brakeConditionNotes?: string;
  fluidCheckNotes?: string;
  batteryHealthNotes?: string;
  exteriorDamageNotes?: string;
  intakeCompletedAt: string;       // ISO DateTime
  intakeMechanicId: string;
}

export interface AdditionalFinding {
  id: string;
  createdAt: string;          // ISO DateTime
  mechanicId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  requiresCustomerApproval: boolean;
  status: 'proposed' | 'approved' | 'declined';
  photos?: Photo[];
}

export interface Ticket {
  id: string;
  source: 'customer' | 'employee';
  customer: Customer;
  vehicle: Vehicle;
  services: Service[];
  symptoms?: string;
  notes?: string;
  photos: Photo[];
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedMechanicIds?: string[]; // Array of mechanic IDs - supports multiple mechanics per ticket
  // Legacy field for backward compatibility - will be migrated to assignedMechanicIds
  assignedMechanicId?: string | null;
  mechanicIntake?: MechanicIntake;
  additionalFindings?: AdditionalFinding[];
  rescheduleInfo?: RescheduleInfo | null;
  schedulingPreferences?: {
    dropoffDate?: string;
    dropoffTime?: string;
    pickupDate?: string;
    pickupTime?: string;
    notificationMethod?: 'text' | 'call' | 'email';
  };
  // Legacy fields for backward compatibility
  customerId?: string;
  vehicleId?: string;
  description?: string;
  assignedTo?: string;
  createdBy?: string;
  createdByType?: 'customer' | 'employee';
  estimatedCompletion?: string;
  preferredDropoff?: string;
  preferredPickup?: string;
  parts?: Part[];
  labor?: Labor[];
  statusHistory?: Array<{
    status: TicketStatus;
    timestamp: string;
    updatedBy: string;
    notes?: string;
  }>;
}

export interface Invoice {
  id: string;
  ticketId: string;
  customerId: string;
  vehicleId: string;
  status: InvoiceStatus;
  parts: Part[];
  labor: Labor[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  dueDate?: string;
  paidAt?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phone2?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  preferredNotification?: NotificationMethod;
  vehicles: string[];
  tickets: string[];
  invoices: string[];
  createdAt: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'mechanic' | 'admin' | 'manager';
  employeeId: string;
  assignedTickets: string[];
  isOnline?: boolean;
}

export interface Quote {
  id: string;
  customerId: string;
  vehicleId: string;
  status: QuoteStatus;
  services: Service[];
  parts: Part[];
  labor: Labor[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  createdAt: string;
  notes?: string;
}

// Payload types for ticket creation
export interface CustomerTicketPayload {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    notificationPreference: 'text' | 'call' | 'email';
  };
  vehicle: Vehicle;
  selectedServices: Array<{
    id: string;
    name: string;
    price?: number;
    subOptionId?: string;
    subOptionName?: string;
    symptoms?: string;
    photos?: string[]; // base64 URLs
  }>;
  schedulingPreferences: {
    pickupTime?: string;
    carStatus: 'in-shop' | 'not-in-shop';
    dropOffDate?: string;
  };
  photos?: Photo[];
}

export interface EmployeeTicketPayload {
  customer: Customer;
  vehicle: Vehicle;
  symptoms?: string;
  description?: string;
  selectedServices?: Service[];
  photos?: Photo[];
  schedulingPreferences?: {
    dropoffDate?: string;
    dropoffTime?: string;
    pickupDate?: string;
    pickupTime?: string;
    notificationMethod?: 'text' | 'call' | 'email';
  };
}


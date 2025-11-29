import { Quote } from '../types';

export const quotes: Quote[] = [
  {
    id: 'q1',
    customerId: 'c1',
    vehicleId: 'v2',
    status: 'sent',
    services: [
      { id: 's13', name: 'Transmission Service' },
      { id: 's14', name: 'Coolant Flush' },
    ],
    parts: [
      { id: 'p9', name: 'Transmission Fluid', quantity: 1, unitPrice: 89.99, total: 89.99 },
      { id: 'p10', name: 'Coolant', quantity: 1, unitPrice: 34.99, total: 34.99 },
    ],
    labor: [
      { id: 'l5', description: 'Transmission Service', hours: 2, hourlyRate: 95, total: 190 },
      { id: 'l6', description: 'Coolant System Flush', hours: 1, hourlyRate: 95, total: 95 },
    ],
    subtotal: 409.98,
    tax: 11.00,
    total: 420.98,
    validUntil: '2024-12-15T23:59:59Z',
    createdAt: '2024-11-25T14:00:00Z',
    notes: 'Recommended service based on mileage',
  },
  {
    id: 'q2',
    customerId: 'c2',
    vehicleId: 'v3',
    status: 'approved',
    services: [
      { id: 's15', name: 'Suspension Repair' },
    ],
    parts: [
      { id: 'p11', name: 'Front Struts (Pair)', quantity: 1, unitPrice: 299.99, total: 299.99 },
      { id: 'p12', name: 'Mounting Hardware', quantity: 1, unitPrice: 45.99, total: 45.99 },
    ],
    labor: [
      { id: 'l7', description: 'Strut Replacement', hours: 3, hourlyRate: 95, total: 285 },
    ],
    subtotal: 630.98,
    tax: 30.40,
    total: 661.38,
    validUntil: '2024-12-10T23:59:59Z',
    createdAt: '2024-11-20T10:00:00Z',
    notes: 'Customer approved - scheduling for next week',
  },
];


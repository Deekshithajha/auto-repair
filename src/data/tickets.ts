import { Ticket } from '../types';

export const tickets: Ticket[] = [
  {
    id: 't1',
    customerId: 'c1',
    vehicleId: 'v1',
    status: 'in-progress',
    description: 'Oil change and tire rotation',
    services: [
      { id: 's1', name: 'Oil Change', status: 'completed' },
      { id: 's2', name: 'Tire Rotation', status: 'in-progress' },
    ],
    assignedTo: 'e1',
    createdAt: '2024-11-28T09:00:00Z',
    updatedAt: '2024-11-29T10:30:00Z',
    estimatedCompletion: '2024-11-29T15:00:00Z',
    notes: 'Customer requested synthetic oil',
  },
  {
    id: 't2',
    customerId: 'c1',
    vehicleId: 'v2',
    status: 'open',
    description: 'Check engine light diagnosis',
    services: [
      { id: 's3', name: 'Diagnostic Scan', status: 'pending' },
      { id: 's4', name: 'Inspection', status: 'pending' },
    ],
    createdAt: '2024-11-29T08:00:00Z',
    updatedAt: '2024-11-29T08:00:00Z',
    estimatedCompletion: '2024-11-30T12:00:00Z',
  },
  {
    id: 't3',
    customerId: 'c2',
    vehicleId: 'v3',
    status: 'completed',
    description: 'Brake pad replacement',
    services: [
      { id: 's5', name: 'Front Brake Pads', status: 'completed' },
      { id: 's6', name: 'Rear Brake Pads', status: 'completed' },
      { id: 's7', name: 'Brake Fluid Flush', status: 'completed' },
    ],
    assignedTo: 'e2',
    createdAt: '2024-11-26T10:00:00Z',
    updatedAt: '2024-11-27T16:00:00Z',
    estimatedCompletion: '2024-11-27T16:00:00Z',
    parts: [
      { id: 'p1', name: 'Front Brake Pads', quantity: 1, unitPrice: 89.99, total: 89.99 },
      { id: 'p2', name: 'Rear Brake Pads', quantity: 1, unitPrice: 79.99, total: 79.99 },
      { id: 'p3', name: 'Brake Fluid', quantity: 1, unitPrice: 24.99, total: 24.99 },
    ],
    labor: [
      { id: 'l1', description: 'Brake Pad Installation', hours: 2.5, hourlyRate: 95, total: 237.50 },
    ],
  },
  {
    id: 't4',
    customerId: 'c3',
    vehicleId: 'v4',
    status: 'waiting-pickup',
    description: 'Annual maintenance service',
    services: [
      { id: 's8', name: 'Oil Change', status: 'completed' },
      { id: 's9', name: 'Tire Rotation', status: 'completed' },
      { id: 's10', name: 'Multi-Point Inspection', status: 'completed' },
      { id: 's11', name: 'Cabin Air Filter', status: 'completed' },
    ],
    assignedTo: 'e1',
    createdAt: '2024-11-27T11:00:00Z',
    updatedAt: '2024-11-28T14:00:00Z',
    estimatedCompletion: '2024-11-28T14:00:00Z',
  },
  {
    id: 't5',
    customerId: 'c3',
    vehicleId: 'v4',
    status: 'open',
    description: 'Alignment check',
    services: [
      { id: 's12', name: 'Wheel Alignment', status: 'pending' },
    ],
    createdAt: '2024-11-29T13:00:00Z',
    updatedAt: '2024-11-29T13:00:00Z',
    estimatedCompletion: '2024-11-30T10:00:00Z',
  },
];


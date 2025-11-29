import { Invoice } from '../types';

export const invoices: Invoice[] = [
  {
    id: 'i1',
    ticketId: 't1',
    customerId: 'c1',
    vehicleId: 'v1',
    status: 'pending',
    parts: [
      { id: 'p4', name: 'Synthetic Oil (5qt)', quantity: 1, unitPrice: 45.99, total: 45.99 },
      { id: 'p5', name: 'Oil Filter', quantity: 1, unitPrice: 12.99, total: 12.99 },
    ],
    labor: [
      { id: 'l2', description: 'Oil Change Service', hours: 0.5, hourlyRate: 95, total: 47.50 },
      { id: 'l3', description: 'Tire Rotation', hours: 0.5, hourlyRate: 95, total: 47.50 },
    ],
    subtotal: 153.98,
    tax: 5.39,
    total: 159.37,
    createdAt: '2024-11-29T10:30:00Z',
    dueDate: '2024-12-13T23:59:59Z',
  },
  {
    id: 'i2',
    ticketId: 't3',
    customerId: 'c2',
    vehicleId: 'v3',
    status: 'paid',
    parts: [
      { id: 'p1', name: 'Front Brake Pads', quantity: 1, unitPrice: 89.99, total: 89.99 },
      { id: 'p2', name: 'Rear Brake Pads', quantity: 1, unitPrice: 79.99, total: 79.99 },
      { id: 'p3', name: 'Brake Fluid', quantity: 1, unitPrice: 24.99, total: 24.99 },
    ],
    labor: [
      { id: 'l1', description: 'Brake Pad Installation', hours: 2.5, hourlyRate: 95, total: 237.50 },
    ],
    subtotal: 432.47,
    tax: 17.10,
    total: 449.57,
    createdAt: '2024-11-27T16:00:00Z',
    dueDate: '2024-12-11T23:59:59Z',
    paidAt: '2024-11-28T09:15:00Z',
  },
  {
    id: 'i3',
    ticketId: 't4',
    customerId: 'c3',
    vehicleId: 'v4',
    status: 'pending',
    parts: [
      { id: 'p6', name: 'Synthetic Oil (5qt)', quantity: 1, unitPrice: 45.99, total: 45.99 },
      { id: 'p7', name: 'Oil Filter', quantity: 1, unitPrice: 12.99, total: 12.99 },
      { id: 'p8', name: 'Cabin Air Filter', quantity: 1, unitPrice: 29.99, total: 29.99 },
    ],
    labor: [
      { id: 'l4', description: 'Annual Maintenance Service', hours: 1.5, hourlyRate: 95, total: 142.50 },
    ],
    subtotal: 231.47,
    tax: 7.85,
    total: 239.32,
    createdAt: '2024-11-28T14:00:00Z',
    dueDate: '2024-12-12T23:59:59Z',
  },
];


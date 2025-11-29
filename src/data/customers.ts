import { Customer } from '../types';

export const customers: Customer[] = [
  {
    id: 'c1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Seattle, WA 98101',
    vehicles: ['v1', 'v2'],
    tickets: ['t1', 't2'],
    invoices: ['i1'],
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'c2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '(555) 234-5678',
    address: '456 Oak Ave, Seattle, WA 98102',
    vehicles: ['v3'],
    tickets: ['t3'],
    invoices: ['i2'],
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 'c3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '(555) 345-6789',
    address: '789 Pine Rd, Seattle, WA 98103',
    vehicles: ['v4'],
    tickets: ['t4', 't5'],
    invoices: ['i3'],
    createdAt: '2024-03-10T09:15:00Z',
  },
];


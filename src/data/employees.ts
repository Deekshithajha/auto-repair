import { Employee } from '../types';

export const employees: Employee[] = [
  {
    id: 'e1',
    firstName: 'Marcus',
    lastName: 'Thompson',
    email: 'marcus.t@lakewood76.com',
    phone: '(555) 111-2222',
    role: 'mechanic',
    employeeId: 'EMP001',
    assignedTickets: ['t1', 't4'],
    isOnline: true,
  },
  {
    id: 'e2',
    firstName: 'David',
    lastName: 'Martinez',
    email: 'david.m@lakewood76.com',
    phone: '(555) 222-3333',
    role: 'mechanic',
    employeeId: 'EMP002',
    assignedTickets: ['t3'],
    isOnline: true,
  },
  {
    id: 'e3',
    firstName: 'Jennifer',
    lastName: 'Lee',
    email: 'jennifer.l@lakewood76.com',
    phone: '(555) 333-4444',
    role: 'admin',
    employeeId: 'ADM001',
    assignedTickets: [],
    isOnline: false,
  },
];


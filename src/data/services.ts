export interface ServiceOption {
  id: string;
  name: string;
  category: 'standard' | 'custom';
  description?: string;
  price?: number;
  priceType: 'fixed' | 'variable';
  icon?: string;
  subOptions?: {
    id: string;
    name: string;
    price?: number;
  }[];
}

export const services: ServiceOption[] = [
  // Standard Services (Fixed Price)
  {
    id: 'brake-job',
    name: 'Brake Job',
    category: 'standard',
    description: 'Brake pad and rotor service',
    priceType: 'fixed',
    subOptions: [
      { id: 'brake-front', name: 'Front Brakes', price: 299 },
      { id: 'brake-rear', name: 'Rear Brakes', price: 279 },
      { id: 'brake-both', name: 'Front & Rear', price: 549 },
    ],
  },
  {
    id: 'ac-service',
    name: 'AC Service',
    category: 'standard',
    description: 'Air conditioning inspection and recharge',
    price: 149,
    priceType: 'fixed',
  },
  {
    id: 'oil-change',
    name: 'Oil Change',
    category: 'standard',
    description: 'Engine oil and filter replacement',
    priceType: 'fixed',
    subOptions: [
      { id: 'oil-synthetic', name: 'Full Synthetic', price: 79 },
      { id: 'oil-blend', name: 'Synthetic Blend', price: 59 },
      { id: 'oil-conventional', name: 'Conventional', price: 45 },
    ],
  },
  {
    id: 'brake-flush',
    name: 'Brake Flush',
    category: 'standard',
    description: 'Brake fluid system flush and replacement',
    price: 99,
    priceType: 'fixed',
  },
  {
    id: 'coolant-flush',
    name: 'Coolant Flush',
    category: 'standard',
    description: 'Cooling system flush and refill',
    price: 129,
    priceType: 'fixed',
  },
  {
    id: 'tire-rotation',
    name: 'Tire Rotation',
    category: 'standard',
    description: 'Rotate and balance all four tires',
    price: 49,
    priceType: 'fixed',
  },
  {
    id: 'diagnostic',
    name: 'Diagnostic',
    category: 'standard',
    description: 'Computer diagnostic scan',
    price: 89,
    priceType: 'fixed',
  },
  {
    id: 'engine-wash',
    name: 'Engine Wash',
    category: 'standard',
    description: 'Engine bay cleaning and detailing',
    price: 79,
    priceType: 'fixed',
  },
  
  // Custom Services (Variable Pricing)
  {
    id: 'engine-replacement',
    name: 'Engine Replacement',
    category: 'custom',
    description: 'Complete engine replacement service',
    priceType: 'variable',
  },
  {
    id: 'transmission-service',
    name: 'Transmission Service',
    category: 'custom',
    description: 'Transmission repair or replacement',
    priceType: 'variable',
  },
  {
    id: 'belt-replacement',
    name: 'Belt Replacement',
    category: 'custom',
    description: 'Serpentine or timing belt replacement',
    priceType: 'variable',
  },
  {
    id: 'battery-service',
    name: 'Battery Services',
    category: 'custom',
    description: 'Battery testing, charging, or replacement',
    priceType: 'variable',
  },
  {
    id: 'rear-end-rebuild',
    name: 'Rear-End Rebuild',
    category: 'custom',
    description: 'Differential and rear axle service',
    priceType: 'variable',
  },
  {
    id: 'defective-part',
    name: 'Customer Return/Defective Part',
    category: 'custom',
    description: 'Diagnostic for returned or defective parts',
    priceType: 'variable',
  },
];


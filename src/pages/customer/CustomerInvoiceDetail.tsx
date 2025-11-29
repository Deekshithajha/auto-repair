import React from 'react';
import { useParams } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { invoices } from '../../data/invoices';
import { vehicles } from '../../data/vehicles';

export const CustomerInvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const invoice = invoices.find(i => i.id === id);
  const vehicle = invoice ? vehicles.find(v => v.id === invoice.vehicleId) : undefined;
  
  if (!invoice || !vehicle) {
    return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Invoice Not Found" showBack />
        <div className="px-4 py-6">
          <p className="text-text-muted text-center">Invoice not found</p>
        </div>
      </div>
    );
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title={`Invoice #${invoice.id.toUpperCase()}`} showBack />
      
      <div className="px-4 py-6 space-y-4">
        {/* Header Card */}
        <div className="bg-white rounded-card-lg p-6 shadow-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-text-muted text-sm mb-1">Invoice #{invoice.id.toUpperCase()}</p>
              <p className="text-text-main font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</p>
              <p className="text-text-muted text-sm">{vehicle.plate}</p>
            </div>
            <StatusBadge status={invoice.status} />
          </div>
          <div className="pt-4 border-t border-border-soft">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-muted">Created:</span>
              <span className="text-text-main font-medium">{formatDate(invoice.createdAt)}</span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Due:</span>
                <span className="text-text-main font-medium">{formatDate(invoice.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Parts */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-4">Parts (Taxable)</h3>
          <div className="space-y-3">
            {invoice.parts.map((part) => (
              <div key={part.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-text-main font-medium">{part.name}</p>
                  <p className="text-text-muted text-sm">Qty: {part.quantity} × {formatCurrency(part.unitPrice)}</p>
                </div>
                <p className="text-text-main font-semibold">{formatCurrency(part.total)}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Labor */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-4">Labor (Non-Taxable)</h3>
          <div className="space-y-3">
            {invoice.labor.map((labor) => (
              <div key={labor.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-text-main font-medium">{labor.description}</p>
                  <p className="text-text-muted text-sm">{labor.hours} hrs × {formatCurrency(labor.hourlyRate)}/hr</p>
                </div>
                <p className="text-text-main font-semibold">{formatCurrency(labor.total)}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Totals */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-main">Subtotal</span>
              <span className="text-text-main font-semibold">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-main">Tax</span>
              <span className="text-text-main font-semibold">{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t-2 border-border-soft">
              <span className="text-text-main text-lg font-semibold">Total</span>
              <span className="text-primary text-2xl font-bold">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-3 pb-4">
          <Button variant="primary" fullWidth onClick={() => {}}>
            Download PDF
          </Button>
          {invoice.status === 'pending' && (
            <Button variant="secondary" fullWidth onClick={() => {}}>
              Pay Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};


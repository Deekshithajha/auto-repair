import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface CustomerRegistrationProps {
  onSuccess?: () => void;
}

export const CustomerRegistration: React.FC<CustomerRegistrationProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!customerData.name.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return false;
    }
    if (!customerData.email.trim()) {
      toast({
        title: "Error", 
        description: "Email is required",
        variant: "destructive",
      });
      return false;
    }
    if (!customerData.password || customerData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return false;
    }
    if (customerData.password !== customerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: customerData.email,
        password: customerData.password,
        options: {
          data: {
            name: customerData.name,
            phone: customerData.phone
          }
        }
      });

      if (authError) {
        throw authError;
      }

      // Update the profile with phone if user was created
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone: customerData.phone })
          .eq('id', authData.user.id);

        if (profileError) {
          console.warn('Profile update failed:', profileError);
        }
      }

      toast({
        title: "Success",
        description: "Customer registered successfully!",
      });

      // Reset form
      setCustomerData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
      
      setOpen(false);
      onSuccess?.();
      
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <span className="mr-2">👤</span>
          Register New Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Customer</DialogTitle>
          <DialogDescription>
            Create a new customer account for service requests
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Full Name *</Label>
            <Input
              id="customer-name"
              type="text"
              placeholder="Enter customer's full name"
              value={customerData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer-email">Email Address *</Label>
            <Input
              id="customer-email"
              type="email"
              placeholder="customer@example.com"
              value={customerData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer-phone">Phone Number</Label>
            <Input
              id="customer-phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={customerData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer-password">Password *</Label>
            <Input
              id="customer-password"
              type="password"
              placeholder="At least 6 characters"
              value={customerData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer-confirm-password">Confirm Password *</Label>
            <Input
              id="customer-confirm-password"
              type="password"
              placeholder="Confirm password"
              value={customerData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Registering...' : 'Register Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
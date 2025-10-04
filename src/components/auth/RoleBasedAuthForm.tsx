import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type LoginMode = 'customer' | 'employee' | 'admin';

export const RoleBasedAuthForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('customer');
  const { signIn } = useAuth();

  // Customer login state
  const [customerData, setCustomerData] = useState({
    email: '',
    licensePlate: ''
  });

  // Employee/Admin login state
  const [staffData, setStaffData] = useState({
    systemId: '',
    password: ''
  });

  const handleCustomerLogin = async () => {
    setIsLoading(true);
    // For customer login with email + license plate
    // The license plate serves as the password or verification
    await signIn(customerData.licensePlate, customerData.email, 'license');
    setIsLoading(false);
  };

  const handleStaffLogin = async () => {
    setIsLoading(true);
    await signIn(staffData.systemId, staffData.password, 'system_id');
    setIsLoading(false);
  };

  const getModeConfig = (mode: LoginMode) => {
    switch (mode) {
      case 'employee':
        return {
          title: 'Employee Portal',
          subtitle: 'Access your work dashboard',
          color: 'bg-secondary'
        };
      case 'admin':
        return {
          title: 'Admin Portal',
          subtitle: 'Manage your business',
          color: 'bg-primary'
        };
      default:
        return {
          title: 'Customer Portal',
          subtitle: 'Track your service requests',
          color: 'bg-gradient-hero'
        };
    }
  };

  const modeConfig = getModeConfig(loginMode);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-background rounded-full shadow-glow mb-4">
            <div className="flex items-center space-x-1">
              <span className="text-2xl">🔧</span>
              <span className="text-2xl">🚗</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AUTO REPAIR INC</h1>
          <p className="text-white/90 text-lg">Auto Repair Excellence</p>
        </div>

        <Card className="shadow-glow border-0 bg-background/95 backdrop-blur">
          <CardHeader className="space-y-4">
            <Tabs value={loginMode} onValueChange={(value) => setLoginMode(value as LoginMode)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="employee">Employee</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="text-center">
              <CardTitle>{modeConfig.title}</CardTitle>
              <CardDescription>{modeConfig.subtitle}</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {loginMode === 'customer' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-email">Email Address</Label>
                  <Input 
                    id="customer-email" 
                    type="email" 
                    placeholder="your@email.com"
                    value={customerData.email} 
                    onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-license">License Plate Number</Label>
                  <Input 
                    id="customer-license" 
                    type="text" 
                    placeholder="ABC-1234"
                    value={customerData.licensePlate} 
                    onChange={(e) => setCustomerData(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your registered vehicle's license plate
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-id">System ID</Label>
                  <Input 
                    id="staff-id" 
                    type="text" 
                    placeholder={`${loginMode === 'admin' ? 'ADM' : 'EMP'}-0001`}
                    value={staffData.systemId} 
                    onChange={(e) => setStaffData(prev => ({ ...prev, systemId: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-password">Password</Label>
                  <Input 
                    id="staff-password" 
                    type="password"
                    value={staffData.password} 
                    onChange={(e) => setStaffData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={loginMode === 'customer' ? handleCustomerLogin : handleStaffLogin}
              className={`w-full ${modeConfig.color} hover:opacity-90 transition-opacity`} 
              disabled={isLoading || (
                loginMode === 'customer' 
                  ? !customerData.email || !customerData.licensePlate
                  : !staffData.systemId || !staffData.password
              )}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center text-white/60 text-sm mt-6">
          <p>🔧 AUTO REPAIR INC • Secure Login</p>
        </div>
      </div>
    </div>
  );
};

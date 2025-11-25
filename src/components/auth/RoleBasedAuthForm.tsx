import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerRegistration } from '@/components/customers/CustomerRegistration';

type LoginMode = 'customer' | 'employee' | 'admin';

export const RoleBasedAuthForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('customer');
  const { signIn, signUp } = useAuth();

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

  // Demo login support
  const demoUsers = {
    customer: { email: 'demo-customer@autorepair.com', password: 'demo123', name: 'Demo Customer' },
    employee: { email: 'demo-employee@autorepair.com', password: 'demo123', name: 'Demo Employee' },
    admin: { email: 'demo-admin@autorepair.com', password: 'demo123', name: 'Demo Admin' }
  } as const;

  const handleDemoLogin = async (role: 'customer' | 'employee' | 'admin') => {
    setIsLoading(true);
    const demo = demoUsers[role];
    const attempt = await signIn(demo.email, demo.password);
    if (attempt.error) {
      await signUp(demo.email, demo.password, demo.name);
      await signIn(demo.email, demo.password);
    }
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.05),transparent_50%)]" />
      
      {/* Foreground content */}
      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-[440px]">
          {/* Logo/Brand Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <img 
                  src="/lakewood-logo.png" 
                  alt="Lakewood 76 Auto Repair" 
                  className="relative h-20 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Lakewood 76 Auto Repair
            </h1>
            <p className="text-slate-400 text-sm font-medium">Professional Auto Service & Repair</p>
          </div>

          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-6 pb-6">
              <Tabs value={loginMode} onValueChange={(value) => setLoginMode(value as LoginMode)}>
                <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 p-1">
                  <TabsTrigger 
                    value="customer"
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
                  >
                    Customer
                  </TabsTrigger>
                  <TabsTrigger 
                    value="employee"
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
                  >
                    Employee
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin"
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
                  >
                    Admin
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="text-center space-y-1">
                <CardTitle className="text-2xl text-white">{modeConfig.title}</CardTitle>
                <CardDescription className="text-slate-400">{modeConfig.subtitle}</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {loginMode === 'customer' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="customer-email" className="text-slate-300 font-medium">Email Address</Label>
                    <Input 
                      id="customer-email" 
                      type="email" 
                      placeholder="your@email.com"
                      value={customerData.email} 
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={isLoading}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/20 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-license" className="text-slate-300 font-medium">License Plate Number</Label>
                    <Input 
                      id="customer-license" 
                      type="text" 
                      placeholder="ABC-1234"
                      value={customerData.licensePlate} 
                      onChange={(e) => setCustomerData(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                      disabled={isLoading}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/20 h-11 uppercase"
                    />
                    <p className="text-xs text-slate-500">
                      Enter your registered vehicle's license plate
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="staff-id" className="text-slate-300 font-medium">System ID</Label>
                    <Input 
                      id="staff-id" 
                      type="text" 
                      placeholder={`${loginMode === 'admin' ? 'ADM' : 'EMP'}-0001`}
                      value={staffData.systemId} 
                      onChange={(e) => setStaffData(prev => ({ ...prev, systemId: e.target.value }))}
                      disabled={isLoading}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-secondary focus:ring-secondary/20 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-password" className="text-slate-300 font-medium">Password</Label>
                    <Input 
                      id="staff-password" 
                      type="password"
                      value={staffData.password} 
                      onChange={(e) => setStaffData(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isLoading}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-secondary focus:ring-secondary/20 h-11"
                    />
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button 
                onClick={loginMode === 'customer' ? handleCustomerLogin : handleStaffLogin}
                className="w-full h-11 font-semibold text-base shadow-lg" 
                variant={loginMode === 'customer' ? 'default' : loginMode === 'employee' ? 'secondary' : 'default'}
                disabled={isLoading || (
                  loginMode === 'customer' 
                    ? !customerData.email || !customerData.licensePlate
                    : !staffData.systemId || !staffData.password
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : 'Sign In'}
              </Button>
              
              {loginMode === 'customer' && (
                <CustomerRegistration
                  trigger={
                    <Button variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-slate-800">
                      New customer? Create an account
                    </Button>
                  }
                />
              )}
            </CardFooter>
          </Card>

          {loginMode === 'customer' && (
            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-950 px-2 text-slate-500">Quick Demo Access</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('customer')}
                  disabled={isLoading}
                  className="bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white h-9"
                >
                  Customer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('employee')}
                  disabled={isLoading}
                  className="bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white h-9"
                >
                  Employee
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={isLoading}
                  className="bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white h-9"
                >
                  Admin
                </Button>
              </div>
              <p className="text-center text-xs text-slate-600">
                demo-[role]@autorepair.com • demo123
              </p>
            </div>
          )}

          <div className="text-center mt-8 text-xs text-slate-600">
            <p>© 2024 Lakewood 76 Auto Repair Inc. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

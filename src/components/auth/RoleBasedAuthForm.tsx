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
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated SVG Background */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="gradBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0b1220" />
            <stop offset="100%" stopColor="#141a2a" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6ee7ff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6ee7ff" stopOpacity="0" />
          </radialGradient>
          <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="24" />
          </filter>
        </defs>

        <rect x="0" y="0" width="1440" height="900" fill="url(#gradBg)" />
        {/* Ambient glows */}
        <circle cx="250" cy="180" r="180" fill="url(#glow)" filter="url(#softBlur)" />
        <circle cx="1220" cy="720" r="220" fill="url(#glow)" filter="url(#softBlur)" />

        {/* Rotating gears */}
        <g transform="translate(240 580)">
          <g style={{ transformOrigin: 'center', animation: 'spin-slow 32s linear infinite' as any }}>
            <circle r="90" fill="none" stroke="#657089" strokeWidth="6" />
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x="-6" y="-104" width="12" height="24" fill="#8fa3c0" transform={`rotate(${i * 30})`} rx="3" />
            ))}
            <circle r="12" fill="#8fa3c0" />
          </g>
        </g>

        <g transform="translate(1160 260)">
          <g style={{ transformOrigin: 'center', animation: 'spin 18s linear infinite' as any }}>
            <circle r="60" fill="none" stroke="#7a86a8" strokeWidth="5" />
            {Array.from({ length: 10 }).map((_, i) => (
              <rect key={i} x="-5" y="-72" width="10" height="18" fill="#a6b4d3" transform={`rotate(${i * 36})`} rx="2" />
            ))}
            <circle r="10" fill="#a6b4d3" />
          </g>
        </g>

        <g transform="translate(920 680)">
          <g style={{ transformOrigin: 'center', animation: 'spin-slower 46s linear infinite reverse' as any }}>
            <circle r="110" fill="none" stroke="#4f5a78" strokeWidth="6" />
            {Array.from({ length: 14 }).map((_, i) => (
              <rect key={i} x="-7" y="-126" width="14" height="28" fill="#6d7aa0" transform={`rotate(${i * 25.714})`} rx="3" />
            ))}
            <circle r="14" fill="#6d7aa0" />
          </g>
        </g>

        {/* Floating bolts */}
        {[
          { x: 180, y: 220, d: 36, delay: 0 },
          { x: 360, y: 140, d: 28, delay: 2 },
          { x: 1080, y: 760, d: 34, delay: 1.2 },
          { x: 1280, y: 620, d: 26, delay: 3.1 },
          { x: 720, y: 180, d: 30, delay: 0.7 }
        ].map((b, idx) => (
          <g key={idx} transform={`translate(${b.x} ${b.y})`} style={{ animation: `float ${14 + b.delay}s ease-in-out ${b.delay}s infinite alternate` as any }}>
            <circle r={b.d / 2} fill="none" stroke="#3e4761" strokeWidth="2" />
            <circle r={b.d / 6} fill="#96a7c7" />
          </g>
        ))}

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes spin-slower { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes float { from { transform: translateY(-8px); } to { transform: translateY(8px); } }
        `}</style>
      </svg>

      {/* Foreground content */}
      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md">
        {/* Logo/Brand Header */}
        <div className="text-center mb-8">
          {/* Animated mascot: car enters mechanic shop "76" */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full shadow-glow mb-4" style={{ background: 'radial-gradient(ellipse at center, rgba(110,231,255,0.25), rgba(110,231,255,0))' }}>
            <svg width="96" height="96" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Animated car entering shop 76">
              <defs>
                <clipPath id="circleMask"><circle cx="60" cy="60" r="58"/></clipPath>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0b1220"/>
                  <stop offset="100%" stopColor="#141a2a"/>
                </linearGradient>
                <style>{`
                  /* Looping glide for the mascot car */
                  @keyframes driveIn {
                    0% { transform: translateX(-70px); }
                    50% { transform: translateX(8px); }
                    100% { transform: translateX(12px); }
                  }
                  /* Door cycles up and down in sync */
                  @keyframes doorUp {
                    0%, 40% { transform: translateY(0px); }
                    60%, 100% { transform: translateY(-26px); }
                  }
                  /* Ensure reliable transform behavior across browsers */
                  g.anim { transform-box: fill-box; transform-origin: center; will-change: transform; }
                  @media (prefers-reduced-motion: reduce) {
                    g[aria-label='car'] { animation: none; transform: translateX(12px); }
                    g[aria-label='door'] { animation: none; transform: translateY(-26px); }
                  }
                `}</style>
              </defs>
              <g clipPath="url(#circleMask)">
                {/* background */}
                <rect x="0" y="0" width="120" height="120" fill="url(#sky)"/>
                {/* ground */}
                <rect x="0" y="84" width="120" height="36" fill="#2a334a"/>
                {/* shop body */}
                <g transform="translate(60,30)">
                  <rect x="-4" y="16" width="56" height="46" rx="4" fill="#1d2a46" stroke="#3b4a6a" strokeWidth="2"/>
                  {/* shop label box */}
                  <rect x="6" y="-2" width="26" height="18" rx="3" fill="#1e3a8a" stroke="#4c6fbf" strokeWidth="1.5"/>
                  <text x="19" y="11" textAnchor="middle" fontFamily="Inter, system-ui, -apple-system" fontSize="10" fontWeight="700" fill="#93c5fd">76</text>
                  {/* garage door frame */}
                  <rect x="26" y="28" width="22" height="30" fill="#0f172a" stroke="#3b4a6a" strokeWidth="1.5"/>
                  {/* sliding door */}
                  <g aria-label="door" className="anim" style={{ transformOrigin: '47px 58px', animation: 'doorUp 12s ease-in-out 0.2s infinite alternate' as any }}>
                    <rect x="26" y="28" width="22" height="30" fill="#334155"/>
                    {Array.from({length:4}).map((_,i)=> (
                      <rect key={i} x="28" y={31 + i*7} width="18" height="3" fill="#64748b"/>
                    ))}
                  </g>
                  {/* small window */}
                  <rect x="-0.5" y="30" width="18" height="12" fill="#1e40af" stroke="#60a5fa" strokeWidth="1"/>
                </g>
                {/* driveway */}
                <rect x="60" y="78" width="40" height="6" fill="#3b465f"/>
                {/* car */}
                <g aria-label="car" className="anim" style={{ animation: 'driveIn 12s cubic-bezier(.28,.75,.25,1) 0s infinite alternate' as any }}>
                  {/* wheels */}
                  <g transform="translate(0,0)">
                    <circle cx="76" cy="88" r="6" fill="#0d47a1" stroke="#1e3a8a" strokeWidth="2"/>
                    <circle cx="94" cy="88" r="6" fill="#0d47a1" stroke="#1e3a8a" strokeWidth="2"/>
                  </g>
                  {/* body */}
                  <path d="M68 76 h26 a6 6 0 0 1 6 6 v6 h-4 v4 a4 4 0 0 1 -4 4 h-22 a4 4 0 0 1 -4 -4 v-16 z" fill="#d32f2f" stroke="#7b0000" strokeWidth="2"/>
                  {/* cabin */}
                  <path d="M72 76 l10 -8 h10 l8 8 v8 h-28 z" fill="#ff6b6b" stroke="#d32f2f" strokeWidth="2"/>
                  {/* windows */}
                  <rect x="76" y="72" width="10" height="8" fill="#4fc3f7" stroke="#0d47a1" strokeWidth="1.5"/>
                  <rect x="88" y="72" width="10" height="8" fill="#4fc3f7" stroke="#0d47a1" strokeWidth="1.5"/>
                  {/* headlight */}
                  <circle cx="100" cy="84" r="2" fill="#fde68a"/>
                </g>
              </g>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AUTO REPAIR INC</h1>
          <p className="text-white/90 text-lg">Auto Repair Excellence</p>
        </div>

        <Card className="shadow-glow border-0 bg-background/90 backdrop-blur">
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

        {loginMode === 'customer' && (
          <div className="text-center mt-4 space-y-4">
            <CustomerRegistration
              trigger={
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  New here? Register
                </Button>
              }
            />
            <div className="space-y-2">
              <p className="text-white/80 text-sm">Quick Demo Access</p>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('customer')}
                  disabled={isLoading}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Customer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('employee')}
                  disabled={isLoading}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Employee
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={isLoading}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Admin
                </Button>
              </div>
              <div className="text-white/70 text-xs">
                <p>Demo email: demo-[role]@autorepair.com • Password: demo123</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-white/60 text-sm mt-6">
          <p>🔧 AUTO REPAIR INC • Secure Login</p>
        </div>
        </div>
      </div>
    </div>
  );
};

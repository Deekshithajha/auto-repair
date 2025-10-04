import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

type LoginMode = 'customer' | 'employee' | 'admin';

export const AuthForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('customer');
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const { signIn, signUp } = useAuth();

  // Demo login credentials
  const demoUsers = {
    customer: { email: 'demo-customer@97auto.com', password: 'demo123', name: 'Demo Customer' },
    employee: { email: 'demo-employee@97auto.com', password: 'demo123', name: 'Demo Employee' },
    admin: { email: 'demo-admin@97auto.com', password: 'demo123', name: 'Demo Admin' }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn(formData.email, formData.password);
    setIsLoading(false);
  };

  const handleSignUp = async () => {
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    setIsLoading(true);
    await signUp(formData.email, formData.password, formData.name);
    setIsLoading(false);
  };

  const handleDemoLogin = async (role: 'customer' | 'employee' | 'admin') => {
    setIsLoading(true);
    const demoUser = demoUsers[role];
    
    // Try to sign in first
    const signInResult = await signIn(demoUser.email, demoUser.password);
    
    // If sign in fails, create the account
    if (signInResult.error) {
      await signUp(demoUser.email, demoUser.password, demoUser.name);
    }
    
    setIsLoading(false);
  };

  const getModeConfig = (mode: LoginMode) => {
    switch (mode) {
      case 'employee':
        return {
          title: 'Employee Access',
          subtitle: 'Access your work dashboard',
          gradient: 'bg-gradient-secondary'
        };
      case 'admin':
        return {
          title: 'Admin Portal',
          subtitle: 'Manage your business',
          gradient: 'bg-gradient-primary'
        };
      default:
        return {
          title: 'Customer Portal',
          subtitle: 'Track your service requests',
          gradient: 'bg-gradient-hero'
        };
    }
  };

  const modeConfig = getModeConfig(loginMode);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Role Switching Buttons - Top Right Style */}
        <div className="flex justify-end mb-4 space-x-1 sm:space-x-2">
          <Button
            variant={loginMode === 'employee' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLoginMode('employee')}
            className={`text-xs sm:text-sm px-2 sm:px-3 ${loginMode === 'employee' 
              ? 'bg-secondary hover:bg-secondary/90' 
              : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            Employee
          </Button>
          <Button
            variant={loginMode === 'admin' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLoginMode('admin')}
            className={`text-xs sm:text-sm px-2 sm:px-3 ${loginMode === 'admin' 
              ? 'bg-primary hover:bg-primary/90' 
              : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            Admin
          </Button>
        </div>

        {/* Logo/Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-background rounded-full shadow-glow mb-4">
            <div className="flex items-center space-x-1">
              <span className="text-xl sm:text-2xl">🔧</span>
              <span className="text-xl sm:text-2xl">🚗</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">AUTO REPAIR INC</h1>
          <p className="text-white/90 text-base sm:text-lg">Auto Repair Excellence</p>
          
          {/* Mode Indicator */}
          <div className="mt-4 flex items-center justify-center space-x-2">
            <span className="text-white/80 font-medium text-sm sm:text-base">{modeConfig.title}</span>
          </div>
        </div>

        <Card className="shadow-glow border-0 bg-background/95 backdrop-blur">
          <CardHeader className="space-y-1">
            {/* Tab Navigation */}
            <div className="grid w-full grid-cols-2 bg-muted p-1 rounded-md">
              <button
                onClick={() => setIsSignUp(false)}
                className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${
                  !isSignUp 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${
                  isSignUp 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>
            <CardDescription className="text-center text-muted-foreground">
              {modeConfig.subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="signup-name" className="text-sm font-medium">Full Name</label>
                <Input 
                  id="signup-name" 
                  type="text" 
                  placeholder="John Doe" 
                  value={formData.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)} 
                  className="focus:ring-primary" 
                />
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input 
                id="email" 
                type="email" 
                placeholder={loginMode === 'customer' ? 'your@email.com' : `${loginMode}@autorepairinc.com`}
                value={formData.email} 
                onChange={(e) => handleInputChange('email', e.target.value)} 
                className="focus:ring-primary" 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password} 
                onChange={(e) => handleInputChange('password', e.target.value)} 
                className="focus:ring-primary" 
              />
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={formData.confirmPassword} 
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)} 
                  className="focus:ring-primary" 
                />
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={isSignUp ? handleSignUp : handleSignIn} 
              className={`w-full ${modeConfig.gradient} hover:opacity-90 transition-opacity`} 
              disabled={isLoading || (isSignUp && formData.password !== formData.confirmPassword)}
            >
              {isLoading ? 'Loading...' : (isSignUp ? `Create ${modeConfig.title.replace(' Access', '').replace(' Portal', '')} Account` : `Sign In to ${modeConfig.title}`)}
            </Button>
          </CardFooter>
        </Card>

        {/* Demo Login Section - More Compact */}
        {loginMode === 'customer' && (
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-white/70 text-sm">Quick Demo Access</p>
            </div>
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('customer')}
                disabled={isLoading}
                className="bg-white/5 text-white border-white/20 hover:bg-white/10 text-xs px-2"
              >
                Customer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('employee')}
                disabled={isLoading}
                className="bg-white/5 text-white border-white/20 hover:bg-white/10 text-xs px-2"
              >
                Employee
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="bg-white/5 text-white border-white/20 hover:bg-white/10 text-xs px-2"
              >
                Admin
              </Button>
            </div>
          </div>
        )}

        <div className="text-center text-white/60 text-sm mt-6">
          <p>🔧 AUTO REPAIR INC • No email confirmation required</p>
        </div>
      </div>
    </div>
  );
};

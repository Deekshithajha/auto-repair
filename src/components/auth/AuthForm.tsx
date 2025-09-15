import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Wrench, Car, UserCircle, Shield, Users } from 'lucide-react';

type LoginMode = 'customer' | 'employee' | 'admin';

export const AuthForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('customer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const {
    signIn,
    signUp
  } = useAuth();

  // Demo login credentials
  const demoUsers = {
    customer: { email: 'demo-customer@autorepair.com', password: 'demo123', name: 'Demo Customer' },
    employee: { email: 'demo-employee@autorepair.com', password: 'demo123', name: 'Demo Employee' },
    admin: { email: 'demo-admin@autorepair.com', password: 'demo123', name: 'Demo Admin' }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(formData.email, formData.password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
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
          icon: UserCircle,
          gradient: 'bg-gradient-secondary',
          color: 'text-secondary'
        };
      case 'admin':
        return {
          title: 'Admin Portal',
          subtitle: 'Manage your business',
          icon: Shield,
          gradient: 'bg-gradient-primary',
          color: 'text-primary'
        };
      default:
        return {
          title: 'Customer Portal',
          subtitle: 'Track your service requests',
          icon: Users,
          gradient: 'bg-gradient-hero',
          color: 'text-primary'
        };
    }
  };

  const modeConfig = getModeConfig(loginMode);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        {/* Role Switching Buttons - Top Right Style */}
        <div className="flex justify-end mb-4 space-x-2">
          <Button
            variant={loginMode === 'employee' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLoginMode('employee')}
            className={loginMode === 'employee' 
              ? 'bg-secondary hover:bg-secondary/90' 
              : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }
          >
            <UserCircle className="h-4 w-4 mr-1" />
            Employee
          </Button>
          <Button
            variant={loginMode === 'admin' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLoginMode('admin')}
            className={loginMode === 'admin' 
              ? 'bg-primary hover:bg-primary/90' 
              : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }
          >
            <Shield className="h-4 w-4 mr-1" />
            Admin
          </Button>
        </div>

        {/* Logo/Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-background rounded-full shadow-glow mb-4">
            <div className="flex items-center space-x-1">
              <Wrench className="h-7 w-7 text-primary" />
              <Car className="h-7 w-7 text-secondary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">97</h1>
          <p className="text-white/90 text-lg">Auto Repair Excellence</p>
          
          {/* Mode Indicator */}
          <div className="mt-4 flex items-center justify-center space-x-2">
            <modeConfig.icon className={`h-5 w-5 ${modeConfig.color === 'text-primary' ? 'text-white' : 'text-white'}`} />
            <span className="text-white/80 font-medium">{modeConfig.title}</span>
          </div>
        </div>

        <Card className="shadow-glow border-0 bg-background/95 backdrop-blur">
          <Tabs defaultValue="signin" className="w-full">
            <CardHeader className="space-y-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <CardDescription className="text-center text-muted-foreground">
                {modeConfig.subtitle}
              </CardDescription>
            </CardHeader>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder={loginMode === 'customer' ? 'your@email.com' : `${loginMode}@97auto.com`}
                      value={formData.email} 
                      onChange={handleInputChange} 
                      required 
                      className="focus:ring-primary" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      value={formData.password} 
                      onChange={handleInputChange} 
                      required 
                      className="focus:ring-primary" 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className={`w-full ${modeConfig.gradient} hover:opacity-90 transition-opacity`} 
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In to {modeConfig.title}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input 
                      id="signup-name" 
                      name="name" 
                      type="text" 
                      placeholder="John Doe" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required 
                      className="focus:ring-primary" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      name="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      required 
                      className="focus:ring-primary" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      name="password" 
                      type="password" 
                      value={formData.password} 
                      onChange={handleInputChange} 
                      required 
                      className="focus:ring-primary" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      value={formData.confirmPassword} 
                      onChange={handleInputChange} 
                      required 
                      className="focus:ring-primary" 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className={`w-full ${modeConfig.gradient} hover:opacity-90 transition-opacity`} 
                    disabled={isLoading || formData.password !== formData.confirmPassword}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create {modeConfig.title.replace(' Access', '').replace(' Portal', '')} Account
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Demo Login Section - More Compact */}
        {loginMode === 'customer' && (
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-white/70 text-sm">Quick Demo Access</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('customer')}
                disabled={isLoading}
                className="bg-white/5 text-white border-white/20 hover:bg-white/10 text-xs"
              >
                Customer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('employee')}
                disabled={isLoading}
                className="bg-white/5 text-white border-white/20 hover:bg-white/10 text-xs"
              >
                Employee
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="bg-white/5 text-white border-white/20 hover:bg-white/10 text-xs"
              >
                Admin
              </Button>
            </div>
          </div>
        )}

        <div className="text-center text-white/60 text-sm mt-6">
          <p>🔧 97 Auto Repair • No email confirmation required</p>
        </div>
      </div>
    </div>
  );
};
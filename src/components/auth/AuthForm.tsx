import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Wrench, Car } from 'lucide-react';
export const AuthForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
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
  return <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-background rounded-full shadow-elegant mb-4">
            <div className="flex items-center space-x-1">
              <Wrench className="h-6 w-6 text-primary" />
              <Car className="h-6 w-6 text-secondary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AutoRepair Pro</h1>
          <p className="text-white/80">Professional auto repair management</p>
        </div>

        <Card className="shadow-glow border-0 bg-background/95 backdrop-blur">
          <Tabs defaultValue="signin" className="w-full">
            <CardHeader className="space-y-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} required className="focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required className="focus:ring-primary" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleInputChange} required className="focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} required className="focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" name="password" type="password" value={formData.password} onChange={handleInputChange} required className="focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required className="focus:ring-primary" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-gradient-secondary hover:opacity-90 transition-opacity" disabled={isLoading || formData.password !== formData.confirmPassword}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Demo Login Section */}
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <p className="text-white/80 text-sm mb-3">Quick Demo Access</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('customer')}
              disabled={isLoading}
              className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Demo as Customer
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('employee')}
              disabled={isLoading}
              className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Demo as Employee
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Demo as Admin
            </Button>
          </div>
        </div>

        <div className="text-center text-white/60 text-sm mt-6">
          <p>Secure login • Demo accounts ready</p>
        </div>
      </div>
    </div>;
};
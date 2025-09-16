import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Car, Wrench, Key } from 'lucide-react';

interface LoginProps {
  onSubmit?: (credentials: { email: string; password: string; rememberMe: boolean }) => void;
  theme?: 'red' | 'blue';
}

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormState {
  isLoading: boolean;
  showPassword: boolean;
  error: string | null;
  success: string | null;
}

export const Login: React.FC<LoginProps> = ({ onSubmit, theme = 'blue' }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    showPassword: false,
    error: null,
    success: null,
  });

  const isRedTheme = theme === 'red';
  const primaryColor = isRedTheme ? 'auto-red' : 'auto-blue';
  const accentColor = isRedTheme ? 'auto-blue' : 'auto-red';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (formState.error) {
      setFormState(prev => ({ ...prev, error: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setFormState(prev => ({ 
        ...prev, 
        error: 'Please fill in all required fields' 
      }));
      return;
    }

    setFormState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      success: null 
    }));

    try {
      if (onSubmit) {
        await onSubmit(formData);
        // Success is handled by the auth system
        setFormState(prev => ({ 
          ...prev, 
          isLoading: false, 
          success: 'Welcome back! Login successful.' 
        }));
      }
    } catch (error) {
      setFormState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Invalid credentials. Please try again.' 
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setFormState(prev => ({ 
      ...prev, 
      showPassword: !prev.showPassword 
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='wrench-red'%3E%3Cpath d='M25 25 L40 10 L47 17 L32 32 L25 25 Z' fill='none' stroke='%23D32F2F' stroke-width='3'/%3E%3Ccircle cx='25' cy='25' r='12' fill='none' stroke='%23D32F2F' stroke-width='3'/%3E%3Ccircle cx='25' cy='25' r='6' fill='%23FF6B6B'/%3E%3C/g%3E%3Cg id='tire-blue'%3E%3Ccircle cx='75' cy='75' r='15' fill='none' stroke='%231976D2' stroke-width='3'/%3E%3Ccircle cx='75' cy='75' r='10' fill='none' stroke='%231976D2' stroke-width='2'/%3E%3Ccircle cx='75' cy='75' r='5' fill='%234FC3F7'/%3E%3Cpath d='M60 75 L90 75 M75 60 L75 90' stroke='%231976D2' stroke-width='2'/%3E%3C/g%3E%3Cg id='key-red'%3E%3Ccircle cx='25' cy='105' r='8' fill='none' stroke='%23D32F2F' stroke-width='3'/%3E%3Crect x='30' y='100' width='15' height='10' fill='%23FF6B6B' stroke='%23D32F2F' stroke-width='2'/%3E%3Cpath d='M45 105 L55 105' stroke='%23D32F2F' stroke-width='3'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Sculpted Background Panel */}
      <div className={`absolute inset-0 ${isRedTheme ? 'bg-auto-red-200' : 'bg-auto-blue-200'} opacity-20`}>
        <div 
          className={`absolute top-0 right-0 w-2/3 h-full ${isRedTheme ? 'bg-auto-red-400' : 'bg-auto-blue-400'} opacity-30`}
          style={{
            clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)',
          }}
        />
        <div 
          className={`absolute bottom-0 left-0 w-1/2 h-1/2 ${isRedTheme ? 'bg-auto-blue-400' : 'bg-auto-red-400'} opacity-20`}
          style={{
            clipPath: 'ellipse(100% 100% at 0% 100%)',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Panel - Mascot & Branding */}
            <div className="space-y-8">
              {/* Brand Header */}
              <div className="space-y-4">
                <h1 className={`text-5xl font-bold font-['Poppins'] ${isRedTheme ? 'text-auto-red-900' : 'text-auto-blue-900'}`}>
                  AutoFix Pro
                </h1>
                <p className={`text-xl ${isRedTheme ? 'text-auto-red-600' : 'text-auto-blue-600'} font-medium`}>
                  Your trusted repair partner
                </p>
              </div>

              {/* Mascot Container */}
              <div className="relative">
                {/* Floating decorative elements */}
                <div className={`absolute -top-4 -right-4 w-16 h-16 ${isRedTheme ? 'bg-auto-blue-400' : 'bg-auto-red-400'} rounded-full opacity-30 animate-float-gentle`} />
                <div className={`absolute -bottom-4 -left-4 w-12 h-12 ${isRedTheme ? 'bg-auto-red-400' : 'bg-auto-blue-400'} rounded-full opacity-40 animate-float-gentle`} style={{ animationDelay: '1s' }} />
                
                {/* Mascot SVG */}
                <div className="animate-mascot-bob">
                  <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Car Body (Red) */}
                    <path d="M60 180 L60 150 C60 130 75 115 95 115 L185 115 C205 115 220 130 220 150 L220 180 L210 180 L210 200 C210 215 195 230 180 230 L100 230 C85 230 70 215 70 200 L70 180 L60 180 Z" fill="#D32F2F" stroke="#7B0000" strokeWidth="3"/>
                    
                    {/* Car Windows (Blue) */}
                    <rect x="75" y="130" width="40" height="35" fill="#4FC3F7" stroke="#0D47A1" strokeWidth="2"/>
                    <rect x="165" y="130" width="40" height="35" fill="#4FC3F7" stroke="#0D47A1" strokeWidth="2"/>
                    
                    {/* Car Roof (Red) */}
                    <path d="M75 130 L140 100 L205 130 L205 165 L75 165 Z" fill="#FF6B6B" stroke="#D32F2F" strokeWidth="3"/>
                    
                    {/* Wheels (Blue) */}
                    <circle cx="100" cy="200" r="20" fill="#1976D2" stroke="#0D47A1" strokeWidth="3"/>
                    <circle cx="180" cy="200" r="20" fill="#1976D2" stroke="#0D47A1" strokeWidth="3"/>
                    
                    {/* Wheel Centers (Red) */}
                    <circle cx="100" cy="200" r="12" fill="#FF6B6B" stroke="#D32F2F" strokeWidth="2"/>
                    <circle cx="180" cy="200" r="12" fill="#FF6B6B" stroke="#D32F2F" strokeWidth="2"/>
                    
                    {/* Mechanic Character (Blue) */}
                    <circle cx="140" cy="80" r="25" fill="#BBDEFB" stroke="#1976D2" strokeWidth="3"/>
                    
                    {/* Mechanic Hat (Red) */}
                    <ellipse cx="140" cy="65" rx="22" ry="10" fill="#D32F2F" stroke="#7B0000" strokeWidth="2"/>
                    
                    {/* Eyes (Blue) */}
                    <circle cx="133" cy="78" r="3" fill="#0D47A1"/>
                    <circle cx="147" cy="78" r="3" fill="#0D47A1"/>
                    
                    {/* Smile (Red) */}
                    <path d="M133 88 Q140 95 147 88" stroke="#D32F2F" strokeWidth="3" fill="none"/>
                    
                    {/* Wrench in hand (Blue) */}
                    <path d="M165 90 L180 75 L187 82 L172 97 Z" fill="#1976D2" stroke="#0D47A1" strokeWidth="2"/>
                    <circle cx="165" cy="90" r="4" fill="#4FC3F7" stroke="#1976D2" strokeWidth="2"/>
                    
                    {/* Sparkles (Red and Blue alternating) */}
                    <path d="M40 60 L47 67 L40 74 L33 67 Z" fill="#FF6B6B"/>
                    <path d="M240 90 L247 97 L240 104 L233 97 Z" fill="#4FC3F7"/>
                    <path d="M30 120 L37 127 L30 134 L23 127 Z" fill="#FF6B6B"/>
                    <path d="M250 150 L257 157 L250 164 L243 157 Z" fill="#4FC3F7"/>
                    
                    {/* Exhaust (Blue) */}
                    <ellipse cx="50" cy="160" rx="12" ry="5" fill="#BBDEFB" opacity="0.8"/>
                    <ellipse cx="42" cy="150" rx="10" ry="4" fill="#BBDEFB" opacity="0.6"/>
                    <ellipse cx="34" cy="140" rx="8" ry="3" fill="#BBDEFB" opacity="0.4"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Panel - Login Card */}
            <div className="flex justify-center lg:justify-end">
              <Card 
                className={`w-full max-w-md shadow-2xl border-0 ${isRedTheme ? 'bg-auto-red-200' : 'bg-auto-blue-200'} backdrop-blur-sm relative overflow-hidden`}
                style={{
                  boxShadow: isRedTheme 
                    ? '0 25px 50px rgba(123, 0, 0, 0.15)' 
                    : '0 25px 50px rgba(13, 71, 161, 0.15)'
                }}
              >
                {/* Accent Ribbon */}
                <div 
                  className={`absolute top-0 right-0 w-24 h-24 ${isRedTheme ? 'bg-auto-blue-600' : 'bg-auto-red-600'} transform rotate-45 translate-x-8 -translate-y-8`}
                />
                <div 
                  className={`absolute top-2 right-2 w-16 h-16 ${isRedTheme ? 'bg-auto-blue-400' : 'bg-auto-red-400'} transform rotate-45 translate-x-6 -translate-y-6`}
                />

                <CardHeader className="text-center pb-6 pt-8">
                  <CardTitle className={`text-3xl font-bold font-['Poppins'] ${isRedTheme ? 'text-auto-red-900' : 'text-auto-blue-900'}`}>
                    Welcome Back
                  </CardTitle>
                  <p className={`${isRedTheme ? 'text-auto-red-600' : 'text-auto-blue-600'} mt-2`}>
                    Sign in to your account
                  </p>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label 
                        htmlFor="email" 
                        className={`font-medium ${isRedTheme ? 'text-auto-red-900' : 'text-auto-blue-900'}`}
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={`border-2 ${isRedTheme ? 'border-auto-red-400 focus:border-auto-red-600 focus:ring-auto-red-600' : 'border-auto-blue-400 focus:border-auto-blue-600 focus:ring-auto-blue-600'} transition-all duration-200`}
                        aria-describedby="email-error"
                      />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label 
                        htmlFor="password" 
                        className={`font-medium ${isRedTheme ? 'text-auto-red-900' : 'text-auto-blue-900'}`}
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={formState.showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className={`border-2 ${isRedTheme ? 'border-auto-red-400 focus:border-auto-red-600 focus:ring-auto-red-600' : 'border-auto-blue-400 focus:border-auto-blue-600 focus:ring-auto-blue-600'} pr-10 transition-all duration-200`}
                          aria-describedby="password-error"
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isRedTheme ? 'text-auto-red-600 hover:text-auto-red-800' : 'text-auto-blue-600 hover:text-auto-blue-800'} transition-colors`}
                          aria-label={formState.showPassword ? 'Hide password' : 'Show password'}
                        >
                          {formState.showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className={`border-2 ${isRedTheme ? 'border-auto-red-400 data-[state=checked]:bg-auto-red-600 data-[state=checked]:border-auto-red-600' : 'border-auto-blue-400 data-[state=checked]:bg-auto-blue-600 data-[state=checked]:border-auto-blue-600'}`}
                      />
                      <Label 
                        htmlFor="rememberMe" 
                        className={`font-medium cursor-pointer ${isRedTheme ? 'text-auto-red-900' : 'text-auto-blue-900'}`}
                      >
                        Remember me for 30 days
                      </Label>
                    </div>

                    {/* Error Message */}
                    {formState.error && (
                      <Alert className={`border-2 ${isRedTheme ? 'border-auto-red-400 bg-auto-red-200/50' : 'border-auto-blue-400 bg-auto-blue-200/50'}`}>
                        <AlertDescription className={isRedTheme ? 'text-auto-red-900' : 'text-auto-blue-900'}>
                          {formState.error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Success Message */}
                    {formState.success && (
                      <Alert className={`border-2 ${isRedTheme ? 'border-auto-blue-400 bg-auto-blue-200/50' : 'border-auto-red-400 bg-auto-red-200/50'}`}>
                        <AlertDescription className={isRedTheme ? 'text-auto-blue-900' : 'text-auto-red-900'}>
                          {formState.success}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Login Button */}
                    <Button
                      type="submit"
                      disabled={formState.isLoading}
                      className={`w-full ${isRedTheme ? 'bg-auto-red-600 hover:bg-auto-red-700' : 'bg-auto-blue-600 hover:bg-auto-blue-700'} ${isRedTheme ? 'text-auto-blue-200' : 'text-auto-red-200'} font-semibold py-3 text-lg transition-all duration-200 hover:scale-105 focus:ring-3 ${isRedTheme ? 'focus:ring-auto-red-400' : 'focus:ring-auto-blue-400'} focus:ring-offset-2`}
                    >
                      {formState.isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <Car className="mr-2 h-5 w-5" />
                          Sign In
                        </>
                      )}
                    </Button>

                    {/* Demo Login */}
                    <div className="text-center space-y-2">
                      <p className={`text-sm ${isRedTheme ? 'text-auto-red-600' : 'text-auto-blue-600'}`}>
                        Demo credentials:
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              email: 'demo-customer@autorepair.com',
                              password: 'demo123'
                            }));
                          }}
                          className={`px-3 py-1 text-xs rounded ${isRedTheme ? 'bg-auto-red-400 text-auto-blue-200 hover:bg-auto-red-500' : 'bg-auto-blue-400 text-auto-red-200 hover:bg-auto-blue-500'} transition-colors`}
                        >
                          Customer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              email: 'demo-employee@autorepair.com',
                              password: 'demo123'
                            }));
                          }}
                          className={`px-3 py-1 text-xs rounded ${isRedTheme ? 'bg-auto-red-400 text-auto-blue-200 hover:bg-auto-red-500' : 'bg-auto-blue-400 text-auto-red-200 hover:bg-auto-blue-500'} transition-colors`}
                        >
                          Employee
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              email: 'demo-admin@autorepair.com',
                              password: 'demo123'
                            }));
                          }}
                          className={`px-3 py-1 text-xs rounded ${isRedTheme ? 'bg-auto-red-400 text-auto-blue-200 hover:bg-auto-red-500' : 'bg-auto-blue-400 text-auto-red-200 hover:bg-auto-blue-500'} transition-colors`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center">
                      <p className={isRedTheme ? 'text-auto-red-900' : 'text-auto-blue-900'}>
                        Don't have an account?{' '}
                        <button
                          type="button"
                          className={`${isRedTheme ? 'text-auto-red-600 hover:text-auto-red-800' : 'text-auto-blue-600 hover:text-auto-blue-800'} font-semibold underline transition-colors focus:outline-none focus:ring-2 ${isRedTheme ? 'focus:ring-auto-red-400' : 'focus:ring-auto-blue-400'} focus:ring-offset-2 rounded`}
                        >
                          Sign up here
                        </button>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

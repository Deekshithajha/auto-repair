import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopAppBar } from '../components/navigation/TopAppBar';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
  });
  const [showDemo, setShowDemo] = useState(false);
  
  const getRoleConfig = () => {
    switch (role) {
      case 'customer':
        return {
          title: 'Customer Login',
          field1Label: 'Email',
          field1Placeholder: 'your.email@example.com',
          field1Type: 'email',
          field2Label: 'License Plate',
          field2Placeholder: 'ABC-1234',
          field2Type: 'text',
          redirectPath: '/customer',
        };
      case 'employee':
        return {
          title: 'Employee Login',
          field1Label: 'Employee ID',
          field1Placeholder: 'EMP001',
          field1Type: 'text',
          field2Label: 'Password',
          field2Placeholder: '••••••••',
          field2Type: 'password',
          redirectPath: '/employee',
        };
      case 'admin':
        return {
          title: 'Admin Login',
          field1Label: 'Admin ID',
          field1Placeholder: 'ADM001',
          field1Type: 'text',
          field2Label: 'Password',
          field2Placeholder: '••••••••',
          field2Type: 'password',
          redirectPath: '/admin',
        };
      default:
        return {
          title: 'Login',
          field1Label: 'Username',
          field1Placeholder: '',
          field1Type: 'text',
          field2Label: 'Password',
          field2Placeholder: '',
          field2Type: 'password',
          redirectPath: '/',
        };
    }
  };
  
  const config = getRoleConfig();
  
  const getDemoCredentials = () => {
    switch (role) {
      case 'customer':
        return {
          field1: 'sarah.johnson@email.com',
          field2: 'ABC-1234',
          label: 'Demo Customer Account',
        };
      case 'employee':
        return {
          field1: 'EMP001',
          field2: 'password',
          label: 'Demo Employee Account',
        };
      case 'admin':
        return {
          field1: 'ADM001',
          field2: 'password',
          label: 'Demo Admin Account',
        };
      default:
        return null;
    }
  };
  
  const demoCreds = getDemoCredentials();
  
  const handleUseDemo = () => {
    if (demoCreds) {
      setFormData({
        field1: demoCreds.field1,
        field2: demoCreds.field2,
      });
      setShowDemo(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No actual authentication - just navigate to the dashboard
    navigate(config.redirectPath);
  };
  
  return (
    <div className="min-h-screen bg-bg-soft">
      <TopAppBar title="Lakewood 76 Auto Repair" showBack />
      
      <div className="px-6 py-8">
        <div className="max-w-md mx-auto">
          {/* Login Card */}
          <div className="bg-white rounded-card-lg shadow-card p-6">
            <h2 className="text-2xl font-semibold text-text-main mb-6">{config.title}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={config.field1Label}
                type={config.field1Type}
                placeholder={config.field1Placeholder}
                value={formData.field1}
                onChange={(e) => setFormData({ ...formData, field1: e.target.value })}
                required
              />
              
              <Input
                label={config.field2Label}
                type={config.field2Type}
                placeholder={config.field2Placeholder}
                value={formData.field2}
                onChange={(e) => setFormData({ ...formData, field2: e.target.value })}
                required
              />
              
              <Button type="submit" variant="primary" size="lg" fullWidth className="mt-6">
                Continue
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button className="text-sm text-primary hover:text-primary-light font-medium">
                Forgot your credentials?
              </button>
            </div>
          </div>
          
          {/* Demo Credentials */}
          {demoCreds && (
            <div className="mt-4 bg-primary/5 border border-primary/20 rounded-card-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-text-main mb-1">Demo Account</h3>
                  <p className="text-xs text-text-muted">Use these credentials for a realistic demo experience</p>
                </div>
                <button
                  onClick={() => setShowDemo(!showDemo)}
                  className="text-primary text-sm font-medium hover:text-primary-light"
                >
                  {showDemo ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showDemo && (
                <div className="mt-3 space-y-2 pt-3 border-t border-primary/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">{config.field1Label}:</span>
                    <span className="font-mono font-medium text-text-main">{demoCreds.field1}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">{config.field2Label}:</span>
                    <span className="font-mono font-medium text-text-main">{demoCreds.field2}</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    className="mt-3"
                    onClick={handleUseDemo}
                  >
                    Use Demo Account
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Info Text */}
          <p className="text-center text-text-muted text-sm mt-6">
            This is a demo. Enter any credentials to continue.
          </p>
        </div>
      </div>
    </div>
  );
};


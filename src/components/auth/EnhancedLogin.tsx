import React from 'react';
import { RoleBasedAuthForm } from './RoleBasedAuthForm';

interface EnhancedLoginProps {
  onSubmit?: (credentials: { email: string; password: string }) => Promise<void>;
}

export const EnhancedLogin: React.FC<EnhancedLoginProps> = ({ onSubmit }) => {
  return (
    <div className="relative min-h-screen">
      <RoleBasedAuthForm />
    </div>
  );
};

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = true,
  className = '',
  ...props
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-text-main mb-2">
          {label}
        </label>
      )}
      <input
        className={`px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
          error ? 'border-accent-danger' : ''
        } ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-accent-danger">{error}</p>
      )}
    </div>
  );
};


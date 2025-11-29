import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, trend, onClick }) => {
  const isClickable = !!onClick;
  
  return (
    <div
      className={`bg-white rounded-card-lg p-4 shadow-card ${
        isClickable ? 'cursor-pointer hover:shadow-card-hover transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-muted text-sm font-medium mb-1">{label}</p>
          <p className="text-text-main text-2xl font-semibold">{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-1 ${trend.isPositive ? 'text-accent-success' : 'text-accent-danger'}`}>
              {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-primary opacity-80">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};


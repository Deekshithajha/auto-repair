import React from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-30 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 px-6 py-4"
    >
      {icon || (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
      {label && <span className="font-semibold">{label}</span>}
    </button>
  );
};


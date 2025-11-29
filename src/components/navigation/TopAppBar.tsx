import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftClick?: () => void;
  onRightClick?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  showBack = false,
  leftIcon,
  rightIcon,
  onLeftClick,
  onRightClick,
}) => {
  const navigate = useNavigate();
  
  const handleLeftClick = () => {
    if (onLeftClick) {
      onLeftClick();
    } else if (showBack) {
      navigate(-1);
    }
  };
  
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-border-soft">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3 flex-1">
          {(showBack || leftIcon) && (
            <button
              onClick={handleLeftClick}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-soft transition-colors"
            >
              {leftIcon || (
                <svg className="w-6 h-6 text-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              )}
            </button>
          )}
          {title && (
            <h1 className="text-lg font-semibold text-text-main truncate">{title}</h1>
          )}
        </div>
        
        {rightIcon && (
          <button
            onClick={onRightClick}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-soft transition-colors"
          >
            {rightIcon}
          </button>
        )}
      </div>
    </div>
  );
};


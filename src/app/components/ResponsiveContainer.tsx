'use client';

import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  centerContent?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'xl',
  padding = true,
  centerContent = false,
}) => {
  const { isMobile } = useResponsive();
  
  // Map maxWidth to Tailwind classes
  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };
  
  // Determine padding based on screen size
  const paddingClasses = padding
    ? isMobile
      ? 'px-4 py-4'
      : 'px-6 py-6 sm:px-8 md:px-10 lg:px-12'
    : '';
  
  // Center content if requested
  const centerClasses = centerContent ? 'flex flex-col items-center justify-center' : '';
  
  return (
    <div
      className={`w-full mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses} ${centerClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer; 
'use client';

import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: string;
  rowGap?: string;
  columnGap?: string;
  autoFit?: boolean;
  minChildWidth?: string;
  maxChildWidth?: string;
}

/**
 * A responsive grid component that adjusts columns based on screen size
 * 
 * @example
 * <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="1rem">
 *   <Card />
 *   <Card />
 *   <Card />
 * </ResponsiveGrid>
 */
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4, '2xl': 6 },
  gap = '1rem',
  rowGap,
  columnGap,
  autoFit = false,
  minChildWidth = '250px',
  maxChildWidth,
}) => {
  const { currentBreakpoint } = useResponsive();
  
  // Determine number of columns based on current breakpoint
  const getColumns = () => {
    // If autoFit is true, use grid-template-columns: repeat(auto-fit, minmax(min, 1fr))
    if (autoFit) {
      const minWidth = minChildWidth;
      const maxWidth = maxChildWidth ? `, ${maxChildWidth}` : '';
      return `repeat(auto-fit, minmax(${minWidth}${maxWidth}, 1fr))`;
    }
    
    // Otherwise, use the specified number of columns for the current breakpoint
    const cols = columns[currentBreakpoint] || columns.md || 3;
    return `repeat(${cols}, 1fr)`;
  };
  
  // Set gap properties
  const gapStyle = {
    gap: gap,
    rowGap: rowGap || gap,
    columnGap: columnGap || gap,
  };
  
  return (
    <div
      className={`w-full ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: getColumns(),
        ...gapStyle,
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid; 
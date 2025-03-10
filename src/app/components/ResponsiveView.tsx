'use client';

import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

interface ResponsiveViewProps {
  children: React.ReactNode;
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  condition?: 'above' | 'below' | 'only';
}

/**
 * A component that conditionally renders content based on the current viewport size
 * 
 * @example
 * // Only show on mobile devices
 * <ResponsiveView breakpoint="md" condition="below">
 *   <MobileMenu />
 * </ResponsiveView>
 * 
 * // Only show on desktop devices
 * <ResponsiveView breakpoint="lg" condition="above">
 *   <DesktopNavigation />
 * </ResponsiveView>
 */
const ResponsiveView: React.FC<ResponsiveViewProps> = ({
  children,
  breakpoint = 'md',
  condition = 'above',
}) => {
  const { width } = useResponsive();
  
  // Map breakpoints to pixel values
  const breakpointValues = {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };
  
  // Determine if content should be shown based on condition
  const shouldShow = (() => {
    const breakpointValue = breakpointValues[breakpoint];
    
    switch (condition) {
      case 'above':
        return width >= breakpointValue;
      case 'below':
        return width < breakpointValue;
      case 'only':
        const nextBreakpoint = Object.entries(breakpointValues).find(
          (entry) => entry[1] > breakpointValues[breakpoint as keyof typeof breakpointValues]
        );
        
        return width >= breakpointValues[breakpoint] && 
          (!nextBreakpoint || width < nextBreakpoint[1]);
      default:
        return true;
    }
  })();
  
  // Only render children if condition is met
  return shouldShow ? <>{children}</> : null;
};

// Convenience components for common use cases
export const MobileOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ResponsiveView breakpoint="md" condition="below">
    {children}
  </ResponsiveView>
);

export const TabletOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ResponsiveView breakpoint="md" condition="only">
    {children}
  </ResponsiveView>
);

export const DesktopOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ResponsiveView breakpoint="lg" condition="above">
    {children}
  </ResponsiveView>
);

export const TabletAndAbove: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ResponsiveView breakpoint="md" condition="above">
    {children}
  </ResponsiveView>
);

export const TabletAndBelow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ResponsiveView breakpoint="lg" condition="below">
    {children}
  </ResponsiveView>
);

export default ResponsiveView; 
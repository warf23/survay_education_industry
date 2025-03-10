'use client';

import { useState, useEffect } from 'react';
import { breakpoints, getCurrentBreakpoint } from '../utils/mediaQueries';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveState {
  currentBreakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  width: number;
  height: number;
}

export const useResponsive = (): ResponsiveState => {
  // Default state for SSR
  const defaultState: ResponsiveState = {
    currentBreakpoint: 'md',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isPortrait: false,
    isLandscape: true,
    width: 1024,
    height: 768,
  };

  // State to track responsive values
  const [state, setState] = useState<ResponsiveState>(defaultState);

  useEffect(() => {
    // Function to update state based on current dimensions
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const currentBreakpoint = getCurrentBreakpoint() as Breakpoint;
      
      setState({
        currentBreakpoint,
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
        isPortrait: height > width,
        isLandscape: width >= height,
        width,
        height,
      });
    };

    // Set initial dimensions
    updateDimensions();

    // Add event listener for window resize
    window.addEventListener('resize', updateDimensions);
    
    // Add event listener for orientation change (mobile devices)
    window.addEventListener('orientationchange', updateDimensions);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  return state;
};

// Helper functions for responsive design
export const useBreakpointValue = <T>(values: Record<Breakpoint, T>): T => {
  const { currentBreakpoint } = useResponsive();
  return values[currentBreakpoint];
};

export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsive();
  return isMobile;
};

export const useIsTablet = (): boolean => {
  const { isTablet } = useResponsive();
  return isTablet;
};

export const useIsDesktop = (): boolean => {
  const { isDesktop } = useResponsive();
  return isDesktop;
};

export default useResponsive; 
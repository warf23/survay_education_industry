// Media query breakpoints
export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Media query functions for use with CSS-in-JS libraries
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,
  
  // Max-width queries
  xsMax: `@media (max-width: ${breakpoints.sm - 1}px)`,
  smMax: `@media (max-width: ${breakpoints.md - 1}px)`,
  mdMax: `@media (max-width: ${breakpoints.lg - 1}px)`,
  lgMax: `@media (max-width: ${breakpoints.xl - 1}px)`,
  xlMax: `@media (max-width: ${breakpoints['2xl'] - 1}px)`,
  
  // Range queries
  xsOnly: `@media (min-width: ${breakpoints.xs}px) and (max-width: ${breakpoints.sm - 1}px)`,
  smOnly: `@media (min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`,
  mdOnly: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  lgOnly: `@media (min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`,
  xlOnly: `@media (min-width: ${breakpoints.xl}px) and (max-width: ${breakpoints['2xl'] - 1}px)`,
  '2xlOnly': `@media (min-width: ${breakpoints['2xl']}px)`,
  
  // Special queries
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  dark: '@media (prefers-color-scheme: dark)',
  light: '@media (prefers-color-scheme: light)',
  motion: '@media (prefers-reduced-motion: no-preference)',
  noMotion: '@media (prefers-reduced-motion: reduce)',
  hover: '@media (hover: hover)',
  touch: '@media (hover: none)',
  print: '@media print',
};

// Hook-friendly functions for responsive design
export const isBreakpoint = {
  xs: typeof window !== 'undefined' && window.innerWidth >= breakpoints.xs,
  sm: typeof window !== 'undefined' && window.innerWidth >= breakpoints.sm,
  md: typeof window !== 'undefined' && window.innerWidth >= breakpoints.md,
  lg: typeof window !== 'undefined' && window.innerWidth >= breakpoints.lg,
  xl: typeof window !== 'undefined' && window.innerWidth >= breakpoints.xl,
  '2xl': typeof window !== 'undefined' && window.innerWidth >= breakpoints['2xl'],
};

// Helper function to get current breakpoint
export const getCurrentBreakpoint = () => {
  if (typeof window === 'undefined') return 'md'; // Default for SSR
  
  const width = window.innerWidth;
  
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

// Helper function to check if the current viewport is mobile
export const isMobile = () => {
  if (typeof window === 'undefined') return false; // Default for SSR
  return window.innerWidth < breakpoints.md;
};

// Helper function to check if the current viewport is tablet
export const isTablet = () => {
  if (typeof window === 'undefined') return false; // Default for SSR
  return window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg;
};

// Helper function to check if the current viewport is desktop
export const isDesktop = () => {
  if (typeof window === 'undefined') return true; // Default for SSR
  return window.innerWidth >= breakpoints.lg;
}; 
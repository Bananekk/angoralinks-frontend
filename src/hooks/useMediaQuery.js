// src/hooks/useMediaQuery.js
import { useState, useEffect, useCallback } from 'react';

// Breakpoints (mobile-first)
export const breakpoints = {
  xs: 0,      // 0-479px (mobile small)
  sm: 480,    // 480-767px (mobile large)
  md: 768,    // 768-1023px (tablet)
  lg: 1024,   // 1024-1279px (desktop)
  xl: 1280,   // 1280-1535px (desktop large)
  '2xl': 1536 // 1536px+ (ultra wide)
};

// Hook do sprawdzania media query
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Ustaw początkową wartość
    setMatches(media.matches);

    // Listener na zmiany
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

// 🚀 Hook do sprawdzania breakpointów
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('lg');
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWidth(w);
      
      if (w < breakpoints.sm) setBreakpoint('xs');
      else if (w < breakpoints.md) setBreakpoint('sm');
      else if (w < breakpoints.lg) setBreakpoint('md');
      else if (w < breakpoints.xl) setBreakpoint('lg');
      else if (w < breakpoints['2xl']) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    handleResize(); // Initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    width,
    isMobile: width < breakpoints.md,      // < 768px
    isTablet: width >= breakpoints.md && width < breakpoints.lg, // 768-1023px
    isDesktop: width >= breakpoints.lg,    // >= 1024px
  };
};

// 🚀 Hook do responsywnych wartości
export const useResponsiveValue = (values) => {
  const { breakpoint } = useBreakpoint();
  
  // values = { xs: 1, sm: 2, md: 3, lg: 4 }
  // Zwróć wartość dla aktualnego breakpointu lub najbliższego mniejszego
  const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  // Fallback do pierwszej wartości
  return Object.values(values)[0];
};

// 🚀 Helper do generowania responsywnych stylów inline
export const getResponsiveStyles = (isMobile, isTablet) => ({
  // Container
  container: {
    padding: isMobile ? '16px' : isTablet ? '24px' : '32px',
    maxWidth: isMobile ? '100%' : '1200px',
    margin: '0 auto'
  },
  
  // Grid
  grid: (cols = { mobile: 1, tablet: 2, desktop: 3 }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${isMobile ? cols.mobile : isTablet ? cols.tablet : cols.desktop}, 1fr)`,
    gap: isMobile ? '12px' : '24px'
  }),
  
  // Flex
  flexRow: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '12px' : '24px'
  },
  
  // Typography
  heading1: {
    fontSize: isMobile ? '24px' : isTablet ? '32px' : '40px',
    fontWeight: 'bold',
    lineHeight: 1.2
  },
  heading2: {
    fontSize: isMobile ? '20px' : isTablet ? '24px' : '32px',
    fontWeight: 'bold',
    lineHeight: 1.3
  },
  body: {
    fontSize: isMobile ? '14px' : '16px',
    lineHeight: 1.6
  },
  
  // Buttons
  button: {
    padding: isMobile ? '12px 20px' : '14px 28px',
    fontSize: isMobile ? '14px' : '16px',
    minHeight: '44px', // Touch-friendly
    minWidth: '44px'
  },
  
  // Cards
  card: {
    padding: isMobile ? '16px' : '24px',
    borderRadius: isMobile ? '8px' : '12px'
  }
});

export default useMediaQuery;
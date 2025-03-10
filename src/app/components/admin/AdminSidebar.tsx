'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

type AdminSidebarProps = {
  activeView: string;
  setActiveView: (view: string) => void;
};

export default function AdminSidebar({ activeView, setActiveView }: AdminSidebarProps) {
  const [isCompact, setIsCompact] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Handle window resize for responsive behavior
  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCompact(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const navItems = [
    { 
      id: 'table', 
      label: 'Table View', 
      icon: 'table', 
      description: 'View all survey responses in a table format',
      color: 'emerald'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: 'chart-bar', 
      description: 'Visualize survey data with charts and graphs',
      color: 'emerald' 
    },
    { 
      id: 'export', 
      label: 'Export Data', 
      icon: 'download', 
      description: 'Download survey data in various formats',
      color: 'emerald'
    },
  ];

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'table':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'chart-bar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'download':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!mounted) return null;
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <motion.div 
      layout
      className={`${isCompact ? 'md:w-44' : 'md:w-64'} w-full bg-white shadow-lg border-b md:border-b-0 md:border-r border-gray-200 relative h-full transition-all duration-300 overflow-hidden`}
      style={{ 
        backgroundImage: 'linear-gradient(to bottom, white, rgba(240, 255, 244, 0.3))'
      }}
    >
      {/* Glass effect top header */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-emerald-50 to-transparent z-0 opacity-70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1 }}
      />
      
      {/* Toggle button with slide animation */}
      <AnimatePresence>
        {mounted && (
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="hidden md:block absolute -right-3 top-5 z-10"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCompact(!isCompact)}
              className="bg-emerald-50 text-emerald-700 p-1 rounded-full shadow-md border border-emerald-200 hover:bg-emerald-100 transition-colors duration-200"
            >
              <motion.div
                animate={{ rotate: isCompact ? 180 : 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
                </svg>
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className={`p-3 md:py-5 md:px-4 relative z-10`}>
        <AnimatePresence>
          <motion.div 
            key="header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`mb-6 pl-2 hidden md:block ${isCompact ? 'text-center px-0 pl-0' : ''}`}
          >
            <h2 className={`text-lg font-semibold text-emerald-700 tracking-wide ${isCompact ? 'text-center text-base' : ''} whitespace-nowrap`}>
              {isCompact ? 'Survey' : 'Survey Admin'}
            </h2>
            {!isCompact && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-gray-500 mt-1"
              >
                Manage your survey data
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
        
        <LayoutGroup>
          <motion.div layout className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-x-visible">
            {navItems.map((item) => (
              <motion.div 
                layout
                key={item.id} 
                className="relative" 
                onMouseEnter={() => setHoveredItem(item.id)} 
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.button
                  layout
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center ${isCompact ? 'justify-start' : ''} px-4 py-3 rounded-lg whitespace-nowrap md:whitespace-normal transition-all duration-200 w-full group relative overflow-hidden`}
                  style={{ 
                    background: activeView === item.id 
                      ? 'linear-gradient(90deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)' 
                      : undefined
                  }}
                >
                  {/* Background hover effect */}
                  {activeView !== item.id && (
                    <motion.div 
                      className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ zIndex: -1 }}
                    />
                  )}
                  
                  {/* Icon container with animation */}
                  <motion.div 
                    layout
                    className={`p-1 rounded-md ${activeView === item.id ? 'text-white' : 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100'} transition-colors duration-200 flex-shrink-0`}
                    animate={activeView === item.id ? { 
                      scale: [1, 1.2, 1],
                      transition: { duration: 0.5 }
                    } : {}}
                  >
                    {getIcon(item.icon)}
                  </motion.div>
                  
                  {/* Label with truncation for compact mode */}
                  <motion.span 
                    layout
                    className={`font-medium text-sm ml-3 ${activeView === item.id ? 'text-white' : 'text-gray-700 group-hover:text-emerald-700'} transition-colors duration-200 ${isCompact ? 'truncate max-w-[80px]' : ''}`}
                  >
                    {item.label}
                  </motion.span>
                  
                  {/* Active indicator dot */}
                  {activeView === item.id && (
                    <motion.div 
                      layoutId="activeItemIndicator"
                      className="absolute right-3 w-2 h-2 rounded-full bg-white shadow-md"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
                
                {/* Enhanced tooltip that shows on hover for all menu items */}
                <AnimatePresence>
                  {hoveredItem === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-full ml-2 top-1 z-20 bg-white p-3 rounded-md shadow-lg border border-gray-200 w-52"
                      style={{ 
                        display: isMobile ? 'none' : 'block',
                        pointerEvents: 'none'
                      }}
                    >
                      <div className="font-medium text-emerald-700">{item.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </LayoutGroup>
        
        {/* Info card at bottom - only show if not compact */}
    
        {/* Mini stats footer */}
        <AnimatePresence>
          {isCompact && !isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-10 hidden md:block text-center"
            >
              <div className="px-2 py-3 bg-emerald-50 rounded-md border border-emerald-100">
                <div className="text-xs text-emerald-700 font-medium">Total Responses</div>
                <div className="text-lg font-bold text-emerald-800 mt-1">128</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
} 
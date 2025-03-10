'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth, signOut } from '@/lib/admin-auth';
import SurveyResponsesTable from '@/app/components/admin/SurveyResponsesTable';
import AdminHeader from '@/app/components/admin/AdminHeader';
import AdminSidebar from '@/app/components/admin/AdminSidebar';
import Analytics from '@/app/components/admin/Analytics';
import { fetchSurveyResponses, exportToCsv } from '@/lib/admin-data';
import { motion } from 'framer-motion';

export interface SurveyResponse {
  id: string;
  // Add other properties that exist in your survey responses
  [key: string]: string | number | boolean | null | undefined;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);
  const [activeView, setActiveView] = useState('table');
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      console.log('Dashboard: Verifying authentication...');
      try {
        // Check if authenticated as admin
        const authenticated = await checkAuth();
        console.log('Dashboard: Authentication result:', authenticated);
        
        if (!authenticated) {
          console.log('Dashboard: Not authenticated, redirecting to login');
          router.push('/admin/login');
          return;
        }
        
        // User is authenticated
        setIsAuthenticated(true);
        setAuthChecked(true);
        
        // Fetch survey data
        try {
          console.log('Dashboard: Fetching survey responses');
          const data = await fetchSurveyResponses();
          setSurveyData(data);
        } catch (error) {
          console.error('Error fetching survey data:', error);
        } finally {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error during auth verification:', error);
        router.push('/admin/login');
      }
    };

    if (!authChecked) {
      verifyAuth();
    }
  }, [router, authChecked]);

  // Listen for the switchToTableView event
  useEffect(() => {
    const handleSwitchToTableView = () => {
      setActiveView('table');
    };

    window.addEventListener('switchToTableView', handleSwitchToTableView);
    return () => {
      window.removeEventListener('switchToTableView', handleSwitchToTableView);
    };
  }, []);

  const handleSignOut = async () => {
    console.log('Dashboard: Signing out');
    await signOut();
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  // Loading animation variants
  const loadingContainerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const pulseVariants = {
    initial: { scale: 0.95, opacity: 0.7 },
    animate: { 
      scale: 1.05, 
      opacity: 1,
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as const,
        duration: 1.2
      }
    }
  };

  // While authentication is being checked
  if (!authChecked) {
    return (
      <motion.div 
        variants={loadingContainerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%)'
        }}
      >
        <div className="relative z-10 text-center p-8 bg-white bg-opacity-60 backdrop-blur-sm rounded-xl shadow-xl border border-emerald-100">
          <motion.div 
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"
          />
          <p className="text-emerald-800 font-medium">Verifying authentication...</p>
          
          {/* Decorative circles */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-emerald-300 bg-opacity-20 rounded-full blur-xl z-0"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-400 bg-opacity-20 rounded-full blur-xl z-0"></div>
        </div>
      </motion.div>
    );
  }

  // If authentication check is done but user is not authenticated
  if (!isAuthenticated) {
    // This shouldn't normally render as we redirect in the useEffect
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%)'
        }}
      >
        <div className="relative text-center p-8 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl shadow-xl border border-red-100 max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-600 font-medium mb-3">You must be logged in as an admin.</p>
          <motion.button 
            onClick={() => router.push('/admin/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 bg-emerald-600 text-white py-2 px-6 rounded-md hover:bg-emerald-700 transition-all duration-200 shadow-md"
          >
            Go to Login
          </motion.button>
          
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-red-300 bg-opacity-20 rounded-full blur-xl z-0"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-400 bg-opacity-10 rounded-full blur-xl z-0"></div>
        </div>
      </motion.div>
    );
  }

  // If still loading data
  if (isLoading) {
    return (
      <motion.div 
        variants={loadingContainerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%)'
        }}
      >
        <div className="relative z-10 text-center p-8 bg-white bg-opacity-60 backdrop-blur-sm rounded-xl shadow-xl border border-emerald-100">
          <motion.div 
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"
          />
          <p className="text-emerald-800 font-medium">Loading survey data...</p>
          
          {/* Shimmer effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100 to-transparent"
            animate={{ 
              x: ['-100%', '100%'],
            }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "loop", 
              duration: 2,
              ease: "linear",
            }}
            style={{ zIndex: -1 }}
          />
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-300 bg-opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-400 bg-opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/2 left-2/3 w-48 h-48 bg-emerald-200 bg-opacity-20 rounded-full blur-2xl"></div>
      </motion.div>
    );
  }
  
  // Render the dashboard when authenticated and data is loaded
  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-gray-50 to-white"></div>
        
        {/* Animated soft gradient blobs */}
        <motion.div 
          className="absolute top-0 left-0 w-[800px] h-[800px] bg-emerald-100 rounded-full opacity-20 blur-3xl"
          animate={{
            x: ['-20%', '0%', '-20%'],
            y: ['-20%', '0%', '-20%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 30,
            ease: "easeInOut",
          }}
        />
        
        <motion.div 
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-200 rounded-full opacity-15 blur-3xl"
          animate={{
            x: ['20%', '0%', '20%'],
            y: ['20%', '0%', '20%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "easeInOut",
          }}
        />
        
        <motion.div 
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-cyan-200 rounded-full opacity-10 blur-3xl"
          animate={{
            x: ['-30%', '10%', '-30%'],
            y: ['10%', '-20%', '10%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut",
          }}
        />

        {/* Mesh grid overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5"></div>
        
        {/* Top vignette */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-50 to-transparent opacity-70"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex w-full">
        <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
        
        <div className="flex-1 flex flex-col overflow-hidden backdrop-blur-sm">
          <AdminHeader onSignOut={handleSignOut} />
          
          <main className="flex-1 overflow-x-auto overflow-y-auto p-4 relative">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 ml-1">
                  {activeView === 'table' && 'Survey Responses'}
                  {activeView === 'analytics' && 'Survey Analytics'}
                  {activeView === 'export' && 'Export Data'}
                </h1>
                
                {/* Summary stats - can be expanded later */}
                <div className="ml-auto flex space-x-4">
                  <div className="px-4 py-2 bg-white bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm border border-emerald-100">
                    <div className="text-xs text-emerald-700 font-medium">Total Responses</div>
                    <div className="text-lg font-bold text-emerald-800">{surveyData.length}</div>
                  </div>
                </div>
              </div>
              
              {activeView === 'table' && <SurveyResponsesTable data={surveyData} />}
              {activeView === 'analytics' && (
                <>
                
                  <Analytics data={surveyData} />
                </>
              )}
              {activeView === 'export' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl shadow-sm border border-emerald-100 p-8"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Export Survey Data</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      className="border border-emerald-100 rounded-lg p-6 bg-white shadow-sm"
                    >
                      <div className="mb-4 p-3 rounded-full bg-emerald-100 text-emerald-600 w-12 h-12 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">CSV Export</h3>
                      <p className="text-gray-600 mb-4">Download all survey responses in CSV format for analysis in Excel, Google Sheets, or other data tools.</p>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => exportToCsv(surveyData, 'survey_responses.csv')}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md shadow-sm hover:bg-emerald-700 transition-colors duration-200"
                      >
                        Download CSV
                      </motion.button>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      className="border border-emerald-100 rounded-lg p-6 bg-white shadow-sm"
                    >
                      <div className="mb-4 p-3 rounded-full bg-emerald-100 text-emerald-600 w-12 h-12 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">JSON Export</h3>
                      <p className="text-gray-600 mb-4">Export data in JSON format for use in web applications or data processing scripts.</p>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                            JSON.stringify(surveyData, null, 2)
                          )}`;
                          const link = document.createElement('a');
                          link.href = jsonString;
                          link.download = 'survey_responses.json';
                          link.click();
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md shadow-sm hover:bg-emerald-700 transition-colors duration-200"
                      >
                        Download JSON
                      </motion.button>
                    </motion.div>
                  </div>
                  
                  
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 
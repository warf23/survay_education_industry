'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth, signOut } from '@/lib/admin-auth';
import SurveyResponsesTable from '@/app/components/admin/SurveyResponsesTable';
import AdminHeader from '@/app/components/admin/AdminHeader';
import AdminSidebar from '@/app/components/admin/AdminSidebar';
import { fetchSurveyResponses } from '@/lib/admin-data';

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

  const handleSignOut = async () => {
    console.log('Dashboard: Signing out');
    await signOut();
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  // While authentication is being checked
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If authentication check is done but user is not authenticated
  if (!isAuthenticated) {
    // This shouldn't normally render as we redirect in the useEffect
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600">You must be logged in as an admin.</p>
          <button 
            onClick={() => router.push('/admin/login')}
            className="mt-4 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If still loading data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey data...</p>
        </div>
      </div>
    );
  }
  
  // Render the dashboard when authenticated and data is loaded
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onSignOut={handleSignOut} />
        
        <main className="flex-1 overflow-x-auto overflow-y-auto bg-gray-100 p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Survey Responses</h1>
            
            <SurveyResponsesTable data={surveyData} />
          </div>
        </main>
      </div>
    </div>
  );
} 
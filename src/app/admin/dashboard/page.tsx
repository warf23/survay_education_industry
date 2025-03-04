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
  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);
  const [activeView, setActiveView] = useState('table');
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      const authenticated = await checkAuth();
      if (!authenticated) {
        router.push('/admin/login');
        return;
      }
      
      setIsAuthenticated(true);
      
      try {
        const data = await fetchSurveyResponses();
        setSurveyData(data);
      } catch (error) {
        console.error('Error fetching survey data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader onSignOut={handleSignOut} />
      
      <div className="flex flex-1">
        <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
        
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Survey Responses</h1>
            <p className="text-gray-600">View and analyze survey data from respondents</p>
          </div>
          
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading survey data...</p>
              </div>
            </div>
          ) : (
            <SurveyResponsesTable data={surveyData} />
          )}
        </main>
      </div>
    </div>
  );
} 
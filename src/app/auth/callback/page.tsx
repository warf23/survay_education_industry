'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {



        // Check if we have a hash fragment in the URL (common with OAuth redirects) okk 
        if (window.location.hash && window.location.hash.includes('access_token')) {
          // The hash contains the access token, let Supabase handle it
          const { error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error handling auth callback:', error);
          }
        } else {
          // No hash, just get the session normally
          const { error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error handling auth callback:', error);
          }
        }
        
        // Redirect back to the survey
        router.push('/');
      } catch (error) {
        console.error('Exception in auth callback:', error);
        // Still redirect to home page even if there's an error
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
} 
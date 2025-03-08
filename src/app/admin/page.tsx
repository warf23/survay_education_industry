'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Simple redirect to dashboard - let the dashboard handle authentication
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 ml-4">Loading...</p>
    </div>
  );
} 
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to avoid hydration issues with client components
const Questionnaire = dynamic(
  () => import('./components/Questionnaire'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Questionnaire />
    </div>
  );
}

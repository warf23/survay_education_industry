'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import ResponsiveContainer from './components/ResponsiveContainer';

// Use dynamic import with no SSR to avoid hydration issues with client components
const Questionnaire = dynamic(
  () => import('./components/Questionnaire'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <ResponsiveContainer maxWidth="full" padding={false}>
        <Questionnaire />
      </ResponsiveContainer>
    </div>
  );
}

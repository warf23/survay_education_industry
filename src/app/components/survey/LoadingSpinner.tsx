'use client';

import React from 'react';

type LoadingSpinnerProps = {
  message?: string;
};

export default function LoadingSpinner({ message = 'Loading survey...' }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
} 
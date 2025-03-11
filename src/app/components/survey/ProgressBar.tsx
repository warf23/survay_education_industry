'use client';

import React from 'react';

type ProgressBarProps = {
  progress: number;
};

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="h-1 bg-gray-200 w-full">
      <div 
        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-in-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
} 
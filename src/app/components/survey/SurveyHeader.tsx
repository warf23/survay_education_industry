'use client';

import React from 'react';
import Image from 'next/image';
import LanguageSelector from './LanguageSelector';
import UserProfile from './UserProfile';
import ProgressBar from './ProgressBar';
import { UserInfo } from './types';

type SurveyHeaderProps = {
  language: 'english' | 'french';
  setLanguage: (language: 'english' | 'french') => void;
  progress: number;
  userInfo: UserInfo | null;
  onSignOut: () => void;
};

export default function SurveyHeader({ 
  language, 
  setLanguage, 
  progress, 
  userInfo, 
  onSignOut 
}: SurveyHeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Image 
                src="/logo.png" 
                alt="EMSI - École Marocaine des Sciences de l'Ingénieur" 
                width={140} 
                height={40} 
                className="h-8 w-auto mr-3 object-contain"
                priority
              />
              <Image src="/fsjes.png" alt="EMSI - École Marocaine des Sciences de l'Ingénieur" width={180} height={60} className="h-auto object-contain w-[140px] sm:w-[180px]" priority />
              <span className="text-lg font-semibold text-gray-800 hidden sm:block">Survey: Education & Industry</span>
              
            </div>
          </div>

          {/* User Profile and Controls */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector language={language} setLanguage={setLanguage} />
            <LanguageSelector language={language} setLanguage={setLanguage} compact={true} />

            {/* User Profile */}
            <UserProfile userInfo={userInfo} language={language} onSignOut={onSignOut} />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={progress} />
    </header>
  );
} 
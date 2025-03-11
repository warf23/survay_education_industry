'use client';

import React from 'react';
import { UserInfo } from './types';

type UserProfileProps = {
  userInfo: UserInfo | null;
  language: 'english' | 'french';
  onSignOut: () => void;
};

export default function UserProfile({ userInfo, language, onSignOut }: UserProfileProps) {
  if (!userInfo) {
    return (
      <button
        className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        onClick={onSignOut}
        title={language === 'english' ? 'Sign out' : 'Déconnexion'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 focus:outline-none">
        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-200">
          <span className="text-emerald-700 font-medium text-sm">
            {userInfo.fullName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-gray-700 hidden md:block">{userInfo.fullName.split(' ')[0]}</span>
      </button>
      
      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
        <div className="px-4 py-2 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700">{userInfo.fullName}</p>
          <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
        </div>
        <button
          onClick={onSignOut}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {language === 'english' ? 'Sign Out' : 'Se Déconnecter'}
        </button>
      </div>
    </div>
  );
} 
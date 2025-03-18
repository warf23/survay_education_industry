'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserInfo } from './types';

type UserProfileProps = {
  userInfo: UserInfo | null;
  language: 'english' | 'french';
  onSignOut: () => void;
};

export default function UserProfile({ userInfo, language, onSignOut }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!userInfo) {
    return (
      <button
        className="p-2 rounded-full text-gray-600 hover:bg-gray-100 active:bg-gray-200 transform active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
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
    <div className="relative">
      <button 
        ref={buttonRef}
        className={`flex items-center space-x-2 p-1.5 rounded-lg transition-all duration-200 
          ${isOpen ? 'bg-emerald-50 ring-2 ring-emerald-500 ring-opacity-50' : 'hover:bg-gray-50 active:bg-gray-100'}
          focus:outline-none`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={`h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border-2 transition-all duration-200
          ${isOpen ? 'border-emerald-500 shadow-md' : 'border-emerald-200 hover:border-emerald-300'}`}>
          <span className="text-emerald-700 font-medium text-sm">
            {userInfo.fullName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-gray-700 hidden md:block font-medium">{userInfo.fullName.split(' ')[0]}</span>
        {/* Dropdown arrow icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 hidden md:block
            ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown Menu */}
      <div 
        ref={dropdownRef}
        className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 transform transition-all duration-200 origin-top-right
          ${isOpen 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-[-10px] scale-95 pointer-events-none'}`}
      >
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
          <p className="text-sm font-medium text-gray-700">{userInfo.fullName}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{userInfo.email}</p>
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            onSignOut();
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 flex items-center transition-colors duration-150 group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-2 text-gray-400 group-hover:text-emerald-500 transition-colors duration-150" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="group-hover:text-emerald-600 transition-colors duration-150">
            {language === 'english' ? 'Sign Out' : 'Se Déconnecter'}
          </span>
        </button>
      </div>
    </div>
  );
} 
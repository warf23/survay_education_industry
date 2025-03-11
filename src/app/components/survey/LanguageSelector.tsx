'use client';

import React from 'react';

type LanguageSelectorProps = {
  language: 'english' | 'french';
  setLanguage: (language: 'english' | 'french') => void;
  compact?: boolean;
};

export default function LanguageSelector({ language, setLanguage, compact = false }: LanguageSelectorProps) {
  if (compact) {
    return (
      <div className="sm:hidden">
        <select 
          className="bg-gray-100 border-0 rounded-md text-sm py-1 pl-2 pr-8 text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'english' | 'french')}
        >
          <option value="english">English</option>
          <option value="french">Français</option>
        </select>
      </div>
    );
  }

  return (
    <div className="hidden sm:flex space-x-2">
      <button 
        className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${language === 'english' ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => setLanguage('english')}
      >
        English
      </button>
      <button 
        className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${language === 'french' ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => setLanguage('french')}
      >
        Français
      </button>
    </div>
  );
} 
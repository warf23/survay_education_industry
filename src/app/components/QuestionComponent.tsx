'use client';

import React from 'react';

type QuestionComponentProps = {
  question: {
    id: string;
    label: string;
    english: string;
    french: string;
  };
  language: 'english' | 'french';
  value: string;
  onChange: (value: string) => void;
};

export default function QuestionComponent({ 
  question, 
  language, 
  value, 
  onChange 
}: QuestionComponentProps) {
  const questionText = question[language];
  
  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-800 mb-2">{questionText}</h2>
        <div className="h-1 w-16 bg-emerald-500 rounded-full"></div>
      </div>
      
      <div className="mt-4">
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm resize-none"
          rows={5}
          placeholder={language === 'english' ? 'Type your answer here...' : 'Tapez votre réponse ici...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={questionText}
        />
        
        <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
          <div>
            {value.length > 0 && (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {language === 'english' ? 'Response saved as you type' : 'Réponse enregistrée pendant que vous tapez'}
              </span>
            )}
          </div>
          <div>
            {value.length > 0 && (
              <span>{value.length} {language === 'english' ? 'characters' : 'caractères'}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
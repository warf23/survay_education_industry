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
    <div className="question-box animate-fadeIn">
      <h2 className="question-text">{questionText}</h2>
      
      <div className="mt-4">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows={5}
          placeholder={language === 'english' ? 'Type your answer here...' : 'Tapez votre réponse ici...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
} 
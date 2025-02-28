'use client';

import React from 'react';

type CompletionProps = {
  language: 'english' | 'french';
  onRestart: () => void;
};

export default function Completion({ language, onRestart }: CompletionProps) {
  const content = {
    title: {
      english: 'Thank You!',
      french: 'Merci !'
    },
    message: {
      english: 'Your responses have been recorded in our database. We appreciate your participation in this survey.',
      french: 'Vos réponses ont été enregistrées dans notre base de données. Nous vous remercions de votre participation à cette enquête.'
    },
    impact: {
      english: 'Your input will help improve the collaboration between education and industry, ensuring better alignment between skills development and market needs.',
      french: 'Vos contributions aideront à améliorer la collaboration entre l\'éducation et l\'industrie, assurant une meilleure adéquation entre le développement des compétences et les besoins du marché.'
    },
    dataUsage: {
      english: 'Your data will be used for research purposes only and will be handled with confidentiality.',
      french: 'Vos données seront utilisées uniquement à des fins de recherche et seront traitées en toute confidentialité.'
    },
    restart: {
      english: 'Start New Survey',
      french: 'Démarrer une nouvelle enquête'
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-md overflow-hidden">
        <div className="h-2 bg-purple-600"></div>
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4 animate-fadeIn">
            {content.title[language]}
          </h1>
          
          <p className="text-gray-600 mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            {content.message[language]}
          </p>
          
          <p className="text-gray-600 mb-6 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            {content.impact[language]}
          </p>
          
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-10 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <p className="text-purple-700">
              {content.dataUsage[language]}
            </p>
          </div>
          
          <button 
            className="btn-primary mx-auto animate-fadeIn"
            onClick={onRestart}
            style={{ animationDelay: '0.8s' }}
          >
            {content.restart[language]}
          </button>
        </div>
      </div>
    </div>
  );
} 
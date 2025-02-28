'use client';

import React, { useState, useEffect } from 'react';
import { signInWithGoogle, getCurrentUser } from '@/lib/supabase';

type WelcomeProps = {
  onStart: (userId: string, fullName: string, email: string) => void;
  language: 'english' | 'french';
  onLanguageChange: (language: 'english' | 'french') => void;
};

export default function Welcome({ onStart, language, onLanguageChange }: WelcomeProps) {
  const [step, setStep] = useState<'intro' | 'auth'>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const checkCurrentUser = async () => {
      const user = await getCurrentUser();
      if (user && user.id && user.fullName && user.email) {
        onStart(user.id, user.fullName, user.email);
      }
    };

    checkCurrentUser();
  }, [onStart]);

  const content = {
    title: {
      english: 'Survey: Education & Industry Collaboration',
      french: 'Enquête : Collaboration Entre Éducation et Industrie'
    },
    subtitle: {
      english: 'Help us understand the relationship between skills development and industry needs',
      french: 'Aidez-nous à comprendre la relation entre le développement des compétences et les besoins de l\'industrie'
    },
    description: {
      english: 'This survey aims to collect data on the alignment between education and industry needs. Your input will help improve training programs and better prepare learners for the job market.',
      french: 'Cette enquête vise à recueillir des données sur l\'alignement entre l\'éducation et les besoins de l\'industrie. Vos réponses aideront à améliorer les programmes de formation et à mieux préparer les apprenants au marché du travail.'
    },
    sections: {
      english: [
        'Company Information',
        'Skills Identification',
        'Collaboration Between Education and Industry',
        'Future Prospects'
      ],
      french: [
        'Information d\'entreprise',
        'Identification des Compétences',
        'Collaboration entre Éducation et Industrie',
        'Perspectives d\'Avenir'
      ]
    },
    time: {
      english: 'Estimated time: 10-15 minutes',
      french: 'Temps estimé : 10-15 minutes'
    },
    next: {
      english: 'Next',
      french: 'Suivant'
    },
    signInWithGoogle: {
      english: 'Sign in with Google',
      french: 'Se connecter avec Google'
    },
    authTitle: {
      english: 'Sign in to continue',
      french: 'Connectez-vous pour continuer'
    },
    authSubtitle: {
      english: 'We\'ll use your Google account to identify your responses',
      french: 'Nous utiliserons votre compte Google pour identifier vos réponses'
    },
    error: {
      english: 'An error occurred. Please try again.',
      french: 'Une erreur s\'est produite. Veuillez réessayer.'
    }
  };

  const handleNextClick = () => {
    setStep('auth');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
      // The redirect will happen automatically
      // After redirect back, the useEffect will handle the user
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError(content.error[language]);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className={`max-w-2xl w-full bg-white rounded-xl shadow-md overflow-hidden transition-all duration-500 ease-in-out ${step === 'auth' ? 'transform-gpu scale-100 opacity-100' : ''}`}>
        <div className="h-2 bg-purple-600"></div>
        
        <div className="flex justify-end p-4">
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1 rounded-full text-sm ${language === 'english' ? 'bg-purple-100 text-purple-800' : 'text-gray-600'}`}
              onClick={() => onLanguageChange('english')}
            >
              English
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm ${language === 'french' ? 'bg-purple-100 text-purple-800' : 'text-gray-600'}`}
              onClick={() => onLanguageChange('french')}
            >
              Français
            </button>
          </div>
        </div>
        
        {step === 'intro' ? (
          <div className="p-8 animate-fadeIn">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {content.title[language]}
            </h1>
            <p className="text-purple-700 mb-6">
              {content.subtitle[language]}
            </p>
            
            <p className="text-gray-600 mb-6">
              {content.description[language]}
            </p>
            
            <div className="mb-6">
              <h2 className="font-semibold text-gray-700 mb-2">
                {language === 'english' ? 'Survey Sections:' : 'Sections de l\'enquête:'}
              </h2>
              <ul className="space-y-2">
                {content.sections[language].map((section, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-800 mr-3 text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{section}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <p className="text-gray-500 mb-8 text-sm">
              {content.time[language]}
            </p>
            
            <button 
              className="btn-primary w-full py-3 rounded-lg"
              onClick={handleNextClick}
            >
              {content.next[language]}
            </button>
          </div>
        ) : (
          <div className="p-8 animate-slideUp">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {content.authTitle[language]}
            </h1>
            <p className="text-purple-700 mb-6">
              {content.authSubtitle[language]}
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>{content.signInWithGoogle[language]}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
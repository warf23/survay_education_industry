'use client';

import React, { useState, useEffect } from 'react';
import { signInWithGoogle, getCurrentUser } from '@/lib/supabase';
import Image from 'next/image';

type WelcomeProps = {
  onStart: (userId: string, fullName: string, email: string) => void;
  language: 'english' | 'french';
  onLanguageChange: (language: 'english' | 'french') => void;
};

export default function Welcome({ onStart, language, onLanguageChange }: WelcomeProps) {
  const [step, setStep] = useState<'intro' | 'auth'>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [animateIcons, setAnimateIcons] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkCurrentUser = async () => {
      const user = await getCurrentUser();
      if (user && user.id && user.fullName && user.email) {
        onStart(user.id, user.fullName, user.email);
      }
    };

    checkCurrentUser();
    
    // Start icon animations after component mounts
    setTimeout(() => {
      setAnimateIcons(true);
    }, 300);
  }, [onStart]);

  const content = {
    title: {
      english: 'Bridging Education & Industry',
      french: 'Rapprocher l\'Éducation et l\'Industrie'
    },
    subtitle: {
      english: 'Shape the future of skills development',
      french: 'Façonnez l\'avenir du développement des compétences'
    },
    description: {
      english: 'Your insights are invaluable. This survey aims to identify gaps between education and industry needs, helping create more effective training programs that prepare learners for real-world challenges.',
      french: 'Vos perspectives sont inestimables. Cette enquête vise à identifier les écarts entre l\'éducation et les besoins de l\'industrie, contribuant à créer des programmes de formation plus efficaces qui préparent les apprenants aux défis du monde réel.'
    },
    sections: {
      english: [
        'Company Information & Background',
        'Skills Identification & Assessment',
        'Education-Industry Collaboration',
        'Future Trends & Innovations'
      ],
      french: [
        'Information d\'entreprise & Contexte',
        'Identification & Évaluation des Compétences',
        'Collaboration Éducation-Industrie',
        'Tendances Futures & Innovations'
      ]
    },
    benefits: {
      english: [
        'Help shape educational curricula',
        'Influence future workforce development',
        'Contribute to industry-education alignment',
        'Support innovation in skills training'
      ],
      french: [
        'Aidez à façonner les programmes éducatifs',
        'Influencez le développement de la main-d\'œuvre future',
        'Contribuez à l\'alignement industrie-éducation',
        'Soutenez l\'innovation dans la formation aux compétences'
      ]
    },
    time: {
      english: 'Estimated time: 10-15 minutes',
      french: 'Temps estimé : 10-15 minutes'
    },
    next: {
      english: 'Get Started',
      french: 'Commencer'
    },
    authTitle: {
      english: 'One quick step before we begin',
      french: 'Une étape rapide avant de commencer'
    },
    authSubtitle: {
      english: 'Sign in to save your progress and ensure your feedback is counted',
      french: 'Connectez-vous pour sauvegarder votre progression et vous assurer que vos commentaires sont pris en compte'
    },
    signInWithGoogle: {
      english: 'Continue with Google',
      french: 'Continuer avec Google'
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

  const iconClasses = `transition-all duration-500 ease-in-out ${animateIcons ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 p-4">
      <div className={`max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 ease-in-out ${step === 'auth' ? 'transform-gpu scale-100 opacity-100' : ''}`}>
        <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
        
        <div className="flex justify-between items-center p-4">
          {/* EMSI Logo */}
          <div className="flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="EMSI - École Marocaine des Sciences de l'Ingénieur" 
              width={180} 
              height={60} 
              className="h-auto object-contain"
              priority
            />
          </div>
          
          {/* Language Selector */}
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${language === 'english' ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => onLanguageChange('english')}
            >
              English
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${language === 'french' ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => onLanguageChange('french')}
            >
              Français
            </button>
          </div>
        </div>
        
        {step === 'intro' ? (
          <div className="p-8 animate-fadeIn">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center shadow-md mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                {content.title[language]}
              </h1>
            </div>
            
            <p className="text-emerald-700 text-lg font-medium mb-6">
              {content.subtitle[language]}
            </p>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              {content.description[language]}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 shadow-sm">
                <h2 className="font-semibold text-emerald-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${iconClasses}`} style={{ transitionDelay: '100ms' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {language === 'english' ? 'Survey Sections:' : 'Sections de l\'enquête:'}
                </h2>
                <ul className="space-y-3">
                  {content.sections[language].map((section, index) => (
                    <li key={index} className={`flex items-center ${iconClasses}`} style={{ transitionDelay: `${150 + index * 100}ms` }}>
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-800 mr-3 text-sm font-medium shadow-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-700">{section}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-6 border border-teal-100 shadow-sm">
                <h2 className="font-semibold text-teal-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${iconClasses}`} style={{ transitionDelay: '100ms' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {language === 'english' ? 'Benefits of Participating:' : 'Avantages de la Participation:'}
                </h2>
                <ul className="space-y-3">
                  {content.benefits[language].map((benefit, index) => (
                    <li key={index} className={`flex items-start ${iconClasses}`} style={{ transitionDelay: `${150 + index * 100}ms` }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-500 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${iconClasses}`} style={{ transitionDelay: '500ms' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {content.time[language]}
              </p>
              
              <p className="text-gray-500 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${iconClasses}`} style={{ transitionDelay: '550ms' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {language === 'english' ? 'Your data is secure' : 'Vos données sont sécurisées'}
              </p>
            </div>
            
            <button 
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 flex items-center justify-center font-medium text-lg"
              onClick={handleNextClick}
            >
              {content.next[language]}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="p-8 animate-slideUp">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-300 rounded-full flex items-center justify-center shadow-md mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {content.authTitle[language]}
              </h1>
              <p className="text-emerald-700 mb-6 max-w-md mx-auto">
                {content.authSubtitle[language]}
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-emerald-600 rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span className="text-lg">{content.signInWithGoogle[language]}</span>
            </button>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setStep('intro')}
                className="text-emerald-600 hover:text-emerald-800 text-sm flex items-center justify-center mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                {language === 'english' ? 'Back to information' : 'Retour aux informations'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating elements for visual interest */}
      <div className="fixed top-20 left-20 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none -z-10"></div>
      <div className="fixed bottom-20 right-20 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none -z-10"></div>
      <div className="fixed bottom-40 left-40 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000 pointer-events-none -z-10"></div>
    </div>
  );
} 
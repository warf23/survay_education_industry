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
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);

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

    // Add confetti effect
    const showConfetti = () => {
      const colors = ['#34D399', '#10B981', '#059669', '#065F46'];
      const count = 100;
      
      for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 5 + 's';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(confetti);
        
        setTimeout(() => {
          confetti.remove();
        }, 6000);
      }
    };
    
    showConfetti();
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 p-2 sm:p-4 relative overflow-hidden">
      {/* Floating animated elements for visual interest */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className={`w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-500 ease-in-out border border-emerald-100 ${step === 'auth' ? 'transform-gpu scale-100 opacity-100' : ''}`}>
        <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
        
        <div className="flex sm:flex-row justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-white to-emerald-50">
          {/* EMSI Logo with subtle animation */}
          <div className=" hover:scale-105 transition-transform duration-300 mb-2 sm:mb-0">
            <Image 
              src="/logo.png" 
              alt="EMSI - École Marocaine des Sciences de l'Ingénieur" 
              width={180} 
              height={60} 
              className="h-auto object-contain w-[140px] sm:w-[180px]"
              priority
            />
          </div>
          <div className=" hover:scale-105 transition-transform duration-300 mb-2 sm:mb-0">
<Image src="/fsjes.png" alt="EMSI - École Marocaine des Sciences de l'Ingénieur" width={180} height={60} className="h-auto object-contain w-[140px] sm:w-[180px]" priority />

          </div>
          
          {/* Language Selector with improved styling */}
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button 
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm transition-all duration-300 border ${language === 'english' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm' : 'text-gray-600 hover:bg-gray-100 border-transparent'}`}
              onClick={() => onLanguageChange('english')}
            >
              <span className="flex items-center">
                <span className={`inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-1.5 ${language === 'english' ? 'bg-emerald-500' : 'bg-transparent border border-gray-300'}`}></span>
                English
              </span>
            </button>
            <button 
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm transition-all duration-300 border ${language === 'french' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm' : 'text-gray-600 hover:bg-gray-100 border-transparent'}`}
              onClick={() => onLanguageChange('french')}
            >
              <span className="flex items-center">
                <span className={`inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-1.5 ${language === 'french' ? 'bg-emerald-500' : 'bg-transparent border border-gray-300'}`}></span>
                Français
              </span>
            </button>
          </div>
        </div>
        
        {step === 'intro' ? (
          <div className="p-4 sm:p-6 md:p-8 animate-fadeIn relative">
            {/* Decorative element */}
            <div className="absolute -top-4 -right-4 w-16 sm:w-24 h-16 sm:h-24 bg-emerald-100 rounded-full opacity-50 z-0"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center mb-6 relative z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mr-0 sm:mr-5 transform rotate-3 hover:rotate-0 transition-all duration-300 mx-auto sm:mx-0 mb-3 sm:mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-500 mb-1">
                  {content.title[language]}
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full mx-auto sm:mx-0"></div>
              </div>
            </div>
            
            <p className="text-emerald-700 text-lg sm:text-xl font-medium mb-6 pl-4 border-l-4 border-emerald-300">
              {content.subtitle[language]}
            </p>
            
            <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed bg-gradient-to-br from-white to-emerald-50 p-3 sm:p-4 rounded-lg shadow-sm border border-emerald-50 text-sm sm:text-base">
              {content.description[language]}
            </p>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 sm:p-6 border border-emerald-100 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <h2 className="font-semibold text-emerald-800 mb-3 sm:mb-4 flex items-center text-base sm:text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 sm:h-6 sm:w-6 mr-2 ${iconClasses}`} style={{ transitionDelay: '100ms' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {language === 'english' ? 'Survey Sections:' : 'Sections de l\'enquête:'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {content.sections[language].map((section, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center p-2 sm:p-3 rounded-lg transition-all duration-300 ${iconClasses} ${
                        hoveredSection === index 
                          ? 'bg-emerald-100 shadow-md transform scale-105' 
                          : 'bg-white/70 hover:bg-emerald-50 shadow-sm'
                      }`} 
                      style={{ transitionDelay: `${150 + index * 100}ms` }}
                      onMouseEnter={() => setHoveredSection(index)}
                      onMouseLeave={() => setHoveredSection(null)}
                    >
                      <span className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-800 mr-2 sm:mr-3 text-xs sm:text-sm font-medium shadow-sm border border-emerald-200">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-700 font-medium text-sm sm:text-base">{section}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 sm:mb-8 space-y-2 md:space-y-0 md:space-x-2">
              <div className="flex items-center p-2 sm:p-3 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 text-xs sm:text-sm w-full md:w-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-emerald-500 ${iconClasses}`} style={{ transitionDelay: '500ms' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {content.time[language]}
              </div>
              
              <div className="flex items-center p-2 sm:p-3 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 text-xs sm:text-sm w-full md:w-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-emerald-500 ${iconClasses}`} style={{ transitionDelay: '550ms' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {language === 'english' ? 'Your data is secure' : 'Vos données sont sécurisées'}
              </div>

              <div className="flex items-center p-2 sm:p-3 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 text-xs sm:text-sm w-full md:w-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-emerald-500 ${iconClasses}`} style={{ transitionDelay: '600ms' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {language === 'english' ? 'Professional insights' : 'Perspectives professionnelles'}
              </div>
            </div>
            
            <button 
              className="w-full py-3 sm:py-5 px-6 sm:px-8 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 flex items-center justify-center font-medium text-base sm:text-lg relative overflow-hidden group"
              onClick={handleNextClick}
            >
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
              <span className="relative flex items-center">
                {content.next[language]}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-6 md:p-8 animate-slideUp">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-emerald-400 to-teal-300 rounded-full flex items-center justify-center shadow-lg mb-4 sm:mb-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-12 sm:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-500 mb-2 sm:mb-3">
                {content.authTitle[language]}
              </h1>
              <p className="text-emerald-700 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
                {content.authSubtitle[language]}
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-5 py-3 sm:py-4 rounded-lg mb-4 sm:mb-6 animate-shake text-sm sm:text-base">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-white border border-gray-300 rounded-xl px-4 sm:px-6 py-4 sm:py-5 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              {isLoading ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 border-t-emerald-600 rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="sm:w-[28px] sm:h-[28px] filter drop-shadow-sm">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span className="text-base sm:text-lg font-semibold">{content.signInWithGoogle[language]}</span>
            </button>
            
            <div className="mt-4 sm:mt-6 text-center">
              <button 
                onClick={() => setStep('intro')}
                className="text-emerald-600 hover:text-emerald-800 text-xs sm:text-sm flex items-center justify-center mx-auto bg-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                {language === 'english' ? 'Back to information' : 'Retour aux informations'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add media query styles for better mobile experience */}
      <style jsx global>{`
        @media (max-width: 640px) {
          .floating-shape {
            opacity: 0.2;
          }
          
          .floating-shape.shape-1 {
            width: 200px;
            height: 200px;
          }
          
          .floating-shape.shape-2 {
            width: 150px;
            height: 150px;
          }
          
          .confetti {
            width: 8px;
            height: 12px;
          }
        }
        
        /* Improve touch targets for mobile */
        @media (hover: none) {
          button {
            min-height: 44px;
          }
        }
        
        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          .floating-shape, .confetti {
            animation: none !important;
          }
          
          .transform {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Add this CSS to the component
export const WelcomeStyles = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  }

  @keyframes confettiFall {
    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }

  .floating-shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(30px);
    opacity: 0.3;
    animation: float 10s ease-in-out infinite, pulse 8s ease-in-out infinite;
  }

  .shape-1 {
    background-color: rgba(16, 185, 129, 0.4);
    width: 300px;
    height: 300px;
    top: -150px;
    left: -150px;
    animation-delay: 0s;
  }

  .shape-2 {
    background-color: rgba(5, 150, 105, 0.4);
    width: 250px;
    height: 250px;
    top: calc(100% - 100px);
    right: -100px;
    animation-delay: 1s;
  }

  .shape-3 {
    background-color: rgba(52, 211, 153, 0.4);
    width: 200px;
    height: 200px;
    bottom: -100px;
    left: 25%;
    animation-delay: 2s;
  }

  .shape-4 {
    background-color: rgba(6, 95, 70, 0.25);
    width: 350px;
    height: 350px;
    top: 20%;
    right: -150px;
    animation-delay: 3s;
  }

  .confetti {
    position: fixed;
    width: 10px;
    height: 15px;
    opacity: 0.7;
    top: -100px;
    animation: confettiFall 5s ease-in-out forwards;
    z-index: -1;
  }
`; 
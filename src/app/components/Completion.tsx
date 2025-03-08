'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

type CompletionProps = {
  language: 'english' | 'french';
};

export default function Completion({ language }: CompletionProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    // Show confetti animation after component mounts
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                background: `hsl(${Math.random() * 360}, 100%, 50%)`,
                borderRadius: '50%',
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}
      
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-700 ease-out animate-slideUp">
        <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
        <div className="p-8 text-center">
          {/* EMSI Logo */}
          <div className="flex justify-center mb-6">
            <Image 
              src="/logo.png" 
              alt="EMSI - École Marocaine des Sciences de l'Ingénieur" 
              width={180} 
              height={60} 
              className="h-auto object-contain"
              priority
            />
          </div>
          
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center transform transition-all duration-700 animate-bounce-slow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-4 animate-fadeIn">
            {content.title[language]}
          </h1>
          
          <p className="text-gray-600 mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            {content.message[language]}
          </p>
          
          <p className="text-gray-600 mb-6 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            {content.impact[language]}
          </p>
          
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-lg p-4 mb-6 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <p className="text-emerald-700">
              {content.dataUsage[language]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
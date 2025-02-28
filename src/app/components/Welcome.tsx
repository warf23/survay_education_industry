'use client';

import React, { useState } from 'react';
import { saveUserProfile } from '@/lib/supabase';

type WelcomeProps = {
  onStart: (userId: string, fullName: string, email: string) => void;
  language: 'english' | 'french';
  onLanguageChange: (language: 'english' | 'french') => void;
};

export default function Welcome({ onStart, language, onLanguageChange }: WelcomeProps) {
  const [step, setStep] = useState<'intro' | 'form'>('intro');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ fullName: '', email: '', server: '' });

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
    start: {
      english: 'Start Survey',
      french: 'Commencer l\'enquête'
    },
    next: {
      english: 'Next',
      french: 'Suivant'
    },
    fullName: {
      english: 'Full Name',
      french: 'Nom Complet'
    },
    email: {
      english: 'Email Address',
      french: 'Adresse Email'
    },
    formTitle: {
      english: 'Before we begin...',
      french: 'Avant de commencer...'
    },
    formSubtitle: {
      english: 'Please provide your information',
      french: 'Veuillez fournir vos informations'
    },
    required: {
      english: 'This field is required',
      french: 'Ce champ est obligatoire'
    },
    invalidEmail: {
      english: 'Please enter a valid email address',
      french: 'Veuillez entrer une adresse email valide'
    },
    serverError: {
      english: 'An error occurred. Please try again.',
      french: 'Une erreur s\'est produite. Veuillez réessayer.'
    }
  };

  const handleNextClick = () => {
    setStep('form');
  };

  const validateForm = () => {
    const newErrors = { fullName: '', email: '', server: '' };
    let isValid = true;

    if (!fullName.trim()) {
      newErrors.fullName = content.required[language];
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = content.required[language];
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = content.invalidEmail[language];
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Save user profile to Supabase
        const userId = await saveUserProfile(fullName, email);
        
        if (userId) {
          // If successful, proceed to the survey
          onStart(userId, fullName, email);
        } else {
          // If there was an error, show an error message
          setErrors(prev => ({ ...prev, server: content.serverError[language] }));
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('Error saving user profile:', error);
        setErrors(prev => ({ ...prev, server: content.serverError[language] }));
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className={`max-w-2xl w-full bg-white rounded-xl shadow-md overflow-hidden transition-all duration-500 ease-in-out ${step === 'form' ? 'transform-gpu scale-100 opacity-100' : ''}`}>
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
              {content.formTitle[language]}
            </h1>
            <p className="text-purple-700 mb-6">
              {content.formSubtitle[language]}
            </p>
            
            {errors.server && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {errors.server}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  {content.fullName[language]}
                </label>
                <input
                  type="text"
                  id="fullName"
                  className={`text-input w-full ${errors.fullName ? 'border-red-500' : ''}`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={content.fullName[language]}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {content.email[language]}
                </label>
                <input
                  type="email"
                  id="email"
                  className={`text-input w-full ${errors.email ? 'border-red-500' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={content.email[language]}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              
              <button 
                type="submit"
                className="btn-primary w-full py-3 rounded-lg relative"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {language === 'english' ? 'Processing...' : 'Traitement...'}
                  </span>
                ) : (
                  content.start[language]
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 
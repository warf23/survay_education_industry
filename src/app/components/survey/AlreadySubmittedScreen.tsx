'use client';

import React from 'react';
import Image from 'next/image';
import { UserInfo } from './types';
import { supabase } from '@/lib/supabase';

type AlreadySubmittedScreenProps = {
  language: 'english' | 'french';
  userInfo: UserInfo | null;
  onContinue: (updatedAnswers: { questionId: string, answer: string }[]) => void;
  onSignOut: () => void;
};

export default function AlreadySubmittedScreen({ 
  language, 
  userInfo, 
  onContinue, 
  onSignOut 
}: AlreadySubmittedScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-md overflow-hidden">
        <div className="h-2 bg-emerald-600"></div>
        <div className="p-8">
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
            <Image src="/fsjes.png" alt="EMSI - École Marocaine des Sciences de l'Ingénieur" width={180} height={60} className="h-auto object-contain w-[140px] sm:w-[180px]" priority />
          </div>
          
          {/* User Profile Section */}
          <div className="flex items-center mb-6 pb-6 border-b border-gray-100">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border-2 border-emerald-200 mr-4">
              <span className="text-emerald-700 font-bold text-xl">
                {userInfo?.fullName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{userInfo?.fullName || 'User'}</h3>
              <p className="text-sm text-gray-500">{userInfo?.email || ''}</p>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {language === 'english' ? 'You have already completed this survey' : 'Vous avez déjà complété cette enquête'}
          </h1>
          <p className="text-gray-600 mb-6">
            {language === 'english' 
              ? 'Thank you for your previous submission. You can update your responses if you wish.' 
              : 'Merci pour votre soumission précédente. Vous pouvez mettre à jour vos réponses si vous le souhaitez.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={async () => {
                // Get existing responses before continuing
                try {
                  const { data: existingResponses, error } = await supabase
                    .from('survey_responses')
                    .select('question_id, answer')
                    .eq('user_id', userInfo?.id);

                  if (error) {
                    console.error('Error fetching existing responses:', error);
                    return;
                  }

                  // Update the answers state with existing responses
                  if (existingResponses) {
                    const updatedAnswers = existingResponses.map(response => ({
                      questionId: response.question_id,
                      answer: response.answer
                    }));
                    onContinue(updatedAnswers);
                  }
                } catch (error) {
                  console.error('Error loading existing responses:', error);
                }
              }}
              className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {language === 'english' ? 'Continue and Update' : 'Continuer et Mettre à Jour'}
            </button>
            <button 
              onClick={onSignOut} 
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {language === 'english' ? 'Sign Out' : 'Se Déconnecter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
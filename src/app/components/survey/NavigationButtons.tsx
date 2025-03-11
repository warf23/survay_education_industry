'use client';

import React from 'react';

type NavigationButtonsProps = {
  language: 'english' | 'french';
  onPrevious: () => void;
  onNext: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  isSubmitting: boolean;
};

export default function NavigationButtons({
  language,
  onPrevious,
  onNext,
  isFirstQuestion,
  isLastQuestion,
  isSubmitting
}: NavigationButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-8">
      <button 
        className={`order-2 sm:order-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center ${isFirstQuestion ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onPrevious}
        disabled={isFirstQuestion}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {language === 'english' ? 'Previous' : 'Précédent'}
      </button>
      
      <button 
        className="order-1 sm:order-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors flex items-center justify-center shadow-sm"
        onClick={onNext}
        disabled={isSubmitting}
      >
        {isLastQuestion ? (
          isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {language === 'english' ? 'Submitting...' : 'Soumission...'}
            </span>
          ) : (
            <>
              {language === 'english' ? 'Submit' : 'Soumettre'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )
        ) : (
          <>
            {language === 'english' ? 'Next' : 'Suivant'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
} 
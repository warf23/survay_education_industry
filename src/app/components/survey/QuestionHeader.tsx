'use client';

import React from 'react';
import { CategoryData } from './types';

type QuestionHeaderProps = {
  currentCategory: CategoryData;
  language: 'english' | 'french';
  currentSection: number;
  totalSections: number;
  currentQuestion: number;
  totalQuestionsInSection: number;
};

export default function QuestionHeader({
  currentCategory,
  language,
  currentSection,
  totalSections,
  currentQuestion,
  totalQuestionsInSection
}: QuestionHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
            {currentCategory?.title[language]}
          </h2>
          <p className="text-sm text-emerald-600 font-medium">
            {language === 'english' ? 'Section' : 'Section'} {currentSection + 1} {language === 'english' ? 'of' : 'sur'} {totalSections}
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center">
          <span className="text-sm text-gray-500">
            {language === 'english' ? 'Question' : 'Question'} {currentQuestion + 1} {language === 'english' ? 'of' : 'sur'} {totalQuestionsInSection}
          </span>
          <div className="ml-3 flex space-x-1">
            {Array.from({ length: totalQuestionsInSection }).map((_, index) => (
              <div 
                key={index} 
                className={`h-2 w-2 rounded-full ${currentQuestion >= index ? 'bg-emerald-500' : 'bg-gray-200'}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
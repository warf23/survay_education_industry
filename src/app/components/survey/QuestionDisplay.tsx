'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { QuestionData } from './types';

// Define the type for QuestionComponent props
type QuestionComponentProps = {
  question: QuestionData;
  language: 'english' | 'french';
  value: string;
  onChange: (value: string) => void;
};

// Use dynamic import with proper typing
const SelectQuestionComponent = dynamic<QuestionComponentProps>(
  () => import('../SelectQuestionComponent').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>
  }
);

type QuestionDisplayProps = {
  question: QuestionData;
  language: 'english' | 'french';
  value: string;
  onChange: (answer: string) => void;
};

export default function QuestionDisplay({
  question,
  language,
  value,
  onChange
}: QuestionDisplayProps) {
  return (
    <div className="mb-8">
      <SelectQuestionComponent
        question={question}
        language={language}
        value={value}
        onChange={onChange}
      />
    </div>
  );
} 
'use client';

import React from 'react';

type QuestionProps = {
  question: {
    id: string;
    label: string;
    english: string;
    french: string;
  };
  language: 'english' | 'french';
  value: string;
  onChange: (value: string) => void;
};

export default function QuestionComponent({ question, language, value, onChange }: QuestionProps) {
  const questionText = question[language];
  const options: Record<string, string[]> = {
    // Industry sector options
    'A-01': [
      'Agriculture', 'Manufacturing', 'Technology', 'Healthcare', 
      'Education', 'Finance', 'Retail', 'Construction', 'Transportation', 'Other'
    ],
    // Region options
    'A-02': [
      'North America', 'Europe', 'Asia', 'South America', 
      'Africa', 'Australia/Oceania', 'Middle East'
    ],
    // Public or Private
    'A-03': ['Public', 'Private', 'Hybrid'],
    // Firm size
    'A-04': [
      '1-10 employees', '11-50 employees', '51-200 employees', 
      '201-500 employees', '501-1000 employees', '1000+ employees'
    ],
    // Firm age
    'A-05': [
      'Less than 1 year', '1-5 years', '6-10 years', 
      '11-20 years', '21-50 years', '50+ years'
    ],
    // Importance rating
    'B-02': [
      'Not important', 'Slightly important', 'Moderately important', 
      'Very important', 'Extremely important'
    ],
  };

  // Determine question type based on question ID
  const getQuestionType = (questionId: string) => {
    // Multi-choice questions
    if (['A-01', 'A-02', 'A-03', 'A-04', 'A-05', 'B-02'].includes(questionId)) {
      return 'radio';
    }
    
    // Open-ended questions that need textareas
    if (['A-06', 'A-08', 'B-01', 'B-03', 'B-04', 'C-03', 'C-05', 'D-01', 'D-02', 'D-03', 'D-05', 'D-06'].includes(questionId)) {
      return 'textarea';
    }
    
    // Default to text input
    return 'text';
  };

  const questionType = getQuestionType(question.id);

  // Render appropriate input based on question type
  const renderInput = () => {
    switch (questionType) {
      case 'radio':
        return (
          <div className="space-y-2">
            {options[question.id]?.map((option, index) => (
              <div 
                key={index}
                className={`radio-container ${value === option ? 'selected' : ''}`}
                onClick={() => onChange(option)}
              >
                <div className="radio-button">
                  <div className="radio-button-inner"></div>
                </div>
                <span>{option}</span>
              </div>
            ))}
          </div>
        );
      
      case 'textarea':
        return (
          <textarea
            className="textarea-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here..."
          />
        );
      
      case 'text':
      default:
        return (
          <input
            type="text"
            className="text-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here..."
          />
        );
    }
  };

  return (
    <div className="mb-8">
      <h2 className="question-title">{questionText}</h2>
      {renderInput()}
    </div>
  );
} 
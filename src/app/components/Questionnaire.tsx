'use client';

import React, { useState, useEffect } from 'react';
import QuestionComponent from './QuestionComponent';
import Welcome from './Welcome';
import Completion from './Completion';
import { saveSurveyResponses } from '@/lib/supabase';

type Answer = {
  questionId: string;
  answer: string;
};

type UserInfo = {
  id: string;
  fullName: string;
  email: string;
};

// Define the data structure to match data.json
type QuestionData = {
  id: string;
  label: string;
  english: string;
  french: string;
};

type CategoryData = {
  id: string;
  title: {
    english: string;
    french: string;
  };
  questions: QuestionData[];
};

type SurveyData = {
  categories: CategoryData[];
};

export default function Questionnaire() {
  const [data, setData] = useState<SurveyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [language, setLanguage] = useState<'english' | 'french'>('english');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    // Fetch data.json when component mounts
    fetch('/data.json')
      .then(response => response.json())
      .then((jsonData: SurveyData) => {
        setData(jsonData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading survey data:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }
  
  const categories = data.categories;
  const currentCategory = categories[currentSection];
  const totalSections = categories.length;
  const totalQuestionsInSection = currentCategory?.questions.length || 0;
  
  // Calculate overall progress
  const totalQuestions = categories.reduce((total, category) => total + category.questions.length, 0);
  const completedQuestions = answers.length;
  const progress = (completedQuestions / totalQuestions) * 100;

  const handleAnswer = (questionId: string, answer: string) => {
    // Check if we already have an answer for this question
    const existingAnswerIndex = answers.findIndex(a => a.questionId === questionId);
    
    if (existingAnswerIndex !== -1) {
      // Update existing answer
      const newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = { questionId, answer };
      setAnswers(newAnswers);
    } else {
      // Add new answer
      setAnswers([...answers, { questionId, answer }]);
    }
  };

  const handleNext = () => {
    // Check if we're at the last question in the section
    if (currentQuestion < totalQuestionsInSection - 1) {
      // Move to next question in the same section
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Move to the next section
      if (currentSection < totalSections - 1) {
        setCurrentSection(currentSection + 1);
        setCurrentQuestion(0);
      } else {
        // We're at the very end - submit the form
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    // Check if we're at the first question in the section
    if (currentQuestion > 0) {
      // Move to previous question in the same section
      setCurrentQuestion(currentQuestion - 1);
    } else {
      // Move to the previous section
      if (currentSection > 0) {
        setCurrentSection(currentSection - 1);
        // Go to the last question of the previous section
        const prevSectionQuestions = categories[currentSection - 1].questions.length;
        setCurrentQuestion(prevSectionQuestions - 1);
      }
    }
  };

  const handleSubmit = async () => {
    if (!userInfo) {
      console.error('No user info available');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Save survey responses to Supabase
      const success = await saveSurveyResponses(userInfo.id, answers);
      
      if (success) {
        // If successful, show completion screen
        setCompleted(true);
      } else {
        // If there was an error, show an error message
        setSubmitError(language === 'english' 
          ? 'An error occurred while saving your responses. Please try again.' 
          : 'Une erreur s\'est produite lors de l\'enregistrement de vos réponses. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error saving survey responses:', error);
      setSubmitError(language === 'english' 
        ? 'An error occurred while saving your responses. Please try again.' 
        : 'Une erreur s\'est produite lors de l\'enregistrement de vos réponses. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setCompleted(false);
    setCurrentSection(0);
    setCurrentQuestion(0);
    setAnswers([]);
    setUserInfo(null);
  };

  const handleStart = (userId: string, fullName: string, email: string) => {
    setUserInfo({
      id: userId,
      fullName,
      email
    });
    setStarted(true);
  };

  // Get current question
  const currentQuestionObj = currentCategory?.questions[currentQuestion];
  
  // Find answer for current question
  const currentAnswer = answers.find(a => a.questionId === currentQuestionObj?.id)?.answer || '';

  if (!started) {
    return (
      <Welcome 
        onStart={handleStart} 
        language={language}
        onLanguageChange={setLanguage}
      />
    );
  }

  if (completed) {
    return (
      <Completion 
        language={language} 
        onRestart={handleRestart} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="questionnaire-header">
        <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
          <h1 className="text-lg font-semibold">Survey: Education & Industry</h1>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1 rounded-full text-sm ${language === 'english' ? 'bg-purple-100 text-purple-800' : 'text-gray-600'}`}
              onClick={() => setLanguage('english')}
            >
              English
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm ${language === 'french' ? 'bg-purple-100 text-purple-800' : 'text-gray-600'}`}
              onClick={() => setLanguage('french')}
            >
              Français
            </button>
          </div>
        </div>
        <div className="progress-bar mt-4">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full py-8 px-4">
        <div className="question-container">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {submitError}
            </div>
          )}

          <p className="section-header">
            {`Section ${currentCategory?.id}: ${currentCategory?.title[language]}`}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Question {currentQuestion + 1} of {totalQuestionsInSection}
          </p>
          
          {currentQuestionObj && (
            <QuestionComponent
              question={currentQuestionObj}
              language={language}
              value={currentAnswer}
              onChange={(answer: string) => handleAnswer(currentQuestionObj.id, answer)}
            />
          )}
          
          <div className="flex justify-between mt-8">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              onClick={handlePrevious}
              disabled={currentSection === 0 && currentQuestion === 0}
            >
              Previous
            </button>
            
            <button 
              className="btn-primary"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {currentSection === totalSections - 1 && currentQuestion === totalQuestionsInSection - 1 ? (
                isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {language === 'english' ? 'Submitting...' : 'Soumission...'}
                  </span>
                ) : (
                  'Submit'
                )
              ) : (
                'Next'
              )}
              
              {currentSection !== totalSections - 1 || currentQuestion !== totalQuestionsInSection - 1 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : null}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 
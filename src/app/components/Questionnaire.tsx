'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Welcome from './Welcome';
import Completion from './Completion';
import { saveSurveyResponses, signOut, hasUserSubmittedResponses } from '@/lib/supabase';

// Define the type for QuestionComponent props
type QuestionComponentProps = {
  question: {
    id: string;
    label: string;
    english: string;
    french: string;
    type?: string;
    options?: Array<{
      english: string;
      french: string;
    }>;
  };
  language: 'english' | 'french';
  value: string;
  onChange: (value: string) => void;
};

// Use dynamic import with proper typing
const SelectQuestionComponent = dynamic<QuestionComponentProps>(
  () => import('./SelectQuestionComponent').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>
  }
);

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
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCheckingSubmission, setIsCheckingSubmission] = useState(false);

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
    // Get the current question object
    const currentQuestionObj = currentCategory?.questions[currentQuestion];
    
    // Ensure we have an answer for the current question (even if it's an empty string)
    if (currentQuestionObj) {
      const hasAnswer = answers.some(a => a.questionId === currentQuestionObj.id);
      
      if (!hasAnswer) {
        // If no answer exists, create an empty answer
        handleAnswer(currentQuestionObj.id, '');
      }
    }
    
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
      setSubmitError(language === 'english' 
        ? 'User information is missing. Please try signing in again.' 
        : 'Les informations utilisateur sont manquantes. Veuillez vous reconnecter.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      console.log('Submitting survey responses for user:', userInfo.id);
      
      // Ensure all questions have answers (even if they're empty strings)
      const allQuestions: QuestionData[] = [];
      categories.forEach(category => {
        category.questions.forEach(question => {
          allQuestions.push(question);
        });
      });
      
      // Create a complete set of answers
      const completeAnswers = [...answers];
      
      // Add empty answers for any questions that don't have answers yet
      allQuestions.forEach(question => {
        const hasAnswer = completeAnswers.some(a => a.questionId === question.id);
        if (!hasAnswer) {
          completeAnswers.push({ questionId: question.id, answer: '' });
        }
      });
      
      // Save survey responses to Supabase
      const success = await saveSurveyResponses(userInfo.id, completeAnswers);
      
      if (success) {
        // If successful, show completion screen
        setCompleted(true);
      } else {
        // If there was an error, show an error message
        setSubmitError(language === 'english' 
          ? 'An error occurred while saving your responses. Please try again or contact support.' 
          : 'Une erreur s\'est produite lors de l\'enregistrement de vos réponses. Veuillez réessayer ou contacter le support.');
      }
    } catch (error) {
      console.error('Error saving survey responses:', error);
      
      // Display a more specific error message if possible
      let errorMessage = '';
      if (error instanceof Error) {
        if (error.message.includes('foreign key constraint')) {
          errorMessage = language === 'english'
            ? 'There was an issue with your user account. Please try signing out and in again.'
            : 'Il y a eu un problème avec votre compte utilisateur. Veuillez essayer de vous déconnecter et de vous reconnecter.';
        } else {
          errorMessage = language === 'english' 
            ? 'An error occurred while saving your responses. Please try again.' 
            : 'Une erreur s\'est produite lors de l\'enregistrement de vos réponses. Veuillez réessayer.';
        }
      } else {
        errorMessage = language === 'english' 
          ? 'An unknown error occurred. Please try again.' 
          : 'Une erreur inconnue s\'est produite. Veuillez réessayer.';
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStart = (userId: string, fullName: string, email: string) => {
    setUserInfo({
      id: userId,
      fullName,
      email
    });
    
    // Check if the user has already submitted responses
    setIsCheckingSubmission(true);
    hasUserSubmittedResponses(userId)
      .then(hasSubmitted => {
        setHasSubmitted(hasSubmitted);
        setIsCheckingSubmission(false);
        
        // Initialize empty answers for all questions
        if (data) {
          const initialAnswers: Answer[] = [];
          data.categories.forEach(category => {
            category.questions.forEach(question => {
              initialAnswers.push({ questionId: question.id, answer: '' });
            });
          });
          setAnswers(initialAnswers);
        }
        
        setStarted(true);
      })
      .catch(error => {
        console.error('Error checking if user has submitted responses:', error);
        setIsCheckingSubmission(false);
        
        // Initialize empty answers for all questions
        if (data) {
          const initialAnswers: Answer[] = [];
          data.categories.forEach(category => {
            category.questions.forEach(question => {
              initialAnswers.push({ questionId: question.id, answer: '' });
            });
          });
          setAnswers(initialAnswers);
        }
        
        setStarted(true);
      });
  };

  // Get current question
  const currentQuestionObj = currentCategory?.questions[currentQuestion];
  
  // Find answer for current question
  const currentAnswer = answers.find(a => a.questionId === currentQuestionObj?.id)?.answer || '';

  // Add a sign out function to the component
  const handleSignOut = async () => {
    await signOut();
    window.location.reload(); // Reload the page to reset the state
  };

  if (!started) {
    return (
      <Welcome 
        onStart={handleStart} 
        language={language}
        onLanguageChange={setLanguage}
      />
    );
  }

  if (isCheckingSubmission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'english' ? 'Checking your previous submissions...' : 'Vérification de vos soumissions précédentes...'}
          </p>
        </div>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-md overflow-hidden">
          <div className="h-2 bg-purple-600"></div>
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {language === 'english' ? 'You have already completed this survey' : 'Vous avez déjà complété cette enquête'}
            </h1>
            <p className="text-gray-600 mb-6">
              {language === 'english' 
                ? 'Thank you for your previous submission. Your responses have been recorded and will be updated if you choose to continue.' 
                : 'Merci pour votre soumission précédente. Vos réponses ont été enregistrées et seront mises à jour si vous choisissez de continuer.'}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setHasSubmitted(false)} 
                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
              >
                {language === 'english' ? 'Continue Anyway' : 'Continuer Quand Même'}
              </button>
              <button 
                onClick={handleSignOut} 
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {language === 'english' ? 'Sign Out' : 'Se Déconnecter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <Completion 
        language={language} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="questionnaire-header">
        <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
          <h1 className="text-lg font-semibold">Survey: Education & Industry</h1>
          <div className="flex gap-2 items-center">
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
            <button
              className="ml-2 px-3 py-1 text-sm text-gray-600 hover:text-red-600"
              onClick={handleSignOut}
              title={language === 'english' ? 'Sign out' : 'Déconnexion'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
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
            <SelectQuestionComponent
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
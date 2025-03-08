'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Welcome from './Welcome';
import Completion from './Completion';
import { saveSurveyResponses, signOut, hasUserSubmittedResponses } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

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
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Verify the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error or no user found:', authError);
        setIsSubmitting(false);
        return;
      }
      
      if (user.id !== userInfo.id) {
        console.error('User ID mismatch. Authenticated:', user.id, 'Form user:', userInfo.id);
        setIsSubmitting(false);
        return;
      }
      
      console.log('Submitting responses for user:', userInfo.id);
      
      const success = await saveSurveyResponses(userInfo.id, answers);
      
      if (success) {
        setCompleted(true);
      } else {
        alert(language === 'english' 
          ? 'There was an error submitting your responses. Please try again.' 
          : 'Une erreur est survenue lors de la soumission de vos réponses. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error submitting responses:', error);
      alert(language === 'english' 
        ? 'There was an error submitting your responses. Please try again.' 
        : 'Une erreur est survenue lors de la soumission de vos réponses. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStart = (userId: string, fullName: string, email: string) => {
    console.log('Starting survey for user:', userId);
    
    // Verify the user ID matches the authenticated user
    supabase.auth.getUser()
      .then(({ data: { user }, error }) => {
        if (error) {
          console.error('Authentication error:', error);
          return;
        }
        
        if (!user) {
          console.error('No authenticated user found');
          return;
        }
        
        if (user.id !== userId) {
          console.error('User ID mismatch. Authenticated:', user.id, 'Provided:', userId);
          return;
        }
        
        // Set user info
        setUserInfo({
          id: userId,
          fullName,
          email
        });
        
        // Check if user has already submitted responses
        setIsCheckingSubmission(true);
        
        hasUserSubmittedResponses(userId)
          .then(hasSubmitted => {
            setHasSubmitted(hasSubmitted);
            setIsCheckingSubmission(false);
            
            // If user has submitted, we'll show the "already submitted" screen
            // Otherwise, initialize answers and start the survey
            if (!hasSubmitted) {
              // Initialize with empty answers for all questions
              const initialAnswers: Answer[] = [];
              categories.forEach(category => {
                category.questions.forEach(question => {
                  initialAnswers.push({
                    questionId: question.id,
                    answer: ''
                  });
                });
              });
              setAnswers(initialAnswers);
            }
            
            setStarted(true);
          });
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
                      setAnswers(updatedAnswers);
                    }

                    // Continue with the survey
                    setHasSubmitted(false);
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
                onClick={handleSignOut} 
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

  if (completed) {
    return (
      <Completion 
        language={language} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Modern Navigation Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Image 
                  src="/logo.png" 
                  alt="EMSI - École Marocaine des Sciences de l'Ingénieur" 
                  width={140} 
                  height={40} 
                  className="h-8 w-auto mr-3 object-contain"
                  priority
                />
                <span className="text-lg font-semibold text-gray-800 hidden sm:block">Survey: Education & Industry</span>
                <span className="text-lg font-semibold text-gray-800 sm:hidden">Survey</span>
              </div>
            </div>

            {/* User Profile and Controls */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="hidden sm:flex space-x-2">
            <button 
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${language === 'english' ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setLanguage('english')}
            >
              English
            </button>
            <button 
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${language === 'french' ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setLanguage('french')}
            >
              Français
            </button>
              </div>

              {/* Mobile Language Selector */}
              <div className="sm:hidden">
                <select 
                  className="bg-gray-100 border-0 rounded-md text-sm py-1 pl-2 pr-8 text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'english' | 'french')}
                >
                  <option value="english">English</option>
                  <option value="french">Français</option>
                </select>
              </div>

              {/* User Profile */}
              {userInfo && (
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-200">
                      <span className="text-emerald-700 font-medium text-sm">
                        {userInfo.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 hidden md:block">{userInfo.fullName.split(' ')[0]}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-700">{userInfo.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {language === 'english' ? 'Sign Out' : 'Se Déconnecter'}
                    </button>
                  </div>
                </div>
              )}

              {/* Sign Out Button (if no user profile) */}
              {!userInfo && (
            <button
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              onClick={handleSignOut}
              title={language === 'english' ? 'Sign out' : 'Déconnexion'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 w-full">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full mx-auto bg-white rounded-xl shadow-sm p-6 md:p-8">
          {/* Section and Question Navigation */}
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
          
          {/* Question Component */}
          {currentQuestionObj && (
            <div className="mb-8">
            <SelectQuestionComponent
              question={currentQuestionObj}
              language={language}
              value={currentAnswer}
              onChange={(answer: string) => handleAnswer(currentQuestionObj.id, answer)}
            />
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-8">
            <button 
              className={`order-2 sm:order-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center ${currentSection === 0 && currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handlePrevious}
              disabled={currentSection === 0 && currentQuestion === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {language === 'english' ? 'Previous' : 'Précédent'}
            </button>
            
            <button 
              className="order-1 sm:order-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors flex items-center justify-center shadow-sm"
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
        </div>
      </main>
    </div>
  );
} 
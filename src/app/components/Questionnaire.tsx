'use client';

import React, { useState, useEffect } from 'react';
import Welcome from './Welcome';
import Completion from './Completion';
import { saveSurveyResponses, signOut, hasUserSubmittedResponses } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

// Import newly created components
import LoadingSpinner from './survey/LoadingSpinner';
import SurveyHeader from './survey/SurveyHeader';
import NavigationButtons from './survey/NavigationButtons';
import QuestionHeader from './survey/QuestionHeader';
import QuestionDisplay from './survey/QuestionDisplay';
import AlreadySubmittedScreen from './survey/AlreadySubmittedScreen';

// Import types
import { Answer, UserInfo, SurveyData } from './survey/types';

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
    return <LoadingSpinner />;
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
    
    if (!currentQuestionObj) return;
    
    // Find the current answer
    const currentAnswer = answers.find(a => a.questionId === currentQuestionObj.id)?.answer || '';
    
    // Check if the answer is empty or only whitespace
    if (!currentAnswer.trim()) {
      alert(language === 'english' 
        ? 'Please answer the current question before proceeding.'
        : 'Veuillez répondre à la question actuelle avant de continuer.');
      return;
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
  
  // Check if current question has a non-empty answer
  const isCurrentQuestionAnswered = Boolean(currentAnswer.trim());

  // Add a sign out function to the component
  const handleSignOut = async () => {
    await signOut();
    window.location.reload(); // Reload the page to reset the state
  };

  const handleContinueFromSubmitted = (updatedAnswers: Answer[]) => {
    setAnswers(updatedAnswers);
    setHasSubmitted(false);
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
    return <LoadingSpinner message={language === 'english' ? 'Checking your previous submissions...' : 'Vérification de vos soumissions précédentes...'} />;
  }

  if (hasSubmitted) {
    return (
      <AlreadySubmittedScreen 
        language={language}
        userInfo={userInfo}
        onContinue={handleContinueFromSubmitted}
        onSignOut={handleSignOut}
      />
    );
  }

  if (completed) {
    return <Completion language={language} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Survey Header with Navigation */}
      <SurveyHeader 
        language={language}
        setLanguage={setLanguage}
        progress={progress}
        userInfo={userInfo}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full mx-auto bg-white rounded-xl shadow-sm p-6 md:p-8">
          {/* Section and Question Navigation */}
          <QuestionHeader 
            currentCategory={currentCategory}
            language={language}
            currentSection={currentSection}
            totalSections={totalSections}
            currentQuestion={currentQuestion}
            totalQuestionsInSection={totalQuestionsInSection}
          />
          
          {/* Question Component */}
          {currentQuestionObj && (
            <QuestionDisplay
              question={currentQuestionObj}
              language={language}
              value={currentAnswer}
              onChange={(answer: string) => handleAnswer(currentQuestionObj.id, answer)}
            />
          )}
          
          {/* Navigation Buttons */}
          <NavigationButtons 
            language={language}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isFirstQuestion={currentSection === 0 && currentQuestion === 0}
            isLastQuestion={currentSection === totalSections - 1 && currentQuestion === totalQuestionsInSection - 1}
            isSubmitting={isSubmitting}
            isCurrentQuestionAnswered={isCurrentQuestionAnswered}
          />
        </div>
      </main>
    </div>
  );
} 
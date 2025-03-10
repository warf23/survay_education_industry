'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SurveyResponse } from '@/app/admin/dashboard/page';
import { getAnalytics } from '@/lib/admin-data';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title
);

// Feature flag to control whether to show analytics or redirect to the table view
// Set to true to enable analytics, false to redirect to the table view
const ENABLE_ANALYTICS = false;

// Survey data types
type SurveyData = {
  categories: SurveyCategory[];
};

type SurveyCategory = {
  id: string;
  title: {
    english: string;
    french: string;
  };
  questions: SurveyQuestion[];
};

type SurveyQuestion = {
  id: string;
  label: string;
  english: string;
  french: string;
  type?: string;
  options?: SurveyOption[];
};

type SurveyOption = {
  english: string;
  french: string;
};

type AnalyticsProps = {
  data: SurveyResponse[];
};

export default function Analytics({ data }: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyData | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [showRawResponses, setShowRawResponses] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const responsesPerPage = 5;
  const redirecting = !ENABLE_ANALYTICS;
  
  // Redirect logic if analytics is disabled
  useEffect(() => {
    if (!ENABLE_ANALYTICS) {
      // Set a small delay before redirecting to show a message
      const timer = setTimeout(() => {
        // Find the parent element and switch to table view
        const event = new CustomEvent('switchToTableView');
        window.dispatchEvent(event);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Compute analytics data
  const analytics = useMemo(() => getAnalytics(data), [data]);
  
  // Fetch survey questions data
  useEffect(() => {
    fetch('/data.json')
      .then(response => response.json())
      .then((jsonData: SurveyData) => {
        setSurveyQuestions(jsonData);
      })
      .catch(error => {
        console.error('Error loading survey data:', error);
      });
  }, []);
  
  useEffect(() => {
    // Simulate loading for smoother transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format data for pie chart - Industries
  const industryPieData = useMemo(() => {
    const industries = Object.keys(analytics.responsesByIndustry);
    const counts = Object.values(analytics.responsesByIndustry) as number[];
    
    // Generate a color palette
    const generateColors = (count: number) => {
      const colors = [];
      const backgroundColors = [];
      for (let i = 0; i < count; i++) {
        const hue = (i * 360) / count;
        colors.push(`hsla(${hue}, 75%, 60%, 1)`);
        backgroundColors.push(`hsla(${hue}, 75%, 60%, 0.7)`);
      }
      return { colors, backgroundColors };
    };
    
    const { colors, backgroundColors } = generateColors(industries.length);
    
    return {
      labels: industries,
      datasets: [
        {
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    };
  }, [analytics.responsesByIndustry]);
  
  // Format data for pie chart - Regions
  const regionPieData = useMemo(() => {
    const regions = Object.keys(analytics.responsesByRegion);
    const counts = Object.values(analytics.responsesByRegion) as number[];
    
    // Generate a color palette
    const generateColors = (count: number) => {
      const colors = [];
      const backgroundColors = [];
      for (let i = 0; i < count; i++) {
        const hue = (i * 140 + 200) % 360; // Different color scheme from industry
        colors.push(`hsla(${hue}, 75%, 50%, 1)`);
        backgroundColors.push(`hsla(${hue}, 75%, 50%, 0.7)`);
      }
      return { colors, backgroundColors };
    };
    
    const { colors, backgroundColors } = generateColors(regions.length);
    
    return {
      labels: regions,
      datasets: [
        {
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    };
  }, [analytics.responsesByRegion]);
  
  // Generate questions response data
  const questionsData = useMemo(() => {
    if (!surveyQuestions || !data.length) return null;
    
    const allQuestions: Record<string, {
      question: SurveyQuestion,
      category: string,
      categoryTitle: string,
      responses: Record<string, number>
    }> = {};
    
    // Process all questions from the survey structure
    surveyQuestions.categories.forEach(category => {
      category.questions.forEach(question => {
        allQuestions[question.id] = {
          question,
          category: category.id,
          categoryTitle: category.title.english,
          responses: {}
        };
        
        // Initialize responses object
        if (question.options) {
          question.options.forEach(option => {
            allQuestions[question.id].responses[option.english] = 0;
          });
        } else {
          // For text questions, we'll handle them differently
          allQuestions[question.id].responses['Text Responses'] = 0;
        }
      });
    });
    
    // Count responses for each question
    data.forEach(response => {
      // Iterate through all questions
      for (const questionData of Object.values(allQuestions)) {
        const question = questionData.question;
        
        // Try multiple possible field names to match with response data
        const possibleFieldNames = [
          question.label,           // e.g., "Age"
          question.id,              // e.g., "A-05"
          question.id.replace('-', ''), // e.g., "A05"
          question.label.toLowerCase(), // e.g., "age"
          // Add more variations if needed
        ];
        
        // Find the first field name that has a value
        const matchedField = possibleFieldNames.find(fieldName => 
          response[fieldName] !== undefined && response[fieldName] !== null
        );
        
        if (matchedField) {
          const value = response[matchedField];
          
          if (typeof value === 'string') {
            if (question.type === 'select' || question.type === 'radio') {
              // For select/radio, increment the count for that option
              if (questionData.responses[value] !== undefined) {
                questionData.responses[value]++;
              } else {
                questionData.responses[value] = 1;
              }
            } else if (question.type === 'multiselect') {
              // For multiselect, might be stored as comma-separated or JSON
              try {
                // Try parsing as JSON first
                const selectedOptions = JSON.parse(value);
                if (Array.isArray(selectedOptions)) {
                  selectedOptions.forEach(option => {
                    if (questionData.responses[option] !== undefined) {
                      questionData.responses[option]++;
                    } else {
                      questionData.responses[option] = 1;
                    }
                  });
                }
              } catch {
                // Not JSON, try as comma-separated
                value.split(',').forEach(option => {
                  const trimmedOption = option.trim();
                  if (trimmedOption) {
                    if (questionData.responses[trimmedOption] !== undefined) {
                      questionData.responses[trimmedOption]++;
                    } else {
                      questionData.responses[trimmedOption] = 1;
                    }
                  }
                });
              }
            } else {
              // Text response
              questionData.responses['Text Responses']++;
            }
          } else if (typeof value === 'boolean') {
            // Boolean response (likely yes/no)
            const boolValue = value ? 'Yes' : 'No';
            if (questionData.responses[boolValue] !== undefined) {
              questionData.responses[boolValue]++;
            } else {
              questionData.responses[boolValue] = 1;
            }
          }
        }
      }
    });
    
    return allQuestions;
  }, [surveyQuestions, data]);
  
  // Selected question data for visualization
  const selectedQuestionData = useMemo(() => {
    if (!questionsData || !selectedQuestionId) return null;
    
    const questionInfo = questionsData[selectedQuestionId];
    if (!questionInfo) return null;
    
    // Generate colors for visualization
    const generateColors = (count: number) => {
      const colors = [];
      const backgroundColors = [];
      for (let i = 0; i < count; i++) {
        const hue = (i * 137.5 + 120) % 360; // Using green-based emerald hues
        colors.push(`hsla(${hue}, 75%, 45%, 1)`);
        backgroundColors.push(`hsla(${hue}, 75%, 45%, 0.7)`);
      }
      return { colors, backgroundColors };
    };
    
    const labels = Object.keys(questionInfo.responses);
    const values = Object.values(questionInfo.responses);
    const { colors, backgroundColors } = generateColors(labels.length);
    
    // For text questions, we'll show a count of responses
    if (questionInfo.question.type === 'text' || !questionInfo.question.type) {
      return {
        questionInfo,
        chartData: {
          labels: ['Text Responses'],
          datasets: [{
            data: [values[0] || 0],
            backgroundColor: ['rgba(16, 185, 129, 0.7)'],
            borderColor: ['rgb(16, 185, 129)'],
            borderWidth: 1
          }]
        },
        isText: true
      };
    }
    
    // For other question types (select, radio, multiselect)
    return {
      questionInfo,
      chartData: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors,
          borderColor: colors,
          borderWidth: 1
        }]
      },
      isText: false
    };
  }, [questionsData, selectedQuestionId]);

  // Get actual responses for the selected question
  const actualResponses = useMemo(() => {
    if (!selectedQuestionId || !data.length) return [];
    
    // Find the question label/id to match with response data
    const questionInfo = surveyQuestions?.categories
      .flatMap(category => category.questions)
      .find(q => q.id === selectedQuestionId);
    
    if (!questionInfo) return [];
    
    // Try multiple possible field names to match with response data
    // This handles cases where the field name might be different from the label
    const possibleFieldNames = [
      questionInfo.label,           // e.g., "Age"
      questionInfo.id,              // e.g., "A-05"
      questionInfo.id.replace('-', ''), // e.g., "A05"
      questionInfo.label.toLowerCase(), // e.g., "age"
      // Add more variations if needed
    ];
    
    // Get all responses for this question by trying different field names
    const matchedResponses = data.filter(response => {
      return possibleFieldNames.some(fieldName => 
        response[fieldName] !== undefined && response[fieldName] !== null
      );
    });
    
    return matchedResponses.map(response => {
      // Find the first field name that has a value
      const matchedField = possibleFieldNames.find(fieldName => 
        response[fieldName] !== undefined && response[fieldName] !== null
      ) || questionInfo.label;
      
      return {
        id: response.id,
        value: response[matchedField],
        industry: response.Industry,
        region: response.Region,
        firmSize: response.FirmSize,
        age: response.Age
      };
    });
  }, [selectedQuestionId, data, surveyQuestions]);

  // Paginate responses
  const paginatedResponses = useMemo(() => {
    const startIndex = (currentPage - 1) * responsesPerPage;
    return actualResponses.slice(startIndex, startIndex + responsesPerPage);
  }, [actualResponses, currentPage, responsesPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(actualResponses.length / responsesPerPage);
  
  // Show loading state or redirection message
  if (isLoading || redirecting) {
    return (
      <div className="flex items-center justify-center h-full">
        {redirecting ? (
          <div className="text-center">
            <motion.div 
              className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-700 font-medium">Analytics is currently disabled.</p>
            <p className="text-gray-500 mt-2">Redirecting to Survey Responses...</p>
          </div>
        ) : (
          <motion.div 
            className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    );
  }
  
  // Don't render anything if analytics is disabled (we're redirecting)
  if (!ENABLE_ANALYTICS) {
    return null;
  }
  
  return (
    <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
      {/* Analytics navigation tabs */}
      <div className="flex items-center border-b border-emerald-100 bg-emerald-50 px-4 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'questions', label: 'Questions Analysis' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'questions')}
            className={`px-4 py-3 font-medium text-sm relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-emerald-700' : 'text-gray-600 hover:text-emerald-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
      
      {/* Content area */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Responses Card */}
              <motion.div 
                className="bg-white rounded-lg shadow-sm border border-emerald-100 p-4"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm">Total Responses</h3>
                    <div className="text-2xl font-bold text-gray-800">{analytics.totalResponses}</div>
                  </div>
                </div>
              </motion.div>
              
              {/* Avg Response Length Card */}
              <motion.div 
                className="bg-white rounded-lg shadow-sm border border-emerald-100 p-4"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm">Avg Response Length</h3>
                    <div className="text-2xl font-bold text-gray-800">{analytics.averageResponseLength} chars</div>
                  </div>
                </div>
              </motion.div>
              
              {/* Industries Card */}
              <motion.div 
                className="bg-white rounded-lg shadow-sm border border-emerald-100 p-4"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm">Unique Industries</h3>
                    <div className="text-2xl font-bold text-gray-800">{Object.keys(analytics.responsesByIndustry).length}</div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Overview Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <motion.div 
                className="bg-white rounded-lg shadow-sm border border-emerald-100 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-gray-700 font-medium mb-4">Industry Distribution</h3>
                <div className="h-64">
                  <Pie 
                    data={industryPieData} 
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            boxWidth: 15,
                            font: {
                              size: 11
                            }
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-lg shadow-sm border border-emerald-100 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-gray-700 font-medium mb-4">Regional Distribution</h3>
                <div className="h-64">
                  <Pie 
                    data={regionPieData} 
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            boxWidth: 15,
                            font: {
                              size: 11
                            }
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Questions Analysis Tab */}
        {activeTab === 'questions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Question-by-Question Analysis</h2>
            
            {!surveyQuestions ? (
              <div className="text-center p-8">
                <motion.div 
                  className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="mt-4 text-gray-500">Loading question data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Questions Navigation */}
                <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-4 overflow-y-auto max-h-[700px]">
                  <h3 className="text-gray-700 font-medium mb-4 sticky top-0 bg-white py-2 border-b border-gray-100">Select a Question</h3>
                  
                  <div className="space-y-6">
                    {surveyQuestions.categories.map(category => (
                      <div key={category.id} className="space-y-2">
                        <h4 className="text-sm font-medium text-emerald-700 mb-2">{category.title.english}</h4>
                        
                        {category.questions.map(question => (
                          <motion.button
                            key={question.id}
                            onClick={() => setSelectedQuestionId(question.id)}
                            className={`text-left p-2 rounded-md text-sm w-full ${
                              selectedQuestionId === question.id 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                            whileHover={{ x: 3 }}
                          >
                            <div className="font-medium">{question.label}</div>
                            <div className="text-xs truncate">{question.english}</div>
                          </motion.button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Question visualization */}
                <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-4 md:col-span-2">
                  {selectedQuestionId && selectedQuestionData ? (
                    <div>
                      <div className="mb-6">
                        <span className="text-xs font-medium text-emerald-700">{selectedQuestionData.questionInfo.category} • {selectedQuestionData.questionInfo.question.id}</span>
                        <h3 className="text-lg font-medium text-gray-800">{selectedQuestionData.questionInfo.question.english}</h3>
                        <p className="text-sm text-gray-500 mt-1">Question type: {selectedQuestionData.questionInfo.question.type || 'Text'}</p>
                      </div>
                      
                      {/* Toggle between chart and raw responses */}
                      <div className="flex justify-end mb-4">
                        <div className="bg-gray-100 rounded-lg p-1 inline-flex">
                          <button
                            onClick={() => setShowRawResponses(false)}
                            className={`px-3 py-1 text-sm rounded-md ${
                              !showRawResponses 
                                ? 'bg-white shadow-sm text-emerald-700' 
                                : 'text-gray-600 hover:text-emerald-600'
                            }`}
                          >
                            Chart View
                          </button>
                          <button
                            onClick={() => setShowRawResponses(true)}
                            className={`px-3 py-1 text-sm rounded-md ${
                              showRawResponses 
                                ? 'bg-white shadow-sm text-emerald-700' 
                                : 'text-gray-600 hover:text-emerald-600'
                            }`}
                          >
                            Raw Responses
                          </button>
                        </div>
                      </div>
                      
                      {!showRawResponses ? (
                        // Chart view - existing code
                        <>
                          {selectedQuestionData.isText ? (
                            <div className="bg-emerald-50 rounded-lg p-6 text-center">
                              <div className="text-6xl font-bold text-emerald-700 mb-2">
                                {selectedQuestionData.chartData.datasets[0].data[0]}
                              </div>
                              <div className="text-sm text-emerald-600">Text responses received</div>
                              
                              <div className="mt-8 p-4 bg-white rounded-lg border border-emerald-100">
                                <p className="text-sm text-gray-600">
                                  This is an open-ended text question. The number above represents how many respondents 
                                  answered this question. Switch to &quot;Raw Responses&quot; to see the actual text responses.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="h-80">
                              {selectedQuestionData.questionInfo.question.type === 'multiselect' ? (
                                <Bar 
                                  data={selectedQuestionData.chartData}
                                  options={{
                                    indexAxis: 'y',
                                    plugins: {
                                      legend: { display: false },
                                      tooltip: {
                                        callbacks: {
                                          label: (context) => {
                                            const value = context.raw as number;
                                            const total = (selectedQuestionData.chartData.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                                            const percentage = ((value / total) * 100).toFixed(1);
                                            return `${value} responses (${percentage}%)`;
                                          }
                                        }
                                      }
                                    },
                                    scales: {
                                      x: { grid: { display: false } },
                                      y: { grid: { display: false } }
                                    },
                                    maintainAspectRatio: false
                                  }}
                                />
                              ) : (
                                <Doughnut 
                                  data={selectedQuestionData.chartData}
                                  options={{
                                    cutout: '60%',
                                    plugins: {
                                      legend: { 
                                        position: 'right',
                                        labels: { boxWidth: 15, font: { size: 11 } }
                                      },
                                      tooltip: {
                                        callbacks: {
                                          label: (context) => {
                                            const value = context.raw as number;
                                            const total = (selectedQuestionData.chartData.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                                            const percentage = ((value / total) * 100).toFixed(1);
                                            return `${value} responses (${percentage}%)`;
                                          }
                                        }
                                      }
                                    },
                                    maintainAspectRatio: false
                                  }}
                                />
                              )}
                            </div>
                          )}
                          
                          {/* Data summary */}
                          <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                            <h4 className="font-medium text-emerald-700 mb-2">Response Summary</h4>
                            
                            {!selectedQuestionData.isText && (
                              <div className="space-y-2 mt-3">
                                {Object.entries(selectedQuestionData.questionInfo.responses)
                                  .sort((a, b) => b[1] - a[1])
                                  .map(([option, count], index) => (
                                    <div key={option} className="flex items-center justify-between">
                                      <div className="text-sm text-gray-700 flex items-center">
                                        <div className="w-3 h-3 rounded-full mr-2" style={{ 
                                          backgroundColor: selectedQuestionData.chartData.datasets[0].backgroundColor[index] as string 
                                        }}></div>
                                        <span className="truncate max-w-xs">{option}</span>
                                      </div>
                                      <div className="text-sm font-medium">
                                        {count} ({Math.round(count / data.length * 100)}%)
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        // Raw responses view - new code
                        <div>
                          <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-emerald-700 mb-2">Individual Responses</h4>
                            <p className="text-sm text-gray-600">
                              Showing {actualResponses.length} responses for this question.
                            </p>
                          </div>
                          
                          {actualResponses.length === 0 ? (
                            <div className="text-center p-8 text-gray-500">
                              No responses found for this question.
                            </div>
                          ) : (
                            <>
                              <div className="space-y-4 mb-6">
                                {paginatedResponses.map((response, index) => (
                                  <motion.div 
                                    key={`${response.id}-${index}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
                                  >
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {response.industry && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          {response.industry}
                                        </span>
                                      )}
                                      {response.region && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                          {response.region}
                                        </span>
                                      )}
                                      {response.firmSize && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                          {response.firmSize}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="mt-2">
                                      {typeof response.value === 'string' ? (
                                        <p className="text-gray-700 whitespace-pre-wrap">{response.value}</p>
                                      ) : (
                                        <p className="text-gray-700">{String(response.value)}</p>
                                      )}
                                    </div>
                                    
                                    <div className="mt-2 text-xs text-gray-500">
                                      Response ID: {response.id}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                              
                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="flex justify-center mt-6">
                                  <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                      disabled={currentPage === 1}
                                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                        currentPage === 1 
                                          ? 'text-gray-300 cursor-not-allowed' 
                                          : 'text-gray-500 hover:bg-gray-50'
                                      }`}
                                    >
                                      <span className="sr-only">Previous</span>
                                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                    
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                      <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                          currentPage === page
                                            ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                        }`}
                                      >
                                        {page}
                                      </button>
                                    ))}
                                    
                                    <button
                                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                      disabled={currentPage === totalPages}
                                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                        currentPage === totalPages 
                                          ? 'text-gray-300 cursor-not-allowed' 
                                          : 'text-gray-500 hover:bg-gray-50'
                                      }`}
                                    >
                                      <span className="sr-only">Next</span>
                                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </nav>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center flex-col">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-gray-500 mt-4">Select a question to view its analytics</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
} 
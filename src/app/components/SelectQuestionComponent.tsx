import React, { useState, useRef, useEffect } from 'react';

type Option = {
  english: string;
  french: string;
};

type SelectQuestionProps = {
  question: {
    id: string;
    label: string;
    english: string;
    french: string;
    type?: string;
    options?: Option[];
  };
  language: 'english' | 'french';
  value: string;
  onChange: (value: string) => void;
};

const SelectQuestionComponent = ({ question, language, value, onChange }: SelectQuestionProps) => {
  // Default to text if no type is specified
  const type = question.type || 'text';
  const options = question.options || [];
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleMultiSelectChange = (option: string) => {
    const currentValues = value ? value.split(',') : [];
    
    if (currentValues.includes(option)) {
      // Remove if already selected
      const newValues = currentValues.filter(v => v !== option);
      onChange(newValues.join(','));
    } else {
      // Add if not already selected
      currentValues.push(option);
      onChange(currentValues.join(','));
    }
  };

  return (
    <div className="mb-6 animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-800 mb-2">{question[language]}</h2>
        <div className="h-1 w-16 bg-emerald-500 rounded-full"></div>
      </div>
      
      {type === 'text' && (
        <div className="mt-4">
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm resize-none"
            rows={5}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={language === 'english' ? "Enter your answer here..." : "Entrez votre réponse ici..."}
            aria-label={question[language]}
          />
          
          <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
            <div>
              {value.length > 0 && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {language === 'english' ? 'Response saved as you type' : 'Réponse enregistrée pendant que vous tapez'}
                </span>
              )}
            </div>
            <div>
              {value.length > 0 && (
                <span>{value.length} {language === 'english' ? 'characters' : 'caractères'}</span>
              )}
            </div>
          </div>
        </div>
      )}
      
      {type === 'select' && (
        <div className="relative mt-4" ref={dropdownRef}>
          {/* Modern selection display */}
          <div 
            className="w-full p-4 border border-gray-300 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={value ? "text-gray-800" : "text-gray-400"}>
              {value || (language === 'english' ? "Select an option" : "Sélectionner une option")}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Options cards container */}
          {isOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto animate-scaleIn">
              {options.map((option, index) => (
                <div 
                  key={index} 
                  className={`p-3 cursor-pointer hover:bg-emerald-50 transition-colors ${value === option[language] ? "bg-emerald-100 font-medium" : ""}`}
                  onClick={() => {
                    onChange(option[language]);
                    setIsOpen(false);
                  }}
                >
                  {option[language]}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {type === 'radio' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {options.map((option, index) => (
            <div 
              key={index} 
              className={`
                p-4 rounded-lg border cursor-pointer transition-all duration-200
                ${value === option[language] 
                  ? "border-emerald-500 bg-emerald-50 shadow-sm" 
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
              `}
              onClick={() => onChange(option[language])}
            >
              <div className="flex items-center">
                <div className={`
                  h-5 w-5 rounded-full mr-3 flex items-center justify-center
                  border-2 transition-colors duration-200 ${value === option[language] ? "border-emerald-600" : "border-gray-400"}
                `}>
                  {value === option[language] && (
                    <div className="h-2.5 w-2.5 bg-emerald-600 rounded-full animate-scaleIn"></div>
                  )}
                </div>
                <label className="cursor-pointer">
                  {option[language]}
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {type === 'multiselect' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {options.map((option, index) => {
            const selectedValues = value ? value.split(',') : [];
            const isChecked = selectedValues.includes(option[language]);
            
            return (
              <div 
                key={index} 
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all duration-200
                  ${isChecked 
                    ? "border-emerald-500 bg-emerald-50 shadow-sm" 
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
                `}
                onClick={() => handleMultiSelectChange(option[language])}
              >
                <div className="flex items-center">
                  <div className={`
                    h-5 w-5 rounded-md mr-3 flex items-center justify-center transition-colors duration-200
                    ${isChecked ? "bg-emerald-600 border-emerald-600" : "border-2 border-gray-400"}
                  `}>
                    {isChecked && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white animate-scaleIn" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    {option[language]}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectQuestionComponent; 
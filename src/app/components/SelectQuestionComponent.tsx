import React, { useState } from 'react';

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
    <div className="mb-6">
      <label className="block font-medium text-lg mb-3">
        {question[language]}
      </label>
      
      {type === 'text' && (
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={language === 'english' ? "Enter your answer here..." : "Entrez votre réponse ici..."}
        />
      )}
      
      {type === 'select' && (
        <div className="relative">
          {/* Modern selection display */}
          <div 
            className="w-full p-4 border border-gray-300 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={value ? "text-gray-800" : "text-gray-400"}>
              {value || (language === 'english' ? "Select an option" : "Sélectionner une option")}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? "transform rotate-180" : ""}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Options cards container */}
          {isOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((option, index) => (
            <div 
              key={index} 
              className={`
                p-4 rounded-lg border cursor-pointer transition-all
                ${value === option[language] 
                  ? "border-emerald-500 bg-emerald-50 shadow-sm" 
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
              `}
              onClick={() => onChange(option[language])}
            >
              <div className="flex items-center">
                <div className={`
                  h-5 w-5 rounded-full mr-3 flex items-center justify-center
                  border-2 ${value === option[language] ? "border-emerald-600" : "border-gray-400"}
                `}>
                  {value === option[language] && (
                    <div className="h-2.5 w-2.5 bg-emerald-600 rounded-full"></div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((option, index) => {
            const selectedValues = value ? value.split(',') : [];
            const isChecked = selectedValues.includes(option[language]);
            
            return (
              <div 
                key={index} 
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all
                  ${isChecked 
                    ? "border-emerald-500 bg-emerald-50 shadow-sm" 
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
                `}
                onClick={() => handleMultiSelectChange(option[language])}
              >
                <div className="flex items-center">
                  <div className={`
                    h-5 w-5 rounded-md mr-3 flex items-center justify-center
                    ${isChecked ? "bg-emerald-600 border-emerald-600" : "border-2 border-gray-400"}
                  `}>
                    {isChecked && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
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
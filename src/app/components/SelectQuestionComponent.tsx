import React, { useState, useRef, useEffect, useMemo } from 'react';

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

// Helper function to stylize keywords in questions
const stylizeQuestionText = (questionId: string, text: string, language: 'english' | 'french'): React.ReactNode => {
  // Define keywords to highlight for each question category
  const keywordsMap: Record<string, { english: string[]; french: string[] }> = {
    // Firm Information
    'A-01': {
      english: ['industry sector'],
      french: ['secteur d\'activité']
    },
    'A-02': {
      english: ['company headquartered'],
      french: ['siège social', 'entreprise']
    },
    'A-03': {
      english: ['Public', 'Private'],
      french: ['publique', 'privée']
    },
    'A-04': {
      english: ['firm size', 'employees'],
      french: ['taille', 'entreprise', 'employés']
    },
    'A-05': {
      english: ['age of the firm'],
      french: ['âge', 'entreprise']
    },
    'A-06': {
      english: ['strengths', 'skills', 'resources', 'market positioning'],
      french: ['forces', 'compétences', 'ressources', 'positionnement sur le marché']
    },
    'A-07': {
      english: ['recruitment process'],
      french: ['process de recrutement']
    },
    'A-08': {
      english: ['market opportunities'],
      french: ['opportunités', 'marché']
    },
    'A-09': {
      english: ['main competitors'],
      french: ['principaux concurrents']
    },
    'A-10': {
      english: ['innovation', 'R&D'],
      french: ['innovation', 'R&D']
    },
    // Skills Identification
    'B-01': {
      english: ['key skills'],
      french: ['compétences clés']
    },
    'B-02': {
      english: ['skills', 'importance', 'market context'],
      french: ['compétences', 'importance', 'contexte actuel du marché']
    },
    'B-03': {
      english: ['specific skills', 'lacking'],
      french: ['compétences spécifiques', 'manquent']
    },
    'B-04': {
      english: ['skills', 'technological developments'],
      french: ['compétences', 'évolutions technologiques']
    },
    'B-05': {
      english: ['tools', 'methods', 'assess', 'skills'],
      french: ['outils', 'méthodes', 'évaluer', 'compétences']
    },
    // Collaboration section
    'C-01': {
      english: ['formal partnerships', 'training institutions'],
      french: ['partenariats formels', 'institutions de formation']
    },
    'C-02': {
      english: ['partnerships', 'skills development'],
      french: ['partenariats', 'développement des compétences']
    },
    'C-03': {
      english: ['difficulties', 'collaboration', 'education', 'industry'],
      french: ['difficultés', 'collaboration', 'éducation', 'industrie']
    },
    'C-04': {
      english: ['channels', 'knowledge', 'training establishments'],
      french: ['canaux', 'savoir', 'établissements de formation']
    },
    'C-05': {
      english: ['initiatives', 'improve', 'cooperation'],
      french: ['initiatives', 'améliorer', 'coopération']
    },
    // Future Prospects
    'D-01': {
      english: ['essential', 'next 5 to 10 years'],
      french: ['essentielles', '5 à 10 prochaines années']
    },
    'D-02': {
      english: ['teaching methods', 'evolve', 'future needs'],
      french: ['méthodes d\'enseignement', 'évoluer', 'besoins futurs']
    },
    'D-03': {
      english: ['new technologies', 'AI', 'digitization', 'skills development'],
      french: ['nouvelles technologies', 'IA', 'digitalisation', 'développement des compétences']
    },
    'D-04': {
      english: ['measure', 'effectiveness', 'skills', 'market requirements'],
      french: ['mesurez', 'efficacité', 'compétences', 'exigences du marché']
    },
    'D-05': {
      english: ['recommendations', 'improve', 'match', 'education', 'industrial needs'],
      french: ['recommandations', 'renforcer', 'adéquation', 'éducation', 'besoins industriels']
    }
  };

  // If no keywords defined for this question, return plain text
  if (!keywordsMap[questionId]) {
    return text;
  }

  const keywords = keywordsMap[questionId][language] || [];
  if (keywords.length === 0) {
    return text;
  }

  // Create parts to display with highlighting
  let parts: React.ReactNode[] = [text];
  
  // For each keyword, split all current parts that are strings and replace the keyword with styled version
  keywords.forEach(keyword => {
    parts = parts.flatMap(part => {
      // Skip if part is already a React element
      if (typeof part !== 'string') return part;
      
      const segments = part.split(new RegExp(`(${keyword})`, 'i'));
      return segments.map((segment, i) => {
        if (i % 2 === 1) { // This is a matched keyword
          // Use emerald-600 color for all keywords
          const colorClass = 'text-emerald-600';
          
          // Create a more unique key by combining keyword, segment and index
          const uniqueKey = `${keyword}-${segment}-${i}`;
          
          return <span key={uniqueKey} className={`${colorClass} font-medium`}>{segment}</span>;
        }
        return segment;
      });
    });
  });

  return <>{parts}</>;
};

// Helper function to check if an option is a "specify" type option
const isSpecifyOption = (option: string, language: 'english' | 'french'): boolean => {
  const specifyTerms = {
    english: ['other', 'specify', 'please specify', 'custom', 'specify country', 'specify option'],
    french: ['autre', 'précisez', 'veuillez préciser', 'préciser', 'personnalisé', 'précisez le pays']
  };

  return specifyTerms[language].some(term => 
    option.toLowerCase().includes(term.toLowerCase())
  );
};

const SelectQuestionComponent = ({ question, language, value, onChange }: SelectQuestionProps) => {
  // Default to text if no type is specified
  const type = question.type || 'text';
  const options = question.options || [];
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [otherValue, setOtherValue] = useState('');
  
  // Check if selected option is a "specify" type option
  const selectedOption = value.split(':')?.[0]?.trim() || value;
  const isOtherSelected = isSpecifyOption(selectedOption, language);
  
  // For multiselect, check if any of the selected values is a "specify" type option
  const selectedValues = useMemo(() => value ? value.split(',') : [], [value]);
  const isOtherInMultiselect = selectedValues.some(val => 
    isSpecifyOption(val.split(':')?.[0]?.trim() || val, language)
  );
  
  // Handle "Other" text input change
  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const otherText = e.target.value;
    setOtherValue(otherText);
    
    // For multiselect, we need to keep the "Other/specify" option in the value
    if (type === 'multiselect') {
      // Find the "specify" option from selected values
      const specifyOption = selectedValues.find(val => 
        isSpecifyOption(val.split(':')?.[0]?.trim() || val, language)
      ) || (language === 'english' ? 'Other' : 'Autre');
      
      const baseOption = specifyOption.split(':')?.[0]?.trim() || specifyOption;
      
      // Remove any previous "specify: something" entry
      const filteredValues = selectedValues.filter(v => 
        !isSpecifyOption(v.split(':')?.[0]?.trim() || v, language)
      );
      
      // Add the new "specify: something" entry if there's text
      if (otherText.trim()) {
        filteredValues.push(`${baseOption}: ${otherText}`);
      } else {
        filteredValues.push(baseOption);
      }
      
      onChange(filteredValues.join(','));
    } else {
      // For radio and select, we replace the value with "specify: text"
      const baseOption = selectedOption;
      
      if (otherText.trim()) {
        onChange(`${baseOption}: ${otherText}`);
      } else {
        onChange(baseOption);
      }
    }
  };
  
  // Extract "Other/specify" text from value if it exists
  useEffect(() => {
    if (type === 'multiselect') {
      // For multiselect, find the "specify: something" entry
      const specifyEntry = selectedValues.find(val => {
        const parts = val.split(':');
        return parts.length > 1 && isSpecifyOption(parts[0].trim(), language);
      });
      
      if (specifyEntry) {
        const parts = specifyEntry.split(':');
        if (parts.length > 1) {
          setOtherValue(parts.slice(1).join(':').trim());
        } else {
          setOtherValue('');
        }
      } else {
        setOtherValue('');
      }
    } else if (value.includes(':') && isOtherSelected) {
      // For radio and select
      const parts = value.split(':');
      if (parts.length > 1) {
        setOtherValue(parts.slice(1).join(':').trim());
      } else {
        setOtherValue('');
      }
    } else {
      setOtherValue('');
    }
  }, [value, language, type, isOtherSelected, selectedValues]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    // Add event listener with capture phase to ensure it runs before other handlers
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
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
        <h2 className="text-xl font-medium text-gray-800 mb-2">
          {stylizeQuestionText(question.id, question[language], language)}
        </h2>
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
            className={`w-full p-4 border border-gray-300 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors shadow-sm ${isOtherSelected && otherValue ? 'border-emerald-400' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <span className={value ? "text-gray-800" : "text-gray-400"}>
              {isOtherSelected && otherValue 
                ? `${selectedOption}: ${otherValue}` 
                : value || (language === 'english' ? "Select an option" : "Sélectionner une option")}
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
            <div className="dropdown-menu">
              {options.map((option, index) => {
                const optionText = option[language];
                const isSelected = value === optionText || value.startsWith(`${optionText}: `);
                const isSpecify = isSpecifyOption(optionText, language);
                
                return (
                  <div 
                    key={index} 
                    className={`dropdown-item ${
                      isSelected ? "bg-emerald-100 font-medium" : ""
                    } ${isSpecify ? "border-l-4 border-emerald-400 pl-3" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(optionText);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      {isSpecify && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      )}
                      {optionText}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Modern "Other/Specify" text input field */}
          {isOtherSelected && (
            <div className="mt-3 animate-fadeIn">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 pl-4 pr-10 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  value={otherValue}
                  onChange={handleOtherChange}
                  placeholder={language === 'english' ? "Please specify..." : "Veuillez préciser..."}
                  autoFocus
                />
                {otherValue && (
                  <span className="absolute right-3 top-3 text-emerald-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-emerald-600">
                {language === 'english' ? 'Your custom answer will be saved automatically' : 'Votre réponse personnalisée sera enregistrée automatiquement'}
              </p>
            </div>
          )}
        </div>
      )}
      
      {type === 'radio' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {options.map((option, index) => {
            const optionText = option[language];
            const isSelected = value === optionText || value.startsWith(`${optionText}: `);
            const isSpecify = isSpecifyOption(optionText, language);
            
            return (
              <div 
                key={index} 
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all duration-200
                  ${isSelected
                    ? "border-emerald-500 bg-emerald-50 shadow-sm" 
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
                  ${isSpecify ? "border-l-4 border-emerald-400" : ""}
                `}
                onClick={() => onChange(optionText)}
              >
                <div className="flex items-center">
                  <div className={`
                    h-5 w-5 rounded-full mr-3 flex items-center justify-center
                    border-2 transition-colors duration-200 ${isSelected ? "border-emerald-600" : "border-gray-400"}
                  `}>
                    {isSelected && (
                      <div className="h-2.5 w-2.5 bg-emerald-600 rounded-full animate-scaleIn"></div>
                    )}
                  </div>
                  <label className="cursor-pointer flex items-center">
                    {isSpecify && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    )}
                    {optionText}
                  </label>
                </div>
              </div>
            );
          })}
          
          {/* Modern "Other/Specify" text input field */}
          {isOtherSelected && (
            <div className="col-span-1 sm:col-span-2 mt-2 animate-fadeIn">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 pl-4 pr-10 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  value={otherValue}
                  onChange={handleOtherChange}
                  placeholder={language === 'english' ? "Please specify..." : "Veuillez préciser..."}
                  autoFocus
                />
                {otherValue && (
                  <span className="absolute right-3 top-3 text-emerald-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-emerald-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {language === 'english' ? 'Your custom answer will be saved automatically' : 'Votre réponse personnalisée sera enregistrée automatiquement'}
              </p>
            </div>
          )}
        </div>
      )}
      
      {type === 'multiselect' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {options.map((option, index) => {
            const optionText = option[language];
            const isChecked = selectedValues.some(v => v === optionText || v.startsWith(`${optionText}: `));
            const isSpecify = isSpecifyOption(optionText, language);
            
            return (
              <div 
                key={index} 
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all duration-200
                  ${isChecked 
                    ? "border-emerald-500 bg-emerald-50 shadow-sm" 
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
                  ${isSpecify ? "border-l-4 border-emerald-400" : ""}
                `}
                onClick={() => handleMultiSelectChange(optionText)}
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
                  <label className="cursor-pointer flex items-center">
                    {isSpecify && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    )}
                    {optionText}
                  </label>
                </div>
              </div>
            );
          })}
          
          {/* Modern "Other/Specify" text input field for multiselect */}
          {isOtherInMultiselect && (
            <div className="col-span-1 sm:col-span-2 mt-2 animate-fadeIn">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 pl-4 pr-10 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  value={otherValue}
                  onChange={handleOtherChange}
                  placeholder={language === 'english' ? "Please specify..." : "Veuillez préciser..."}
                  autoFocus
                />
                {otherValue && (
                  <span className="absolute right-3 top-3 text-emerald-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-emerald-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {language === 'english' ? 'Your custom answer will be saved automatically' : 'Votre réponse personnalisée sera enregistrée automatiquement'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectQuestionComponent; 
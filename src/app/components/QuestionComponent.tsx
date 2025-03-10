'use client';

import React from 'react';

type QuestionComponentProps = {
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

export default function QuestionComponent({ 
  question, 
  language, 
  value, 
  onChange 
}: QuestionComponentProps) {
  const questionText = question[language];
  
  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-800 mb-2">
          {stylizeQuestionText(question.id, questionText, language)}
        </h2>
        <div className="h-1 w-16 bg-emerald-500 rounded-full"></div>
      </div>
      
      <div className="mt-4">
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm resize-none"
          rows={5}
          placeholder={language === 'english' ? 'Type your answer here...' : 'Tapez votre réponse ici...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={questionText}
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
    </div>
  );
} 
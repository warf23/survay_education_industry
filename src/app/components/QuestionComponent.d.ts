declare module '@/app/components/QuestionComponent' {
  export interface QuestionComponentProps {
    question: {
      id: string;
      label: string;
      english: string;
      french: string;
    };
    language: 'english' | 'french';
    value: string;
    onChange: (value: string) => void;
  }
  
  const QuestionComponent: React.FC<QuestionComponentProps>;
  export default QuestionComponent;
} 
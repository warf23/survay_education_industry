// Types for Survey Components

export type QuestionComponentProps = {
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

export type Answer = {
  questionId: string;
  answer: string;
};

export type UserInfo = {
  id: string;
  fullName: string;
  email: string;
};

export type QuestionData = {
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

export type CategoryData = {
  id: string;
  title: {
    english: string;
    french: string;
  };
  questions: QuestionData[];
};

export type SurveyData = {
  categories: CategoryData[];
}; 
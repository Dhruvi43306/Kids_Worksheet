import type { GeneratedQuestion, QuestionData } from "@/app/worksheet/type";
import type React from "react";
export interface QuestionRendererProps {
  question: GeneratedQuestion;
  data: QuestionData;
  showAnswers: boolean;
  userAnswer: any;
  onAnswerChange: (value: any) => void;
  correctAnswers: string[];
}
export type QuestionRendererComponent = React.ComponentType<QuestionRendererProps>;
export type QuestionRendererRegistry = Record<string, QuestionRendererComponent>;

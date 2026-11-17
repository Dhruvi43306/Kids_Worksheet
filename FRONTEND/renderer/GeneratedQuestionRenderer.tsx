"use client";
import { AlertCircle } from "lucide-react";
import type { GeneratedQuestion } from "@/app/worksheet/type";
import { parseQuestionData, parseCorrectAnswers } from "./questionHelpers";
import { resolveQuestionComponent } from "./dynamicQuestionLoader";
import "@/styles/worksheet.css";

export interface GeneratedQuestionRendererProps {
  question: GeneratedQuestion;
  showAnswers: boolean;
  userAnswer: any;
  onAnswerChange: (value: any) => void;
}

export default function GeneratedQuestionRenderer({
  question,
  showAnswers,
  userAnswer,
  onAnswerChange,
}: GeneratedQuestionRendererProps) {
  const data = parseQuestionData(question.questionDataJson);
  const correctAnswers = parseCorrectAnswers(question.correctAnswer);
  const Component = resolveQuestionComponent(question.rendererKey);

  if (Component) {
    const wrapperClassName = [
      "worksheet-question-renderer",
      question.cssClass,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClassName}>
        <Component
          question={question}
          data={data}
          showAnswers={showAnswers}
          userAnswer={userAnswer}
          onAnswerChange={onAnswerChange}
          correctAnswers={correctAnswers}
        />
      </div>
    );
  }
  return (
    <div className="rendererFallbackCard">
      <div className="rendererFallbackTitle">
        <AlertCircle size={20} />
        <span>Unresolved Question Renderer</span>
      </div>
      <p className="generated-question-renderer__hint">
        No frontend component found matching the backend-provided renderer key
        convention.
      </p>
      <div className="rendererFallbackDetails">
        <span className="rendererFallbackLabel">Question Type ID:</span>
        <span className="rendererFallbackValue">{question.questionTypeId}</span>

        <span className="rendererFallbackLabel">Question Type Code:</span>
        <span className="rendererFallbackValue">
          {question.questionTypeCode || "(none)"}
        </span>

        <span className="rendererFallbackLabel">Question Type Name:</span>
        <span className="rendererFallbackValue">
          {question.questionTypeName || "(none)"}
        </span>

        <span className="rendererFallbackLabel">Renderer Key:</span>
        <span className="rendererFallbackValue">
          {question.rendererKey || "(none)"}
        </span>

       
      </div>
    </div>
  );
}

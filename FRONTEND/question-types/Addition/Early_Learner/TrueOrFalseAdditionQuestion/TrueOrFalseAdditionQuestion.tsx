import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, AlertCircle, HelpCircle, ArrowLeft, RefreshCw, Printer, Download } from "lucide-react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData, GeneratedQuestion, NumberLineOption, NumberLineJump } from "@/app/worksheet/type";
import { AnswerBox, VisualDisplay, answerMatches } from "@/renderer/questionHelpers";


function TrueOrFalseAdditionDisplay({
  equation,
  options,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswer,
}: {
  equation: string;
  options: Array<string | number>;
  userAnswer: any;
  showAnswers: boolean;
  onAnswerChange: (value: string) => void;
  correctAnswer: string;
}) {
  const selectedAnswer = String(userAnswer ?? "");

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: "1.2rem",
          fontWeight: 800,
          color: "#1e293b",
          textAlign: "center",
        }}
      >
        Is the addition equation true or false?
      </h3>

      <div
        style={{
          padding: "20px 32px",
          border: "2px solid #e2e8f0",
          borderRadius: "16px",
          background: "#f8fafc",
          fontSize: "2rem",
          fontWeight: 900,
          color: "#1e293b",
        }}
      >
        {equation}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {options.map((option) => {
          const value = String(option);
          const selected = selectedAnswer === value;
          const correct = value === String(correctAnswer);

          let borderColor = "#cbd5e1";
          let background = "#ffffff";
          let textColor = "#334155";

          if (selected) {
            borderColor = "#6366f1";
            background = "#eef2ff";
            textColor = "#4338ca";
          }

          if (showAnswers && correct) {
            borderColor = "#22c55e";
            background = "#f0fdf4";
            textColor = "#15803d";
          }

          if (showAnswers && selected && !correct) {
            borderColor = "#ef4444";
            background = "#fef2f2";
            textColor = "#b91c1c";
          }

          return (
            <button
              key={value}
              type="button"
              disabled={showAnswers}
              onClick={() => {
                if (!showAnswers) {
                  onAnswerChange(value);
                }
              }}
              style={{
                minWidth: "120px",
                height: "54px",
                border: `2px solid ${borderColor}`,
                borderRadius: "12px",
                background,
                color: textColor,
                fontSize: "1.2rem",
                fontWeight: 800,
                cursor: showAnswers ? "default" : "pointer",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {showAnswers && (
        <div
          style={{
            fontWeight: 800,
            color:
              selectedAnswer === String(correctAnswer) ? "#16a34a" : "#dc2626",
          }}
        >
          {selectedAnswer === String(correctAnswer)
            ? "✓ Correct"
            : `✗ Correct answer: ${correctAnswer}`}
        </div>
      )}
    </div>
  );
}

export default function TrueOrFalseAdditionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  return (
    <TrueOrFalseAdditionDisplay
      equation={data.equation ?? `${data.firstNumber ?? 0} + ${data.secondNumber ?? 0} = ${data.displayedTotal ?? 0}`}
      options={data.options ?? ["True", "False"]}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      onAnswerChange={onAnswerChange}
      correctAnswer={correctAnswers[0] ?? question.correctAnswer ?? ""}
    />
  );
}

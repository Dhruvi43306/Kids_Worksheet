import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, AlertCircle, HelpCircle, ArrowLeft, RefreshCw, Printer, Download } from "lucide-react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData, GeneratedQuestion, NumberLineOption, NumberLineJump } from "@/app/worksheet/type";
import { AnswerBox, VisualDisplay, answerMatches } from "@/renderer/questionHelpers";


export default function PatternQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const icons = data.icons?.length ? data.icons : data.icon ? [data.icon] : [];
  const isOptionCorrect = (value: string | number) =>
    answerMatches(value, correctAnswers);

    const options =
      data.options ??
      (question.questionTypeId === 4
        ? ["True", "False"]
        : question.questionTypeId === 10
          ? ["Yes", "No"]
          : ["Odd", "Even"]);

    return (
      <div className="generated-question patternQuestionContainer">
        <h3 className="generated-question__text">
          {question.questionText}
        </h3>

        {data.statement && (
          <div className="patternQuestionStatement">
            "{data.statement}"
          </div>
        )}

        {icons.length > 0 && (
          <VisualDisplay visualType={data.visualType} icons={icons} />
        )}

        {data.number !== undefined && (
          <div className="patternQuestionBigNumber">
            {data.number}
          </div>
        )}

        <div className="patternQuestionOptionsContainer">
          {options.map((option) => {
            const isSelected = userAnswer === option;

            const correct = isOptionCorrect(option);

            const isWrong = isSelected && !correct;

            const isMissed = showAnswers && !isSelected && correct;

            let stateClass = "patternQuestionOptionButton--default";

            if (isSelected) {
              stateClass = "patternQuestionOptionButton--selected";
            }

            if (showAnswers) {
              if (isSelected && correct) {
                stateClass = "patternQuestionOptionButton--correct";
              } else if (isWrong) {
                stateClass = "patternQuestionOptionButton--wrong";
              } else if (isMissed) {
                stateClass = "patternQuestionOptionButton--missed";
              }
            }

            return (
              <motion.div
                key={option}
                whileHover={{
                  scale: showAnswers ? 1 : 1.03,
                }}
                whileTap={{
                  scale: showAnswers ? 1 : 0.97,
                }}
                onClick={() => {
                  if (!showAnswers) {
                    onAnswerChange(option);
                  }
                }}
                className={`patternQuestionOptionButton ${stateClass}`}
              >
                {option}

                {showAnswers && isSelected && correct && (
                  <Check size={18} className="text-green-600" />
                )}

                {showAnswers && isWrong && (
                  <X size={18} className="text-red-500" />
                )}
              </motion.div>
            );
          })}
        </div>

        {showAnswers && <AnswerBox answer={correctAnswers.join(", ")} />}
      </div>
    );
}

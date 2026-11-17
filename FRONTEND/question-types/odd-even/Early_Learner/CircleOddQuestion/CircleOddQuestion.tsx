import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, AlertCircle, HelpCircle, ArrowLeft, RefreshCw, Printer, Download } from "lucide-react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData, GeneratedQuestion, NumberLineOption, NumberLineJump } from "@/app/worksheet/type";
import { AnswerBox, VisualDisplay, answerMatches } from "@/renderer/questionHelpers";


export default function CircleOddQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const isOptionCorrect = (value: string | number) =>
    answerMatches(value, correctAnswers);

    const selectedList: number[] = Array.isArray(userAnswer) ? userAnswer : [];
    const toggleNumber = (num: number) => {
      if (showAnswers) {
        return;
      }

      if (selectedList.includes(num)) {
        onAnswerChange(selectedList.filter((item) => item !== num));
      } else {
        onAnswerChange([...selectedList, num]);
      }
    };

    return (
      <div className="generated-question circleOddQuestionContainer">
        <h3 className="circleOddQuestionTitle">
          {question.questionText}
        </h3>

        <div className="circleOddQuestionGrid">
          {(data.numbers ?? []).map((number, index) => {
            const isSelected = selectedList.includes(number);

            const correct = isOptionCorrect(number);

            const isWrong = isSelected && !correct;

            const isMissed = showAnswers && !isSelected && correct;

            let stateClass = "circleOddQuestionNumber--default";

            if (isSelected) {
              stateClass = "circleOddQuestionNumber--selected";
            }

            if (showAnswers) {
              if (isSelected && correct) {
                stateClass = "circleOddQuestionNumber--correct";
              } else if (isWrong) {
                stateClass = "circleOddQuestionNumber--wrong";
              } else if (isMissed) {
                stateClass = "circleOddQuestionNumber--missed";
              }
            }

            return (
              <motion.div
                key={`${number}-${index}`}
                onClick={() => toggleNumber(number)}
                className={`circleOddQuestionNumber ${stateClass}`}
              >
                {number}

                {showAnswers && isSelected && correct && <Check size={18} />}

                {showAnswers && isWrong && <X size={18} />}

                {showAnswers && isMissed && <HelpCircle size={16} />}
              </motion.div>
            );
          })}
        </div>

        {showAnswers && <AnswerBox answer={correctAnswers.join(", ")} />}
      </div>
    );
}

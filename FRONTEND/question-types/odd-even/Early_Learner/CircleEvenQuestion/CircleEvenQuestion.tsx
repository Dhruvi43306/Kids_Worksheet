import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, AlertCircle, HelpCircle, ArrowLeft, RefreshCw, Printer, Download } from "lucide-react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";


export default function CircleEvenQuestion({
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
      <div className="generated-question circleEvenQuestionContainer">
        <h3 className="circleEvenQuestionTitle">
          {question.questionText}
        </h3>

        <div className="circleEvenQuestionGrid">
          {(data.numbers ?? []).map((number, index) => {
            const isSelected = selectedList.includes(number);

            const correct = isOptionCorrect(number);

            const isWrong = isSelected && !correct;

            const isMissed = showAnswers && !isSelected && correct;

            let stateClass = "circleEvenQuestionNumber--default";

            if (isSelected) {
              stateClass = "circleEvenQuestionNumber--selected";
            }

            if (showAnswers) {
              if (isSelected && correct) {
                stateClass = "circleEvenQuestionNumber--correct";
              } else if (isWrong) {
                stateClass = "circleEvenQuestionNumber--wrong";
              } else if (isMissed) {
                stateClass = "circleEvenQuestionNumber--missed";
              }
            }

            return (
              <motion.div
                key={`${number}-${index}`}
                onClick={() => toggleNumber(number)}
                className={`circleEvenQuestionNumber ${stateClass}`}
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

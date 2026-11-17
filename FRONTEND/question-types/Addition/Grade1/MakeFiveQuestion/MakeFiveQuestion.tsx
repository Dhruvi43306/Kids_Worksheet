
import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";

type MakeFiveDisplayProps = {
  questionText: string;
  currentNumber: number;
  target: number;
  options: Array<string | number>;
  userAnswer: unknown;
  showAnswers: boolean;
  onAnswerChange: (value: string) => void;
  correctAnswer: string;
};

function MakeFiveDisplay({
  questionText,
  currentNumber,
  target,
  options,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswer,
}: MakeFiveDisplayProps) {
  const selectedAnswer = String(userAnswer ?? "").trim();
  const normalizedCorrectAnswer = String(correctAnswer).trim();

  const isCorrect =
    selectedAnswer !== "" &&
    selectedAnswer === normalizedCorrectAnswer;

  return (
    <div className="make-five-question">
      <h3 className="make-five-question__heading">
        {questionText}
      </h3>

      {/* Current number */}
      <div className="make-five-question__current-section">
        <span className="make-five-question__current-label">
          I have
        </span>

        <div className="make-five-question__current-number">
          {currentNumber}
        </div>
      </div>

      {/* Target number */}
      <div className="make-five-question__target-prompt">
        <span className="make-five-question__prompt-text">
          How many more do I need to make
        </span>

        <span className="make-five-question__target-number">
          {target}
        </span>

        <span className="make-five-question__prompt-text">
          ?
        </span>
      </div>

      {/* Visual representation */}
      <div className="make-five-question__visual">
        <div className="make-five-question__visual-caption">
          Think: {currentNumber} needs some more to reach {target}.
        </div>

        <div className="make-five-question__counter">
          {Array.from({ length: target }, (_, index) => {
            const filled = index < currentNumber;

            return (
              <div
                key={index}
                className={[
                  "make-five-question__counter-cell",
                  filled
                    ? "make-five-question__counter-cell--filled"
                    : "make-five-question__counter-cell--empty",
                ].join(" ")}
                aria-label={
                  filled ? "Already counted" : "Still needed"
                }
              >
                {filled ? "●" : ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* Answer options */}
      <div className="make-five-question__options">
        {options.map((option, index) => {
          const value = String(option);
          const selected = selectedAnswer === value;
          const correct = value === normalizedCorrectAnswer;

          const wrong = showAnswers && selected && !correct;
          const missed = showAnswers && !selected && correct;

          const optionClasses = [
            "make-five-question__option",

            selected && !showAnswers
              ? "make-five-question__option--selected"
              : "",

            showAnswers && selected && correct
              ? "make-five-question__option--correct"
              : "",

            wrong
              ? "make-five-question__option--wrong"
              : "",

            missed
              ? "make-five-question__option--missed"
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <motion.button
              key={`${value}-${index}`}
              type="button"
              className={optionClasses}
              disabled={showAnswers}
              aria-pressed={selected}
              whileHover={{
                scale: showAnswers ? 1 : 1.05,
              }}
              whileTap={{
                scale: showAnswers ? 1 : 0.97,
              }}
              onClick={() => {
                if (!showAnswers) {
                  onAnswerChange(value);
                }
              }}
            >
              <span>{option}</span>

              {showAnswers && correct && (
                <Check
                  size={18}
                  className="make-five-question__option-icon"
                  aria-hidden="true"
                />
              )}

              {wrong && (
                <X
                  size={18}
                  className="make-five-question__option-icon"
                  aria-hidden="true"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Hint */}
      {!showAnswers && (
        <div className="make-five-question__hint">
          Think about how many more you need to reach {target}.
        </div>
      )}

      {/* Result */}
      {showAnswers && (
        <div className="make-five-question__result">
          <div
            className={[
              "make-five-question__result-status",
              isCorrect
                ? "make-five-question__result-status--correct"
                : "make-five-question__result-status--wrong",
            ].join(" ")}
          >
            {isCorrect ? (
              <>
                <Check
                  size={18}
                  aria-hidden="true"
                />
                <span>Correct</span>
              </>
            ) : (
              <>
                <X
                  size={18}
                  aria-hidden="true"
                />
                <span>Incorrect</span>
              </>
            )}
          </div>

          <AnswerBox
            answer={`${currentNumber} + ${correctAnswer} = ${target}`}
          />
        </div>
      )}
    </div>
  );
}

export default function MakeFiveQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const currentNumber = data.currentNumber;
  const target = data.target;
  const options = data.options ?? [];

  if (
    currentNumber === undefined ||
    target === undefined ||
    options.length === 0
  ) {
    return (
      <div className="make-five-question__error">
        Make-five-to-fifteen data is incomplete.
      </div>
    );
  }

  return (
    <MakeFiveDisplay
      questionText={question.questionText}
      currentNumber={currentNumber}
      target={target}
      options={options}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      onAnswerChange={onAnswerChange}
      correctAnswer={
        correctAnswers[0] ?? question.correctAnswer ?? ""
      }
    />
  );
}

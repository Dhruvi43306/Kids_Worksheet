"use client";

import { Check, X } from "lucide-react";

import type { QuestionData } from "@/app/worksheet/type";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";

import {
  AnswerBox,
  answerMatches,
} from "@/renderer/questionHelpers";

type NumberSubtractionData = Omit<
  QuestionData,
  "firstNumber" | "secondNumber" | "missingPosition" | "options"
> & {
  firstNumber?: number | null;
  secondNumber?: number | null;
  difference?: number;
  missingPosition?: string;
  options?: Array<string | number>;
  equation?: string;
};

const SUPPORTED_QUESTION_TYPES = [
  "NUMBER_SUBTRACTION_RESULT",
  "NUMBER_SUBTRACTION_MISSING_TAKEAWAY",
  "NUMBER_SUBTRACTION_MISSING_START",
  "NUMBER_SUBTRACTION_CHOOSE_RESULT",
];

function normalizeQuestionType(
  value?: string | null,
): string {
  return (value ?? "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
}

export default function NumberSubtractionQuestion({
  question,
  data: rawData,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const data = rawData as NumberSubtractionData;

  const questionType = normalizeQuestionType(question.questionTypeCode ?? data.questionType,);
  const firstNumber = data.firstNumber ?? null;
  const secondNumber = data.secondNumber ?? null;

  const difference =
    data.difference ??
    (firstNumber !== null && secondNumber !== null
      ? firstNumber - secondNumber
      : 0);

  const currentAnswer =
    userAnswer === undefined || userAnswer === null
      ? ""
      : String(userAnswer).trim();

  const hasAnswer = currentAnswer.length > 0;

  const correctAnswer =
    correctAnswers[0] ??
    question.correctAnswer ??
    "";

  const isCorrect =
    hasAnswer &&
    answerMatches(currentAnswer, correctAnswers);

  const isMissingStart =
    questionType ===
    "NUMBER_SUBTRACTION_MISSING_START";

  const isMissingTakeaway =
    questionType ===
    "NUMBER_SUBTRACTION_MISSING_TAKEAWAY";

  const isChooseResult =
    questionType ===
    "NUMBER_SUBTRACTION_CHOOSE_RESULT";

  const isFindDifference =
    questionType ===
    "NUMBER_SUBTRACTION_RESULT";

  if (
    !SUPPORTED_QUESTION_TYPES.includes(questionType)
  ) {
    return (
      <section className="number-subtraction-question">
        <div className="number-subtraction-question__unsupported">
          Unsupported number subtraction question type:{" "}
          {questionType || "Unknown"}
        </div>
      </section>
    );
  }

  const renderAnswerInput = (label: string) => {
    let inputClass =
      "number-subtraction-question__answer-input";

    if (showAnswers && hasAnswer) {
      inputClass += isCorrect
        ? " number-subtraction-question__answer-input--correct"
        : " number-subtraction-question__answer-input--wrong";
    }

    return (
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={currentAnswer}
        disabled={showAnswers}
        placeholder="?"
        aria-label={label}
        className={inputClass}
        onChange={(event) =>
          onAnswerChange(event.target.value)
        }
      />
    );
  };

  const renderEquation = () => (
    <div className="number-subtraction-question__equation">
      {isMissingStart ? (
        renderAnswerInput("Missing starting number")
      ) : (
        <span className="number-subtraction-question__number">
          {firstNumber ?? "?"}
        </span>
      )}

      <span className="number-subtraction-question__operator">
        −
      </span>

      {isMissingTakeaway ? (
        renderAnswerInput("Missing number being subtracted")
      ) : (
        <span className="number-subtraction-question__number">
          {secondNumber ?? "?"}
        </span>
      )}

      <span className="number-subtraction-question__operator">
        =
      </span>

      {isFindDifference ? (
        renderAnswerInput("Difference")
      ) : isChooseResult ? (
        <span className="number-subtraction-question__question-mark">
          ?
        </span>
      ) : (
        <span className="number-subtraction-question__number">
          {difference}
        </span>
      )}
    </div>
  );

  const options = data.options ?? [];

  return (
    <section className="number-subtraction-question" aria-label="Number subtraction question">
        
      <h3 className="number-subtraction-question__prompt">
        {question.questionText}
      </h3>

      <div className="number-subtraction-question__card">
        {renderEquation()}
        {isChooseResult && (
          <div className="number-subtraction-question__options">
            {options.map((option, index) => {
              const value = String(option);
              const selected =
                currentAnswer === value;

              const optionIsCorrect =
                answerMatches(value, correctAnswers);

              const optionClass = [
                "number-subtraction-question__option",

                selected
                  ? "number-subtraction-question__option--selected"
                  : "",

                showAnswers && optionIsCorrect
                  ? "number-subtraction-question__option--correct"
                  : "",

                showAnswers &&
                selected &&
                !optionIsCorrect
                  ? "number-subtraction-question__option--wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={`${value}-${index}`}
                  type="button"
                  disabled={showAnswers}
                  className={optionClass}
                  onClick={() => {
                    if (!showAnswers) {
                      onAnswerChange(value);
                    }
                  }}
                >
                  <span className="number-subtraction-question__option-label">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="number-subtraction-question__option-value">
                    {option}
                  </span>

                  {showAnswers && optionIsCorrect && (
                    <Check
                      size={18}
                      className="number-subtraction-question__option-icon"
                    />
                  )}

                  {showAnswers &&
                    selected &&
                    !optionIsCorrect && (
                      <X
                        size={18}
                        className="number-subtraction-question__option-icon"
                      />
                    )}
                </button>
              );
            })}
          </div>
        )}

        {showAnswers && hasAnswer && (
          <div
            className={
              isCorrect
                ? "number-subtraction-question__status number-subtraction-question__status--correct"
                : "number-subtraction-question__status number-subtraction-question__status--wrong"
            }
          >
            {isCorrect ? (
              <Check size={18} />
            ) : (
              <X size={18} />
            )}

            <span>
              {isCorrect ? "Correct!" : "Incorrect"}
            </span>
          </div>
        )}

        {showAnswers && (
          <AnswerBox answer={correctAnswer} />
        )}
      </div>
    </section>
  );
}

"use client";

import { Check, X } from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";

import { answerMatches } from "@/renderer/questionHelpers";

import "@/styles/worksheet.css";

type DetectiveData = QuestionData & {
  questionType?: string;
  startNumber?: number;
  result?: number;
  takeAway?: number;
  shownAnswer?: number;
  correctAnswer?: number;
  targetNumber?: number;
  options?: Array<string | number>;
  firstTakeAway?: number;
  secondTakeAway?: number;
  missingNumber?: number;
  finalNumber?: number;
};

export default function SubtractionDetectiveQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const details = data as DetectiveData;

  const code = (
    question.questionTypeCode?.trim() ||
    details.questionType?.trim() ||
    ""
  ).toUpperCase();

  const currentAnswer =
    userAnswer === undefined || userAnswer === null
      ? ""
      : String(userAnswer);

  const hasAnswer = currentAnswer.trim().length > 0;

  const isErrorQuestion = code === "DETECTIVE_FIND_ERROR";
  const isEquationQuestion = code === "DETECTIVE_MATCH_EQUATION";

  const expectedErrorChoice =
    Number(details.shownAnswer) === Number(details.correctAnswer)
      ? "Correct"
      : "Incorrect";

  const correctAnswer = isErrorQuestion
    ? expectedErrorChoice
    : correctAnswers[0] ?? "";

  const isCorrect =
    hasAnswer &&
    (
      isErrorQuestion
        ? currentAnswer.trim().toLowerCase() ===
          expectedErrorChoice.toLowerCase()
        : answerMatches(currentAnswer, correctAnswers)
    );

  const answerId =
    `subtraction-detective-${question.generatedQuestionId}`;

  let inputClassName =
    "subtraction-detective-question__input";

  if (showAnswers && hasAnswer) {
    inputClassName += isCorrect
      ? " subtraction-detective-question__input--correct"
      : " subtraction-detective-question__input--wrong";
  }

  // Numeric answer stays on the RIGHT of the question text.
  const renderNumericAnswer = () => (
    <div className="subtraction-detective-question__numeric-answer">
    

      <input
        id={answerId}
        type="number"
        inputMode="numeric"
        value={currentAnswer}
        disabled={showAnswers}
        placeholder="?"
        aria-label="Enter your answer"
        className={inputClassName}
        onChange={(event) =>
          onAnswerChange(event.target.value)
        }
      />

      {showAnswers && hasAnswer && (
        isCorrect ? (
          <Check
            size={20}
            aria-label="Correct answer"
            className="subtraction-detective-question__feedback--correct"
          />
        ) : (
          <X
            size={20}
            aria-label="Incorrect answer"
            className="subtraction-detective-question__feedback--wrong"
          />
        )
      )}

      {showAnswers && (
        <span className="subtraction-detective-question__correct-answer">
          Correct: {correctAnswer}
        </span>
      )}
    </div>
  );

  // Multiple-choice answers stay CENTERED under the question.
  const renderChoices = (choices: string[]) => (
    <div
      className={[
        "subtraction-detective-question__choices",
        isEquationQuestion
          ? "subtraction-detective-question__choices--equations"
          : "",
      ].filter(Boolean).join(" ")}
      role="group"
      aria-label="Choose your answer"
    >
      {choices.map((choice, index) => {
        const selected = currentAnswer === choice;

        const optionIsCorrect = isErrorQuestion
          ? choice.toLowerCase() ===
            expectedErrorChoice.toLowerCase()
          : answerMatches(choice, correctAnswers);

        const optionClassName = [
          "subtraction-detective-question__choice",
          selected
            ? "subtraction-detective-question__choice--selected"
            : "",
          showAnswers && optionIsCorrect
            ? "subtraction-detective-question__choice--correct"
            : "",
          showAnswers && selected && !optionIsCorrect
            ? "subtraction-detective-question__choice--wrong"
            : "",
        ].filter(Boolean).join(" ");

        return (
          <button
            key={`${choice}-${index}`}
            type="button"
            className={optionClassName}
            disabled={showAnswers}
            aria-pressed={selected}
            onClick={() => {
              if (!showAnswers) {
                onAnswerChange(choice);
              }
            }}
          >
            {isEquationQuestion && (
              <span className="subtraction-detective-question__choice-letter">
                {String.fromCharCode(65 + index)}
              </span>
            )}

            <span>{choice}</span>

            {showAnswers && optionIsCorrect && (
              <Check size={18} aria-hidden="true" />
            )}

            {showAnswers && selected && !optionIsCorrect && (
              <X size={18} aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );

  // Select the response type without recreating the question.
  let responseControl;

  switch (code) {
    case "DETECTIVE_MISSING_NUMBER":
    case "DETECTIVE_NUMBER_CHAIN":
      responseControl = renderNumericAnswer();
      break;

    case "DETECTIVE_FIND_ERROR":
      responseControl = renderChoices(
        (details.options?.map(String) ?? ["Correct", "Incorrect"])
      );
      break;

    case "DETECTIVE_MATCH_EQUATION":
      responseControl = renderChoices(
        (details.options?.map(String) ?? [])
      );
      break;

    default:
      responseControl = (
        <span className="subtraction-detective-question__unsupported">
          Unsupported type: {code || "Unknown"}
        </span>
      );
  }

  const isNumericQuestion =
    code === "DETECTIVE_MISSING_NUMBER" ||
    code === "DETECTIVE_NUMBER_CHAIN";

  return (
    <section className="subtraction-detective-question">

      <div
        className={[
          "subtraction-detective-question__layout",
          isNumericQuestion
            ? "subtraction-detective-question__layout--numeric"
            : "subtraction-detective-question__layout--choices",
        ].join(" ")}
      >
        {/* The backend-generated question appears only once. */}
        <div className="subtraction-detective-question__prompt">
          <p>{question.questionText}</p>
        </div>

        {isNumericQuestion && responseControl}
      </div>

      {!isNumericQuestion && (
        <div className="subtraction-detective-question__choice-area">
          {responseControl}
        </div>
      )}

    </section>
  );
}
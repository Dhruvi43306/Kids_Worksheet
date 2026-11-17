
"use client";

import {
  ArrowRight,
  Check,
  X,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";

import { answerMatches } from "@/renderer/questionHelpers";

import "@/styles/worksheet.css";

type MentalSubtractionData = QuestionData & {
  questionType?: string;
  startNumber?: number | null;
  takeAway?: number | null;
  difference?: number | null;
  missingPosition?: string;
  equation?: string;
  countingBackNumbers?: Array<number | null>;
  countingUpNumbers?: number[];
  countingSteps?: number | null;
  selectionMode?: string;
  answerType?: string;
};

const questionTypeAliases: Record<string, string> = {
  SUBTRACT_WITHIN_0_10: "SUBTRACT_WITHIN_ZERO_TEN",
  UBTRACT_WITHIN_ONE_TWENTY: "SUBTRACT_WITHIN_ONE_TWENTY",

  MISSING_MINUEND_OR_SUBTRAHEND_WITHIN_TEN:
    "MISSING_MINUEND_OR_SUBTRAHEND_WITHIN_10",

  SUBTRACT_WITHIN_1_20: "SUBTRACT_WITHIN_ONE_TWENTY",

  SUBTRACT_ONE_DIGIT_FROM_1_100_NO_REGROUPING:
    "SUBTRACT_ONE_DIGIT_FROM_ONE_HUNDREDD_NO_REGROUPING",

  SUBTRACT_ONE_DIGIT_FROM_1_100_MISSING_NUMBERS:
    "SUBTRACT_ONE_DIGIT_FROM_ONE_HUNDREED_MISSING_NUMBERS",
};

export default function MentalSubtractionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const subtractionData = data as MentalSubtractionData;

  const rawCode = (
    question.questionTypeCode?.trim() ||
    subtractionData.questionType?.trim() ||
    ""
  ).toUpperCase();

  const code = questionTypeAliases[rawCode] ?? rawCode;

  const currentAnswer =
    userAnswer === undefined || userAnswer === null
      ? ""
      : String(userAnswer);

  const hasAnswer = currentAnswer.trim().length > 0;

  const expectedAnswers =
    correctAnswers?.length > 0
      ? correctAnswers
      : [];

  const correctAnswer = expectedAnswers[0] ?? "";

  const isCorrect =
    hasAnswer &&
    answerMatches(currentAnswer, expectedAnswers);

  const answerId =
    `mental-subtraction-answer-${question.generatedQuestionId}`;

  const isCountingBack =
    code === "SUBTRACT_BY_COUNTING_BACK";

  const isCountingUp =
    code === "SUBTRACT_BY_COUNTING_UP";

  const isWithinTen =
    code === "SUBTRACT_WITHIN_ZERO_TEN";

  const shouldShowObjectVisual =
    isWithinTen &&
    subtractionData.startNumber !== null &&
    subtractionData.startNumber !== undefined &&
    subtractionData.takeAway !== null &&
    subtractionData.takeAway !== undefined;

  const countingBackNumbers =
    subtractionData.countingBackNumbers ?? [];

  const countingUpNumbers =
    subtractionData.countingUpNumbers ?? [];

  let inputClassName =
    "mental-subtraction-question__answer-input";

  if (showAnswers && hasAnswer) {
    inputClassName += isCorrect
      ? " mental-subtraction-question__answer-input--correct"
      : " mental-subtraction-question__answer-input--wrong";
  }

  // ======================================================
  // ANSWER INPUT
  // ======================================================

  const renderAnswer = () => (
    <div className="mental-subtraction-question__answer-control">
      <label
        htmlFor={answerId}
        className="mental-subtraction-question__answer-label"
      >
        Answer
      </label>

      <input
        id={answerId}
        type="number"
        inputMode="numeric"
        value={currentAnswer}
        disabled={showAnswers}
        placeholder="?"
        aria-label="Enter the subtraction answer"
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
            className="mental-subtraction-question__feedback--correct"
          />
        ) : (
          <X
            size={20}
            aria-label="Incorrect answer"
            className="mental-subtraction-question__feedback--wrong"
          />
        )
      )}

      {showAnswers && (
        <span className="mental-subtraction-question__correct-answer">
          Correct: {correctAnswer}
        </span>
      )}
    </div>
  );

  // ======================================================
  // COUNT BACK VISUAL
  // The last position is null in the backend data.
  // Keep it hidden until the answer is revealed.
  // ======================================================

  const renderCountingBack = () => (
    <div className="mental-subtraction-question__visual">
      <div className="mental-subtraction-question__visual-heading">
        <span>COUNT BACK</span>
        <span className="mental-subtraction-question__visual-caption">
          Follow the numbers backward.
        </span>
      </div>

      <div
        className="mental-subtraction-question__number-track"
        role="list"
        aria-label="Counting backward number track"
      >
        {countingBackNumbers.map((number, index) => {
          const isMissing = number === null;

          const displayedNumber =
            isMissing
              ? showAnswers
                ? correctAnswer
                : "?"
              : String(number);

          return (
            <div
              className="mental-subtraction-question__track-item"
              key={`${index}-${number ?? "missing"}`}
              role="listitem"
            >
              <div
                className={[
                  "mental-subtraction-question__number-cell",
                  index === 0
                    ? "mental-subtraction-question__number-cell--start"
                    : "",
                  isMissing
                    ? "mental-subtraction-question__number-cell--missing"
                    : "",
                ].filter(Boolean).join(" ")}
              >
                <strong>{displayedNumber}</strong>

                {isMissing && (
                  <span className="mental-subtraction-question__cell-caption">
                    {showAnswers ? "Answer" : "Find"}
                  </span>
                )}
              </div>

              {index < countingBackNumbers.length - 1 && (
                <ArrowRight
                  className="mental-subtraction-question__track-arrow"
                  size={16}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ======================================================
  // COUNT UP VISUAL
  // The backend provides an ascending sequence.
  // ======================================================

  const renderCountingUp = () => (
    <div className="mental-subtraction-question__visual">
      <div className="mental-subtraction-question__visual-heading">
        <span>COUNT UP</span>
        <span className="mental-subtraction-question__visual-caption">
          Count the jumps between the numbers.
        </span>
      </div>

      <div
        className="mental-subtraction-question__number-track"
        role="list"
        aria-label="Counting upward number track"
      >
        {countingUpNumbers.map((number, index) => (
          <div
            className="mental-subtraction-question__track-item"
            key={`${index}-${number}`}
            role="listitem"
          >
            <div
              className={[
                "mental-subtraction-question__number-cell",
                index === 0
                  ? "mental-subtraction-question__number-cell--start"
                  : "",
                index === countingUpNumbers.length - 1
                  ? "mental-subtraction-question__number-cell--finish"
                  : "",
              ].filter(Boolean).join(" ")}
            >
              <strong>{number}</strong>
            </div>

            {index < countingUpNumbers.length - 1 && (
              <ArrowRight
                className="mental-subtraction-question__track-arrow"
                size={16}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ======================================================
  // OBJECT VISUAL: SUBTRACT WITHIN 0-10
  // Do not display the correct result in advance.
  // ======================================================

  const renderObjects = () => {
    const start = subtractionData.startNumber ?? 0;
    const removed = subtractionData.takeAway ?? 0;

    return (
      <div className="mental-subtraction-question__visual">
        <div className="mental-subtraction-question__visual-heading">
          <span>COUNT THE OBJECTS</span>
          <span className="mental-subtraction-question__visual-caption">
            Cross out the objects being subtracted.
          </span>
        </div>

        <div
          className="mental-subtraction-question__object-row"
          role="list"
          aria-label={`${start} objects, with ${removed} crossed out`}
        >
          {Array.from({ length: start }, (_, index) => {
            const isRemoved = index < removed;

            return (
              <span
                key={index}
                role="listitem"
                className={[
                  "mental-subtraction-question__object",
                  isRemoved
                    ? "mental-subtraction-question__object--removed"
                    : "",
                ].filter(Boolean).join(" ")}
                aria-label={
                  isRemoved ? "Subtracted object" : "Remaining object"
                }
              >
                {isRemoved ? "×" : "●"}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  // ======================================================
  // VISUAL SELECTION
  // Other question types need only the question and answer.
  // ======================================================

  let visual: React.ReactNode = null;

  if (isCountingBack && countingBackNumbers.length > 0) {
    visual = renderCountingBack();
  } else if (isCountingUp && countingUpNumbers.length > 0) {
    visual = renderCountingUp();
  } else if (shouldShowObjectVisual) {
    visual = renderObjects();
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <section className="mental-subtraction-question">

      <div
        className={[
          "mental-subtraction-question__question-row",
          visual
            ? "mental-subtraction-question__question-row--with-visual"
            : "",
        ].filter(Boolean).join(" ")}
      >
        {/* Backend-generated question is displayed once. */}

        <div className="mental-subtraction-question__prompt">
          <p>{question.questionText}</p>
        </div>

        {renderAnswer()}
      </div>

      {visual}

    </section>
  );
}
import React, { useMemo } from "react";
import "@/styles/worksheet.css";

type DivisionQuestionData = {
  renderKey?: string;
  questionType?: string;
  dividend?: number | null;
  divisor?: number | null;
  quotient?: number | null;
  missingValue?: "dividend" | "divisor" | null;
  operatorSymbol?: string;
  answerMode?: string;
  answerType?: string;
};

type Props = {
  questionData?: string | DivisionQuestionData | null;
  data?: string | DivisionQuestionData | null;
  question?: Record<string, unknown> | null;
  questionText?: string;
  value?: string | number;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;

  // Connect these to the existing parent Check Answer flow.
  isChecked?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string | number;
};

function parseDivisionData(
  input:
    | string
    | DivisionQuestionData
    | Record<string, unknown>
    | null
    | undefined
): DivisionQuestionData {
  if (!input) return {};

  if (typeof input === "string") {
    try {
      return parseDivisionData(JSON.parse(input));
    } catch {
      return {};
    }
  }

  if (typeof input !== "object") return {};

  const obj = input as Record<string, unknown>;

  for (const key of ["questionData", "QuestionData", "data", "Data"]) {
    const nested = obj[key];

    if (typeof nested === "string" || (nested && typeof nested === "object")) {
      const parsed = parseDivisionData(
        nested as string | Record<string, unknown>
      );

      if (parsed.renderKey || parsed.questionType) {
        return parsed;
      }
    }
  }

  return obj as DivisionQuestionData;
}

export default function DivisionNumericalDigit({
  questionData,
  data,
  question,
  questionText,
  value = "",
  onAnswerChange,
  disabled = false,
  isChecked = false,
  isCorrect = false,
  correctAnswer,
}: Props) {
  const parsed = useMemo(
    () => parseDivisionData(questionData ?? data ?? question),
    [questionData, data, question]
  );

  const dividend = parsed.dividend ?? null;
  const divisor = parsed.divisor ?? null;
  const quotient = parsed.quotient ?? null;
  const operator = parsed.operatorSymbol || "÷";

  const questionType = (parsed.questionType || "").toUpperCase();

  const missingValue =
    parsed.missingValue?.toLowerCase() ||
    (questionType === "DIVISION_MISSING_DIVISOR"
      ? "divisor"
      : questionType === "DIVISION_MISSING_DIVIDEND"
        ? "dividend"
        : "");

  const isMissingDivisor = missingValue === "divisor";
  const isMissingDividend = missingValue === "dividend";

  const answerValue = String(value ?? "");

  const updateAnswer = (nextValue: string) => {
    // Only allow non-negative whole-number answers.
    if (/^\d*$/.test(nextValue)) {
      onAnswerChange?.(nextValue);
    }
  };

  const renderAnswerBox = (label: string) => (
    <input
      className="dvd28-answer-input"
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      aria-label={label}
      placeholder="?"
      value={answerValue}
      disabled={disabled || isChecked}
      onChange={(event) => updateAnswer(event.target.value)}
    />
  );

  const hasQuestionData =
    dividend !== null || divisor !== null || quotient !== null;

  if (!hasQuestionData) {
    return (
      <section className="dvd28-container">
        <p className="dvd28-fallback">
          {questionText || "Division question data is missing."}
        </p>
      </section>
    );
  }

  return (
    <section className="dvd28-container">
      <div className="dvd28-heading">
        <span className="dvd28-heading-icon" aria-hidden="true">
          ÷
        </span>
        <span className="dvd28-heading-title">Division</span>
      </div>

      {questionText && (
        <p className="dvd28-question-text">{questionText}</p>
      )}

      <div
        className="dvd28-equation"
        aria-label="Division problem"
      >
        {isMissingDividend ? (
          <>
            {renderAnswerBox("Missing dividend")}
            <span className="dvd28-operator">{operator}</span>
            <span className="dvd28-number">{divisor}</span>
            <span className="dvd28-equals">=</span>
            <span className="dvd28-number">{quotient}</span>
          </>
        ) : isMissingDivisor ? (
          <>
            <span className="dvd28-number">{dividend}</span>
            <span className="dvd28-operator">{operator}</span>
            {renderAnswerBox("Missing divisor")}
            <span className="dvd28-equals">=</span>
            <span className="dvd28-number">{quotient}</span>
          </>
        ) : (
          <>
            <span className="dvd28-number">{dividend}</span>
            <span className="dvd28-operator">{operator}</span>
            <span className="dvd28-number">{divisor}</span>
            <span className="dvd28-equals">=</span>
            {renderAnswerBox("Division answer")}
          </>
        )}
      </div>

      <p className="dvd28-hint">
        {isMissingDividend || isMissingDivisor
          ? "Find the missing number."
          : "Divide and enter your answer in the box."}
      </p>

      {isChecked && (
        <div
          className={`dvd28-feedback ${
            isCorrect
              ? "dvd28-feedback-correct"
              : "dvd28-feedback-incorrect"
          }`}
          role="status"
        >
          {isCorrect ? (
            <span>✓ Correct! Well done!</span>
          ) : (
            <span>
              ✗ Not quite. Correct answer:{" "}
              <strong>{correctAnswer ?? "Not provided"}</strong>
            </span>
          )}
        </div>
      )}
    </section>
  );
}
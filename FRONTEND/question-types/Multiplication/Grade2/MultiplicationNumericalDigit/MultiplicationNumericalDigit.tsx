
import React, { useMemo } from "react";
import "@/styles/worksheet.css";

type QuestionData = {
  renderKey?: string;
  questionType?: string;
  firstNumber?: number | null;
  secondNumber?: number | null;
  result?: number | null;
  missingFactor?: "first" | "second" | null;
  operatorSymbol?: string;
  answerMode?: string;
  answerType?: string;
};

type Props = {
  questionData?: string | QuestionData | null;
  data?: string | QuestionData | null;
  question?: Record<string, unknown> | null;
  questionText?: string;
  value?: string | number;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;

  // Pass these from your parent worksheet after checking.
  isChecked?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string | number;
};

function parseQuestionData(
  input: Props["questionData"] | Props["data"] | Props["question"]
): QuestionData {
  if (!input) return {};

  if (typeof input === "string") {
    try {
      return parseQuestionData(
        JSON.parse(input) as Record<string, unknown>
      );
    } catch {
      return {};
    }
  }

  if (typeof input !== "object") return {};

  const obj = input as Record<string, unknown>;

  // Support a questionData object nested inside a wrapper.
  for (const key of ["questionData", "data", "QuestionData", "Data"]) {
    const nested = obj[key];

    if (typeof nested === "string" || (nested && typeof nested === "object")) {
      const parsed = parseQuestionData(
        nested as string | QuestionData
      );

      if (parsed.renderKey || parsed.questionType) {
        return parsed;
      }
    }
  }

  return obj as QuestionData;
}

export default function MultiplicationNumericalDigit({
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
    () => parseQuestionData(questionData ?? data ?? question),
    [questionData, data, question]
  );

  const firstNumber = parsed.firstNumber ?? null;
  const secondNumber = parsed.secondNumber ?? null;
  const result = parsed.result ?? null;
  const missingFactor = parsed.missingFactor ?? null;
  const operator = parsed.operatorSymbol || "×";

  const isMissingFirst =
    parsed.questionType === "MULTIPLICATION_MISSING_FIRST_FACTOR" ||
    missingFactor === "first";

  const isMissingSecond =
    parsed.questionType === "MULTIPLICATION_MISSING_SECOND_FACTOR" ||
    missingFactor === "second";

  const answerValue = String(value ?? "");

  const updateAnswer = (nextValue: string) => {
    // Keep answers numeric and allow the field to be cleared.
    if (/^\d*$/.test(nextValue)) {
      onAnswerChange?.(nextValue);
    }
  };

  const renderAnswerBox = (label: string) => (
    <input
      className="mnd27-answer-input"
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

  const isValidQuestion =
    firstNumber !== null ||
    secondNumber !== null ||
    result !== null;

  if (!isValidQuestion) {
    return (
      <section className="mnd27-container">
        <p className="mnd27-fallback-text">
          {questionText || "Multiplication question data is missing."}
        </p>
      </section>
    );
  }

  return (
    <section className="mnd27-container">
      <div className="mnd27-heading">
        <span className="mnd27-heading-icon" aria-hidden="true">
          ✖
        </span>
        <span className="mnd27-heading-title">Multiplication</span>
      </div>

      {questionText && (
        <p className="mnd27-question-text">{questionText}</p>
      )}

      <div className="mnd27-equation" aria-label="Multiplication problem">
        {isMissingFirst ? (
          <>
            {renderAnswerBox("Missing first factor")}
            <span className="mnd27-operator">{operator}</span>
            <span className="mnd27-number">{secondNumber}</span>
            <span className="mnd27-equals">=</span>
            <span className="mnd27-number">{result}</span>
          </>
        ) : isMissingSecond ? (
          <>
            <span className="mnd27-number">{firstNumber}</span>
            <span className="mnd27-operator">{operator}</span>
            {renderAnswerBox("Missing second factor")}
            <span className="mnd27-equals">=</span>
            <span className="mnd27-number">{result}</span>
          </>
        ) : (
          <>
            <span className="mnd27-number">{firstNumber}</span>
            <span className="mnd27-operator">{operator}</span>
            <span className="mnd27-number">{secondNumber}</span>
            <span className="mnd27-equals">=</span>
            {renderAnswerBox("Multiplication answer")}
          </>
        )}
      </div>

      <p className="mnd27-hint">
        {isMissingFirst || isMissingSecond
          ? "Find the missing factor."
          : "Calculate the answer and enter it in the box."}
      </p>

      {isChecked && (
        <div
          className={`mnd27-feedback ${
            isCorrect
              ? "mnd27-feedback-correct"
              : "mnd27-feedback-incorrect"
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

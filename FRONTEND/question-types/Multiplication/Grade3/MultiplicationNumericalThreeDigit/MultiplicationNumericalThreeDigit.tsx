
import React, { useMemo } from "react";
import "@/styles/worksheet.css";

type MultiplicationThreeDigitData = {
  renderKey?: string;
  questionType?: string;
  firstNumber?: number | null;
  secondNumber?: number | null;
  operatorSymbol?: string;
  onesPartialProduct?: number;
  tensPartialProduct?: number;
  adjustmentOperator?: "+" | "-";
  adjustmentNumber?: number;
  showColumns?: boolean;
  allowRegrouping?: boolean;
};

type Props = {
  questionData?: string | MultiplicationThreeDigitData | null;
  data?: string | MultiplicationThreeDigitData | null;
  question?: Record<string, unknown> | null;
  questionText?: string;
  value?: string | number;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;
  isChecked?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string | number;
};

function parseData(
  input:
    | string
    | MultiplicationThreeDigitData
    | Record<string, unknown>
    | null
    | undefined
): MultiplicationThreeDigitData {
  if (!input) return {};

  if (typeof input === "string") {
    try {
      return parseData(JSON.parse(input));
    } catch {
      return {};
    }
  }

  if (typeof input !== "object") return {};

  const obj = input as Record<string, unknown>;

  for (const key of ["questionData", "QuestionData", "data", "Data"]) {
    const nested = obj[key];

    if (
      typeof nested === "string" ||
      (nested !== null && typeof nested === "object")
    ) {
      const parsed = parseData(
        nested as string | Record<string, unknown>
      );

      if (parsed.renderKey || parsed.questionType) return parsed;
    }
  }

  return obj as MultiplicationThreeDigitData;
}

export default function MultiplicationNumericalThreeDigit({
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
  const item = useMemo(
    () => parseData(questionData ?? data ?? question),
    [questionData, data, question]
  );

  const first = item.firstNumber ?? null;
  const second = item.secondNumber ?? null;
  const type = (item.questionType || "").toUpperCase();

  const isPartialProducts =
    type === "MULTIPLICATION_TWO_DIGIT_BY_TWO_DIGIT_PARTIAL_PRODUCTS";

  const isRegrouping =
    type === "MULTIPLICATION_THREE_DIGIT_REGROUPING_COLUMNS" ||
    item.showColumns === true;

  const isMultiStep =
    type === "MULTIPLICATION_MULTI_STEP_NUMBER_EXPRESSION";

  const adjustmentOperator = item.adjustmentOperator || "+";
  const adjustmentNumber = item.adjustmentNumber;

  const answerValue = String(value ?? "");

  const updateAnswer = (nextValue: string) => {
    if (/^\\d*$/.test(nextValue)) {
      onAnswerChange?.(nextValue);
    }
  };

  const renderAnswerBox = (label = "Multiplication answer") => (
    <input
      className="mntd29-answer-input"
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

  if (first === null || second === null) {
    return (
      <section className="mntd29-container">
        <p className="mntd29-fallback">
          {questionText || "Multiplication question data is missing."}
        </p>
      </section>
    );
  }

  return (
    <section className="mntd29-container">
      <div className="mntd29-heading">
        <span className="mntd29-heading-icon" aria-hidden="true">
          ×
        </span>

        <span className="mntd29-heading-title">
          {isPartialProducts
            ? "Partial Products"
            : isRegrouping
              ? "Multiply With Regrouping"
              : isMultiStep
                ? "Multi-Step Multiplication"
                : "Three-Digit Multiplication"}
        </span>
      </div>

      {questionText && (
        <p className="mntd29-question-text">{questionText}</p>
      )}

      {isPartialProducts ? (
        <div className="mntd29-partial-layout">
          <div className="mntd29-partial-equation">
            <span>{first}</span>
            <span className="mntd29-operator">×</span>
            <span>{second}</span>
          </div>

          <div className="mntd29-work-card">
            <p className="mntd29-work-title">
              Split the second number into tens and ones.
            </p>

            <div className="mntd29-work-row">
              <span>
                {first} × {second % 10}
              </span>
              <span className="mntd29-place-label">Ones product</span>
            </div>

            <div className="mntd29-work-row">
              <span>
                {first} × {Math.floor(second / 10) * 10}
              </span>
              <span className="mntd29-place-label">Tens product</span>
            </div>

            <div className="mntd29-work-divider" />

            <div className="mntd29-final-answer">
              <label className="mntd29-final-label">
                Final answer
              </label>
              {renderAnswerBox("Final partial-products answer")}
            </div>
          </div>
        </div>
      ) : isRegrouping ? (
        <div className="mntd29-column-card">
          <p className="mntd29-work-title">
            Multiply from right to left. Regroup when needed.
          </p>

          <div className="mntd29-column-problem">
            <div className="mntd29-carry-space" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            <div className="mntd29-digit-row">
              {String(first).split("").map((digit, index) => (
                <span className="mntd29-digit" key={`top-${index}`}>
                  {digit}
                </span>
              ))}
            </div>

            <div className="mntd29-digit-row mntd29-second-row">
              <span className="mntd29-column-operator">×</span>
              {String(second).split("").map((digit, index) => (
                <span className="mntd29-digit" key={`bottom-${index}`}>
                  {digit}
                </span>
              ))}
            </div>

            <div className="mntd29-column-line" />

            <div className="mntd29-column-answer">
              {renderAnswerBox("Regrouping multiplication answer")}
            </div>
          </div>
        </div>
      ) : isMultiStep ? (
        <div className="mntd29-expression-card">
          <p className="mntd29-work-title">
            Multiply first, then complete the second operation.
          </p>

          <div className="mntd29-expression">
            <span>{first}</span>
            <span className="mntd29-operator">×</span>
            <span>{second}</span>
            <span className="mntd29-operator">
              {adjustmentOperator}
            </span>
            <span>{adjustmentNumber}</span>
            <span className="mntd29-equals">=</span>
            {renderAnswerBox("Multi-step expression answer")}
          </div>
        </div>
      ) : (
        <div className="mntd29-simple-card">
          <div className="mntd29-simple-equation">
            <span>{first}</span>
            <span className="mntd29-operator">×</span>
            <span>{second}</span>
            <span className="mntd29-equals">=</span>
            {renderAnswerBox()}
          </div>

          <p className="mntd29-hint">
            Multiply and enter your answer.
          </p>
        </div>
      )}

      {isChecked && (
        <div
          className={`mntd29-feedback ${
            isCorrect
              ? "mntd29-feedback-correct"
              : "mntd29-feedback-incorrect"
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

"use client";
import React, { useMemo } from "react";
import "@/styles/worksheet.css";

type DataObject = Record<string, unknown>;
type Props = {
  questionData?: string | DataObject | null;
  data?: string | DataObject | null;
  question?: DataObject | null;
  questionText?: string;
  value?: string | number;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;
  isChecked?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string | number;
};

type DivisionData = {
  renderKey?: string;
  questionType?: string;
  dividend?: number | null;
  divisor?: number | null;
  quotient?: number;
  proposedQuotient?: number;
  operatorSymbol?: string;
  verificationOperator?: string;
  showLongDivision?: boolean;
  highlightZeroInQuotient?: boolean;
  answerMode?: "input" | "choice";
  answerType?: string;
  options?: string[];
};

function isObject(value: unknown): value is DataObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseData(source: unknown): DivisionData {
  let parsed: unknown = source;

  for (let i = 0; i < 4 && typeof parsed === "string"; i++) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return {};
    }
  }

  if (!isObject(parsed)) return {};
  const nestedKeys = ["questionDataJson", "questionData", "data"];

  for (const key of nestedKeys) {
    const nested = parsed[key];

    if (typeof nested === "string") {
      const result = parseData(nested);
      if (result.questionType || result.renderKey) return result;
    }

    if (isObject(nested)) {
      const result = parseData(nested);
      if (result.questionType || result.renderKey) return result;
    }
  }

  return parsed as DivisionData;
}

export default function DivisionNumericalThreeDigit({
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
  const division = useMemo(
    () => parseData(questionData ?? data ?? question),
    [questionData, data, question]
  );

  const type = String(division.questionType ?? "").toUpperCase();

  const dividend = division.dividend;
  const divisor = division.divisor;
  const proposedQuotient = division.proposedQuotient;

  const isLongDivision =
    type === "DIVISION_TWO_DIGIT_DIVISOR_LONG_METHOD" ||
    division.showLongDivision === true;

  const isZeroQuotient =
    type === "DIVISION_ZERO_IN_QUOTIENT" ||
    division.highlightZeroInQuotient === true;

  const isVerification =
    type === "DIVISION_MULTIPLICATION_VERIFICATION" ||
    division.answerMode === "choice";

  const options = division.options ?? ["Correct", "Incorrect"];

  const handleNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextValue = event.target.value;

    if (/^\d*$/.test(nextValue)) {
      onAnswerChange?.(nextValue);
    }
  };

  const handleChoice = (choice: string) => {
    if (!disabled) onAnswerChange?.(choice);
  };

  const hasDivisionNumbers =
    typeof dividend === "number" && typeof divisor === "number";

  const displayCorrectAnswer =
    correctAnswer !== undefined && correctAnswer !== null
      ? String(correctAnswer)
      : "";

  return (
    <section className="dnt3-root">
      <div className="dnt3-card">
        <div className="dnt3-heading">
          <span className="dnt3-heading-icon" aria-hidden="true">
            ÷
          </span>

          <div className="dnt3-heading-copy">
            <h3 className="dnt3-title">
              {isVerification
                ? "Division Detective"
                : isLongDivision
                  ? "Long Division"
                  : isZeroQuotient
                    ? "Watch the Zero"
                    : "Solve the Division"}
            </h3>

            <p className="dnt3-subtitle">
              {isVerification
                ? "Check the equation using multiplication."
                : isLongDivision
                  ? "Work through the division and enter the quotient."
                  : isZeroQuotient
                    ? "Calculate carefully and pay attention to the zero."
                    : "Find the missing answer."}
            </p>
          </div>
        </div>

        {questionText && (
          <p className="dnt3-question-text">{questionText}</p>
        )}

        {!hasDivisionNumbers ? (
          <div className="dnt3-error">
            Division numbers could not be loaded from the question data.
          </div>
        ) : isVerification ? (
          <div className="dnt3-verification">
            <div className="dnt3-verification-equation">
              <span className="dnt3-number">{dividend}</span>
              <span className="dnt3-operator">÷</span>
              <span className="dnt3-number">{divisor}</span>
              <span className="dnt3-equals">=</span>
              <span className="dnt3-proposed">{proposedQuotient}</span>
            </div>

            <div className="dnt3-verification-hint">
              Multiply the divisor by the proposed quotient. Does it equal
              the dividend?
            </div>

            <div className="dnt3-choice-list">
              {options.map((option) => {
                const selected = String(value) === option;

                return (
                  <button
                    key={option}
                    type="button"
                    className={[
                      "dnt3-choice",
                      selected ? "dnt3-choice-selected" : "",
                      isChecked && selected
                        ? isCorrect
                          ? "dnt3-choice-correct"
                          : "dnt3-choice-incorrect"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleChoice(option)}
                    disabled={disabled}
                    aria-pressed={selected}
                  >
                    <span className="dnt3-choice-indicator">
                      {selected ? "✓" : ""}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ) : isLongDivision ? (
          <div className="dnt3-long-division">
            <div className="dnt3-long-work">
              <div className="dnt3-long-divisor">{divisor}</div>

              <div className="dnt3-long-right">
                <div className="dnt3-long-quotient-row">
                  <input
                    className="dnt3-answer-input dnt3-quotient-input"
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={handleNumberChange}
                    disabled={disabled}
                    aria-label="Enter the quotient"
                    placeholder="?"
                  />
                </div>

                <div className="dnt3-long-dividend">
                  {dividend}
                </div>

                <div className="dnt3-work-lines" aria-hidden="true">
                  <span />
                  <span />
                </div>
              </div>
            </div>

          
          </div>
        ) : (
          <div className="dnt3-standard">
            <div className="dnt3-equation">
              <span className="dnt3-number">{dividend}</span>
              <span className="dnt3-operator">÷</span>
              <span className="dnt3-number">{divisor}</span>
              <span className="dnt3-equals">=</span>

              <input
                className={[
                  "dnt3-answer-input",
                  isZeroQuotient ? "dnt3-zero-answer-input" : "",
                ].join(" ")}
                type="text"
                inputMode="numeric"
                value={value}
                onChange={handleNumberChange}
                disabled={disabled}
                placeholder="?"
                aria-label="Enter the quotient"
              />
            </div>

            {isZeroQuotient && (
              <p className="dnt3-zero-hint">
                <span aria-hidden="true">💡</span>
                Check each place value in your quotient.
              </p>
            )}
          </div>
        )}

        {isChecked && (
          <div
            className={`dnt3-feedback ${
              isCorrect ? "dnt3-feedback-correct" : "dnt3-feedback-incorrect"
            }`}
            role="status"
          >
            <span className="dnt3-feedback-icon" aria-hidden="true">
              {isCorrect ? "✓" : "!"}
            </span>

            <div>
              <strong>
                {isCorrect ? "Excellent work!" : "Not quite yet."}
              </strong>

              {!isCorrect && displayCorrectAnswer && (
                <p>
                  Correct answer: <b>{displayCorrectAnswer}</b>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
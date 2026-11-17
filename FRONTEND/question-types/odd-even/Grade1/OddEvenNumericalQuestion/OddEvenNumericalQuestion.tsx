import React from "react";
import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";

type OddEvenNumericalData = {
  renderKey?: string;
  questionType?: string;
  title?: string;
  minuend?: number;
  subtrahend?: number;
  baseNumber?: number;
  targetParity?: "Odd" | "Even" | string;
  startNumber?: number;
  endNumber?: number;
  parityToCount?: "Odd" | "Even" | string;

  equation?: string;
  options?: Array<string | number>;
};

export default function OddEvenNumericalQuestion({
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: QuestionRendererProps) {
  const d = data as OddEvenNumericalData;
  const questionType = d.questionType ?? "";
  const currentAnswer =
    userAnswer == null ? "" : String(userAnswer);

  const options = d.options ?? ["Odd", "Even"];

  // ODD_EVEN_SUBTRACTION_PARITY
  const difference =
    Number(d.minuend ?? 0) - Number(d.subtrahend ?? 0);

  const correctSubtractionParity =
    difference % 2 === 0 ? "Even" : "Odd";

  // ODD_EVEN_MISSING_ADDEND_PARITY
  // Backend distractors have the opposite parity from the correct addend.
  const isCorrectAddend = (option: string | number) => {
    const baseNumber = Number(d.baseNumber ?? 0);
    const addend = Number(option);
    const sumIsEven = (baseNumber + addend) % 2 === 0;

    return (
      (d.targetParity === "Even" && sumIsEven) ||
      (d.targetParity === "Odd" && !sumIsEven)
    );
  };

  const correctAddend = options.find(isCorrectAddend);

  // ODD_EVEN_COUNT_IN_RANGE
  // Count numbers strictly between the two boundaries.
  const startNumber = Number(d.startNumber ?? 0);
  const endNumber = Number(d.endNumber ?? 0);
  const parityToCount = d.parityToCount ?? "Odd";

  const numbersBetween = Array.from(
    {
      length: Math.max(0, endNumber - startNumber - 1),
    },
    (_, index) => startNumber + index + 1
  );

  const matchesParity = (number: number) =>
    parityToCount === "Even"
      ? number % 2 === 0
      : number % 2 !== 0;

  const correctCount = numbersBetween.filter(matchesParity).length;

  const renderFeedback = (answer: string | number) => {
    if (!showAnswers) return null;

    return (
      <div className="odd_even_numerical__feedback">
        <span>Correct answer</span>
        <strong>{answer}</strong>
      </div>
    );
  };

  // ========================================================
  // 1. ODD_EVEN_SUBTRACTION_PARITY
  // ========================================================
  if (questionType === "ODD_EVEN_SUBTRACTION_PARITY") {
    return (
      <section className="odd_even_numerical__card">
        <div className="odd_even_numerical__equation">
          <span>{d.minuend}</span>
          <span className="odd_even_numerical__operator">−</span>
          <span>{d.subtrahend}</span>
          <span className="odd_even_numerical__equals">=</span>
          <span className="odd_even_numerical__result">
            {showAnswers ? difference : "?"}
          </span>
        </div>

        <p className="odd_even_numerical__instruction">
          Is the difference odd or even?
        </p>

        <div className="odd_even_numerical__choices">
          {options.map((option) => {
            const value = String(option);
            const selected = currentAnswer === value;
            const correct =
              showAnswers && value === correctSubtractionParity;

            return (
              <button
                type="button"
                key={value}
                className={[
                  "odd_even_numerical__choice",
                  selected
                    ? "odd_even_numerical__choice--selected"
                    : "",
                  correct
                    ? "odd_even_numerical__choice--correct"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onAnswerChange(value)}
                aria-pressed={selected}
              >
                <span className="odd_even_numerical__choice-symbol">
                  {value === "Odd" ? "●" : "●●"}
                </span>
                {value}
              </button>
            );
          })}
        </div>

        {renderFeedback(correctSubtractionParity)}
      </section>
    );
  }

  // ========================================================
  // 2. ODD_EVEN_MISSING_ADDEND_PARITY
  // ========================================================
  if (questionType === "ODD_EVEN_MISSING_ADDEND_PARITY") {
    return (
      <section className="odd_even_numerical__card">
        <div className="odd_even_numerical__target">
          <span className="odd_even_numerical__target-label">
            Make the sum
          </span>
          <strong
            className={`odd_even_numerical__target-value ${
              d.targetParity === "Even"
                ? "odd_even_numerical__target-value--even"
                : "odd_even_numerical__target-value--odd"
            }`}
          >
            {d.targetParity}
          </strong>
        </div>

        <div className="odd_even_numerical__equation">
          <span>{d.baseNumber}</span>
          <span className="odd_even_numerical__operator">+</span>
          <span className="odd_even_numerical__result">
            {showAnswers ? correctAddend : "?"}
          </span>
          <span className="odd_even_numerical__equals">=</span>
          <span className="odd_even_numerical__target-word">
            {d.targetParity}
          </span>
        </div>

        <p className="odd_even_numerical__instruction">
          Choose a number that makes the sum {String(d.targetParity).toLowerCase()}.
        </p>

        <div className="odd_even_numerical__number-choices">
          {options.map((option) => {
            const value = String(option);
            const selected = currentAnswer === value;
            const correct =
              showAnswers && isCorrectAddend(option);

            return (
              <button
                type="button"
                key={value}
                className={[
                  "odd_even_numerical__number-choice",
                  selected
                    ? "odd_even_numerical__number-choice--selected"
                    : "",
                  correct
                    ? "odd_even_numerical__number-choice--correct"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onAnswerChange(value)}
                aria-pressed={selected}
              >
                {option}
              </button>
            );
          })}
        </div>

        {correctAddend !== undefined &&
          renderFeedback(correctAddend)}
      </section>
    );
  }

  // ========================================================
  // 3. ODD_EVEN_COUNT_IN_RANGE
  // ========================================================
  if (questionType === "ODD_EVEN_COUNT_IN_RANGE") {
    return (
      <section className="odd_even_numerical__card">
        <div className="odd_even_numerical__range">
          <div className="odd_even_numerical__boundary">
            <span>Start</span>
            <strong>{startNumber}</strong>
          </div>

          <span className="odd_even_numerical__range-dots">
            …
          </span>

          <div className="odd_even_numerical__boundary">
            <span>End</span>
            <strong>{endNumber}</strong>
          </div>
        </div>

        <div className="odd_even_numerical__count-heading">
          <span className="odd_even_numerical__count-label">
            Count the
          </span>
          <strong
            className={`odd_even_numerical__parity-badge ${
              parityToCount === "Even"
                ? "odd_even_numerical__parity-badge--even"
                : "odd_even_numerical__parity-badge--odd"
            }`}
          >
            {parityToCount}
          </strong>
          <span className="odd_even_numerical__count-label">
            numbers strictly between the boundaries
          </span>
        </div>

        <div className="odd_even_numerical__range-grid">
          {numbersBetween.map((number) => {
            const targetParity = matchesParity(number);

            return (
              <span
                key={number}
                className={[
                  "odd_even_numerical__range-number",
                  targetParity
                    ? "odd_even_numerical__range-number--target"
                    : "",
                  showAnswers && targetParity
                    ? "odd_even_numerical__range-number--revealed"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {number}
              </span>
            );
          })}
        </div>

        <label className="odd_even_numerical__answer-field">
          <span>How many {String(parityToCount).toLowerCase()} numbers?</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={showAnswers ? String(correctCount) : currentAnswer}
            readOnly={showAnswers}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder="Enter the count"
          />
        </label>

        {renderFeedback(correctCount)}
      </section>
    );
  }

  return (
    <section className="odd_even_numerical__card">
      <p className="odd_even_numerical__instruction">
        Unsupported question type: {questionType || "Unknown"}
      </p>
    </section>
  );
}